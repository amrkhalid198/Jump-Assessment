import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

// Never let a CDN or Next cache a webhook.
export const dynamic = 'force-dynamic';

/**
 * Lazily constructed. The Stripe constructor throws when the key is missing,
 * and at module scope that runs during `next build` page-data collection —
 * so the whole app would fail to build on any machine without billing secrets
 * (CI, a new laptop, a contributor who only touches the capture screen).
 * Constructing per request keeps the failure inside the endpoint that needs it.
 */
function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  return new Stripe(key, { apiVersion: '2024-06-20' });
}

/**
 * POST /api/webhook  — the single source of truth for subscription_status.
 *
 * Four properties this endpoint has to have, in order of how badly it hurts
 * when it doesn't:
 *
 * 1. AUTHENTICATED BY SIGNATURE. The URL is public. Without constructEvent,
 *    anyone who guesses it can POST {status: 'active'} and take the product
 *    for free. Verify against the RAW body — App Router gives it via
 *    `await request.text()`; parsing to JSON first changes the bytes and
 *    signature verification fails.
 *
 * 2. IDEMPOTENT. Stripe redelivers on any non-2xx and occasionally on a 2xx
 *    it did not hear. Every event id is recorded and replays are dropped.
 *
 * 3. ORDER-INDEPENDENT. Delivery is not ordered. A `customer.subscription.
 *    updated` from 09:00:01 can arrive after the one from 09:00:05, and
 *    applying them in arrival order would leave a cancelled clinic active. We
 *    compare event timestamps and ignore anything staler than what we hold.
 *
 * 4. FAST. Stripe times out at 20 seconds. Do the database write and return;
 *    push email and analytics onto a queue.
 */
export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  let stripe;
  try {
    stripe = stripeClient();
  } catch (err) {
    console.error('[webhook]', err.message);
    return NextResponse.json({ error: 'Billing not configured' }, { status: 500 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('[webhook] signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  // --- idempotency ---------------------------------------------------------
  // Insert first, act second. The primary key on event_id makes concurrent
  // redeliveries collide here rather than both applying.
  const { error: dupe } = await admin
    .from('billing_events')
    .insert({ event_id: event.id, type: event.type });

  if (dupe) {
    if (dupe.code === '23505') return NextResponse.json({ received: true, duplicate: true });
    console.error('[webhook] idempotency write failed:', dupe);
    return NextResponse.json({ error: 'Storage error' }, { status: 500 }); // let Stripe retry
  }

  try {
    switch (event.type) {
      /**
       * Fires the moment checkout completes. We do not trust its status
       * field — for card authentication the subscription can still be
       * `incomplete`. Retrieve the real subscription instead.
       */
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode !== 'subscription') break;

        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        await applySubscription(admin, subscription, event, session.client_reference_id);
        break;
      }

      /** Renewals, plan changes, cancellations, and lapse into past_due. */
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        await applySubscription(admin, event.data.object, event);
        break;
      }

      /**
       * Monthly payment SUCCEEDED. subscription.updated normally covers this,
       * but handling it explicitly makes the renewal path unambiguous and
       * refreshes current_period_end for the UI.
       */
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        if (!invoice.subscription) break;
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
        await applySubscription(admin, subscription, event);
        break;
      }

      /**
       * Monthly payment FAILED. Stripe moves the subscription to past_due and
       * retries on its dunning schedule. past_due is intentionally still a
       * writable status in SQL: the clinic keeps working through the retry
       * window instead of losing access mid-appointment over an expired card.
       * Only `unpaid` / `canceled`, at the end of dunning, drop them to
       * read-only.
       */
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        if (!invoice.subscription) break;
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
        await applySubscription(admin, subscription, event);
        // queue: notify the clinic owner that the card was declined
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(`[webhook] handler failed for ${event.type}:`, err);
    // Roll back the idempotency marker so the retry is allowed to work.
    await admin.from('billing_events').delete().eq('event_id', event.id);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }
}

/**
 * Writes one Stripe subscription onto its clinic.
 *
 * Resolution order for the clinic, most to least reliable:
 *   1. subscription.metadata.clinic_id  — set at checkout, travels with the object
 *   2. client_reference_id              — present on checkout.session.completed
 *   3. stripe_customer_id lookup        — fallback for subscriptions created in
 *                                         the Stripe dashboard by hand
 */
async function applySubscription(admin, subscription, event, clientReferenceId = null) {
  const clinicId =
    subscription.metadata?.clinic_id ??
    clientReferenceId ??
    (await clinicIdByCustomer(admin, subscription.customer));

  if (!clinicId) {
    // A 200 on purpose: retrying will not conjure a clinic, and a 500 here
    // makes Stripe retry for three days and eventually disable the endpoint.
    console.error('[webhook] no clinic for customer', subscription.customer);
    return;
  }

  // Out-of-order guard. Skip anything older than what we have already applied.
  const eventTime = new Date(event.created * 1000).toISOString();

  const { data: current } = await admin
    .from('clinics')
    .select('last_billing_event_at')
    .eq('id', clinicId)
    .single();

  if (current?.last_billing_event_at && current.last_billing_event_at > eventTime) {
    console.warn('[webhook] ignoring stale event', event.id);
    return;
  }

  const { error } = await admin
    .from('clinics')
    .update({
      subscription_id: subscription.id,
      subscription_status: subscription.status, // enum matches Stripe 1:1
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      stripe_customer_id: subscription.customer,
      last_billing_event_at: eventTime,
    })
    .eq('id', clinicId);

  if (error) throw new Error(`clinic update failed: ${error.message}`);
}

async function clinicIdByCustomer(admin, customerId) {
  const { data } = await admin
    .from('clinics')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();
  return data?.id ?? null;
}

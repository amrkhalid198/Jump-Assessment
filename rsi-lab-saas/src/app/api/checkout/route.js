import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import {
  createSupabaseServerClient,
  createSupabaseAdminClient,
} from '@/lib/supabase/server';

// The Stripe SDK needs Node crypto and streams. On the Edge runtime it fails
// at request time, not build time, which is a miserable way to find out.
export const runtime = 'nodejs';

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
 * POST /api/checkout
 * Starts a subscription for the caller's clinic and returns a Checkout URL.
 *
 * Note what this route does NOT do: it never writes subscription_status. A
 * user can close the tab between paying and being redirected back, and card
 * authentication can complete minutes later. Provisioning here would leave
 * paying clinics locked out. The webhook is the only writer.
 */
export async function POST(request) {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // RLS scopes this to the caller's own clinic, so there is no way to open a
  // checkout session against someone else's.
  const { data: membership } = await supabase
    .from('clinic_members')
    .select('clinic_id, role, clinics(id, name, stripe_customer_id, subscription_status)')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: 'No clinic for this user' }, { status: 403 });
  }
  if (membership.role !== 'owner') {
    return NextResponse.json({ error: 'Only the clinic owner can manage billing' }, { status: 403 });
  }

  const clinic = membership.clinics;

  if (clinic.subscription_status === 'active' || clinic.subscription_status === 'trialing') {
    return NextResponse.json({ error: 'Subscription already active' }, { status: 409 });
  }

  const { priceId } = await request.json().catch(() => ({}));

  // Only prices this app actually sells. Without this check a caller can post
  // any price id from your Stripe account — including a 1-cent test price.
  const allowed = [process.env.STRIPE_PRICE_MONTHLY, process.env.STRIPE_PRICE_ANNUAL];
  if (!allowed.includes(priceId)) {
    return NextResponse.json({ error: 'Unknown price' }, { status: 400 });
  }

  try {
    const stripe = stripeClient();

    // Reuse the customer so a clinic that lapses and returns keeps one billing
    // history rather than accumulating duplicates.
    let customerId = clinic.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: clinic.name,
        metadata: { clinic_id: clinic.id, supabase_user_id: user.id },
      });
      customerId = customer.id;

      // Persist before creating the session. If the write failed afterwards,
      // the next attempt would mint a second customer for the same clinic.
      // Admin client: stripe_customer_id is billing-owned and the SQL trigger
      // rejects it from a user-role connection.
      const admin = createSupabaseAdminClient();
      const { error } = await admin
        .from('clinics')
        .update({ stripe_customer_id: customerId })
        .eq('id', clinic.id);

      if (error) throw new Error(`Could not persist customer: ${error.message}`);
    }

    const origin = request.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],

      // Both are set deliberately. client_reference_id survives on the session;
      // subscription_data.metadata is copied onto the subscription object, so
      // later invoice.* events can resolve a clinic without a second API call.
      client_reference_id: clinic.id,
      subscription_data: {
        metadata: { clinic_id: clinic.id },
      },

      success_url: `${origin}/dashboard/billing?checkout=success`,
      cancel_url: `${origin}/dashboard/billing?checkout=cancelled`,
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[checkout]', err);
    return NextResponse.json({ error: 'Could not start checkout' }, { status: 500 });
  }
}

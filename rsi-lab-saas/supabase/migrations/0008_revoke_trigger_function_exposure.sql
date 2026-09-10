-- ============================================================================
--  promote_pending_admin() is a trigger function. Supabase publishes every
--  public-schema function at /rest/v1/rpc/, and anon/authenticated inherit
--  EXECUTE by default, so it was reachable as an RPC by anonymous callers.
--
--  Invoking it outside a trigger fails (NEW is unbound), so this was not
--  directly exploitable — but it is a SECURITY DEFINER function whose whole
--  job is inserting into app_admins, and leaving that on the public API
--  surface is exactly the exposure that made prune_billing_events dangerous
--  in 0003. Trigger functions should never be callable.
--
--  Revoking EXECUTE does not affect the trigger: triggers run as the table
--  owner, not as the calling role. Verified both ways.
-- ============================================================================

revoke all on function public.promote_pending_admin() from public, anon, authenticated;

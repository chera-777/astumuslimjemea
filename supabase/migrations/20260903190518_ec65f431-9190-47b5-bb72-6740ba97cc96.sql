
CREATE TABLE IF NOT EXISTS public.user_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL,
  blocked_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);

GRANT SELECT, INSERT, DELETE ON public.user_blocks TO authenticated;
GRANT ALL ON public.user_blocks TO service_role;

ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users see own blocks" ON public.user_blocks;
CREATE POLICY "users see own blocks"
  ON public.user_blocks FOR SELECT TO authenticated
  USING (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "users create own blocks" ON public.user_blocks;
CREATE POLICY "users create own blocks"
  ON public.user_blocks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "users delete own blocks" ON public.user_blocks;
CREATE POLICY "users delete own blocks"
  ON public.user_blocks FOR DELETE TO authenticated
  USING (auth.uid() = blocker_id);

CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON public.user_blocks (blocker_id);

CREATE OR REPLACE FUNCTION public.enforce_report_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count int;
BEGIN
  SELECT count(*) INTO recent_count
  FROM public.content_reports
  WHERE reporter_id = NEW.reporter_id
    AND created_at > now() - interval '24 hours';
  IF recent_count >= 5 THEN
    RAISE EXCEPTION 'Report rate limit reached (5 per 24h). Please try again later.';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_report_rate_limit() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_enforce_report_rate_limit ON public.content_reports;
CREATE TRIGGER trg_enforce_report_rate_limit
  BEFORE INSERT ON public.content_reports
  FOR EACH ROW EXECUTE FUNCTION public.enforce_report_rate_limit();

-- Lock down remaining SECURITY DEFINER trigger functions from direct API calls
REVOKE ALL ON FUNCTION public.apply_xp_event() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_self_admin_grant() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.log_role_change() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.protect_profile_fields() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

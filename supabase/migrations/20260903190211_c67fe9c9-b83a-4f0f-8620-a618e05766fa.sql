
-- Add xp/level to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS xp integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level integer NOT NULL DEFAULT 1;

-- xp_events table
CREATE TABLE public.xp_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source text NOT NULL,
  delta integer NOT NULL CHECK (delta > 0 AND delta <= 1000),
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.xp_events TO authenticated;
GRANT ALL ON public.xp_events TO service_role;

ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users see own xp events"
  ON public.xp_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "users insert own xp events"
  ON public.xp_events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_xp_events_user_created ON public.xp_events (user_id, created_at DESC);

-- Trigger: update profiles.xp / level on insert
CREATE OR REPLACE FUNCTION public.apply_xp_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
     SET xp = xp + NEW.delta,
         level = 1 + ((xp + NEW.delta) / 100)
   WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_apply_xp_event ON public.xp_events;
CREATE TRIGGER trg_apply_xp_event
  AFTER INSERT ON public.xp_events
  FOR EACH ROW EXECUTE FUNCTION public.apply_xp_event();

-- Leaderboard view with Halal gender scoping
CREATE OR REPLACE VIEW public.v_university_leaderboard
WITH (security_invoker = true)
AS
SELECT
  p.id,
  p.full_name,
  p.university_id,
  p.gender,
  p.level,
  COALESCE(SUM(e.delta) FILTER (WHERE e.created_at > date_trunc('month', now())), 0)::int AS monthly_xp,
  p.xp AS total_xp
FROM public.profiles p
LEFT JOIN public.xp_events e ON e.user_id = p.id
WHERE p.university_id = public.get_user_university(auth.uid())
  AND (
    p.gender = 'male'
    OR EXISTS (
      SELECT 1 FROM public.profiles viewer
      WHERE viewer.id = auth.uid() AND viewer.gender = 'female'
    )
  )
GROUP BY p.id;

GRANT SELECT ON public.v_university_leaderboard TO authenticated;

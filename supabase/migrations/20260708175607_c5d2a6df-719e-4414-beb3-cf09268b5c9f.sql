
-- ============ messages (community chat, scoped by university) ============
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL,
  room text NOT NULL DEFAULT 'general',
  user_id uuid NOT NULL,
  content text NOT NULL CHECK (length(content) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read same-university messages"
  ON public.messages FOR SELECT TO authenticated
  USING (university_id = public.get_user_university(auth.uid()));

CREATE POLICY "Members insert same-university messages as self"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND university_id = public.get_user_university(auth.uid())
  );

CREATE POLICY "Users delete their own messages"
  ON public.messages FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS messages_room_created_idx
  ON public.messages (university_id, room, created_at DESC);

CREATE TRIGGER trg_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ prayer_times_cache ============
CREATE TABLE IF NOT EXISTS public.prayer_times_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  country text NOT NULL,
  method integer NOT NULL DEFAULT 3,
  date date NOT NULL,
  timings jsonb NOT NULL,
  hijri_date text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (city, country, method, date)
);

GRANT SELECT ON public.prayer_times_cache TO anon, authenticated;
GRANT ALL ON public.prayer_times_cache TO service_role;

ALTER TABLE public.prayer_times_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Prayer cache is world-readable"
  ON public.prayer_times_cache FOR SELECT TO anon, authenticated
  USING (true);

CREATE TRIGGER trg_prayer_cache_updated_at
  BEFORE UPDATE ON public.prayer_times_cache
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ Realtime publication ============
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.event_rsvps REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.messages; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.event_rsvps; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

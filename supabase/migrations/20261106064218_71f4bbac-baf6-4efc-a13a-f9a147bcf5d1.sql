CREATE TABLE public.service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  university_id uuid NOT NULL REFERENCES public.universities(id),
  service text NOT NULL,
  kind text NOT NULL DEFAULT 'request',
  subject text NOT NULL,
  details text NOT NULL,
  location text,
  is_anonymous boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'open',
  staff_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.service_requests TO authenticated;
GRANT ALL ON public.service_requests TO service_role;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students create own requests" ON public.service_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND university_id = public.get_user_university(auth.uid()) AND status = 'open' AND staff_note IS NULL
    AND length(trim(subject)) BETWEEN 3 AND 140 AND length(trim(details)) BETWEEN 5 AND 2000);
CREATE POLICY "Students read own requests, staff read university" ON public.service_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR (university_id = public.get_user_university(auth.uid()) AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'committee'))));
CREATE POLICY "Staff update university requests" ON public.service_requests FOR UPDATE TO authenticated
  USING (university_id = public.get_user_university(auth.uid()) AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'committee')))
  WITH CHECK (university_id = public.get_user_university(auth.uid()));
CREATE TRIGGER service_requests_updated_at BEFORE UPDATE ON public.service_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX service_requests_user_idx ON public.service_requests(user_id, created_at DESC);
CREATE INDEX service_requests_uni_idx ON public.service_requests(university_id, service, created_at DESC);
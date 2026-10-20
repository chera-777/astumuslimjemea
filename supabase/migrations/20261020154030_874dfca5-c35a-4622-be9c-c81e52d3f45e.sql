CREATE TABLE public.student_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  name text NOT NULL,
  gender text NOT NULL,
  description text,
  focus_tags text[] NOT NULL DEFAULT '{}',
  activities text[] NOT NULL DEFAULT '{}',
  academic_year text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_groups TO authenticated;
GRANT ALL ON public.student_groups TO service_role;
ALTER TABLE public.student_groups ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.student_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'Member',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.group_members TO authenticated;
GRANT ALL ON public.group_members TO service_role;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.can_view_group(_user_id uuid, _group_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.student_groups g JOIN public.profiles p ON p.id = _user_id
    WHERE g.id = _group_id AND g.university_id = p.university_id AND lower(g.gender) = lower(p.gender)
  ) OR public.has_role(_user_id, 'admin')
$$;
REVOKE EXECUTE ON FUNCTION public.can_view_group(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_view_group(uuid, uuid) TO authenticated;

CREATE POLICY "View groups in own university and gender" ON public.student_groups
  FOR SELECT TO authenticated USING (public.can_view_group(auth.uid(), id));
CREATE POLICY "Admins manage groups" ON public.student_groups
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "View members of visible groups" ON public.group_members
  FOR SELECT TO authenticated USING (public.can_view_group(auth.uid(), group_id));
CREATE POLICY "Admins manage members" ON public.group_members
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER student_groups_updated_at BEFORE UPDATE ON public.student_groups
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Member names/years for groups the caller may see (profiles are otherwise private)
CREATE OR REPLACE FUNCTION public.get_group_roster(_group_id uuid)
RETURNS TABLE(user_id uuid, full_name text, batch_year text, role text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.user_id, p.full_name, p.batch_year, m.role
  FROM public.group_members m JOIN public.profiles p ON p.id = m.user_id
  WHERE m.group_id = _group_id AND public.can_view_group(auth.uid(), _group_id)
  ORDER BY CASE WHEN m.role = 'Member' THEN 1 ELSE 0 END, p.full_name
$$;
REVOKE EXECUTE ON FUNCTION public.get_group_roster(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_group_roster(uuid) TO authenticated;
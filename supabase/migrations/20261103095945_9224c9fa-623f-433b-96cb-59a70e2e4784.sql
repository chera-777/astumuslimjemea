ALTER TABLE public.student_groups ADD COLUMN IF NOT EXISTS department text;

CREATE OR REPLACE FUNCTION private.can_view_group(_user_id uuid, _group_id uuid)
 RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.student_groups g JOIN public.profiles p ON p.id = _user_id
    WHERE g.id = _group_id AND g.university_id = p.university_id AND lower(g.gender) = lower(p.gender)
      AND (
        ((g.department IS NULL OR lower(g.department) = lower(coalesce(p.department,'')))
         AND (g.academic_year IS NULL OR g.academic_year = coalesce(p.batch_year,'')))
        OR EXISTS (SELECT 1 FROM public.group_members m WHERE m.group_id = g.id AND m.user_id = _user_id)
      )
  ) OR public.has_role(_user_id, 'admin')
$$;

CREATE OR REPLACE FUNCTION public.validate_group_membership()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$ DECLARE g public.student_groups%ROWTYPE; p public.profiles%ROWTYPE; BEGIN
  SELECT * INTO g FROM public.student_groups WHERE id=NEW.group_id FOR UPDATE;
  SELECT * INTO p FROM public.profiles WHERE id=NEW.user_id;
  IF g.id IS NULL OR p.id IS NULL THEN RAISE EXCEPTION 'Choose an existing group and registered student'; END IF;
  IF g.university_id <> p.university_id OR lower(g.gender) <> lower(p.gender) THEN RAISE EXCEPTION 'Members must belong to the group university and gender'; END IF;
  IF g.department IS NOT NULL AND lower(g.department) <> lower(coalesce(p.department,'')) THEN RAISE EXCEPTION 'Members must belong to the group department'; END IF;
  IF g.academic_year IS NOT NULL AND g.academic_year <> coalesce(p.batch_year,'') THEN RAISE EXCEPTION 'Members must be in the group class year'; END IF;
  IF NEW.role NOT IN ('Member','Amir','Naqeeb','Murshid') THEN RAISE EXCEPTION 'Choose a valid group role'; END IF;
  IF (SELECT count(*) FROM public.group_members WHERE group_id=NEW.group_id AND id IS DISTINCT FROM NEW.id)>=14 THEN RAISE EXCEPTION 'A group can have at most 14 students'; END IF;
  RETURN NEW; END; $$;

-- Fix news INSERT policy to enforce university scope
DROP POLICY IF EXISTS "Admins/Amirs can create news" ON public.news;
CREATE POLICY "Admins/Amirs can create news" ON public.news
FOR INSERT TO authenticated
WITH CHECK (
  university_id = public.get_user_university(auth.uid())
  AND (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'amir'::public.app_role))
);

-- Extend profile field protection to INSERT as well
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF (NEW.is_verified IS TRUE OR NEW.is_cafe_student IS TRUE) THEN
      IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
        RAISE EXCEPTION 'Protected profile fields (is_verified, is_cafe_student) can only be set by admins';
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  IF (NEW.is_verified IS DISTINCT FROM OLD.is_verified)
     OR (NEW.is_cafe_student IS DISTINCT FROM OLD.is_cafe_student)
     OR (NEW.university_id IS DISTINCT FROM OLD.university_id) THEN
    IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
      RAISE EXCEPTION 'Protected profile fields (is_verified, is_cafe_student, university_id) can only be changed by admins';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_fields_ins ON public.profiles;
CREATE TRIGGER protect_profile_fields_ins
BEFORE INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_fields();

DROP TRIGGER IF EXISTS protect_profile_fields_upd ON public.profiles;
CREATE TRIGGER protect_profile_fields_upd
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_fields();

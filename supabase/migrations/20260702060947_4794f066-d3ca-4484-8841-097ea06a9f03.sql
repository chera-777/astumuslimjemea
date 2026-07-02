
-- 1. Donations: enforce university match
DROP POLICY IF EXISTS "Users can donate" ON public.donations;
CREATE POLICY "Users can donate" ON public.donations
FOR INSERT TO authenticated
WITH CHECK (
  university_id = (SELECT university_id FROM public.profiles WHERE id = auth.uid())
  AND (
    (is_anonymous = true AND donor_id IS NULL)
    OR (COALESCE(is_anonymous, false) = false AND donor_id = auth.uid())
  )
);

-- 2. Khadim registrations: enforce university match
DROP POLICY IF EXISTS "Users can register as khadim" ON public.khadim_registrations;
CREATE POLICY "Users can register as khadim" ON public.khadim_registrations
FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND university_id = (SELECT university_id FROM public.profiles WHERE id = auth.uid())
);

-- 3. Protect sensitive profile fields (is_verified, is_cafe_student, university_id)
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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

DROP TRIGGER IF EXISTS protect_profile_fields_trigger ON public.profiles;
CREATE TRIGGER protect_profile_fields_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_fields();

-- 4. Convert RLS helper functions to SECURITY INVOKER and lock down EXECUTE
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_university(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT university_id FROM public.profiles WHERE id = auth.uid()
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_user_university(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.protect_profile_fields() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_self_admin_grant() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- RLS policies still evaluate these functions via the internal executor
-- because they are referenced from policy expressions; direct RPC calls
-- from anon/authenticated clients are now blocked.

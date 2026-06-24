
-- 1. Harden get_user_university: ignore caller-supplied parameter, always use auth.uid()
CREATE OR REPLACE FUNCTION public.get_user_university(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT university_id FROM public.profiles WHERE id = auth.uid()
$function$;

-- 2. Revoke EXECUTE on SECURITY DEFINER helpers from anon/public; keep authenticated for RLS use
REVOKE ALL ON FUNCTION public.get_user_university(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_university(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 3. Strengthen donations INSERT policy to handle anonymous vs named donations correctly
DROP POLICY IF EXISTS "Users can donate" ON public.donations;
CREATE POLICY "Users can donate"
ON public.donations
FOR INSERT
TO authenticated
WITH CHECK (
  (is_anonymous = true AND donor_id IS NULL)
  OR (COALESCE(is_anonymous, false) = false AND donor_id = auth.uid())
);

-- Also tighten SELECT so anonymous donations are not exposed by donor_id NULL matching
DROP POLICY IF EXISTS "Users see own donations" ON public.donations;
CREATE POLICY "Users see own donations"
ON public.donations
FOR SELECT
TO authenticated
USING (donor_id IS NOT NULL AND donor_id = auth.uid());

-- 4. Defense-in-depth trigger preventing self-grant of admin role on user_roles
CREATE OR REPLACE FUNCTION public.prevent_self_admin_grant()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'admin'::public.app_role AND NEW.user_id = auth.uid() THEN
    RAISE EXCEPTION 'Users cannot grant themselves the admin role';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_self_admin_grant_trg ON public.user_roles;
CREATE TRIGGER prevent_self_admin_grant_trg
BEFORE INSERT OR UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.prevent_self_admin_grant();

REVOKE ALL ON FUNCTION public.prevent_self_admin_grant() FROM PUBLIC, anon, authenticated;

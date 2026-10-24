ALTER FUNCTION public.admin_student_directory() SET SCHEMA private;
REVOKE ALL ON FUNCTION private.admin_student_directory() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.admin_student_directory() TO authenticated, service_role;
CREATE FUNCTION public.admin_student_directory() RETURNS TABLE(id uuid, full_name text, gender text, university_id uuid, batch_year text, department text, is_verified boolean) LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$ SELECT * FROM private.admin_student_directory() $$;
REVOKE ALL ON FUNCTION public.admin_student_directory() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_student_directory() TO authenticated,service_role;
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated;
ALTER FUNCTION public.can_view_group(uuid, uuid) SET SCHEMA private;
ALTER FUNCTION public.get_group_roster(uuid) SET SCHEMA private;
CREATE OR REPLACE FUNCTION private.get_group_roster(_group_id uuid)
RETURNS TABLE(user_id uuid, full_name text, batch_year text, role text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.user_id, p.full_name, p.batch_year, m.role
  FROM public.group_members m JOIN public.profiles p ON p.id = m.user_id
  WHERE m.group_id = _group_id AND private.can_view_group(auth.uid(), _group_id)
  ORDER BY CASE WHEN m.role = 'Member' THEN 1 ELSE 0 END, p.full_name
$$;
CREATE OR REPLACE FUNCTION public.get_group_roster(_group_id uuid)
RETURNS TABLE(user_id uuid, full_name text, batch_year text, role text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT * FROM private.get_group_roster(_group_id)
$$;
REVOKE EXECUTE ON FUNCTION public.get_group_roster(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_group_roster(uuid) TO authenticated;
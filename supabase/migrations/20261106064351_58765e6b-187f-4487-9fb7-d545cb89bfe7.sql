CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE uni uuid;
BEGIN
  INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'student');
  IF NEW.raw_user_meta_data->>'university_id' ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN
    uni := (NEW.raw_user_meta_data->>'university_id')::uuid;
    IF EXISTS (SELECT 1 FROM public.universities WHERE id = uni)
       AND NEW.raw_user_meta_data->>'gender' IN ('male','female')
       AND length(trim(COALESCE(NEW.raw_user_meta_data->>'full_name',''))) > 0 THEN
      INSERT INTO public.profiles(id, full_name, phone, gender, university_id, department, batch_year, is_cafe_student, is_verified)
      VALUES (
        NEW.id,
        trim(NEW.raw_user_meta_data->>'full_name'),
        NULLIF(NEW.raw_user_meta_data->>'phone',''),
        NEW.raw_user_meta_data->>'gender',
        uni,
        NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'department','')),''),
        NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'batch_year','')),''),
        false,
        false
      ) ON CONFLICT(id) DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Profile photos are visible to other signed-in students (RLS filters by gender where needed);
-- the earlier public-read policy is replaced since the bucket is private.
DROP POLICY IF EXISTS "Avatar public read" ON storage.objects;
CREATE POLICY "Avatar read for signed-in users" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'avatars');
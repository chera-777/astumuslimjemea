ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS id_verification_status text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS id_verification_note text,
  ADD COLUMN IF NOT EXISTS id_verified_at timestamptz;

CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE trusted boolean := (auth.role() = 'service_role') OR public.has_role(auth.uid(), 'admin'::public.app_role);
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF (NEW.is_verified IS TRUE OR NEW.is_cafe_student IS TRUE OR NEW.id_verification_status <> 'none') AND NOT trusted THEN
      RAISE EXCEPTION 'Protected profile fields can only be set by admins';
    END IF;
    RETURN NEW;
  END IF;
  IF NOT trusted THEN
    IF (NEW.is_verified IS DISTINCT FROM OLD.is_verified)
       OR (NEW.is_cafe_student IS DISTINCT FROM OLD.is_cafe_student)
       OR (NEW.university_id IS DISTINCT FROM OLD.university_id)
       OR (NEW.id_verification_note IS DISTINCT FROM OLD.id_verification_note)
       OR (NEW.id_verified_at IS DISTINCT FROM OLD.id_verified_at) THEN
      RAISE EXCEPTION 'Protected profile fields can only be changed by admins';
    END IF;
    -- A student may only reset status to pending when uploading a new card; that also clears verification.
    IF NEW.id_verification_status IS DISTINCT FROM OLD.id_verification_status THEN
      IF NEW.id_verification_status <> 'pending' THEN
        RAISE EXCEPTION 'Verification status is set by the verification service';
      END IF;
    END IF;
    IF NEW.id_card_url IS DISTINCT FROM OLD.id_card_url OR NEW.student_id IS DISTINCT FROM OLD.student_id OR NEW.full_name IS DISTINCT FROM OLD.full_name THEN
      NEW.is_verified := false;
      NEW.id_verified_at := NULL;
      NEW.id_verification_status := CASE WHEN NEW.id_card_url IS NULL THEN 'none' ELSE 'pending' END;
    END IF;
  END IF;
  RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.protect_profile_fields() FROM PUBLIC, anon, authenticated;

-- Storage policies: files live under "<user_id>/..."
CREATE POLICY "Avatar public read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Own avatar upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Own avatar update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Own avatar delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Own id card read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'id-cards' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(), 'admin'::public.app_role)));
CREATE POLICY "Own id card upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'id-cards' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Own id card update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'id-cards' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Own id card delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'id-cards' AND (storage.foldername(name))[1] = auth.uid()::text);
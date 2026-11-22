-- Communication Calling, Media Storage & Two-Layer Student Verification Hardening

-- 1. Storage buckets: community-attachments & private id_cards
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community-attachments',
  'community-attachments',
  true,
  26214400, -- 25 MB
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm',
    'audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/mp4',
    'application/pdf', 'text/plain',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'id_cards',
  'id_cards',
  false, -- Private bucket; previewed via createSignedUrl
  10485760, -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS for community-attachments
DROP POLICY IF EXISTS "Authenticated read community attachments" ON storage.objects;
CREATE POLICY "Authenticated read community attachments"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'community-attachments');

DROP POLICY IF EXISTS "Users upload own community attachments" ON storage.objects;
CREATE POLICY "Users upload own community attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'community-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users delete own community attachments" ON storage.objects;
CREATE POLICY "Users delete own community attachments"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'community-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage RLS for private id_cards (owner + amir/admin)
DROP POLICY IF EXISTS "Owner or admin read id_cards" ON storage.objects;
CREATE POLICY "Owner or admin read id_cards"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'id_cards'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR private.is_amir_or_admin()
  )
);

DROP POLICY IF EXISTS "Owner upload id_cards" ON storage.objects;
CREATE POLICY "Owner upload id_cards"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'id_cards'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Owner update id_cards" ON storage.objects;
CREATE POLICY "Owner update id_cards"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'id_cards'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Owner delete id_cards" ON storage.objects;
CREATE POLICY "Owner delete id_cards"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'id_cards'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. Dedicated Voice & Video Calling Tables
CREATE TABLE IF NOT EXISTS public.community_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.community_conversations(id) ON DELETE CASCADE,
  university_id uuid NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  caller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_kind text NOT NULL CHECK (media_kind IN ('voice', 'video')),
  call_scope text NOT NULL CHECK (call_scope IN ('direct', 'group', 'channel')),
  status text NOT NULL DEFAULT 'ringing' CHECK (status IN ('ringing', 'active', 'ended', 'missed', 'declined', 'cancelled')),
  title text NOT NULL,
  avatar_initials text NOT NULL DEFAULT 'MJ',
  avatar_color text NOT NULL DEFAULT 'from-emerald-600 to-teal-700',
  started_at timestamptz NOT NULL DEFAULT now(),
  answered_at timestamptz,
  ended_at timestamptz,
  duration_sec integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS community_calls_conv_idx
  ON public.community_calls (conversation_id, started_at DESC);
CREATE INDEX IF NOT EXISTS community_calls_uni_idx
  ON public.community_calls (university_id, started_at DESC);

CREATE TABLE IF NOT EXISTS public.community_call_participants (
  call_id uuid NOT NULL REFERENCES public.community_calls(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'ringing' CHECK (status IN ('invited', 'ringing', 'joined', 'left', 'declined')),
  is_muted boolean NOT NULL DEFAULT false,
  is_video_on boolean NOT NULL DEFAULT false,
  is_screen_sharing boolean NOT NULL DEFAULT false,
  is_host boolean NOT NULL DEFAULT false,
  joined_at timestamptz,
  left_at timestamptz,
  PRIMARY KEY (call_id, user_id)
);

CREATE INDEX IF NOT EXISTS community_call_participants_user_idx
  ON public.community_call_participants (user_id, call_id);

ALTER TABLE public.community_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_call_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View calls in accessible conversations or own participation" ON public.community_calls;
CREATE POLICY "View calls in accessible conversations or own participation"
ON public.community_calls FOR SELECT TO authenticated
USING (
  university_id = private.caller_university()
  AND (
    caller_id = auth.uid()
    OR private.can_view_community_conversation(conversation_id)
    OR EXISTS (
      SELECT 1 FROM public.community_call_participants p
      WHERE p.call_id = id AND p.user_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "Create calls in accessible conversations" ON public.community_calls;
CREATE POLICY "Create calls in accessible conversations"
ON public.community_calls FOR INSERT TO authenticated
WITH CHECK (
  caller_id = auth.uid()
  AND university_id = private.caller_university()
  AND private.can_view_community_conversation(conversation_id)
);

DROP POLICY IF EXISTS "Update calls as caller or participant" ON public.community_calls;
CREATE POLICY "Update calls as caller or participant"
ON public.community_calls FOR UPDATE TO authenticated
USING (
  caller_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.community_call_participants p
    WHERE p.call_id = id AND p.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "View call participants" ON public.community_call_participants;
CREATE POLICY "View call participants"
ON public.community_call_participants FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.community_calls c
    WHERE c.id = call_id
      AND (c.caller_id = auth.uid() OR private.can_view_community_conversation(c.conversation_id))
  )
);

DROP POLICY IF EXISTS "Manage own call participant row or as host" ON public.community_call_participants;
CREATE POLICY "Manage own call participant row or as host"
ON public.community_call_participants FOR ALL TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.community_calls c
    WHERE c.id = call_id AND c.caller_id = auth.uid()
  )
)
WITH CHECK (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.community_calls c
    WHERE c.id = call_id AND c.caller_id = auth.uid()
  )
);

DROP TRIGGER IF EXISTS community_calls_updated_at ON public.community_calls;
CREATE TRIGGER community_calls_updated_at
  BEFORE UPDATE ON public.community_calls
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.community_calls REPLICA IDENTITY FULL;
ALTER TABLE public.community_call_participants REPLICA IDENTITY FULL;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['community_calls', 'community_call_participants'] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;

-- Call RPCs with notification delivery
CREATE OR REPLACE FUNCTION public.create_community_call(
  _conversation_id uuid,
  _media_kind text,
  _call_scope text,
  _callee_ids uuid[] DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _caller_id uuid := auth.uid();
  _uni_id uuid := private.caller_university();
  _conv record;
  _caller_name text;
  _call_id uuid;
  _targets uuid[];
  _uid uuid;
  _route text;
BEGIN
  IF _caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF NOT private.can_view_community_conversation(_conversation_id) THEN
    RAISE EXCEPTION 'Conversation is not accessible';
  END IF;

  SELECT * INTO _conv
  FROM public.community_conversations
  WHERE id = _conversation_id;

  SELECT full_name INTO _caller_name
  FROM public.profiles
  WHERE id = _caller_id;

  INSERT INTO public.community_calls (
    conversation_id, university_id, caller_id, media_kind, call_scope, status, title, avatar_color
  ) VALUES (
    _conversation_id,
    _uni_id,
    _caller_id,
    _media_kind,
    _call_scope,
    'ringing',
    _conv.title,
    _conv.avatar_color
  )
  RETURNING id INTO _call_id;

  INSERT INTO public.community_call_participants (
    call_id, user_id, status, is_muted, is_video_on, is_host, joined_at
  ) VALUES (
    _call_id, _caller_id, 'joined', false, (_media_kind = 'video'), true, now()
  )
  ON CONFLICT (call_id, user_id) DO NOTHING;

  IF _callee_ids IS NOT NULL AND array_length(_callee_ids, 1) > 0 THEN
    _targets := _callee_ids;
  ELSE
    SELECT ARRAY(
      SELECT user_id FROM public.community_members
      WHERE conversation_id = _conversation_id AND user_id <> _caller_id
    ) INTO _targets;
  END IF;

  IF _call_scope = 'group' THEN
    _route := '/calls/group/' || _call_id::text;
  ELSE
    _route := '/calls/' || _media_kind || '/' || _call_id::text;
  END IF;

  IF _targets IS NOT NULL THEN
    FOREACH _uid IN ARRAY _targets LOOP
      IF _uid <> _caller_id THEN
        INSERT INTO public.community_call_participants (
          call_id, user_id, status, is_muted, is_video_on, is_host
        ) VALUES (
          _call_id, _uid, 'ringing', false, (_media_kind = 'video'), false
        )
        ON CONFLICT (call_id, user_id) DO NOTHING;

        INSERT INTO public.notifications (user_id, title, body, deep_link, category)
        VALUES (
          _uid,
          CASE WHEN _media_kind = 'video' THEN 'Incoming video call' ELSE 'Incoming voice call' END,
          COALESCE(_caller_name, 'Community member') || ' is calling in ' || COALESCE(_conv.title, 'Community'),
          _route,
          'call'
        );
      END IF;
    END LOOP;
  END IF;

  RETURN _call_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_community_call_status(
  _call_id uuid,
  _status text,
  _duration_sec integer DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _caller_uid uuid := auth.uid();
  _call record;
  _p record;
  _caller_name text;
BEGIN
  IF _caller_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO _call FROM public.community_calls WHERE id = _call_id;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF NOT (
    _call.caller_id = _caller_uid
    OR private.can_view_community_conversation(_call.conversation_id)
    OR EXISTS (SELECT 1 FROM public.community_call_participants p WHERE p.call_id = _call_id AND p.user_id = _caller_uid)
  ) THEN
    RAISE EXCEPTION 'Not authorized for this call';
  END IF;

  UPDATE public.community_calls
  SET
    status = _status,
    answered_at = CASE WHEN _status = 'active' AND answered_at IS NULL THEN now() ELSE answered_at END,
    ended_at = CASE WHEN _status IN ('ended', 'missed', 'declined', 'cancelled') THEN now() ELSE ended_at END,
    duration_sec = COALESCE(_duration_sec, duration_sec)
  WHERE id = _call_id;

  IF _status = 'active' THEN
    UPDATE public.community_call_participants
    SET status = 'joined', joined_at = COALESCE(joined_at, now())
    WHERE call_id = _call_id AND user_id = _caller_uid;
  ELSIF _status = 'declined' THEN
    UPDATE public.community_call_participants
    SET status = 'declined', left_at = now()
    WHERE call_id = _call_id AND user_id = _caller_uid;
  ELSIF _status IN ('ended', 'missed', 'cancelled') THEN
    UPDATE public.community_call_participants
    SET left_at = COALESCE(left_at, now())
    WHERE call_id = _call_id;
  END IF;

  IF _status = 'missed' THEN
    SELECT full_name INTO _caller_name FROM public.profiles WHERE id = _call.caller_id;
    FOR _p IN
      SELECT user_id FROM public.community_call_participants
      WHERE call_id = _call_id AND user_id <> _call.caller_id AND status IN ('ringing', 'invited')
    LOOP
      INSERT INTO public.notifications (user_id, title, body, deep_link, category)
      VALUES (
        _p.user_id,
        'Missed ' || _call.media_kind || ' call',
        'Missed call from ' || COALESCE(_caller_name, 'Community member') || ' (' || _call.title || ')',
        '/calls/history',
        'call'
      );
    END LOOP;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.invite_call_participants(
  _call_id uuid,
  _user_ids uuid[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _caller_uid uuid := auth.uid();
  _call record;
  _inviter_name text;
  _uid uuid;
  _route text;
BEGIN
  IF _caller_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  SELECT * INTO _call FROM public.community_calls WHERE id = _call_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Call not found';
  END IF;

  SELECT full_name INTO _inviter_name FROM public.profiles WHERE id = _caller_uid;
  _route := CASE WHEN _call.call_scope = 'group' THEN '/calls/group/' ELSE '/calls/' || _call.media_kind || '/' END || _call.id::text;

  FOREACH _uid IN ARRAY _user_ids LOOP
    INSERT INTO public.community_call_participants (call_id, user_id, status, is_video_on)
    VALUES (_call_id, _uid, 'invited', _call.media_kind = 'video')
    ON CONFLICT (call_id, user_id) DO NOTHING;

    INSERT INTO public.notifications (user_id, title, body, deep_link, category)
    VALUES (
      _uid,
      'Call invitation',
      COALESCE(_inviter_name, 'A member') || ' invited you to ' || _call.title,
      _route,
      'call'
    );
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.create_community_call(uuid, text, text, uuid[]) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.update_community_call_status(uuid, text, integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.invite_call_participants(uuid, uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_community_call(uuid, text, text, uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_community_call_status(uuid, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.invite_call_participants(uuid, uuid[]) TO authenticated;

-- 3. Allow trusted SECURITY DEFINER verification RPCs & service role to update is_verified
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _bypass boolean := current_setting('app.bypass_profile_protection', true) = 'on'
    OR auth.role() = 'service_role';
BEGIN
  IF _bypass OR public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF (NEW.is_verified IS TRUE OR NEW.is_cafe_student IS TRUE) THEN
      RAISE EXCEPTION 'Protected profile fields (is_verified, is_cafe_student) can only be set by admins';
    END IF;
    RETURN NEW;
  END IF;

  IF (NEW.is_verified IS DISTINCT FROM OLD.is_verified)
     OR (NEW.is_cafe_student IS DISTINCT FROM OLD.is_cafe_student)
     OR (NEW.university_id IS DISTINCT FROM OLD.university_id) THEN
    RAISE EXCEPTION 'Protected profile fields (is_verified, is_cafe_student, university_id) can only be changed by admins';
  END IF;
  RETURN NEW;
END;
$$;

-- 4. Harden Student Verification Schema, Audit Logs, and Admin/Amir Review Workflow
ALTER TABLE public.student_verifications
  ADD COLUMN IF NOT EXISTS verification_method text NOT NULL DEFAULT 'name_lookup',
  ADD COLUMN IF NOT EXISTS admission_year text,
  ADD COLUMN IF NOT EXISTS enrollment_status text,
  ADD COLUMN IF NOT EXISTS portal_photo_url text,
  ADD COLUMN IF NOT EXISTS matched_record jsonb,
  ADD COLUMN IF NOT EXISTS ocr_extracted jsonb,
  ADD COLUMN IF NOT EXISTS attempt_count integer NOT NULL DEFAULT 1;

-- Fix verification_audit_logs RLS: allow owners to view their own verification logs, prevent arbitrary inserts
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.verification_audit_logs;
DROP POLICY IF EXISTS "Owners and admins can view verification audit logs" ON public.verification_audit_logs;
CREATE POLICY "Owners and admins can view verification audit logs"
ON public.verification_audit_logs FOR SELECT TO authenticated
USING (
  private.is_amir_or_admin()
  OR EXISTS (
    SELECT 1 FROM public.student_verifications sv
    WHERE sv.id = verification_id AND sv.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users and admins can insert audit logs" ON public.verification_audit_logs;
CREATE POLICY "Owners and admins insert own verification audit logs"
ON public.verification_audit_logs FOR INSERT TO authenticated
WITH CHECK (
  private.is_amir_or_admin()
  OR EXISTS (
    SELECT 1 FROM public.student_verifications sv
    WHERE sv.id = verification_id AND sv.user_id = auth.uid()
  )
);

-- Updated submission RPC: supports Approach 1 results and Approach 2 ID-card review submissions
CREATE OR REPLACE FUNCTION public.submit_student_verification(
  _full_name text,
  _student_id text DEFAULT NULL,
  _department text DEFAULT NULL,
  _batch_year text DEFAULT NULL,
  _id_card_url text DEFAULT NULL,
  _verification_method text DEFAULT 'name_lookup',
  _ocr_extracted jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _v_id uuid;
  _existing_status text;
  _new_status text;
  _normalized_name text;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  _normalized_name := trim(regexp_replace(coalesce(_full_name, ''), '\s+', ' ', 'g'));
  IF length(_normalized_name) < 3 THEN
    RAISE EXCEPTION 'Please enter your official full name';
  END IF;

  IF _id_card_url IS NOT NULL AND length(trim(_id_card_url)) > 0 THEN
    _new_status := 'pending_admin_review';
  ELSE
    _new_status := 'additional_identification_required';
  END IF;

  SELECT id, status INTO _v_id, _existing_status
  FROM public.student_verifications
  WHERE user_id = _uid;

  IF _v_id IS NOT NULL THEN
    UPDATE public.student_verifications
    SET
      full_name = _normalized_name,
      student_id = coalesce(nullif(trim(_student_id), ''), student_id),
      department = coalesce(nullif(trim(_department), ''), department),
      batch_year = coalesce(nullif(trim(_batch_year), ''), batch_year),
      id_card_url = coalesce(nullif(trim(_id_card_url), ''), id_card_url),
      verification_method = coalesce(_verification_method, verification_method),
      ocr_extracted = coalesce(_ocr_extracted, ocr_extracted),
      rejection_reason = CASE WHEN _new_status = 'pending_admin_review' THEN NULL ELSE rejection_reason END,
      status = _new_status,
      attempt_count = attempt_count + 1,
      updated_at = now()
    WHERE id = _v_id;
  ELSE
    INSERT INTO public.student_verifications (
      user_id, full_name, student_id, department, batch_year, id_card_url,
      verification_method, ocr_extracted, status
    ) VALUES (
      _uid, _normalized_name, nullif(trim(_student_id), ''), nullif(trim(_department), ''),
      nullif(trim(_batch_year), ''), nullif(trim(_id_card_url), ''),
      coalesce(_verification_method, 'name_lookup'), _ocr_extracted, _new_status
    )
    RETURNING id INTO _v_id;
  END IF;

  INSERT INTO public.verification_audit_logs (
    verification_id, actor_id, previous_status, new_status, notes
  ) VALUES (
    _v_id,
    _uid,
    _existing_status,
    _new_status,
    CASE
      WHEN _new_status = 'pending_admin_review' THEN 'Submitted Student ID card and credentials for administrator review'
      ELSE 'Submitted student name details; additional ID verification requested'
    END
  );

  INSERT INTO public.notifications (user_id, title, body, deep_link, category)
  VALUES (
    _uid,
    CASE
      WHEN _new_status = 'pending_admin_review' THEN 'Verification submitted for review'
      ELSE 'Additional ID required'
    END,
    CASE
      WHEN _new_status = 'pending_admin_review' THEN 'Your ASTU student ID document has been queued for administrator review.'
      ELSE 'Please upload your ASTU Student ID card to complete verification.'
    END,
    '/verification',
    'verification'
  );

  RETURN _v_id;
END;
$$;

-- Keep backward-compatible 5-arg wrapper if older callers omit method/ocr
CREATE OR REPLACE FUNCTION public.submit_student_verification(
  _full_name text,
  _student_id text DEFAULT NULL,
  _department text DEFAULT NULL,
  _batch_year text DEFAULT NULL,
  _id_card_url text DEFAULT NULL
)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.submit_student_verification(_full_name, _student_id, _department, _batch_year, _id_card_url, 'name_lookup', NULL);
$$;

-- Admin/Amir Review RPC
CREATE OR REPLACE FUNCTION public.review_student_verification(
  _verification_id uuid,
  _decision text,
  _notes text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _reviewer uuid := auth.uid();
  _rec record;
  _next_status text;
BEGIN
  IF NOT private.is_amir_or_admin() THEN
    RAISE EXCEPTION 'Only ASTU Jemea Amirs or Administrators can review student verifications';
  END IF;
  IF _decision NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Decision must be approved or rejected';
  END IF;

  SELECT * INTO _rec FROM public.student_verifications WHERE id = _verification_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Verification record not found';
  END IF;

  _next_status := CASE WHEN _decision = 'approved' THEN 'verified' ELSE 'rejected' END;

  UPDATE public.student_verifications
  SET
    status = _next_status,
    reviewed_by = _reviewer,
    verified_at = CASE WHEN _next_status = 'verified' THEN now() ELSE NULL END,
    admin_notes = nullif(trim(_notes), ''),
    rejection_reason = CASE WHEN _next_status = 'rejected' THEN COALESCE(nullif(trim(_notes), ''), 'Verification could not be confirmed.') ELSE NULL END,
    updated_at = now()
  WHERE id = _verification_id;

  PERFORM set_config('app.bypass_profile_protection', 'on', true);

  UPDATE public.profiles
  SET
    is_verified = (_next_status = 'verified'),
    full_name = CASE WHEN _next_status = 'verified' THEN COALESCE(_rec.full_name, full_name) ELSE full_name END,
    student_id = CASE WHEN _next_status = 'verified' THEN COALESCE(_rec.student_id, student_id) ELSE student_id END,
    department = CASE WHEN _next_status = 'verified' THEN COALESCE(_rec.department, department) ELSE department END,
    batch_year = CASE WHEN _next_status = 'verified' THEN COALESCE(_rec.batch_year, batch_year) ELSE batch_year END,
    id_card_url = CASE WHEN _next_status = 'verified' THEN COALESCE(_rec.id_card_url, id_card_url) ELSE id_card_url END
  WHERE id = _rec.user_id;

  INSERT INTO public.verification_audit_logs (
    verification_id, actor_id, previous_status, new_status, notes
  ) VALUES (
    _verification_id,
    _reviewer,
    _rec.status,
    _next_status,
    COALESCE(nullif(trim(_notes), ''), CASE WHEN _next_status = 'verified' THEN 'Approved by administrator' ELSE 'Rejected by administrator' END)
  );

  INSERT INTO public.notifications (user_id, title, body, deep_link, category)
  VALUES (
    _rec.user_id,
    CASE WHEN _next_status = 'verified' THEN 'Student status verified' ELSE 'Verification needs attention' END,
    CASE
      WHEN _next_status = 'verified' THEN 'Your ASTU student verification has been approved. Full campus features are now unlocked.'
      ELSE COALESCE(nullif(trim(_notes), ''), 'Your verification could not be confirmed. Review reviewer notes and resubmit.')
    END,
    '/verification',
    'verification'
  );
END;
$$;

-- Admin/Amir Queue Listing RPC
CREATE OR REPLACE FUNCTION public.admin_student_verifications()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  status text,
  full_name text,
  student_id text,
  department text,
  batch_year text,
  id_card_url text,
  verification_method text,
  admission_year text,
  enrollment_status text,
  matched_record jsonb,
  ocr_extracted jsonb,
  rejection_reason text,
  admin_notes text,
  attempt_count integer,
  verified_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT private.is_amir_or_admin() THEN
    RAISE EXCEPTION 'Only ASTU Jemea Amirs or Administrators can inspect verification queue';
  END IF;

  RETURN QUERY
  SELECT
    sv.id, sv.user_id, sv.status, sv.full_name, sv.student_id, sv.department,
    sv.batch_year, sv.id_card_url, sv.verification_method, sv.admission_year,
    sv.enrollment_status, sv.matched_record, sv.ocr_extracted, sv.rejection_reason,
    sv.admin_notes, sv.attempt_count, sv.verified_at, sv.created_at, sv.updated_at
  FROM public.student_verifications sv
  JOIN public.profiles p ON p.id = sv.user_id
  WHERE p.university_id = private.caller_university()
  ORDER BY
    CASE sv.status
      WHEN 'pending_admin_review' THEN 1
      WHEN 'additional_identification_required' THEN 2
      WHEN 'rejected' THEN 3
      ELSE 4
    END,
    sv.updated_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_student_verification(text, text, text, text, text, text, jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.submit_student_verification(text, text, text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.review_student_verification(uuid, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_student_verifications() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_student_verification(text, text, text, text, text, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_student_verification(text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_student_verification(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_student_verifications() TO authenticated;

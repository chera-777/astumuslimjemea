-- Community Messaging Hub, Settings, Channels, Groups, Contacts Directory & Committee Meetings
-- Preserves university boundaries, Halal gender boundaries for photos, and strict RBAC.

-- 1. Extend profiles with messaging identity & presence fields (user-editable, non-privileged)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS online_status text NOT NULL DEFAULT 'recently';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_online_status_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_online_status_check
      CHECK (online_status IN ('online', 'recently', 'offline'));
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique_idx
  ON public.profiles (lower(username))
  WHERE username IS NOT NULL AND length(trim(username)) > 0;

-- 2. Private RLS helper functions (avoid recursion and block direct anon exposure)
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.caller_university()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT university_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION private.caller_gender()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lower(gender) FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION private.is_committee_member()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('committee'::public.app_role, 'amir'::public.app_role, 'admin'::public.app_role)
  );
$$;

CREATE OR REPLACE FUNCTION private.is_amir_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('amir'::public.app_role, 'admin'::public.app_role)
  );
$$;

CREATE OR REPLACE FUNCTION private.is_blocked_between(_a uuid, _b uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_blocks
    WHERE (blocker_id = _a AND blocked_id = _b)
       OR (blocker_id = _b AND blocked_id = _a)
  );
$$;

REVOKE ALL ON FUNCTION private.caller_university() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.caller_gender() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.is_committee_member() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.is_amir_or_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.is_blocked_between(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.caller_university() TO authenticated;
GRANT EXECUTE ON FUNCTION private.caller_gender() TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_committee_member() TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_amir_or_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_blocked_between(uuid, uuid) TO authenticated;

-- 3. Community messaging tables
CREATE TABLE IF NOT EXISTS public.community_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('direct', 'group', 'channel')),
  university_id uuid NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  title text NOT NULL,
  username text,
  description text,
  invite_code text NOT NULL DEFAULT encode(gen_random_bytes(6), 'hex'),
  avatar_color text NOT NULL DEFAULT 'from-emerald-600 to-teal-700',
  is_public boolean NOT NULL DEFAULT false,
  wallpaper_id text NOT NULL DEFAULT 'default',
  sharing_disabled boolean NOT NULL DEFAULT false,
  boost_count integer NOT NULL DEFAULT 0,
  channel_settings jsonb NOT NULL DEFAULT '{"allowReactions":true,"allowForwarding":true,"silentPosts":false}'::jsonb,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS community_conversations_username_idx
  ON public.community_conversations (lower(username))
  WHERE username IS NOT NULL AND length(trim(username)) > 0;
CREATE UNIQUE INDEX IF NOT EXISTS community_conversations_invite_idx
  ON public.community_conversations (invite_code);
CREATE INDEX IF NOT EXISTS community_conversations_uni_type_idx
  ON public.community_conversations (university_id, type, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.community_members (
  conversation_id uuid NOT NULL REFERENCES public.community_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  permissions jsonb NOT NULL DEFAULT '{"canSendMessages":true,"canPinMessages":false,"canInviteMembers":false,"canCreatePolls":false}'::jsonb,
  is_pinned boolean NOT NULL DEFAULT false,
  is_muted boolean NOT NULL DEFAULT false,
  draft_text text NOT NULL DEFAULT '',
  last_read_at timestamptz NOT NULL DEFAULT now(),
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS community_members_user_idx
  ON public.community_members (user_id, conversation_id);

CREATE TABLE IF NOT EXISTS public.community_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.community_conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text text NOT NULL DEFAULT '',
  reply_to_id uuid REFERENCES public.community_messages(id) ON DELETE SET NULL,
  forwarded_from jsonb,
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  poll jsonb,
  is_pinned boolean NOT NULL DEFAULT false,
  deleted_for_all boolean NOT NULL DEFAULT false,
  views_count integer NOT NULL DEFAULT 1,
  edited_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS community_messages_conv_created_idx
  ON public.community_messages (conversation_id, created_at ASC);

CREATE TABLE IF NOT EXISTS public.community_message_reactions (
  message_id uuid NOT NULL REFERENCES public.community_messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id, user_id, emoji)
);

CREATE TABLE IF NOT EXISTS public.community_poll_votes (
  message_id uuid NOT NULL REFERENCES public.community_messages(id) ON DELETE CASCADE,
  option_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id, option_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.community_user_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_preferences jsonb NOT NULL DEFAULT '{"enabled":true,"directMessages":true,"groupMessages":true,"channelPosts":true,"mentionsOnly":false,"soundEnabled":true,"showMessagePreview":true,"quietHoursEnabled":false,"quietHoursRange":"22:30 – 05:30"}'::jsonb,
  privacy_settings jsonb NOT NULL DEFAULT '{"lastSeenVisibility":"university","profilePhotoVisibility":"university","allowDirectMessagesFrom":"everyone","readReceiptsEnabled":true}'::jsonb,
  media_preferences jsonb NOT NULL DEFAULT '{"autoDownloadPhotos":true,"autoDownloadFiles":false,"autoPlayVoice":true,"showWaveforms":true,"compressMediaUploads":true}'::jsonb,
  accessibility_preferences jsonb NOT NULL DEFAULT '{"textSize":"default","compactMode":false,"reducedMotion":false,"highContrastBubbles":false}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.committee_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  meeting_type text NOT NULL DEFAULT 'video' CHECK (meeting_type IN ('voice', 'video')),
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended')),
  scheduled_date date NOT NULL,
  scheduled_time text NOT NULL,
  host_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_user_ids uuid[] NOT NULL DEFAULT ARRAY[]::uuid[],
  started_at timestamptz,
  ended_at timestamptz,
  notifications_sent_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.committee_meeting_participants (
  meeting_id uuid NOT NULL REFERENCES public.committee_meetings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_muted boolean NOT NULL DEFAULT false,
  is_video_on boolean NOT NULL DEFAULT false,
  is_host boolean NOT NULL DEFAULT false,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (meeting_id, user_id)
);

-- 4. Conversation-level helper functions
CREATE OR REPLACE FUNCTION private.is_community_member(_conversation_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.community_members
    WHERE conversation_id = _conversation_id
      AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION private.is_community_admin(_conversation_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.community_members
    WHERE conversation_id = _conversation_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
  );
$$;

CREATE OR REPLACE FUNCTION private.can_view_community_conversation(_conversation_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.community_conversations c
    WHERE c.id = _conversation_id
      AND c.university_id = private.caller_university()
      AND (
        c.is_public = true
        OR private.is_community_member(c.id)
      )
  );
$$;

CREATE OR REPLACE FUNCTION private.can_send_community_message(_conversation_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.community_conversations c
    JOIN public.community_members m ON m.conversation_id = c.id AND m.user_id = auth.uid()
    WHERE c.id = _conversation_id
      AND c.university_id = private.caller_university()
      AND (
        (c.type = 'direct' AND NOT EXISTS (
          SELECT 1 FROM public.community_members other
          WHERE other.conversation_id = c.id
            AND other.user_id <> auth.uid()
            AND private.is_blocked_between(auth.uid(), other.user_id)
        ))
        OR (c.type = 'group' AND (m.role IN ('owner', 'admin') OR COALESCE((m.permissions->>'canSendMessages')::boolean, true)))
        OR (c.type = 'channel' AND m.role IN ('owner', 'admin'))
      )
  );
$$;

REVOKE ALL ON FUNCTION private.is_community_member(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.is_community_admin(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.can_view_community_conversation(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.can_send_community_message(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_community_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_community_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.can_view_community_conversation(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.can_send_community_message(uuid) TO authenticated;

-- 5. Enable Row Level Security & Define Strict Policies
ALTER TABLE public.community_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committee_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committee_meeting_participants ENABLE ROW LEVEL SECURITY;

-- Conversations
DROP POLICY IF EXISTS "View accessible university conversations" ON public.community_conversations;
CREATE POLICY "View accessible university conversations"
ON public.community_conversations FOR SELECT TO authenticated
USING (private.can_view_community_conversation(id));

DROP POLICY IF EXISTS "Create conversations in own university" ON public.community_conversations;
CREATE POLICY "Create conversations in own university"
ON public.community_conversations FOR INSERT TO authenticated
WITH CHECK (
  created_by = auth.uid()
  AND university_id = private.caller_university()
);

DROP POLICY IF EXISTS "Update conversations as owner admin or direct participant" ON public.community_conversations;
CREATE POLICY "Update conversations as owner admin or direct participant"
ON public.community_conversations FOR UPDATE TO authenticated
USING (
  university_id = private.caller_university()
  AND (
    (type = 'direct' AND private.is_community_member(id))
    OR private.is_community_admin(id)
  )
)
WITH CHECK (
  university_id = private.caller_university()
);

DROP POLICY IF EXISTS "Delete conversations as creator or direct participant" ON public.community_conversations;
CREATE POLICY "Delete conversations as creator or direct participant"
ON public.community_conversations FOR DELETE TO authenticated
USING (
  university_id = private.caller_university()
  AND (
    created_by = auth.uid()
    OR (type = 'direct' AND private.is_community_member(id))
  )
);

-- Members
DROP POLICY IF EXISTS "View members of accessible conversations" ON public.community_members;
CREATE POLICY "View members of accessible conversations"
ON public.community_members FOR SELECT TO authenticated
USING (private.can_view_community_conversation(conversation_id));

DROP POLICY IF EXISTS "Insert self or manage members" ON public.community_members;
CREATE POLICY "Insert self or manage members"
ON public.community_members FOR INSERT TO authenticated
WITH CHECK (
  (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.community_conversations c
      WHERE c.id = conversation_id
        AND c.university_id = private.caller_university()
        AND (c.is_public = true OR c.created_by = auth.uid())
    )
  )
  OR (
    private.is_community_admin(conversation_id)
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = user_id AND p.university_id = private.caller_university()
    )
  )
);

DROP POLICY IF EXISTS "Update own preferences or admin member roles" ON public.community_members;
CREATE POLICY "Update own preferences or admin member roles"
ON public.community_members FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR private.is_community_admin(conversation_id))
WITH CHECK (
  (
    user_id = auth.uid()
    AND role = (SELECT cm.role FROM public.community_members cm WHERE cm.conversation_id = community_members.conversation_id AND cm.user_id = auth.uid())
    AND permissions = (SELECT cm.permissions FROM public.community_members cm WHERE cm.conversation_id = community_members.conversation_id AND cm.user_id = auth.uid())
  )
  OR private.is_community_admin(conversation_id)
);

DROP POLICY IF EXISTS "Leave conversation or admin remove member" ON public.community_members;
CREATE POLICY "Leave conversation or admin remove member"
ON public.community_members FOR DELETE TO authenticated
USING (user_id = auth.uid() OR private.is_community_admin(conversation_id));

-- Messages
DROP POLICY IF EXISTS "View messages in accessible conversations" ON public.community_messages;
CREATE POLICY "View messages in accessible conversations"
ON public.community_messages FOR SELECT TO authenticated
USING (private.can_view_community_conversation(conversation_id));

DROP POLICY IF EXISTS "Send permitted messages" ON public.community_messages;
CREATE POLICY "Send permitted messages"
ON public.community_messages FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND private.can_send_community_message(conversation_id)
);

DROP POLICY IF EXISTS "Edit or delete or pin messages" ON public.community_messages;
CREATE POLICY "Edit or delete or pin messages"
ON public.community_messages FOR UPDATE TO authenticated
USING (
  private.can_view_community_conversation(conversation_id)
  AND (
    sender_id = auth.uid()
    OR private.is_community_admin(conversation_id)
    OR EXISTS (
      SELECT 1 FROM public.community_members cm
      WHERE cm.conversation_id = community_messages.conversation_id
        AND cm.user_id = auth.uid()
        AND COALESCE((cm.permissions->>'canPinMessages')::boolean, false)
    )
  )
);

DROP POLICY IF EXISTS "Delete own messages or admin purge" ON public.community_messages;
CREATE POLICY "Delete own messages or admin purge"
ON public.community_messages FOR DELETE TO authenticated
USING (
  sender_id = auth.uid()
  OR private.is_community_admin(conversation_id)
  OR EXISTS (
    SELECT 1 FROM public.community_conversations c
    WHERE c.id = conversation_id AND c.type = 'direct' AND private.is_community_member(c.id)
  )
);

-- Reactions
DROP POLICY IF EXISTS "View message reactions" ON public.community_message_reactions;
CREATE POLICY "View message reactions"
ON public.community_message_reactions FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.community_messages m
    WHERE m.id = message_id AND private.can_view_community_conversation(m.conversation_id)
  )
);

DROP POLICY IF EXISTS "Add own reaction" ON public.community_message_reactions;
CREATE POLICY "Add own reaction"
ON public.community_message_reactions FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.community_messages m
    JOIN public.community_conversations c ON c.id = m.conversation_id
    WHERE m.id = message_id
      AND private.can_view_community_conversation(m.conversation_id)
      AND COALESCE((c.channel_settings->>'allowReactions')::boolean, true)
  )
);

DROP POLICY IF EXISTS "Remove own reaction" ON public.community_message_reactions;
CREATE POLICY "Remove own reaction"
ON public.community_message_reactions FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- Poll votes
DROP POLICY IF EXISTS "View poll votes" ON public.community_poll_votes;
CREATE POLICY "View poll votes"
ON public.community_poll_votes FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.community_messages m
    WHERE m.id = message_id AND private.can_view_community_conversation(m.conversation_id)
  )
);

DROP POLICY IF EXISTS "Vote in poll" ON public.community_poll_votes;
CREATE POLICY "Vote in poll"
ON public.community_poll_votes FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.community_messages m
    WHERE m.id = message_id AND private.can_view_community_conversation(m.conversation_id)
  )
);

DROP POLICY IF EXISTS "Withdraw poll vote" ON public.community_poll_votes;
CREATE POLICY "Withdraw poll vote"
ON public.community_poll_votes FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- User community settings (private to owner)
DROP POLICY IF EXISTS "Manage own community settings" ON public.community_user_settings;
CREATE POLICY "Manage own community settings"
ON public.community_user_settings FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Committee meetings (strictly committee / amir / admin only)
DROP POLICY IF EXISTS "Authorized committee view meetings" ON public.committee_meetings;
CREATE POLICY "Authorized committee view meetings"
ON public.committee_meetings FOR SELECT TO authenticated
USING (
  private.is_committee_member()
  AND university_id = private.caller_university()
  AND (
    private.is_amir_or_admin()
    OR host_id = auth.uid()
    OR auth.uid() = ANY(invited_user_ids)
  )
);

DROP POLICY IF EXISTS "Authorized committee create meetings" ON public.committee_meetings;
CREATE POLICY "Authorized committee create meetings"
ON public.committee_meetings FOR INSERT TO authenticated
WITH CHECK (
  private.is_committee_member()
  AND university_id = private.caller_university()
  AND host_id = auth.uid()
);

DROP POLICY IF EXISTS "Host or amir manage meetings" ON public.committee_meetings;
CREATE POLICY "Host or amir manage meetings"
ON public.committee_meetings FOR UPDATE TO authenticated
USING (
  private.is_committee_member()
  AND university_id = private.caller_university()
  AND (host_id = auth.uid() OR private.is_amir_or_admin())
);

DROP POLICY IF EXISTS "Authorized committee view meeting participants" ON public.committee_meeting_participants;
CREATE POLICY "Authorized committee view meeting participants"
ON public.committee_meeting_participants FOR SELECT TO authenticated
USING (
  private.is_committee_member()
  AND EXISTS (
    SELECT 1 FROM public.committee_meetings m
    WHERE m.id = meeting_id
      AND m.university_id = private.caller_university()
      AND (private.is_amir_or_admin() OR m.host_id = auth.uid() OR auth.uid() = ANY(m.invited_user_ids))
  )
);

DROP POLICY IF EXISTS "Authorized committee join or manage participants" ON public.committee_meeting_participants;
CREATE POLICY "Authorized committee join or manage participants"
ON public.committee_meeting_participants FOR ALL TO authenticated
USING (
  private.is_committee_member()
  AND (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.committee_meetings m
      WHERE m.id = meeting_id AND (m.host_id = auth.uid() OR private.is_amir_or_admin())
    )
  )
)
WITH CHECK (
  private.is_committee_member()
  AND (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.committee_meetings m
      WHERE m.id = meeting_id AND (m.host_id = auth.uid() OR private.is_amir_or_admin())
    )
  )
);

-- 6. Safe Security-Definer RPCs for Messaging Directory & Direct Chat Creation
CREATE OR REPLACE FUNCTION public.get_community_directory()
RETURNS TABLE(
  id uuid,
  full_name text,
  username text,
  bio text,
  department text,
  batch_year text,
  avatar_url text,
  online_status text,
  last_seen_at timestamptz,
  portal_roles text[],
  is_verified boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.full_name,
    COALESCE(NULLIF(trim(p.username), ''), '@' || lower(regexp_replace(split_part(p.full_name, ' ', 1), '[^a-zA-Z0-9]', '', 'g')) || '_' || substr(p.id::text, 1, 4)) AS username,
    COALESCE(p.bio, NULLIF(concat_ws(' · ', p.department, p.batch_year), ''), 'ASTU Muslim Jemea Member') AS bio,
    COALESCE(p.department, 'ASTU Member') AS department,
    COALESCE(p.batch_year, 'Student') AS batch_year,
    CASE
      WHEN lower(p.gender) = 'female' AND private.caller_gender() <> 'female' AND p.id <> auth.uid() THEN NULL
      ELSE p.profile_photo_url
    END AS avatar_url,
    CASE
      WHEN COALESCE(s.privacy_settings->>'lastSeenVisibility', 'university') = 'nobody' AND p.id <> auth.uid() THEN 'offline'
      ELSE p.online_status
    END AS online_status,
    CASE
      WHEN COALESCE(s.privacy_settings->>'lastSeenVisibility', 'university') = 'nobody' AND p.id <> auth.uid() THEN now() - interval '7 days'
      ELSE p.last_seen_at
    END AS last_seen_at,
    COALESCE(
      ARRAY(SELECT ur.role::text FROM public.user_roles ur WHERE ur.user_id = p.id),
      ARRAY['student']::text[]
    ) AS portal_roles,
    COALESCE(p.is_verified, false) AS is_verified
  FROM public.profiles p
  LEFT JOIN public.community_user_settings s ON s.user_id = p.id
  WHERE p.university_id = private.caller_university()
  ORDER BY p.full_name ASC;
$$;

CREATE OR REPLACE FUNCTION public.get_or_create_direct_conversation(_target_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _caller_id uuid := auth.uid();
  _uni_id uuid := private.caller_university();
  _target_uni uuid;
  _target_name text;
  _existing_id uuid;
  _new_id uuid;
BEGIN
  IF _caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF _target_user_id = _caller_id THEN
    RAISE EXCEPTION 'Cannot start a direct chat with yourself';
  END IF;
  SELECT university_id, full_name INTO _target_uni, _target_name
  FROM public.profiles WHERE id = _target_user_id;
  IF _target_uni IS NULL OR _target_uni <> _uni_id THEN
    RAISE EXCEPTION 'Member not found in your university';
  END IF;
  IF private.is_blocked_between(_caller_id, _target_user_id) THEN
    RAISE EXCEPTION 'Direct messaging is blocked between these accounts';
  END IF;

  SELECT c.id INTO _existing_id
  FROM public.community_conversations c
  JOIN public.community_members m1 ON m1.conversation_id = c.id AND m1.user_id = _caller_id
  JOIN public.community_members m2 ON m2.conversation_id = c.id AND m2.user_id = _target_user_id
  WHERE c.type = 'direct'
  LIMIT 1;

  IF _existing_id IS NOT NULL THEN
    RETURN _existing_id;
  END IF;

  INSERT INTO public.community_conversations (type, university_id, title, created_by, is_public)
  VALUES ('direct', _uni_id, _target_name, _caller_id, false)
  RETURNING id INTO _new_id;

  INSERT INTO public.community_members (conversation_id, user_id, role, permissions)
  VALUES
    (_new_id, _caller_id, 'owner', '{"canSendMessages":true,"canPinMessages":true,"canInviteMembers":false,"canCreatePolls":false}'::jsonb),
    (_new_id, _target_user_id, 'owner', '{"canSendMessages":true,"canPinMessages":true,"canInviteMembers":false,"canCreatePolls":false}'::jsonb);

  RETURN _new_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.boost_community_channel(_conversation_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _next integer;
BEGIN
  IF NOT private.can_view_community_conversation(_conversation_id) THEN
    RAISE EXCEPTION 'Channel not accessible';
  END IF;
  UPDATE public.community_conversations
  SET boost_count = boost_count + 1
  WHERE id = _conversation_id AND type = 'channel'
  RETURNING boost_count INTO _next;
  RETURN COALESCE(_next, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.get_community_directory() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_or_create_direct_conversation(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.boost_community_channel(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_community_directory() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_direct_conversation(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.boost_community_channel(uuid) TO authenticated;

-- 7. Triggers for timestamps and automatic conversation updated_at bump on new message
CREATE OR REPLACE FUNCTION public.bump_community_conversation_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.community_conversations
  SET updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.bump_community_conversation_updated_at() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS community_conversations_updated_at ON public.community_conversations;
CREATE TRIGGER community_conversations_updated_at
  BEFORE UPDATE ON public.community_conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS community_user_settings_updated_at ON public.community_user_settings;
CREATE TRIGGER community_user_settings_updated_at
  BEFORE UPDATE ON public.community_user_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS committee_meetings_updated_at ON public.committee_meetings;
CREATE TRIGGER committee_meetings_updated_at
  BEFORE UPDATE ON public.committee_meetings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS community_messages_bump_conv ON public.community_messages;
CREATE TRIGGER community_messages_bump_conv
  AFTER INSERT ON public.community_messages
  FOR EACH ROW EXECUTE FUNCTION public.bump_community_conversation_updated_at();

-- 8. Realtime publication & full replica identity
ALTER TABLE public.community_conversations REPLICA IDENTITY FULL;
ALTER TABLE public.community_members REPLICA IDENTITY FULL;
ALTER TABLE public.community_messages REPLICA IDENTITY FULL;
ALTER TABLE public.community_message_reactions REPLICA IDENTITY FULL;
ALTER TABLE public.community_poll_votes REPLICA IDENTITY FULL;
ALTER TABLE public.committee_meetings REPLICA IDENTITY FULL;
ALTER TABLE public.committee_meeting_participants REPLICA IDENTITY FULL;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'community_conversations',
    'community_members',
    'community_messages',
    'community_message_reactions',
    'community_poll_votes',
    'committee_meetings',
    'committee_meeting_participants'
  ] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;

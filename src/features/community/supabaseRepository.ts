import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/integrations/supabase/types";
import { supabase as defaultSupabase } from "@/integrations/supabase/client";
import { assertCommitteeAccess } from "./committeeAccess";
import type {
  ChannelSettings,
  ChatMessage,
  CommitteeMeeting,
  CommunityAccessibilityPreferences,
  CommunityMediaPreferences,
  CommunityNotificationPreferences,
  CommunityPrivacySettings,
  CommunityProfileUpdateInput,
  CommunitySnapshot,
  CommunityUser,
  Conversation,
  ConversationType,
  CreateChannelInput,
  CreateGroupInput,
  ForwardedAttribution,
  GroupMember,
  GroupMemberPermissions,
  GroupRole,
  ICommunityRepository,
  MeetingParticipant,
  MeetingStatus,
  MeetingType,
  MessageAttachment,
  MessageReaction,
  PollData,
  PresenceStatus,
  ScheduleMeetingInput,
  SendMessageInput,
} from "./types";

const DEFAULT_NOTIFICATION_PREFS: CommunityNotificationPreferences = {
  enabled: true,
  directMessages: true,
  groupMessages: true,
  channelPosts: true,
  mentionsOnly: false,
  soundEnabled: true,
  showMessagePreview: true,
  quietHoursEnabled: false,
  quietHoursRange: "22:30 – 05:30",
};

const DEFAULT_PRIVACY_SETTINGS: CommunityPrivacySettings = {
  lastSeenVisibility: "university",
  profilePhotoVisibility: "university",
  allowDirectMessagesFrom: "everyone",
  readReceiptsEnabled: true,
};

const DEFAULT_MEDIA_PREFS: CommunityMediaPreferences = {
  autoDownloadPhotos: true,
  autoDownloadFiles: false,
  autoPlayVoice: true,
  showWaveforms: true,
  compressMediaUploads: true,
};

const DEFAULT_ACCESSIBILITY_PREFS: CommunityAccessibilityPreferences = {
  textSize: "default",
  compactMode: false,
  reducedMotion: false,
  highContrastBubbles: false,
};

const DEFAULT_CHANNEL_SETTINGS: ChannelSettings = {
  allowReactions: true,
  allowForwarding: true,
  silentPosts: false,
};

const AVATAR_COLORS = [
  "from-emerald-600 to-teal-700",
  "from-teal-600 to-cyan-700",
  "from-sky-600 to-blue-700",
  "from-violet-600 to-purple-700",
  "from-amber-600 to-orange-700",
  "from-rose-600 to-pink-700",
];

function computeInitials(name: string, fallback = "AM"): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
  if (words.length === 1 && words[0].length >= 2) return words[0].slice(0, 2).toUpperCase();
  return (words[0]?.[0] || fallback).toUpperCase();
}

function pickAvatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function deriveCommunityRole(roles: string[]): string {
  if (roles.includes("admin")) return "Admin";
  if (roles.includes("amir")) return "Amir";
  if (roles.includes("committee")) return "Committee Member";
  return "Member";
}

function normalizePermissions(raw: unknown): GroupMemberPermissions {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    canSendMessages: obj.canSendMessages !== false,
    canPinMessages: Boolean(obj.canPinMessages),
    canInviteMembers: Boolean(obj.canInviteMembers),
    canCreatePolls: Boolean(obj.canCreatePolls),
  };
}

function normalizeChannelSettings(raw: unknown): ChannelSettings {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    allowReactions: obj.allowReactions !== false,
    allowForwarding: obj.allowForwarding !== false,
    silentPosts: Boolean(obj.silentPosts),
  };
}

export class SupabaseCommunityRepository implements ICommunityRepository {
  private client: SupabaseClient<Database>;
  private cachedUserId: string | null = null;
  private cachedUniversityId: string | null = null;

  constructor(client: SupabaseClient<Database> = defaultSupabase) {
    this.client = client;
  }

  private async requireContext(): Promise<{ userId: string; universityId: string }> {
    const { data: userData, error: userErr } = await this.client.auth.getUser();
    if (userErr || !userData.user) {
      throw new Error("Sign in required for Community messaging.");
    }
    const userId = userData.user.id;
    if (this.cachedUserId === userId && this.cachedUniversityId) {
      return { userId, universityId: this.cachedUniversityId };
    }
    const { data: profileRow, error: profileErr } = await this.client
      .from("profiles")
      .select("university_id")
      .eq("id", userId)
      .maybeSingle();
    if (profileErr || !profileRow?.university_id) {
      throw new Error("Complete your student profile to access Community.");
    }
    this.cachedUserId = userId;
    this.cachedUniversityId = profileRow.university_id;
    return { userId, universityId: profileRow.university_id };
  }

  async getSnapshot(): Promise<CommunitySnapshot> {
    const { userId } = await this.requireContext();

    const [
      dirRes,
      blocksRes,
      settingsRes,
      convsRes,
      membersRes,
      msgsRes,
    ] = await Promise.all([
      this.client.rpc("get_community_directory"),
      this.client.from("user_blocks").select("blocked_id").eq("blocker_id", userId),
      this.client.from("community_user_settings").select("*").eq("user_id", userId).maybeSingle(),
      this.client.from("community_conversations").select("*").order("updated_at", { ascending: false }),
      this.client.from("community_members").select("*"),
      this.client.from("community_messages").select("*").order("created_at", { ascending: true }),
    ]);

    if (dirRes.error) throw dirRes.error;
    if (convsRes.error) throw convsRes.error;
    if (membersRes.error) throw membersRes.error;
    if (msgsRes.error) throw msgsRes.error;

    const blockedSet = new Set((blocksRes.data ?? []).map((b) => b.blocked_id));

    const users: Record<string, CommunityUser> = {};
    for (const row of dirRes.data ?? []) {
      const roles = row.portal_roles ?? ["student"];
      users[row.id] = {
        id: row.id,
        fullName: row.full_name,
        username: row.username.startsWith("@") ? row.username : `@${row.username}`,
        bio: row.bio,
        department: row.department,
        batchYear: row.batch_year,
        avatarInitials: computeInitials(row.full_name),
        avatarColor: pickAvatarColor(row.id),
        avatarUrl: row.avatar_url ?? undefined,
        status: (row.online_status as PresenceStatus) || "recently",
        lastSeenAt: row.last_seen_at,
        communityRole: deriveCommunityRole(roles),
        portalRoles: roles,
        isBlocked: blockedSet.has(row.id),
      };
    }

    const messageIds = (msgsRes.data ?? []).map((m) => m.id);
    const [reactionsRes, pollVotesRes] = messageIds.length
      ? await Promise.all([
          this.client.from("community_message_reactions").select("*").in("message_id", messageIds),
          this.client.from("community_poll_votes").select("*").in("message_id", messageIds),
        ])
      : [{ data: [], error: null }, { data: [], error: null }];

    if (reactionsRes.error) throw reactionsRes.error;
    if (pollVotesRes.error) throw pollVotesRes.error;

    const reactionsByMsg = new Map<string, Map<string, string[]>>();
    for (const r of reactionsRes.data ?? []) {
      if (!reactionsByMsg.has(r.message_id)) reactionsByMsg.set(r.message_id, new Map());
      const emojiMap = reactionsByMsg.get(r.message_id)!;
      const list = emojiMap.get(r.emoji) ?? [];
      list.push(r.user_id);
      emojiMap.set(r.emoji, list);
    }

    const votesByMsgOption = new Map<string, Map<string, string[]>>();
    for (const v of pollVotesRes.data ?? []) {
      if (!votesByMsgOption.has(v.message_id)) votesByMsgOption.set(v.message_id, new Map());
      const optMap = votesByMsgOption.get(v.message_id)!;
      const list = optMap.get(v.option_id) ?? [];
      list.push(v.user_id);
      optMap.set(v.option_id, list);
    }

    const membersByConv = new Map<string, typeof membersRes.data>();
    for (const m of membersRes.data ?? []) {
      const arr = membersByConv.get(m.conversation_id) ?? [];
      arr.push(m);
      membersByConv.set(m.conversation_id, arr);
    }

    const messagesByConversation: Record<string, ChatMessage[]> = {};
    const pinnedByConv = new Map<string, string[]>();

    for (const row of msgsRes.data ?? []) {
      const emojiMap = reactionsByMsg.get(row.id);
      const reactions: MessageReaction[] = emojiMap
        ? Array.from(emojiMap.entries()).map(([emoji, userIds]) => ({ emoji, userIds }))
        : [];

      let poll: PollData | undefined;
      if (row.poll && typeof row.poll === "object" && !Array.isArray(row.poll)) {
        const rawPoll = row.poll as unknown as PollData;
        const optVotes = votesByMsgOption.get(row.id);
        poll = {
          ...rawPoll,
          options: (rawPoll.options ?? []).map((opt) => ({
            ...opt,
            voterIds: optVotes?.get(opt.id) ?? opt.voterIds ?? [],
          })),
        };
      }

      const attachments = Array.isArray(row.attachments)
        ? (row.attachments as unknown as MessageAttachment[])
        : undefined;

      const forwardedFrom =
        row.forwarded_from && typeof row.forwarded_from === "object"
          ? (row.forwarded_from as unknown as ForwardedAttribution)
          : undefined;

      const msg: ChatMessage = {
        id: row.id,
        conversationId: row.conversation_id,
        senderId: row.sender_id,
        text: row.text,
        createdAt: row.created_at,
        editedAt: row.edited_at ?? undefined,
        deletedForAll: row.deleted_for_all,
        replyToId: row.reply_to_id ?? undefined,
        forwardedFrom,
        attachments: attachments && attachments.length > 0 ? attachments : undefined,
        poll,
        viewsCount: row.views_count,
        reactions,
        deliveryStatus: "read",
        isPinned: row.is_pinned,
      };

      if (!messagesByConversation[row.conversation_id]) {
        messagesByConversation[row.conversation_id] = [];
      }
      messagesByConversation[row.conversation_id].push(msg);

      if (row.is_pinned && !row.deleted_for_all) {
        const pins = pinnedByConv.get(row.conversation_id) ?? [];
        pins.push(row.id);
        pinnedByConv.set(row.conversation_id, pins);
      }
    }

    const conversations: Conversation[] = (convsRes.data ?? []).map((row) => {
      const convMembersRows = membersByConv.get(row.id) ?? [];
      const myMemberRow = convMembersRows.find((m) => m.user_id === userId);
      const members: GroupMember[] = convMembersRows.map((m) => ({
        userId: m.user_id,
        role: (m.role as GroupRole) || "member",
        joinedAt: m.joined_at,
        permissions: normalizePermissions(m.permissions),
      }));
      const participantIds = convMembersRows.map((m) => m.user_id);

      let displayTitle = row.title;
      let displayUsername = row.username ?? undefined;
      let avatarInitials = computeInitials(row.title);
      let avatarColor = row.avatar_color || pickAvatarColor(row.id);

      if (row.type === "direct") {
        const peerId = participantIds.find((pid) => pid !== userId);
        const peer = peerId ? users[peerId] : undefined;
        if (peer) {
          displayTitle = peer.fullName;
          displayUsername = peer.username;
          avatarInitials = peer.avatarInitials;
          avatarColor = peer.avatarColor;
        }
      }

      const convMsgs = messagesByConversation[row.id] ?? [];
      const lastReadMs = myMemberRow?.last_read_at
        ? new Date(myMemberRow.last_read_at).getTime()
        : 0;
      const unreadCount = myMemberRow
        ? convMsgs.filter(
            (m) =>
              m.senderId !== userId &&
              !m.deletedForAll &&
              new Date(m.createdAt).getTime() > lastReadMs
          ).length
        : 0;

      const prefix = row.type === "channel" ? "ch" : "join";

      return {
        id: row.id,
        type: row.type as ConversationType,
        title: displayTitle,
        username: displayUsername,
        description: row.description ?? undefined,
        inviteLink: `https://astujemea.app/${prefix}/${row.invite_code}`,
        participantIds,
        members,
        pinnedMessageIds: pinnedByConv.get(row.id) ?? [],
        unreadCount,
        isPinned: myMemberRow?.is_pinned ?? false,
        isMuted: myMemberRow?.is_muted ?? false,
        typingUserIds: [],
        draftText: myMemberRow?.draft_text ?? "",
        updatedAt: row.updated_at,
        avatarInitials,
        avatarColor,
        isPublic: row.is_public,
        wallpaperId: row.wallpaper_id || "default",
        sharingDisabled: row.sharing_disabled,
        subscriberCount: row.type === "channel" ? convMembersRows.length : undefined,
        boostCount: row.type === "channel" ? row.boost_count : undefined,
        isSubscribed: row.type === "channel" ? Boolean(myMemberRow) : undefined,
        channelSettings:
          row.type === "channel" ? normalizeChannelSettings(row.channel_settings) : undefined,
      };
    });

    const rawSettings = settingsRes.data;
    return {
      currentUserId: userId,
      users,
      conversations,
      messagesByConversation,
      notificationPreferences: {
        ...DEFAULT_NOTIFICATION_PREFS,
        ...((rawSettings?.notification_preferences as Partial<CommunityNotificationPreferences>) ?? {}),
      },
      privacySettings: {
        ...DEFAULT_PRIVACY_SETTINGS,
        ...((rawSettings?.privacy_settings as Partial<CommunityPrivacySettings>) ?? {}),
      },
      mediaPreferences: {
        ...DEFAULT_MEDIA_PREFS,
        ...((rawSettings?.media_preferences as Partial<CommunityMediaPreferences>) ?? {}),
      },
      accessibilityPreferences: {
        ...DEFAULT_ACCESSIBILITY_PREFS,
        ...((rawSettings?.accessibility_preferences as Partial<CommunityAccessibilityPreferences>) ?? {}),
      },
    };
  }

  async uploadAttachment(
    file: File | Blob,
    conversationId: string,
    meta?: {
      fileName?: string;
      mimeType?: string;
      type?: "image" | "video" | "file" | "voice";
      durationSec?: number;
      waveform?: number[];
    }
  ): Promise<MessageAttachment> {
    const { userId } = await this.requireContext();
    const rawName =
      meta?.fileName ||
      (file instanceof File ? file.name : `voice-${Date.now()}.webm`);
    const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const objectPath = `${userId}/${conversationId}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 6)}-${safeName}`;
    const mimeType = meta?.mimeType || file.type || "application/octet-stream";

    const { error: uploadErr } = await this.client.storage
      .from("community-attachments")
      .upload(objectPath, file, { contentType: mimeType, upsert: false });

    if (uploadErr) throw uploadErr;

    const { data: pub } = this.client.storage
      .from("community-attachments")
      .getPublicUrl(objectPath);

    const inferredType =
      meta?.type ??
      (mimeType.startsWith("image/")
        ? "image"
        : mimeType.startsWith("video/")
          ? "video"
          : mimeType.startsWith("audio/")
            ? "voice"
            : "file");

    return {
      id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: inferredType,
      name: rawName,
      url: pub.publicUrl,
      sizeBytes: file.size,
      mimeType,
      ...(meta?.durationSec !== undefined ? { durationSec: meta.durationSec } : {}),
      ...(meta?.waveform ? { waveform: meta.waveform } : {}),
    };
  }

  async sendMessage(input: SendMessageInput): Promise<ChatMessage> {
    const { userId } = await this.requireContext();
    const { data, error } = await this.client
      .from("community_messages")
      .insert({
        conversation_id: input.conversationId,
        sender_id: userId,
        text: input.text,
        reply_to_id: input.replyToId ?? null,
        forwarded_from: (input.forwardedFrom ?? null) as Json,
        attachments: (input.attachments ?? []) as unknown as Json,
        poll: (input.poll ?? null) as unknown as Json,
      })
      .select("*")
      .single();

    if (error) throw error;

    await this.client
      .from("community_members")
      .update({ draft_text: "", last_read_at: new Date().toISOString() })
      .eq("conversation_id", input.conversationId)
      .eq("user_id", userId);

    return {
      id: data.id,
      conversationId: data.conversation_id,
      senderId: data.sender_id,
      text: data.text,
      createdAt: data.created_at,
      replyToId: data.reply_to_id ?? undefined,
      forwardedFrom: (data.forwarded_from as unknown as ForwardedAttribution) ?? undefined,
      attachments:
        Array.isArray(data.attachments) && data.attachments.length > 0
          ? (data.attachments as unknown as MessageAttachment[])
          : undefined,
      poll: (data.poll as unknown as PollData) ?? undefined,
      viewsCount: data.views_count,
      reactions: [],
      deliveryStatus: "delivered",
      isPinned: data.is_pinned,
    };
  }

  async editMessage(conversationId: string, messageId: string, newText: string): Promise<ChatMessage | null> {
    const { data, error } = await this.client
      .from("community_messages")
      .update({ text: newText, edited_at: new Date().toISOString() })
      .eq("id", messageId)
      .eq("conversation_id", conversationId)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      id: data.id,
      conversationId: data.conversation_id,
      senderId: data.sender_id,
      text: data.text,
      createdAt: data.created_at,
      editedAt: data.edited_at ?? undefined,
      reactions: [],
      deliveryStatus: "read",
      isPinned: data.is_pinned,
    };
  }

  async deleteMessage(conversationId: string, messageId: string, forEveryone: boolean): Promise<void> {
    if (forEveryone) {
      const { error } = await this.client
        .from("community_messages")
        .update({
          text: "",
          attachments: [] as unknown as Json,
          poll: null,
          deleted_for_all: true,
          is_pinned: false,
        })
        .eq("id", messageId)
        .eq("conversation_id", conversationId);
      if (error) throw error;
      return;
    }
    const { error } = await this.client
      .from("community_messages")
      .delete()
      .eq("id", messageId)
      .eq("conversation_id", conversationId);
    if (error) throw error;
  }

  async toggleReaction(_conversationId: string, messageId: string, userId: string, emoji: string): Promise<void> {
    const { data: existing, error: fetchErr } = await this.client
      .from("community_message_reactions")
      .select("emoji")
      .eq("message_id", messageId)
      .eq("user_id", userId)
      .eq("emoji", emoji)
      .maybeSingle();
    if (fetchErr) throw fetchErr;

    if (existing) {
      const { error } = await this.client
        .from("community_message_reactions")
        .delete()
        .eq("message_id", messageId)
        .eq("user_id", userId)
        .eq("emoji", emoji);
      if (error) throw error;
    } else {
      const { error } = await this.client
        .from("community_message_reactions")
        .insert({ message_id: messageId, user_id: userId, emoji });
      if (error) throw error;
    }
  }

  async votePoll(conversationId: string, messageId: string, optionId: string, userId: string): Promise<void> {
    const { data: msgRow, error: msgErr } = await this.client
      .from("community_messages")
      .select("poll")
      .eq("id", messageId)
      .eq("conversation_id", conversationId)
      .maybeSingle();
    if (msgErr) throw msgErr;
    const poll = msgRow?.poll as unknown as PollData | null;

    const { data: existingVotes, error: votesErr } = await this.client
      .from("community_poll_votes")
      .select("option_id")
      .eq("message_id", messageId)
      .eq("user_id", userId);
    if (votesErr) throw votesErr;

    const alreadyVotedThisOption = (existingVotes ?? []).some((v) => v.option_id === optionId);
    if (alreadyVotedThisOption) {
      const { error } = await this.client
        .from("community_poll_votes")
        .delete()
        .eq("message_id", messageId)
        .eq("option_id", optionId)
        .eq("user_id", userId);
      if (error) throw error;
      return;
    }

    if (!poll?.multipleChoice && (existingVotes ?? []).length > 0) {
      await this.client
        .from("community_poll_votes")
        .delete()
        .eq("message_id", messageId)
        .eq("user_id", userId);
    }

    const { error } = await this.client
      .from("community_poll_votes")
      .insert({ message_id: messageId, option_id: optionId, user_id: userId });
    if (error) throw error;
  }

  async togglePinMessage(conversationId: string, messageId: string): Promise<void> {
    const { data, error: fetchErr } = await this.client
      .from("community_messages")
      .select("is_pinned")
      .eq("id", messageId)
      .eq("conversation_id", conversationId)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!data) return;

    const { error } = await this.client
      .from("community_messages")
      .update({ is_pinned: !data.is_pinned })
      .eq("id", messageId)
      .eq("conversation_id", conversationId);
    if (error) throw error;
  }

  async togglePinConversation(conversationId: string): Promise<void> {
    const { userId } = await this.requireContext();
    const { data } = await this.client
      .from("community_members")
      .select("is_pinned")
      .eq("conversation_id", conversationId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!data) return;
    const { error } = await this.client
      .from("community_members")
      .update({ is_pinned: !data.is_pinned })
      .eq("conversation_id", conversationId)
      .eq("user_id", userId);
    if (error) throw error;
  }

  async toggleMuteConversation(conversationId: string): Promise<void> {
    const { userId } = await this.requireContext();
    const { data } = await this.client
      .from("community_members")
      .select("is_muted")
      .eq("conversation_id", conversationId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!data) return;
    const { error } = await this.client
      .from("community_members")
      .update({ is_muted: !data.is_muted })
      .eq("conversation_id", conversationId)
      .eq("user_id", userId);
    if (error) throw error;
  }

  async setConversationWallpaper(conversationId: string, wallpaperId: string): Promise<void> {
    const { error } = await this.client
      .from("community_conversations")
      .update({ wallpaper_id: wallpaperId })
      .eq("id", conversationId);
    if (error) throw error;
  }

  async toggleDisableSharing(conversationId: string): Promise<void> {
    const { data } = await this.client
      .from("community_conversations")
      .select("sharing_disabled")
      .eq("id", conversationId)
      .maybeSingle();
    if (!data) return;
    const { error } = await this.client
      .from("community_conversations")
      .update({ sharing_disabled: !data.sharing_disabled })
      .eq("id", conversationId);
    if (error) throw error;
  }

  async exportConversationHistory(conversationId: string): Promise<{ filename: string; content: string }> {
    const snapshot = await this.getSnapshot();
    const conv = snapshot.conversations.find((c) => c.id === conversationId);
    const messages = snapshot.messagesByConversation[conversationId] ?? [];
    const lines = [
      `Chat History Export: ${conv?.title ?? "Conversation"}`,
      `Exported: ${new Date().toISOString()}`,
      `Total messages: ${messages.length}`,
      "----------------------------------------",
      ...messages.map((m) => {
        const sender = snapshot.users[m.senderId]?.fullName ?? "Member";
        const body = m.deletedForAll
          ? "[deleted]"
          : m.poll
            ? `[Poll] ${m.poll.question}`
            : m.text || (m.attachments?.map((a) => `[${a.type}: ${a.name}]`).join(" ") ?? "");
        return `[${new Date(m.createdAt).toLocaleString()}] ${sender}: ${body}`;
      }),
    ];
    const safeName = (conv?.title || "chat").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return { filename: `${safeName}-history.txt`, content: lines.join("\n") };
  }

  async markConversationRead(conversationId: string): Promise<void> {
    const { userId } = await this.requireContext();
    await this.client
      .from("community_members")
      .update({ last_read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .eq("user_id", userId);
  }

  async saveDraft(conversationId: string, draftText: string): Promise<void> {
    const { userId } = await this.requireContext();
    await this.client
      .from("community_members")
      .update({ draft_text: draftText })
      .eq("conversation_id", conversationId)
      .eq("user_id", userId);
  }

  async clearConversationHistory(conversationId: string): Promise<void> {
    const { error } = await this.client
      .from("community_messages")
      .delete()
      .eq("conversation_id", conversationId);
    if (error) throw error;
  }

  async deleteConversation(conversationId: string): Promise<void> {
    const { error } = await this.client
      .from("community_conversations")
      .delete()
      .eq("id", conversationId);
    if (error) throw error;
  }

  async leaveConversation(conversationId: string): Promise<void> {
    const { userId } = await this.requireContext();
    const { error } = await this.client
      .from("community_members")
      .delete()
      .eq("conversation_id", conversationId)
      .eq("user_id", userId);
    if (error) throw error;
  }

  async reportConversation(conversationId: string, reason: string): Promise<void> {
    const { userId } = await this.requireContext();
    const { error } = await this.client.from("content_reports").insert({
      reporter_id: userId,
      target_type: "community_conversation",
      target_id: conversationId,
      reason,
    });
    if (error) throw error;
  }

  async getOrCreateDirectConversation(userId: string): Promise<Conversation> {
    const { data: convId, error } = await this.client.rpc(
      "get_or_create_direct_conversation",
      { _target_user_id: userId }
    );
    if (error || !convId) {
      throw error ?? new Error("Could not open direct conversation.");
    }
    const snap = await this.getSnapshot();
    const found = snap.conversations.find((c) => c.id === convId);
    if (!found) throw new Error("Direct conversation was created but could not be loaded.");
    return found;
  }

  async createGroup(input: CreateGroupInput): Promise<Conversation> {
    const { userId, universityId } = await this.requireContext();
    const { data: convRow, error: convErr } = await this.client
      .from("community_conversations")
      .insert({
        type: "group",
        university_id: universityId,
        title: input.title.trim(),
        description: input.description.trim() || "ASTU Muslim Jemea community group",
        is_public: Boolean(input.isPublic),
        avatar_color: pickAvatarColor(input.title),
        created_by: userId,
      })
      .select("id")
      .single();
    if (convErr || !convRow) throw convErr ?? new Error("Failed to create group");

    const ownerPermissions: GroupMemberPermissions = {
      canSendMessages: true,
      canPinMessages: true,
      canInviteMembers: true,
      canCreatePolls: true,
    };
    const memberPermissions: GroupMemberPermissions = {
      canSendMessages: true,
      canPinMessages: false,
      canInviteMembers: false,
      canCreatePolls: false,
    };

    const uniqueOtherIds = Array.from(new Set(input.memberIds)).filter((id) => id !== userId);
    const { error: ownerErr } = await this.client.from("community_members").insert({
      conversation_id: convRow.id,
      user_id: userId,
      role: "owner",
      permissions: ownerPermissions as unknown as Json,
    });
    if (ownerErr) throw ownerErr;

    if (uniqueOtherIds.length > 0) {
      const { error: membersErr } = await this.client.from("community_members").insert(
        uniqueOtherIds.map((uid) => ({
          conversation_id: convRow.id,
          user_id: uid,
          role: "member",
          permissions: memberPermissions as unknown as Json,
        }))
      );
      if (membersErr) throw membersErr;
    }

    await this.client.from("community_messages").insert({
      conversation_id: convRow.id,
      sender_id: userId,
      text: `Assalamu Alaikum! Created group "${input.title.trim()}".`,
    });

    const snap = await this.getSnapshot();
    const created = snap.conversations.find((c) => c.id === convRow.id);
    if (!created) throw new Error("Group created but could not be loaded.");
    return created;
  }

  async createChannel(input: CreateChannelInput): Promise<Conversation> {
    const { userId, universityId } = await this.requireContext();
    const slug = (input.username || input.title)
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, "_")
      .replace(/(^_|_$)/g, "")
      .slice(0, 24);

    const { data: convRow, error: convErr } = await this.client
      .from("community_conversations")
      .insert({
        type: "channel",
        university_id: universityId,
        title: input.title.trim(),
        username: slug ? `@${slug}` : null,
        description: input.description.trim() || "ASTU Muslim Jemea broadcast channel",
        is_public: input.isPublic ?? true,
        avatar_color: "from-emerald-600 to-teal-800",
        channel_settings: DEFAULT_CHANNEL_SETTINGS as unknown as Json,
        created_by: userId,
      })
      .select("id")
      .single();
    if (convErr || !convRow) throw convErr ?? new Error("Failed to create channel");

    const { error: ownerErr } = await this.client.from("community_members").insert({
      conversation_id: convRow.id,
      user_id: userId,
      role: "owner",
      permissions: {
        canSendMessages: true,
        canPinMessages: true,
        canInviteMembers: true,
        canCreatePolls: true,
      } as unknown as Json,
    });
    if (ownerErr) throw ownerErr;

    await this.client.from("community_messages").insert({
      conversation_id: convRow.id,
      sender_id: userId,
      text: `Channel "${input.title.trim()}" created. Broadcast updates to subscribers here.`,
    });

    const snap = await this.getSnapshot();
    const created = snap.conversations.find((c) => c.id === convRow.id);
    if (!created) throw new Error("Channel created but could not be loaded.");
    return created;
  }

  async subscribeChannel(conversationId: string): Promise<void> {
    const { userId } = await this.requireContext();
    const { error } = await this.client.from("community_members").upsert(
      {
        conversation_id: conversationId,
        user_id: userId,
        role: "member",
        permissions: {
          canSendMessages: false,
          canPinMessages: false,
          canInviteMembers: false,
          canCreatePolls: false,
        } as unknown as Json,
      },
      { onConflict: "conversation_id,user_id" }
    );
    if (error) throw error;
  }

  async boostChannel(conversationId: string): Promise<void> {
    const { error } = await this.client.rpc("boost_community_channel", {
      _conversation_id: conversationId,
    });
    if (error) throw error;
  }

  async updateChannelSettings(conversationId: string, settings: Partial<ChannelSettings>): Promise<void> {
    const { data } = await this.client
      .from("community_conversations")
      .select("channel_settings")
      .eq("id", conversationId)
      .maybeSingle();
    const merged = { ...normalizeChannelSettings(data?.channel_settings), ...settings };
    const { error } = await this.client
      .from("community_conversations")
      .update({
        channel_settings: merged as unknown as Json,
        sharing_disabled: !merged.allowForwarding,
      })
      .eq("id", conversationId);
    if (error) throw error;
  }

  async updateGroupDetails(
    conversationId: string,
    updates: { title?: string; description?: string; regenerateInvite?: boolean }
  ): Promise<Conversation | null> {
    const patch: Database["public"]["Tables"]["community_conversations"]["Update"] = {};
    if (updates.title !== undefined) patch.title = updates.title.trim();
    if (updates.description !== undefined) patch.description = updates.description.trim();
    if (updates.regenerateInvite) {
      patch.invite_code = Math.random().toString(36).slice(2, 10);
    }
    const { error } = await this.client
      .from("community_conversations")
      .update(patch)
      .eq("id", conversationId);
    if (error) throw error;
    const snap = await this.getSnapshot();
    return snap.conversations.find((c) => c.id === conversationId) ?? null;
  }

  async addGroupMember(conversationId: string, userId: string): Promise<void> {
    const { data: conv } = await this.client
      .from("community_conversations")
      .select("type")
      .eq("id", conversationId)
      .maybeSingle();
    const isChannel = conv?.type === "channel";
    const { error } = await this.client.from("community_members").upsert(
      {
        conversation_id: conversationId,
        user_id: userId,
        role: isChannel ? "admin" : "member",
        permissions: {
          canSendMessages: true,
          canPinMessages: isChannel,
          canInviteMembers: isChannel,
          canCreatePolls: isChannel,
        } as unknown as Json,
      },
      { onConflict: "conversation_id,user_id" }
    );
    if (error) throw error;
  }

  async removeGroupMember(conversationId: string, userId: string): Promise<void> {
    const { error } = await this.client
      .from("community_members")
      .delete()
      .eq("conversation_id", conversationId)
      .eq("user_id", userId);
    if (error) throw error;
  }

  async updateGroupMemberRole(conversationId: string, userId: string, role: GroupRole): Promise<void> {
    const adminPerms = {
      canSendMessages: true,
      canPinMessages: true,
      canInviteMembers: true,
      canCreatePolls: true,
    };
    const patch: Database["public"]["Tables"]["community_members"]["Update"] = { role };
    if (role === "admin" || role === "owner") {
      patch.permissions = adminPerms as unknown as Json;
    }
    const { error } = await this.client
      .from("community_members")
      .update(patch)
      .eq("conversation_id", conversationId)
      .eq("user_id", userId);
    if (error) throw error;
  }

  async updateGroupMemberPermissions(
    conversationId: string,
    userId: string,
    permissions: Partial<GroupMemberPermissions>
  ): Promise<void> {
    const { data } = await this.client
      .from("community_members")
      .select("permissions")
      .eq("conversation_id", conversationId)
      .eq("user_id", userId)
      .maybeSingle();
    const merged = { ...normalizePermissions(data?.permissions), ...permissions };
    const { error } = await this.client
      .from("community_members")
      .update({ permissions: merged as unknown as Json })
      .eq("conversation_id", conversationId)
      .eq("user_id", userId);
    if (error) throw error;
  }

  async toggleBlockUser(targetUserId: string): Promise<void> {
    const { userId } = await this.requireContext();
    const { data: existing } = await this.client
      .from("user_blocks")
      .select("id")
      .eq("blocker_id", userId)
      .eq("blocked_id", targetUserId)
      .maybeSingle();
    if (existing) {
      const { error } = await this.client.from("user_blocks").delete().eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await this.client
        .from("user_blocks")
        .insert({ blocker_id: userId, blocked_id: targetUserId });
      if (error) throw error;
    }
  }

  private async upsertSettingsColumn<K extends "notification_preferences" | "privacy_settings" | "media_preferences" | "accessibility_preferences">(
    column: K,
    defaults: Record<string, unknown>,
    patch: Record<string, unknown>
  ) {
    const { userId } = await this.requireContext();
    const { data: existing } = await this.client
      .from("community_user_settings")
      .select(column)
      .eq("user_id", userId)
      .maybeSingle();
    const current =
      existing && typeof existing[column] === "object" && existing[column] !== null
        ? (existing[column] as Record<string, unknown>)
        : {};
    const merged = { ...defaults, ...current, ...patch };
    const { error } = await this.client
      .from("community_user_settings")
      .upsert({ user_id: userId, [column]: merged as unknown as Json }, { onConflict: "user_id" });
    if (error) throw error;
    return merged;
  }

  async updateNotificationPreferences(
    prefs: Partial<CommunityNotificationPreferences>
  ): Promise<CommunityNotificationPreferences> {
    return (await this.upsertSettingsColumn(
      "notification_preferences",
      DEFAULT_NOTIFICATION_PREFS as unknown as Record<string, unknown>,
      prefs as unknown as Record<string, unknown>
    )) as unknown as CommunityNotificationPreferences;
  }

  async updatePrivacySettings(
    settings: Partial<CommunityPrivacySettings>
  ): Promise<CommunityPrivacySettings> {
    return (await this.upsertSettingsColumn(
      "privacy_settings",
      DEFAULT_PRIVACY_SETTINGS as unknown as Record<string, unknown>,
      settings as unknown as Record<string, unknown>
    )) as unknown as CommunityPrivacySettings;
  }

  async updateMediaPreferences(
    prefs: Partial<CommunityMediaPreferences>
  ): Promise<CommunityMediaPreferences> {
    return (await this.upsertSettingsColumn(
      "media_preferences",
      DEFAULT_MEDIA_PREFS as unknown as Record<string, unknown>,
      prefs as unknown as Record<string, unknown>
    )) as unknown as CommunityMediaPreferences;
  }

  async updateAccessibilityPreferences(
    prefs: Partial<CommunityAccessibilityPreferences>
  ): Promise<CommunityAccessibilityPreferences> {
    return (await this.upsertSettingsColumn(
      "accessibility_preferences",
      DEFAULT_ACCESSIBILITY_PREFS as unknown as Record<string, unknown>,
      prefs as unknown as Record<string, unknown>
    )) as unknown as CommunityAccessibilityPreferences;
  }

  async updateOwnCommunityProfile(input: CommunityProfileUpdateInput): Promise<CommunityUser | null> {
    const { userId } = await this.requireContext();
    const rawUsername = input.username.trim().replace(/^@+/, "");
    if (rawUsername && !/^[a-zA-Z0-9_]{3,24}$/.test(rawUsername)) {
      throw new Error("Username must be 3–24 letters, numbers, or underscores.");
    }
    const { error } = await this.client
      .from("profiles")
      .update({
        full_name: input.fullName.trim(),
        username: rawUsername ? `@${rawUsername.toLowerCase()}` : null,
        bio: input.bio.trim() || null,
        department: input.department.trim() || null,
        batch_year: input.batchYear.trim() || null,
      })
      .eq("id", userId);
    if (error) throw error;
    const snap = await this.getSnapshot();
    return snap.users[userId] ?? null;
  }

  async clearLocalCache(): Promise<void> {
    const { userId } = await this.requireContext();
    await this.client
      .from("community_members")
      .update({ draft_text: "" })
      .eq("user_id", userId);
  }

  async exportAllCommunityData(): Promise<{ filename: string; content: string }> {
    const snap = await this.getSnapshot();
    const payload = {
      exportedAt: new Date().toISOString(),
      currentUser: snap.users[snap.currentUserId],
      settings: {
        notifications: snap.notificationPreferences,
        privacy: snap.privacySettings,
        media: snap.mediaPreferences,
        accessibility: snap.accessibilityPreferences,
      },
      conversations: snap.conversations,
      messagesByConversation: snap.messagesByConversation,
    };
    return {
      filename: `astu-jemea-community-export-${new Date().toISOString().slice(0, 10)}.json`,
      content: JSON.stringify(payload, null, 2),
    };
  }

  // COMMITTEE-ONLY MEETINGS (RBAC ENFORCED AT UI + SUPABASE RLS)
  async getMeetings(actorRoles: readonly string[]): Promise<CommitteeMeeting[]> {
    assertCommitteeAccess(actorRoles, "view committee meetings");
    const [mtgsRes, partsRes] = await Promise.all([
      this.client.from("committee_meetings").select("*").order("scheduled_date", { ascending: true }),
      this.client.from("committee_meeting_participants").select("*"),
    ]);
    if (mtgsRes.error) throw mtgsRes.error;
    if (partsRes.error) throw partsRes.error;

    const partsByMtg = new Map<string, MeetingParticipant[]>();
    for (const p of partsRes.data ?? []) {
      const list = partsByMtg.get(p.meeting_id) ?? [];
      list.push({
        userId: p.user_id,
        isMuted: p.is_muted,
        isVideoOn: p.is_video_on,
        isHost: p.is_host,
        joinedAt: p.joined_at,
      });
      partsByMtg.set(p.meeting_id, list);
    }

    return (mtgsRes.data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      meetingType: (row.meeting_type as MeetingType) || "video",
      status: (row.status as MeetingStatus) || "scheduled",
      scheduledDate: row.scheduled_date,
      scheduledTime: row.scheduled_time,
      hostId: row.host_id,
      invitedUserIds: row.invited_user_ids ?? [],
      participants: partsByMtg.get(row.id) ?? [],
      startedAt: row.started_at ?? undefined,
      endedAt: row.ended_at ?? undefined,
      notificationsSentAt: row.notifications_sent_at ?? undefined,
      allowedRoles: ["committee", "amir", "admin"],
    }));
  }

  async scheduleMeeting(
    actorRoles: readonly string[],
    hostId: string,
    input: ScheduleMeetingInput
  ): Promise<CommitteeMeeting> {
    assertCommitteeAccess(actorRoles, "schedule a committee meeting");
    const { universityId } = await this.requireContext();
    const invited = Array.from(new Set([hostId, ...input.invitedUserIds]));
    const { data, error } = await this.client
      .from("committee_meetings")
      .insert({
        university_id: universityId,
        title: input.title.trim(),
        description: input.description.trim(),
        meeting_type: input.meetingType,
        status: "scheduled",
        scheduled_date: input.scheduledDate,
        scheduled_time: input.scheduledTime,
        host_id: hostId,
        invited_user_ids: invited,
      })
      .select("*")
      .single();
    if (error || !data) throw error ?? new Error("Failed to schedule meeting");

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      meetingType: data.meeting_type as MeetingType,
      status: data.status as MeetingStatus,
      scheduledDate: data.scheduled_date,
      scheduledTime: data.scheduled_time,
      hostId: data.host_id,
      invitedUserIds: data.invited_user_ids ?? [],
      participants: [],
      notificationsSentAt: data.notifications_sent_at ?? undefined,
      allowedRoles: ["committee", "amir", "admin"],
    };
  }

  async startInstantMeeting(
    actorRoles: readonly string[],
    hostId: string,
    title: string,
    meetingType: MeetingType,
    invitedUserIds: string[]
  ): Promise<CommitteeMeeting> {
    assertCommitteeAccess(actorRoles, "start an instant committee meeting");
    const { universityId } = await this.requireContext();
    const now = new Date();
    const invited = Array.from(new Set([hostId, ...invitedUserIds]));

    const { data, error } = await this.client
      .from("committee_meetings")
      .insert({
        university_id: universityId,
        title: title.trim() || "Instant Committee Conference",
        description: "Immediate Ashura Committee coordination call.",
        meeting_type: meetingType,
        status: "live",
        scheduled_date: now.toISOString().slice(0, 10),
        scheduled_time: now.toTimeString().slice(0, 5),
        host_id: hostId,
        invited_user_ids: invited,
        started_at: now.toISOString(),
      })
      .select("*")
      .single();
    if (error || !data) throw error ?? new Error("Failed to start instant meeting");

    await this.client.from("committee_meeting_participants").upsert(
      {
        meeting_id: data.id,
        user_id: hostId,
        is_muted: false,
        is_video_on: meetingType === "video",
        is_host: true,
      },
      { onConflict: "meeting_id,user_id" }
    );

    const list = await this.getMeetings(actorRoles);
    const created = list.find((m) => m.id === data.id);
    if (!created) throw new Error("Meeting created but could not be loaded");
    return created;
  }

  async joinMeeting(
    actorRoles: readonly string[],
    meetingId: string,
    userId: string
  ): Promise<CommitteeMeeting> {
    assertCommitteeAccess(actorRoles, "join a committee meeting");
    const { data: mtg } = await this.client
      .from("committee_meetings")
      .select("meeting_type, host_id, status, started_at")
      .eq("id", meetingId)
      .maybeSingle();

    await this.client.from("committee_meeting_participants").upsert(
      {
        meeting_id: meetingId,
        user_id: userId,
        is_muted: false,
        is_video_on: mtg?.meeting_type === "video",
        is_host: mtg?.host_id === userId,
      },
      { onConflict: "meeting_id,user_id" }
    );

    if (mtg && mtg.status === "scheduled" && mtg.host_id === userId) {
      await this.client
        .from("committee_meetings")
        .update({ status: "live", started_at: mtg.started_at ?? new Date().toISOString() })
        .eq("id", meetingId);
    }

    const list = await this.getMeetings(actorRoles);
    const joined = list.find((m) => m.id === meetingId);
    if (!joined) throw new Error("Meeting not found");
    return joined;
  }

  async leaveMeeting(actorRoles: readonly string[], meetingId: string, userId: string): Promise<void> {
    assertCommitteeAccess(actorRoles, "leave a committee meeting");
    await this.client
      .from("committee_meeting_participants")
      .delete()
      .eq("meeting_id", meetingId)
      .eq("user_id", userId);
  }

  async endMeeting(actorRoles: readonly string[], meetingId: string, _actorUserId: string): Promise<void> {
    assertCommitteeAccess(actorRoles, "end a committee meeting");
    await this.client
      .from("committee_meetings")
      .update({ status: "ended", ended_at: new Date().toISOString() })
      .eq("id", meetingId);
    await this.client
      .from("committee_meeting_participants")
      .delete()
      .eq("meeting_id", meetingId);
  }

  async inviteToMeeting(actorRoles: readonly string[], meetingId: string, userId: string): Promise<void> {
    assertCommitteeAccess(actorRoles, "invite participants to a committee meeting");
    const { data: mtg } = await this.client
      .from("committee_meetings")
      .select("invited_user_ids")
      .eq("id", meetingId)
      .maybeSingle();
    if (!mtg) return;
    const nextInvited = Array.from(new Set([...(mtg.invited_user_ids ?? []), userId]));
    const { error } = await this.client
      .from("committee_meetings")
      .update({ invited_user_ids: nextInvited })
      .eq("id", meetingId);
    if (error) throw error;
  }

  async toggleParticipantMute(actorRoles: readonly string[], meetingId: string, targetUserId: string): Promise<void> {
    assertCommitteeAccess(actorRoles, "manage meeting participant audio");
    const { data } = await this.client
      .from("committee_meeting_participants")
      .select("is_muted")
      .eq("meeting_id", meetingId)
      .eq("user_id", targetUserId)
      .maybeSingle();
    if (!data) return;
    await this.client
      .from("committee_meeting_participants")
      .update({ is_muted: !data.is_muted })
      .eq("meeting_id", meetingId)
      .eq("user_id", targetUserId);
  }

  async removeMeetingParticipant(actorRoles: readonly string[], meetingId: string, targetUserId: string): Promise<void> {
    assertCommitteeAccess(actorRoles, "remove a meeting participant");
    await this.client
      .from("committee_meeting_participants")
      .delete()
      .eq("meeting_id", meetingId)
      .eq("user_id", targetUserId);
  }
}

export const supabaseCommunityRepository = new SupabaseCommunityRepository();

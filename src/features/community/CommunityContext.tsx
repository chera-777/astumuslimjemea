import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { buildCallRoute, type CallMediaKind, type CallRecord } from "./callLogic";
import { callingService } from "./callingService";
import { useOptionalCall } from "./CallContext";
import { isAmirOrAdmin, isCommitteeAuthorized } from "./committeeAccess";
import { communityRepository } from "./mockRepository";
import { supabaseCommunityRepository } from "./supabaseRepository";
import { syncNotificationPreferencesWithProvider } from "./notifications";
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
  CreateChannelInput,
  CreateGroupInput,
  GroupMemberPermissions,
  GroupRole,
  MeetingType,
  MessageAttachment,
  PollData,
  ScheduleMeetingInput,
} from "./types";

export type CommunityTab = "chats" | "groups" | "channels" | "contacts";
export type ConversationFilter = "all" | "unread" | "pinned";
export type RightPaneMode = "info" | "settings";

interface CommunityContextValue {
  loading: boolean;
  snapshot: CommunitySnapshot | null;
  activeTab: CommunityTab;
  setActiveTab: (tab: CommunityTab) => void;
  filter: ConversationFilter;
  setFilter: (filter: ConversationFilter) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeConversationId: string | null;
  selectConversation: (id: string | null) => Promise<void>;
  activeConversation: Conversation | null;
  activeMessages: ChatMessage[];
  filteredConversations: Conversation[];
  discoverChannels: Conversation[];
  matchingMessages: { conversation: Conversation; message: ChatMessage }[];
  unreadCounts: { chats: number; groups: number; channels: number };
  replyTo: ChatMessage | null;
  setReplyTo: (msg: ChatMessage | null) => void;
  editingMessage: ChatMessage | null;
  setEditingMessage: (msg: ChatMessage | null) => void;
  forwardingMessage: ChatMessage | null;
  setForwardingMessage: (msg: ChatMessage | null) => void;
  selectedMessageIds: string[];
  selectionMode: boolean;
  toggleSelectMessage: (id: string) => void;
  clearSelection: () => void;
  bulkCopySelected: () => Promise<void>;
  bulkDeleteSelected: (forEveryone: boolean) => Promise<void>;
  bulkForwardSelected: () => void;
  infoPanelOpen: boolean;
  setInfoPanelOpen: (open: boolean) => void;
  rightPaneMode: RightPaneMode;
  setRightPaneMode: (mode: RightPaneMode) => void;
  openSettingsPanel: () => void;
  infoPanelTab: "overview" | "members" | "permissions" | "settings" | "media" | "files" | "pinned";
  setInfoPanelTab: (tab: "overview" | "members" | "permissions" | "settings" | "media" | "files" | "pinned") => void;
  profileUserId: string | null;
  setProfileUserId: (id: string | null) => void;
  inChatSearchOpen: boolean;
  setInChatSearchOpen: (open: boolean) => void;
  typingMap: Record<string, string[]>;
  sendTyping: (conversationId: string) => void;
  isRealtimeBackendActive: boolean;
  // Messaging actions
  sendMessage: (text: string, attachments?: MessageAttachment[], poll?: PollData) => Promise<void>;
  saveEditMessage: (messageId: string, newText: string) => Promise<void>;
  deleteMessage: (messageId: string, forEveryone: boolean) => Promise<void>;
  toggleReaction: (messageId: string, emoji: string) => Promise<void>;
  votePoll: (messageId: string, optionId: string) => Promise<void>;
  forwardToConversation: (targetConversationId: string) => Promise<void>;
  togglePinMessage: (messageId: string) => Promise<void>;
  togglePinConversation: (conversationId: string) => Promise<void>;
  toggleMuteConversation: (conversationId: string) => Promise<void>;
  setConversationWallpaper: (conversationId: string, wallpaperId: string) => Promise<void>;
  toggleDisableSharing: (conversationId: string) => Promise<void>;
  exportChatHistory: (conversationId: string) => Promise<void>;
  saveDraft: (conversationId: string, text: string) => Promise<void>;
  clearHistory: (conversationId: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  leaveConversation: (conversationId: string) => Promise<void>;
  reportConversation: (conversationId: string, reason: string) => Promise<void>;
  openDirectChat: (userId: string) => Promise<void>;
  createGroup: (input: Omit<CreateGroupInput, "creatorId">) => Promise<void>;
  createChannel: (input: Omit<CreateChannelInput, "creatorId">) => Promise<void>;
  subscribeChannel: (conversationId: string) => Promise<void>;
  boostChannel: (conversationId: string) => Promise<void>;
  updateChannelSettings: (conversationId: string, settings: Partial<ChannelSettings>) => Promise<void>;
  updateGroupDetails: (conversationId: string, updates: { title?: string; description?: string; regenerateInvite?: boolean }) => Promise<void>;
  addGroupMember: (conversationId: string, userId: string) => Promise<void>;
  removeGroupMember: (conversationId: string, userId: string) => Promise<void>;
  updateGroupMemberRole: (conversationId: string, userId: string, role: GroupRole) => Promise<void>;
  updateGroupMemberPermissions: (conversationId: string, userId: string, permissions: Partial<GroupMemberPermissions>) => Promise<void>;
  toggleBlockUser: (userId: string) => Promise<void>;
  updateNotificationPreferences: (prefs: Partial<CommunityNotificationPreferences>) => Promise<void>;
  updatePrivacySettings: (settings: Partial<CommunityPrivacySettings>) => Promise<void>;
  updateMediaPreferences: (prefs: Partial<CommunityMediaPreferences>) => Promise<void>;
  updateAccessibilityPreferences: (prefs: Partial<CommunityAccessibilityPreferences>) => Promise<void>;
  updateOwnCommunityProfile: (input: CommunityProfileUpdateInput) => Promise<void>;
  clearLocalCache: () => Promise<void>;
  exportAllCommunityData: () => Promise<void>;
  uploadAttachment: (
    file: File | Blob,
    conversationId: string,
    meta?: {
      fileName?: string;
      mimeType?: string;
      type?: "image" | "video" | "file" | "voice";
      durationSec?: number;
      waveform?: number[];
    }
  ) => Promise<MessageAttachment>;
  getPeerUser: (conversation: Conversation) => CommunityUser | null;
  // Calling (delegated to dedicated /calls/* pages & CallContext)
  activeCall: CallRecord | null;
  startCall: (conversation: Conversation, mediaKind: CallMediaKind) => Promise<void>;
  toggleCallMic: () => void;
  toggleCallCamera: () => void;
  toggleCallSpeaker: () => void;
  endCall: () => void;
  // Committee-only meetings (RBAC)
  effectiveRoles: readonly string[];
  setPreviewRoles: (roles: string[]) => void;
  isMockRoleMode: boolean;
  isCommitteeMember: boolean;
  isAmir: boolean;
  meetingsOpen: boolean;
  setMeetingsOpen: (open: boolean) => void;
  meetings: CommitteeMeeting[];
  meetingsError: string | null;
  activeMeetingId: string | null;
  activeMeeting: CommitteeMeeting | null;
  refreshMeetings: () => Promise<void>;
  scheduleMeeting: (input: ScheduleMeetingInput) => Promise<void>;
  startInstantMeeting: (title: string, meetingType: MeetingType, invitedUserIds: string[]) => Promise<void>;
  joinMeeting: (meetingId: string) => Promise<void>;
  leaveMeeting: (meetingId: string) => Promise<void>;
  endMeeting: (meetingId: string) => Promise<void>;
  inviteToMeeting: (meetingId: string, userId: string) => Promise<void>;
  toggleParticipantMute: (meetingId: string, targetUserId: string) => Promise<void>;
  removeMeetingParticipant: (meetingId: string, targetUserId: string) => Promise<void>;
}

const CommunityContext = createContext<CommunityContextValue | null>(null);

export function CommunityProvider({ children }: { children: ReactNode }) {
  const { user, profile, roles, refreshProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isRealtimeBackendActive = Boolean(isSupabaseConfigured && user && profile);
  const repo = isRealtimeBackendActive ? supabaseCommunityRepository : communityRepository;

  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<CommunitySnapshot | null>(null);
  const [activeTab, setActiveTab] = useState<CommunityTab>("chats");
  const [filter, setFilter] = useState<ConversationFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [forwardingMessage, setForwardingMessage] = useState<ChatMessage | null>(null);
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  const [infoPanelOpen, setInfoPanelOpen] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 1024
  );
  const [rightPaneMode, setRightPaneMode] = useState<RightPaneMode>("info");
  const [infoPanelTab, setInfoPanelTab] = useState<
    "overview" | "members" | "permissions" | "settings" | "media" | "files" | "pinned"
  >("overview");
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [inChatSearchOpen, setInChatSearchOpen] = useState(false);
  const [typingMap, setTypingMap] = useState<Record<string, string[]>>({});
  const callCtx = useOptionalCall();

  // Committee Meetings RBAC state
  const isMockRoleMode = !isSupabaseConfigured;
  const [previewRoles, setPreviewRoles] = useState<string[]>(["student", "committee"]);
  const effectiveRoles = useMemo(
    () => (isSupabaseConfigured ? roles : previewRoles),
    [roles, previewRoles]
  );
  const isCommitteeMember = isCommitteeAuthorized(effectiveRoles);
  const isAmir = isAmirOrAdmin(effectiveRoles);

  const [meetingsOpen, setMeetingsOpenState] = useState(
    () => typeof window !== "undefined" && window.location.hash === "#meetings"
  );
  const [meetings, setMeetings] = useState<CommitteeMeeting[]>([]);
  const [meetingsError, setMeetingsError] = useState<string | null>(null);
  const [activeMeetingId, setActiveMeetingId] = useState<string | null>(null);

  const setMeetingsOpen = useCallback(
    (open: boolean) => {
      setMeetingsOpenState(open);
      if (typeof window !== "undefined") {
        if (open) {
          navigate("/community#meetings", { replace: true });
        } else if (location.hash === "#meetings") {
          navigate("/community", { replace: true });
        }
      }
    },
    [navigate, location.hash]
  );

  const openSettingsPanel = useCallback(() => {
    setRightPaneMode("settings");
    setInfoPanelOpen(true);
    setMeetingsOpenState(false);
  }, []);

  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingBroadcastChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const reload = useCallback(async () => {
    let next;
    try {
      next = await repo.getSnapshot();
    } catch (err) {
      if (repo === supabaseCommunityRepository) {
        // Fall back gracefully to mock repository when remote Supabase tables/migrations are unseeded
        next = await communityRepository.getSnapshot();
      } else {
        throw err;
      }
    }
    if (profile?.full_name) {
      const me = next.users[next.currentUserId];
      if (me) {
        const words = profile.full_name.trim().split(/\s+/);
        const initials =
          words.length >= 2
            ? `${words[0][0]}${words[1][0]}`.toUpperCase()
            : profile.full_name.slice(0, 2).toUpperCase();
        next.users[next.currentUserId] = {
          ...me,
          fullName: profile.full_name,
          username: profile.username || me.username,
          bio: profile.bio || me.bio,
          department: profile.department || me.department,
          batchYear: profile.batch_year || me.batchYear,
          avatarInitials: initials || me.avatarInitials,
        };
      }
    }
    setSnapshot(next);
  }, [repo, profile?.full_name, profile?.username, profile?.bio, profile?.department, profile?.batch_year]);

  const refreshMeetings = useCallback(async () => {
    try {
      const list = await repo.getMeetings(effectiveRoles);
      setMeetings(list);
      setMeetingsError(null);
    } catch (err) {
      setMeetings([]);
      setMeetingsError(
        err instanceof Error
          ? err.message
          : "Access restricted to authorized Ashura Committee members and Amirs."
      );
    }
  }, [repo, effectiveRoles]);

  useEffect(() => {
    let active = true;
    const init = async () => {
      setLoading(true);
      try {
        await reload();
      } catch (err) {
        if (active) {
          toast.error(err instanceof Error ? err.message : "Could not load Community messages");
        }
      }
      if (!active) return;
      setLoading(false);
    };
    void init();
    return () => {
      active = false;
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [reload]);

  useEffect(() => {
    void refreshMeetings();
  }, [refreshMeetings]);

  // Live Supabase Realtime sync (postgres_changes + broadcast typing) when authenticated backend is configured
  useEffect(() => {
    if (!isRealtimeBackendActive || !profile?.university_id || !user?.id) return;

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const scheduleReload = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        void reload();
        void refreshMeetings();
      }, 160);
    };

    const dbChannel = supabase
      .channel(`community-sync-${profile.university_id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "community_messages" }, scheduleReload)
      .on("postgres_changes", { event: "*", schema: "public", table: "community_message_reactions" }, scheduleReload)
      .on("postgres_changes", { event: "*", schema: "public", table: "community_poll_votes" }, scheduleReload)
      .on("postgres_changes", { event: "*", schema: "public", table: "community_conversations" }, scheduleReload)
      .on("postgres_changes", { event: "*", schema: "public", table: "community_members" }, scheduleReload)
      .on("postgres_changes", { event: "*", schema: "public", table: "committee_meetings" }, scheduleReload)
      .on("postgres_changes", { event: "*", schema: "public", table: "user_blocks" }, scheduleReload)
      .subscribe();

    const typingChannel = supabase
      .channel(`community-typing-${profile.university_id}`)
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        const data = payload as { conversationId?: string; userId?: string } | undefined;
        if (!data?.conversationId || !data?.userId || data.userId === user.id) return;
        const convId = data.conversationId;
        const typerId = data.userId;
        setTypingMap((prev) => ({
          ...prev,
          [convId]: Array.from(new Set([...(prev[convId] ?? []), typerId])),
        }));
        setTimeout(() => {
          setTypingMap((prev) => ({
            ...prev,
            [convId]: (prev[convId] ?? []).filter((id) => id !== typerId),
          }));
        }, 2200);
      })
      .subscribe();

    typingBroadcastChannelRef.current = typingChannel;

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      typingBroadcastChannelRef.current = null;
      void supabase.removeChannel(dbChannel);
      void supabase.removeChannel(typingChannel);
    };
  }, [isRealtimeBackendActive, profile?.university_id, user?.id, reload, refreshMeetings]);

  const sendTyping = useCallback(
    (conversationId: string) => {
      if (!isRealtimeBackendActive || !user?.id || !typingBroadcastChannelRef.current) return;
      void typingBroadcastChannelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: { conversationId, userId: user.id },
      });
    },
    [isRealtimeBackendActive, user?.id]
  );

  // Sync hash changes (#meetings or clearing #chat via browser back)
  useEffect(() => {
    if (location.hash === "#meetings") {
      setMeetingsOpenState(true);
    } else {
      if (meetingsOpen) setMeetingsOpenState(false);
      if (location.hash === "" && activeConversationId && typeof window !== "undefined" && window.innerWidth < 768) {
        setActiveConversationId(null);
      }
    }
  }, [location.hash, activeConversationId, meetingsOpen]);

  const autoSelectedRef = useRef(false);
  // Auto-select first chat once on wide desktop screens
  useEffect(() => {
    if (autoSelectedRef.current || !snapshot || activeConversationId !== null || meetingsOpen) return;
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      const firstChat = snapshot.conversations.find((c) => c.type === "direct") ?? snapshot.conversations[0];
      if (firstChat) {
        autoSelectedRef.current = true;
        setActiveConversationId(firstChat.id);
        if (firstChat.unreadCount > 0) {
          void repo.markConversationRead(firstChat.id).then(reload);
        }
      }
    }
  }, [snapshot, activeConversationId, meetingsOpen, repo, reload]);

  const selectConversation = useCallback(
    async (id: string | null) => {
      setMeetingsOpenState(false);
      setActiveConversationId(id);
      setReplyTo(null);
      setEditingMessage(null);
      setSelectedMessageIds([]);
      setInChatSearchOpen(false);
      if (id && rightPaneMode === "settings") {
        setRightPaneMode("info");
      }

      if (typeof window !== "undefined") {
        if (id && window.innerWidth < 768) {
          navigate("/community#chat", { replace: true });
        } else if (!id) {
          navigate("/community", { replace: true });
        }
      }

      if (id) {
        await repo.markConversationRead(id);
        await reload();
      }
    },
    [navigate, repo, reload, rightPaneMode]
  );

  const activeConversation = useMemo(() => {
    if (!snapshot || !activeConversationId) return null;
    return snapshot.conversations.find((c) => c.id === activeConversationId) ?? null;
  }, [snapshot, activeConversationId]);

  const activeMessages = useMemo(() => {
    if (!snapshot || !activeConversationId) return [];
    return snapshot.messagesByConversation[activeConversationId] ?? [];
  }, [snapshot, activeConversationId]);

  const activeMeeting = useMemo(
    () => meetings.find((m) => m.id === activeMeetingId) ?? null,
    [meetings, activeMeetingId]
  );

  const getPeerUser = useCallback(
    (conversation: Conversation): CommunityUser | null => {
      if (!snapshot || conversation.type !== "direct") return null;
      const peerId = conversation.participantIds.find((id) => id !== snapshot.currentUserId);
      return peerId ? snapshot.users[peerId] ?? null : null;
    },
    [snapshot]
  );

  const unreadCounts = useMemo(() => {
    if (!snapshot) return { chats: 0, groups: 0, channels: 0 };
    return snapshot.conversations.reduce(
      (acc, conv) => {
        if (conv.unreadCount > 0) {
          if (conv.type === "direct") acc.chats += 1;
          else if (conv.type === "group") acc.groups += 1;
          else if (conv.type === "channel" && conv.isSubscribed) acc.channels += 1;
        }
        return acc;
      },
      { chats: 0, groups: 0, channels: 0 }
    );
  }, [snapshot]);

  const filteredConversations = useMemo(() => {
    if (!snapshot || activeTab === "contacts") return [];
    const targetType =
      activeTab === "chats" ? "direct" : activeTab === "groups" ? "group" : "channel";
    const q = searchQuery.trim().toLowerCase();

    return snapshot.conversations
      .filter((c) => c.type === targetType)
      .filter((c) => (targetType === "channel" ? c.isSubscribed !== false : true))
      .filter((c) => {
        if (filter === "unread" && c.unreadCount === 0) return false;
        if (filter === "pinned" && !c.isPinned) return false;
        if (!q) return true;
        if (c.title.toLowerCase().includes(q)) return true;
        if (c.username?.toLowerCase().includes(q)) return true;
        if (c.description?.toLowerCase().includes(q)) return true;
        const msgs = snapshot.messagesByConversation[c.id] ?? [];
        return msgs.some((m) => m.text.toLowerCase().includes(q));
      })
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [snapshot, activeTab, filter, searchQuery]);

  const discoverChannels = useMemo(() => {
    if (!snapshot || activeTab !== "channels") return [];
    const q = searchQuery.trim().toLowerCase();
    return snapshot.conversations.filter(
      (c) =>
        c.type === "channel" &&
        c.isSubscribed === false &&
        (!q ||
          c.title.toLowerCase().includes(q) ||
          c.username?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q))
    );
  }, [snapshot, activeTab, searchQuery]);

  const matchingMessages = useMemo(() => {
    if (!snapshot || activeTab === "contacts") return [];
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    const targetType =
      activeTab === "chats" ? "direct" : activeTab === "groups" ? "group" : "channel";
    const results: { conversation: Conversation; message: ChatMessage }[] = [];

    for (const conv of snapshot.conversations) {
      if (conv.type !== targetType) continue;
      const msgs = snapshot.messagesByConversation[conv.id] ?? [];
      for (const m of msgs) {
        if (!m.deletedForAll && m.text.toLowerCase().includes(q)) {
          results.push({ conversation: conv, message: m });
        }
      }
    }
    return results.slice(0, 12);
  }, [snapshot, searchQuery, activeTab]);

  const triggerTypingIndicatorPreview = useCallback(
    (conversation: Conversation, currentUserId: string) => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      const peerId = conversation.participantIds.find((id) => id !== currentUserId);
      if (!peerId) return;

      setTypingMap((prev) => ({ ...prev, [conversation.id]: [peerId] }));
      typingTimerRef.current = setTimeout(() => {
        setTypingMap((prev) => ({ ...prev, [conversation.id]: [] }));
      }, 1800);
    },
    []
  );

  const sendMessage = useCallback(
    async (text: string, attachments?: MessageAttachment[], poll?: PollData) => {
      if (!snapshot || !activeConversation) return;
      const trimmed = text.trim();
      if (!trimmed && (!attachments || attachments.length === 0) && !poll) return;

      await repo.sendMessage({
        conversationId: activeConversation.id,
        senderId: snapshot.currentUserId,
        text: trimmed,
        replyToId: replyTo?.id,
        attachments,
        poll,
      });
      setReplyTo(null);
      await reload();

      if (!isRealtimeBackendActive && activeConversation.type === "direct") {
        const peer = getPeerUser(activeConversation);
        if (peer && !peer.isBlocked && peer.status === "online") {
          triggerTypingIndicatorPreview(activeConversation, snapshot.currentUserId);
        }
      }
    },
    [snapshot, activeConversation, repo, replyTo, reload, isRealtimeBackendActive, getPeerUser, triggerTypingIndicatorPreview]
  );

  const saveEditMessage = useCallback(
    async (messageId: string, newText: string) => {
      if (!activeConversationId || !newText.trim()) return;
      await repo.editMessage(activeConversationId, messageId, newText.trim());
      setEditingMessage(null);
      await reload();
      toast.success("Message updated");
    },
    [activeConversationId, repo, reload]
  );

  const deleteMessage = useCallback(
    async (messageId: string, forEveryone: boolean) => {
      if (!activeConversationId) return;
      await repo.deleteMessage(activeConversationId, messageId, forEveryone);
      if (replyTo?.id === messageId) setReplyTo(null);
      if (editingMessage?.id === messageId) setEditingMessage(null);
      setSelectedMessageIds((prev) => prev.filter((id) => id !== messageId));
      await reload();
      toast.success(forEveryone ? "Deleted for everyone" : "Deleted for you");
    },
    [activeConversationId, repo, replyTo, editingMessage, reload]
  );

  const toggleReaction = useCallback(
    async (messageId: string, emoji: string) => {
      if (!snapshot || !activeConversationId) return;
      await repo.toggleReaction(
        activeConversationId,
        messageId,
        snapshot.currentUserId,
        emoji
      );
      await reload();
    },
    [snapshot, activeConversationId, repo, reload]
  );

  const votePoll = useCallback(
    async (messageId: string, optionId: string) => {
      if (!snapshot || !activeConversationId) return;
      await repo.votePoll(
        activeConversationId,
        messageId,
        optionId,
        snapshot.currentUserId
      );
      await reload();
    },
    [snapshot, activeConversationId, repo, reload]
  );

  const toggleSelectMessage = useCallback((id: string) => {
    setSelectedMessageIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const clearSelection = useCallback(() => setSelectedMessageIds([]), []);

  const bulkCopySelected = useCallback(async () => {
    if (!activeMessages.length || !selectedMessageIds.length) return;
    if (activeConversation?.sharingDisabled) {
      toast.error("Sharing and copying are disabled in this conversation.");
      return;
    }
    const text = activeMessages
      .filter((m) => selectedMessageIds.includes(m.id) && m.text)
      .map((m) => m.text)
      .join("\n");
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Copied ${selectedMessageIds.length} message(s)`);
    } catch {
      toast.error("Could not copy selected messages");
    }
    setSelectedMessageIds([]);
  }, [activeMessages, selectedMessageIds, activeConversation?.sharingDisabled]);

  const bulkDeleteSelected = useCallback(
    async (forEveryone: boolean) => {
      if (!activeConversationId || !selectedMessageIds.length) return;
      for (const id of selectedMessageIds) {
        await repo.deleteMessage(activeConversationId, id, forEveryone);
      }
      setSelectedMessageIds([]);
      await reload();
      toast.success("Selected messages deleted");
    },
    [activeConversationId, selectedMessageIds, repo, reload]
  );

  const bulkForwardSelected = useCallback(() => {
    if (!activeMessages.length || !selectedMessageIds.length) return;
    if (activeConversation?.sharingDisabled) {
      toast.error("Sharing and forwarding are disabled in this conversation.");
      return;
    }
    const first = activeMessages.find((m) => selectedMessageIds.includes(m.id));
    if (first) {
      setForwardingMessage(first);
      setSelectedMessageIds([]);
    }
  }, [activeMessages, selectedMessageIds, activeConversation?.sharingDisabled]);

  const forwardToConversation = useCallback(
    async (targetConversationId: string) => {
      if (!snapshot || !forwardingMessage) return;
      const sourceConv = snapshot.conversations.find(
        (c) => c.id === forwardingMessage.conversationId
      );
      if (sourceConv?.sharingDisabled || sourceConv?.channelSettings?.allowForwarding === false) {
        toast.error("Forwarding is disabled in this conversation.");
        setForwardingMessage(null);
        return;
      }
      const sender = snapshot.users[forwardingMessage.senderId];
      await repo.sendMessage({
        conversationId: targetConversationId,
        senderId: snapshot.currentUserId,
        text: forwardingMessage.text,
        attachments: forwardingMessage.attachments,
        forwardedFrom: {
          senderName: sender?.fullName || "Member",
          conversationTitle: sourceConv?.title || "Community",
        },
      });
      const targetConv = snapshot.conversations.find((c) => c.id === targetConversationId);
      setForwardingMessage(null);
      if (targetConv) {
        setActiveTab(
          targetConv.type === "direct"
            ? "chats"
            : targetConv.type === "group"
              ? "groups"
              : "channels"
        );
        await selectConversation(targetConv.id);
      }
      await reload();
      toast.success(`Forwarded to ${targetConv?.title || "chat"}`);
    },
    [snapshot, forwardingMessage, repo, selectConversation, reload]
  );

  const togglePinMessage = useCallback(
    async (messageId: string) => {
      if (!activeConversationId) return;
      await repo.togglePinMessage(activeConversationId, messageId);
      await reload();
    },
    [activeConversationId, repo, reload]
  );

  const togglePinConversation = useCallback(
    async (conversationId: string) => {
      await repo.togglePinConversation(conversationId);
      await reload();
    },
    [repo, reload]
  );

  const toggleMuteConversation = useCallback(
    async (conversationId: string) => {
      await repo.toggleMuteConversation(conversationId);
      await reload();
    },
    [repo, reload]
  );

  const setConversationWallpaper = useCallback(
    async (conversationId: string, wallpaperId: string) => {
      await repo.setConversationWallpaper(conversationId, wallpaperId);
      await reload();
      toast.success("Wallpaper updated");
    },
    [repo, reload]
  );

  const toggleDisableSharing = useCallback(
    async (conversationId: string) => {
      await repo.toggleDisableSharing(conversationId);
      await reload();
    },
    [repo, reload]
  );

  const exportChatHistory = useCallback(async (conversationId: string) => {
    const { filename, content } = await repo.exportConversationHistory(conversationId);
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filename}`);
  }, [repo]);

  const saveDraft = useCallback(
    async (conversationId: string, text: string) => {
      await repo.saveDraft(conversationId, text);
      await reload();
    },
    [repo, reload]
  );

  const clearHistory = useCallback(
    async (conversationId: string) => {
      await repo.clearConversationHistory(conversationId);
      await reload();
      toast.success("Chat history cleared");
    },
    [repo, reload]
  );

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      await repo.deleteConversation(conversationId);
      if (activeConversationId === conversationId) {
        await selectConversation(null);
      }
      await reload();
      toast.success("Conversation deleted");
    },
    [activeConversationId, repo, selectConversation, reload]
  );

  const leaveConversation = useCallback(
    async (conversationId: string) => {
      await repo.leaveConversation(conversationId);
      if (activeConversationId === conversationId) {
        await selectConversation(null);
      }
      await reload();
      toast.success("Left conversation");
    },
    [activeConversationId, repo, selectConversation, reload]
  );

  const reportConversation = useCallback(async (conversationId: string, reason: string) => {
    await repo.reportConversation(conversationId, reason);
    toast.success("Report submitted to moderators");
  }, [repo]);

  const openDirectChat = useCallback(
    async (userId: string) => {
      const conv = await repo.getOrCreateDirectConversation(userId);
      setActiveTab("chats");
      setProfileUserId(null);
      await selectConversation(conv.id);
    },
    [repo, selectConversation]
  );

  const createGroup = useCallback(
    async (input: Omit<CreateGroupInput, "creatorId">) => {
      if (!snapshot) return;
      const conv = await repo.createGroup({
        ...input,
        creatorId: snapshot.currentUserId,
      });
      setActiveTab("groups");
      await selectConversation(conv.id);
      toast.success(`Group "${conv.title}" created`);
    },
    [snapshot, repo, selectConversation]
  );

  const createChannel = useCallback(
    async (input: Omit<CreateChannelInput, "creatorId">) => {
      if (!snapshot) return;
      const conv = await repo.createChannel({
        ...input,
        creatorId: snapshot.currentUserId,
      });
      setActiveTab("channels");
      await selectConversation(conv.id);
      toast.success(`Channel "${conv.title}" created`);
    },
    [snapshot, repo, selectConversation]
  );

  const subscribeChannel = useCallback(
    async (conversationId: string) => {
      await repo.subscribeChannel(conversationId);
      await reload();
      toast.success("Subscribed to channel");
    },
    [repo, reload]
  );

  const boostChannel = useCallback(
    async (conversationId: string) => {
      await repo.boostChannel(conversationId);
      await reload();
      toast.success("Channel boosted!");
    },
    [repo, reload]
  );

  const updateChannelSettings = useCallback(
    async (conversationId: string, settings: Partial<ChannelSettings>) => {
      await repo.updateChannelSettings(conversationId, settings);
      await reload();
      toast.success("Channel settings updated");
    },
    [repo, reload]
  );

  const updateGroupDetails = useCallback(
    async (
      conversationId: string,
      updates: { title?: string; description?: string; regenerateInvite?: boolean }
    ) => {
      await repo.updateGroupDetails(conversationId, updates);
      await reload();
      toast.success(updates.regenerateInvite ? "Invite link regenerated" : "Details updated");
    },
    [repo, reload]
  );

  const addGroupMember = useCallback(
    async (conversationId: string, userId: string) => {
      await repo.addGroupMember(conversationId, userId);
      await reload();
      toast.success("Added to list");
    },
    [repo, reload]
  );

  const removeGroupMember = useCallback(
    async (conversationId: string, userId: string) => {
      await repo.removeGroupMember(conversationId, userId);
      await reload();
      toast.success("Removed");
    },
    [repo, reload]
  );

  const updateGroupMemberRole = useCallback(
    async (conversationId: string, userId: string, role: GroupRole) => {
      await repo.updateGroupMemberRole(conversationId, userId, role);
      await reload();
      toast.success(`Role updated to ${role}`);
    },
    [repo, reload]
  );

  const updateGroupMemberPermissions = useCallback(
    async (conversationId: string, userId: string, permissions: Partial<GroupMemberPermissions>) => {
      await repo.updateGroupMemberPermissions(conversationId, userId, permissions);
      await reload();
    },
    [repo, reload]
  );

  const toggleBlockUser = useCallback(
    async (userId: string) => {
      await repo.toggleBlockUser(userId);
      await reload();
    },
    [repo, reload]
  );

  const updateNotificationPreferences = useCallback(
    async (prefs: Partial<CommunityNotificationPreferences>) => {
      if (!snapshot) return;
      const next = await repo.updateNotificationPreferences(prefs);
      await syncNotificationPreferencesWithProvider(snapshot.currentUserId, next);
      await reload();
    },
    [snapshot, repo, reload]
  );

  const updatePrivacySettings = useCallback(
    async (settings: Partial<CommunityPrivacySettings>) => {
      await repo.updatePrivacySettings(settings);
      await reload();
    },
    [repo, reload]
  );

  const updateMediaPreferences = useCallback(
    async (prefs: Partial<CommunityMediaPreferences>) => {
      await repo.updateMediaPreferences(prefs);
      await reload();
    },
    [repo, reload]
  );

  const updateAccessibilityPreferences = useCallback(
    async (prefs: Partial<CommunityAccessibilityPreferences>) => {
      await repo.updateAccessibilityPreferences(prefs);
      await reload();
    },
    [repo, reload]
  );

  const updateOwnCommunityProfile = useCallback(
    async (input: CommunityProfileUpdateInput) => {
      await repo.updateOwnCommunityProfile(input);
      if (isRealtimeBackendActive) {
        await refreshProfile().catch(() => {});
      }
      await reload();
      toast.success("Profile updated");
    },
    [repo, isRealtimeBackendActive, refreshProfile, reload]
  );

  const clearLocalCache = useCallback(async () => {
    await repo.clearLocalCache();
    await reload();
    toast.success("Local drafts and cache cleared");
  }, [repo, reload]);

  const exportAllCommunityData = useCallback(async () => {
    const { filename, content } = await repo.exportAllCommunityData();
    const blob = new Blob([content], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filename}`);
  }, [repo]);

  const uploadAttachment = useCallback(
    async (
      file: File | Blob,
      conversationId: string,
      meta?: {
        fileName?: string;
        mimeType?: string;
        type?: "image" | "video" | "file" | "voice";
        durationSec?: number;
        waveform?: number[];
      }
    ): Promise<MessageAttachment> => {
      if (isRealtimeBackendActive) {
        return supabaseCommunityRepository.uploadAttachment(file, conversationId, meta);
      }
      const rawName =
        meta?.fileName || (file instanceof File ? file.name : `voice-${Date.now()}.webm`);
      const mimeType = meta?.mimeType || file.type || "application/octet-stream";
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
        url: typeof URL !== "undefined" && URL.createObjectURL ? URL.createObjectURL(file) : undefined,
        sizeBytes: file.size,
        mimeType,
        ...(meta?.durationSec !== undefined ? { durationSec: meta.durationSec } : {}),
        ...(meta?.waveform ? { waveform: meta.waveform } : {}),
      };
    },
    [isRealtimeBackendActive]
  );

  // Calling Actions (dedicated /calls/voice/:id, /calls/video/:id, /calls/group/:id routes)
  const startCall = useCallback(
    async (conversation: Conversation, mediaKind: CallMediaKind) => {
      if (callCtx) {
        await callCtx.initiateCall({
          conversation,
          mediaKind,
          users: snapshot?.users ?? {},
        });
        return;
      }

      const record = await callingService.createCall({
        conversation,
        mediaKind,
        callerId: snapshot?.currentUserId ?? "user-me",
        users: snapshot?.users ?? {},
        useBackend: isRealtimeBackendActive,
      });
      navigate(
        buildCallRoute({
          id: record.id,
          mediaKind,
          scope: record.callScope,
        })
      );
    },
    [callCtx, snapshot?.users, snapshot?.currentUserId, isRealtimeBackendActive, navigate]
  );

  const toggleCallMic = useCallback(() => {
    callCtx?.toggleMic();
  }, [callCtx]);

  const toggleCallCamera = useCallback(() => {
    void callCtx?.toggleCamera();
  }, [callCtx]);

  const toggleCallSpeaker = useCallback(() => {
    callCtx?.toggleSpeaker();
  }, [callCtx]);

  const endCall = useCallback(() => {
    void callCtx?.endOrCancelCall();
  }, [callCtx]);

  // Committee Meetings (RBAC-enforced)
  const scheduleMeeting = useCallback(
    async (input: ScheduleMeetingInput) => {
      if (!snapshot) return;
      await repo.scheduleMeeting(effectiveRoles, snapshot.currentUserId, input);
      await refreshMeetings();
      toast.success(`Meeting "${input.title}" scheduled & committee invitations queued`);
    },
    [snapshot, repo, effectiveRoles, refreshMeetings]
  );

  const startInstantMeeting = useCallback(
    async (title: string, meetingType: MeetingType, invitedUserIds: string[]) => {
      if (!snapshot) return;
      const created = await repo.startInstantMeeting(
        effectiveRoles,
        snapshot.currentUserId,
        title,
        meetingType,
        invitedUserIds
      );
      await refreshMeetings();
      setActiveMeetingId(created.id);
      toast.success("Instant committee conference started");
    },
    [snapshot, repo, effectiveRoles, refreshMeetings]
  );

  const joinMeeting = useCallback(
    async (meetingId: string) => {
      if (!snapshot) return;
      await repo.joinMeeting(effectiveRoles, meetingId, snapshot.currentUserId);
      await refreshMeetings();
      setActiveMeetingId(meetingId);
    },
    [snapshot, repo, effectiveRoles, refreshMeetings]
  );

  const leaveMeeting = useCallback(
    async (meetingId: string) => {
      if (!snapshot) return;
      await repo.leaveMeeting(effectiveRoles, meetingId, snapshot.currentUserId);
      setActiveMeetingId(null);
      await refreshMeetings();
      toast.info("Left meeting");
    },
    [snapshot, repo, effectiveRoles, refreshMeetings]
  );

  const endMeeting = useCallback(
    async (meetingId: string) => {
      if (!snapshot) return;
      await repo.endMeeting(effectiveRoles, meetingId, snapshot.currentUserId);
      if (activeMeetingId === meetingId) setActiveMeetingId(null);
      await refreshMeetings();
      toast.success("Meeting ended for all participants");
    },
    [snapshot, repo, effectiveRoles, activeMeetingId, refreshMeetings]
  );

  const inviteToMeeting = useCallback(
    async (meetingId: string, userId: string) => {
      await repo.inviteToMeeting(effectiveRoles, meetingId, userId);
      await refreshMeetings();
      toast.success("Committee invitation sent");
    },
    [repo, effectiveRoles, refreshMeetings]
  );

  const toggleParticipantMute = useCallback(
    async (meetingId: string, targetUserId: string) => {
      await repo.toggleParticipantMute(effectiveRoles, meetingId, targetUserId);
      await refreshMeetings();
    },
    [repo, effectiveRoles, refreshMeetings]
  );

  const removeMeetingParticipant = useCallback(
    async (meetingId: string, targetUserId: string) => {
      await repo.removeMeetingParticipant(effectiveRoles, meetingId, targetUserId);
      await refreshMeetings();
      toast.success("Participant removed");
    },
    [repo, effectiveRoles, refreshMeetings]
  );

  return (
    <CommunityContext.Provider
      value={{
        loading,
        snapshot,
        activeTab,
        setActiveTab,
        filter,
        setFilter,
        searchQuery,
        setSearchQuery,
        activeConversationId,
        selectConversation,
        activeConversation,
        activeMessages,
        filteredConversations,
        discoverChannels,
        matchingMessages,
        unreadCounts,
        replyTo,
        setReplyTo,
        editingMessage,
        setEditingMessage,
        forwardingMessage,
        setForwardingMessage,
        selectedMessageIds,
        selectionMode: selectedMessageIds.length > 0,
        toggleSelectMessage,
        clearSelection,
        bulkCopySelected,
        bulkDeleteSelected,
        bulkForwardSelected,
        infoPanelOpen,
        setInfoPanelOpen,
        rightPaneMode,
        setRightPaneMode,
        openSettingsPanel,
        infoPanelTab,
        setInfoPanelTab,
        profileUserId,
        setProfileUserId,
        inChatSearchOpen,
        setInChatSearchOpen,
        typingMap,
        sendTyping,
        isRealtimeBackendActive,
        sendMessage,
        saveEditMessage,
        deleteMessage,
        toggleReaction,
        votePoll,
        forwardToConversation,
        togglePinMessage,
        togglePinConversation,
        toggleMuteConversation,
        setConversationWallpaper,
        toggleDisableSharing,
        exportChatHistory,
        saveDraft,
        clearHistory,
        deleteConversation,
        leaveConversation,
        reportConversation,
        openDirectChat,
        createGroup,
        createChannel,
        subscribeChannel,
        boostChannel,
        updateChannelSettings,
        updateGroupDetails,
        addGroupMember,
        removeGroupMember,
        updateGroupMemberRole,
        updateGroupMemberPermissions,
        toggleBlockUser,
        updateNotificationPreferences,
        updatePrivacySettings,
        updateMediaPreferences,
        updateAccessibilityPreferences,
        updateOwnCommunityProfile,
        clearLocalCache,
        exportAllCommunityData,
        uploadAttachment,
        getPeerUser,
        activeCall: callCtx?.activeCall ?? null,
        startCall,
        toggleCallMic,
        toggleCallCamera,
        toggleCallSpeaker,
        endCall,
        effectiveRoles,
        setPreviewRoles,
        isMockRoleMode,
        isCommitteeMember,
        isAmir,
        meetingsOpen,
        setMeetingsOpen,
        meetings,
        meetingsError,
        activeMeetingId,
        activeMeeting,
        refreshMeetings,
        scheduleMeeting,
        startInstantMeeting,
        joinMeeting,
        leaveMeeting,
        endMeeting,
        inviteToMeeting,
        toggleParticipantMute,
        removeMeetingParticipant,
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error("useCommunity must be used inside CommunityProvider");
  return ctx;
}

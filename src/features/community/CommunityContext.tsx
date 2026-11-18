import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { communityRepository } from "./mockRepository";
import { syncNotificationPreferencesWithProvider } from "./notifications";
import type {
  ChatMessage,
  CommunityNotificationPreferences,
  CommunityPrivacySettings,
  CommunitySnapshot,
  CommunityUser,
  Conversation,
  CreateGroupInput,
  GroupMemberPermissions,
  GroupRole,
  MessageAttachment,
} from "./types";

export type CommunityTab = "chats" | "groups";
export type ConversationFilter = "all" | "unread" | "pinned";

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
  matchingMessages: { conversation: Conversation; message: ChatMessage }[];
  unreadCounts: { chats: number; groups: number };
  replyTo: ChatMessage | null;
  setReplyTo: (msg: ChatMessage | null) => void;
  editingMessage: ChatMessage | null;
  setEditingMessage: (msg: ChatMessage | null) => void;
  forwardingMessage: ChatMessage | null;
  setForwardingMessage: (msg: ChatMessage | null) => void;
  infoPanelOpen: boolean;
  setInfoPanelOpen: (open: boolean) => void;
  profileUserId: string | null;
  setProfileUserId: (id: string | null) => void;
  typingMap: Record<string, string[]>;
  sendMessage: (text: string, attachments?: MessageAttachment[]) => Promise<void>;
  saveEditMessage: (messageId: string, newText: string) => Promise<void>;
  deleteMessage: (messageId: string, forEveryone: boolean) => Promise<void>;
  toggleReaction: (messageId: string, emoji: string) => Promise<void>;
  forwardToConversation: (targetConversationId: string) => Promise<void>;
  togglePinMessage: (messageId: string) => Promise<void>;
  togglePinConversation: (conversationId: string) => Promise<void>;
  toggleMuteConversation: (conversationId: string) => Promise<void>;
  saveDraft: (conversationId: string, text: string) => Promise<void>;
  clearHistory: (conversationId: string) => Promise<void>;
  openDirectChat: (userId: string) => Promise<void>;
  createGroup: (input: Omit<CreateGroupInput, "creatorId">) => Promise<void>;
  updateGroupDetails: (conversationId: string, updates: { title?: string; description?: string; regenerateInvite?: boolean }) => Promise<void>;
  addGroupMember: (conversationId: string, userId: string) => Promise<void>;
  removeGroupMember: (conversationId: string, userId: string) => Promise<void>;
  updateGroupMemberRole: (conversationId: string, userId: string, role: GroupRole) => Promise<void>;
  updateGroupMemberPermissions: (conversationId: string, userId: string, permissions: Partial<GroupMemberPermissions>) => Promise<void>;
  toggleBlockUser: (userId: string) => Promise<void>;
  updateNotificationPreferences: (prefs: Partial<CommunityNotificationPreferences>) => Promise<void>;
  updatePrivacySettings: (settings: Partial<CommunityPrivacySettings>) => Promise<void>;
  getPeerUser: (conversation: Conversation) => CommunityUser | null;
}

const CommunityContext = createContext<CommunityContextValue | null>(null);

export function CommunityProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<CommunitySnapshot | null>(null);
  const [activeTab, setActiveTab] = useState<CommunityTab>("chats");
  const [filter, setFilter] = useState<ConversationFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [forwardingMessage, setForwardingMessage] = useState<ChatMessage | null>(null);
  const [infoPanelOpen, setInfoPanelOpen] = useState(false);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [typingMap, setTypingMap] = useState<Record<string, string[]>>({});
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reload = useCallback(async () => {
    const next = await communityRepository.getSnapshot();
    if (profile?.full_name) {
      const me = next.users[next.currentUserId];
      if (me) {
        const words = profile.full_name.trim().split(/\s+/);
        const initials = words.length >= 2 ? `${words[0][0]}${words[1][0]}`.toUpperCase() : profile.full_name.slice(0, 2).toUpperCase();
        next.users[next.currentUserId] = {
          ...me,
          fullName: profile.full_name,
          department: profile.department || me.department,
          batchYear: profile.batch_year || me.batchYear,
          avatarInitials: initials || me.avatarInitials,
        };
      }
    }
    setSnapshot(next);
  }, [profile?.full_name, profile?.department, profile?.batch_year]);

  useEffect(() => {
    let active = true;
    const init = async () => {
      setLoading(true);
      await reload();
      if (!active) return;
      setLoading(false);
    };
    void init();
    return () => {
      active = false;
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [reload]);

  // Default to first conversation on wide screens once snapshot loads
  useEffect(() => {
    if (!snapshot || activeConversationId !== null) return;
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      const firstChat = snapshot.conversations.find((c) => c.type === "direct");
      if (firstChat) {
        setActiveConversationId(firstChat.id);
        void communityRepository.markConversationRead(firstChat.id).then(reload);
      }
    }
  }, [snapshot, activeConversationId, reload]);

  const selectConversation = useCallback(async (id: string | null) => {
    setActiveConversationId(id);
    setReplyTo(null);
    setEditingMessage(null);
    if (id) {
      await communityRepository.markConversationRead(id);
      await reload();
    }
  }, [reload]);

  const activeConversation = useMemo(() => {
    if (!snapshot || !activeConversationId) return null;
    return snapshot.conversations.find((c) => c.id === activeConversationId) ?? null;
  }, [snapshot, activeConversationId]);

  const activeMessages = useMemo(() => {
    if (!snapshot || !activeConversationId) return [];
    return snapshot.messagesByConversation[activeConversationId] ?? [];
  }, [snapshot, activeConversationId]);

  const getPeerUser = useCallback(
    (conversation: Conversation): CommunityUser | null => {
      if (!snapshot || conversation.type !== "direct") return null;
      const peerId = conversation.participantIds.find((id) => id !== snapshot.currentUserId);
      return peerId ? snapshot.users[peerId] ?? null : null;
    },
    [snapshot]
  );

  const unreadCounts = useMemo(() => {
    if (!snapshot) return { chats: 0, groups: 0 };
    return snapshot.conversations.reduce(
      (acc, conv) => {
        if (conv.unreadCount > 0) {
          if (conv.type === "direct") acc.chats += 1;
          else acc.groups += 1;
        }
        return acc;
      },
      { chats: 0, groups: 0 }
    );
  }, [snapshot]);

  const filteredConversations = useMemo(() => {
    if (!snapshot) return [];
    const targetType = activeTab === "chats" ? "direct" : "group";
    const q = searchQuery.trim().toLowerCase();

    return snapshot.conversations
      .filter((c) => c.type === targetType)
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

  const matchingMessages = useMemo(() => {
    if (!snapshot) return [];
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    const targetType = activeTab === "chats" ? "direct" : "group";
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

  const triggerTypingIndicatorPreview = useCallback((conversation: Conversation, currentUserId: string) => {
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    const peerId = conversation.participantIds.find((id) => id !== currentUserId);
    if (!peerId) return;

    // Brief typing indicator preview in mock environment
    setTypingMap((prev) => ({ ...prev, [conversation.id]: [peerId] }));
    typingTimerRef.current = setTimeout(() => {
      setTypingMap((prev) => ({ ...prev, [conversation.id]: [] }));
    }, 1800);
  }, []);

  const sendMessage = useCallback(
    async (text: string, attachments?: MessageAttachment[]) => {
      if (!snapshot || !activeConversation) return;
      const trimmed = text.trim();
      if (!trimmed && (!attachments || attachments.length === 0)) return;

      await communityRepository.sendMessage({
        conversationId: activeConversation.id,
        senderId: snapshot.currentUserId,
        text: trimmed,
        replyToId: replyTo?.id,
        attachments,
      });
      setReplyTo(null);
      await reload();

      if (activeConversation.type === "direct") {
        const peer = getPeerUser(activeConversation);
        if (peer && !peer.isBlocked && peer.status === "online") {
          triggerTypingIndicatorPreview(activeConversation, snapshot.currentUserId);
        }
      }
    },
    [snapshot, activeConversation, replyTo, reload, getPeerUser, triggerTypingIndicatorPreview]
  );

  const saveEditMessage = useCallback(
    async (messageId: string, newText: string) => {
      if (!activeConversationId || !newText.trim()) return;
      await communityRepository.editMessage(activeConversationId, messageId, newText.trim());
      setEditingMessage(null);
      await reload();
      toast.success("Message updated");
    },
    [activeConversationId, reload]
  );

  const deleteMessage = useCallback(
    async (messageId: string, forEveryone: boolean) => {
      if (!activeConversationId) return;
      await communityRepository.deleteMessage(activeConversationId, messageId, forEveryone);
      if (replyTo?.id === messageId) setReplyTo(null);
      if (editingMessage?.id === messageId) setEditingMessage(null);
      await reload();
      toast.success(forEveryone ? "Deleted for everyone" : "Deleted for you");
    },
    [activeConversationId, replyTo, editingMessage, reload]
  );

  const toggleReaction = useCallback(
    async (messageId: string, emoji: string) => {
      if (!snapshot || !activeConversationId) return;
      await communityRepository.toggleReaction(activeConversationId, messageId, snapshot.currentUserId, emoji);
      await reload();
    },
    [snapshot, activeConversationId, reload]
  );

  const forwardToConversation = useCallback(
    async (targetConversationId: string) => {
      if (!snapshot || !forwardingMessage) return;
      const sourceConv = snapshot.conversations.find((c) => c.id === forwardingMessage.conversationId);
      const sender = snapshot.users[forwardingMessage.senderId];
      await communityRepository.sendMessage({
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
        setActiveTab(targetConv.type === "direct" ? "chats" : "groups");
        setActiveConversationId(targetConv.id);
      }
      await reload();
      toast.success(`Forwarded to ${targetConv?.title || "chat"}`);
    },
    [snapshot, forwardingMessage, reload]
  );

  const togglePinMessage = useCallback(
    async (messageId: string) => {
      if (!activeConversationId) return;
      await communityRepository.togglePinMessage(activeConversationId, messageId);
      await reload();
    },
    [activeConversationId, reload]
  );

  const togglePinConversation = useCallback(
    async (conversationId: string) => {
      await communityRepository.togglePinConversation(conversationId);
      await reload();
    },
    [reload]
  );

  const toggleMuteConversation = useCallback(
    async (conversationId: string) => {
      await communityRepository.toggleMuteConversation(conversationId);
      await reload();
    },
    [reload]
  );

  const saveDraft = useCallback(
    async (conversationId: string, text: string) => {
      await communityRepository.saveDraft(conversationId, text);
      await reload();
    },
    [reload]
  );

  const clearHistory = useCallback(
    async (conversationId: string) => {
      await communityRepository.clearConversationHistory(conversationId);
      await reload();
      toast.success("Chat history cleared");
    },
    [reload]
  );

  const openDirectChat = useCallback(
    async (userId: string) => {
      const conv = await communityRepository.getOrCreateDirectConversation(userId);
      setActiveTab("chats");
      setActiveConversationId(conv.id);
      setProfileUserId(null);
      await communityRepository.markConversationRead(conv.id);
      await reload();
    },
    [reload]
  );

  const createGroup = useCallback(
    async (input: Omit<CreateGroupInput, "creatorId">) => {
      if (!snapshot) return;
      const conv = await communityRepository.createGroup({
        ...input,
        creatorId: snapshot.currentUserId,
      });
      setActiveTab("groups");
      setActiveConversationId(conv.id);
      await reload();
      toast.success(`Group "${conv.title}" created`);
    },
    [snapshot, reload]
  );

  const updateGroupDetails = useCallback(
    async (conversationId: string, updates: { title?: string; description?: string; regenerateInvite?: boolean }) => {
      await communityRepository.updateGroupDetails(conversationId, updates);
      await reload();
      toast.success(updates.regenerateInvite ? "Invite link regenerated" : "Group updated");
    },
    [reload]
  );

  const addGroupMember = useCallback(
    async (conversationId: string, userId: string) => {
      await communityRepository.addGroupMember(conversationId, userId);
      await reload();
      toast.success("Member added to group");
    },
    [reload]
  );

  const removeGroupMember = useCallback(
    async (conversationId: string, userId: string) => {
      await communityRepository.removeGroupMember(conversationId, userId);
      await reload();
      toast.success("Member removed");
    },
    [reload]
  );

  const updateGroupMemberRole = useCallback(
    async (conversationId: string, userId: string, role: GroupRole) => {
      await communityRepository.updateGroupMemberRole(conversationId, userId, role);
      await reload();
      toast.success(`Role updated to ${role}`);
    },
    [reload]
  );

  const updateGroupMemberPermissions = useCallback(
    async (conversationId: string, userId: string, permissions: Partial<GroupMemberPermissions>) => {
      await communityRepository.updateGroupMemberPermissions(conversationId, userId, permissions);
      await reload();
    },
    [reload]
  );

  const toggleBlockUser = useCallback(
    async (userId: string) => {
      await communityRepository.toggleBlockUser(userId);
      await reload();
    },
    [reload]
  );

  const updateNotificationPreferences = useCallback(
    async (prefs: Partial<CommunityNotificationPreferences>) => {
      if (!snapshot) return;
      const next = await communityRepository.updateNotificationPreferences(prefs);
      await syncNotificationPreferencesWithProvider(snapshot.currentUserId, next);
      await reload();
    },
    [snapshot, reload]
  );

  const updatePrivacySettings = useCallback(
    async (settings: Partial<CommunityPrivacySettings>) => {
      await communityRepository.updatePrivacySettings(settings);
      await reload();
    },
    [reload]
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
        matchingMessages,
        unreadCounts,
        replyTo,
        setReplyTo,
        editingMessage,
        setEditingMessage,
        forwardingMessage,
        setForwardingMessage,
        infoPanelOpen,
        setInfoPanelOpen,
        profileUserId,
        setProfileUserId,
        typingMap,
        sendMessage,
        saveEditMessage,
        deleteMessage,
        toggleReaction,
        forwardToConversation,
        togglePinMessage,
        togglePinConversation,
        toggleMuteConversation,
        saveDraft,
        clearHistory,
        openDirectChat,
        createGroup,
        updateGroupDetails,
        addGroupMember,
        removeGroupMember,
        updateGroupMemberRole,
        updateGroupMemberPermissions,
        toggleBlockUser,
        updateNotificationPreferences,
        updatePrivacySettings,
        getPeerUser,
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

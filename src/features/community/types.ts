export type PresenceStatus = "online" | "recently" | "offline";

export type DeliveryStatus = "sending" | "sent" | "delivered" | "read";

export type AttachmentType = "image" | "video" | "file" | "voice";

export type GroupRole = "owner" | "admin" | "member";

export interface CommunityUser {
  id: string;
  fullName: string;
  username: string;
  bio: string;
  department: string;
  batchYear: string;
  avatarInitials: string;
  avatarColor: string;
  avatarUrl?: string;
  status: PresenceStatus;
  lastSeenAt: string;
  communityRole?: string;
  isBlocked?: boolean;
}

export interface MessageAttachment {
  id: string;
  type: AttachmentType;
  name: string;
  url?: string;
  sizeBytes?: number;
  durationSec?: number;
  mimeType?: string;
  waveform?: number[];
}

export interface MessageReaction {
  emoji: string;
  userIds: string[];
}

export interface ForwardedAttribution {
  senderName: string;
  conversationTitle: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  editedAt?: string;
  deletedForAll?: boolean;
  replyToId?: string;
  forwardedFrom?: ForwardedAttribution;
  attachments?: MessageAttachment[];
  reactions: MessageReaction[];
  deliveryStatus: DeliveryStatus;
  isPinned?: boolean;
}

export interface GroupMemberPermissions {
  canSendMessages: boolean;
  canPinMessages: boolean;
  canInviteMembers: boolean;
}

export interface GroupMember {
  userId: string;
  role: GroupRole;
  joinedAt: string;
  permissions: GroupMemberPermissions;
}

export interface Conversation {
  id: string;
  type: "direct" | "group";
  title: string;
  username?: string;
  description?: string;
  inviteLink?: string;
  participantIds: string[];
  members?: GroupMember[];
  pinnedMessageIds: string[];
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  typingUserIds: string[];
  draftText?: string;
  updatedAt: string;
  avatarInitials: string;
  avatarColor: string;
  isPublic?: boolean;
}

export interface CommunityNotificationPreferences {
  enabled: boolean;
  directMessages: boolean;
  groupMessages: boolean;
  mentionsOnly: boolean;
  soundEnabled: boolean;
  showMessagePreview: boolean;
  quietHoursEnabled: boolean;
  quietHoursRange: string;
}

export interface CommunityPrivacySettings {
  lastSeenVisibility: "everyone" | "university" | "nobody";
  profilePhotoVisibility: "everyone" | "university";
  allowDirectMessagesFrom: "everyone" | "group_members";
  readReceiptsEnabled: boolean;
}

export interface SendMessageInput {
  conversationId: string;
  senderId: string;
  text: string;
  replyToId?: string;
  attachments?: MessageAttachment[];
  forwardedFrom?: ForwardedAttribution;
}

export interface CreateGroupInput {
  title: string;
  description: string;
  creatorId: string;
  memberIds: string[];
  isPublic?: boolean;
}

export interface CommunitySnapshot {
  currentUserId: string;
  users: Record<string, CommunityUser>;
  conversations: Conversation[];
  messagesByConversation: Record<string, ChatMessage[]>;
  notificationPreferences: CommunityNotificationPreferences;
  privacySettings: CommunityPrivacySettings;
}

/**
 * Repository abstraction so mock state can later be swapped cleanly
 * with a real-time backend service (e.g., Supabase Realtime / WebSockets)
 * without changing UI components.
 */
export interface ICommunityRepository {
  getSnapshot(): Promise<CommunitySnapshot>;
  sendMessage(input: SendMessageInput): Promise<ChatMessage>;
  editMessage(conversationId: string, messageId: string, newText: string): Promise<ChatMessage | null>;
  deleteMessage(conversationId: string, messageId: string, forEveryone: boolean): Promise<void>;
  toggleReaction(conversationId: string, messageId: string, userId: string, emoji: string): Promise<void>;
  togglePinMessage(conversationId: string, messageId: string): Promise<void>;
  togglePinConversation(conversationId: string): Promise<void>;
  toggleMuteConversation(conversationId: string): Promise<void>;
  markConversationRead(conversationId: string): Promise<void>;
  saveDraft(conversationId: string, draftText: string): Promise<void>;
  clearConversationHistory(conversationId: string): Promise<void>;
  getOrCreateDirectConversation(userId: string): Promise<Conversation>;
  createGroup(input: CreateGroupInput): Promise<Conversation>;
  updateGroupDetails(conversationId: string, updates: { title?: string; description?: string; regenerateInvite?: boolean }): Promise<Conversation | null>;
  addGroupMember(conversationId: string, userId: string): Promise<void>;
  removeGroupMember(conversationId: string, userId: string): Promise<void>;
  updateGroupMemberRole(conversationId: string, userId: string, role: GroupRole): Promise<void>;
  updateGroupMemberPermissions(conversationId: string, userId: string, permissions: Partial<GroupMemberPermissions>): Promise<void>;
  toggleBlockUser(userId: string): Promise<void>;
  updateNotificationPreferences(prefs: Partial<CommunityNotificationPreferences>): Promise<CommunityNotificationPreferences>;
  updatePrivacySettings(settings: Partial<CommunityPrivacySettings>): Promise<CommunityPrivacySettings>;
}

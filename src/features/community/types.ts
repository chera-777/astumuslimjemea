export type PresenceStatus = "online" | "recently" | "offline";

export type DeliveryStatus = "sending" | "sent" | "delivered" | "read";

export type AttachmentType = "image" | "video" | "file" | "voice";

export type GroupRole = "owner" | "admin" | "member";

export type ConversationType = "direct" | "group" | "channel";

export type MeetingType = "voice" | "video";

export type MeetingStatus = "scheduled" | "live" | "ended";

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
  portalRoles?: string[];
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

export interface PollOption {
  id: string;
  text: string;
  voterIds: string[];
}

export interface PollData {
  id: string;
  question: string;
  options: PollOption[];
  multipleChoice: boolean;
  anonymous: boolean;
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
  poll?: PollData;
  viewsCount?: number;
  reactions: MessageReaction[];
  deliveryStatus: DeliveryStatus;
  isPinned?: boolean;
}

export interface GroupMemberPermissions {
  canSendMessages: boolean;
  canPinMessages: boolean;
  canInviteMembers: boolean;
  canCreatePolls?: boolean;
}

export interface GroupMember {
  userId: string;
  role: GroupRole;
  joinedAt: string;
  permissions: GroupMemberPermissions;
}

export interface ChannelSettings {
  allowReactions: boolean;
  allowForwarding: boolean;
  silentPosts: boolean;
}

export interface Conversation {
  id: string;
  type: ConversationType;
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
  wallpaperId?: string;
  sharingDisabled?: boolean;
  // Channel-specific fields
  subscriberCount?: number;
  boostCount?: number;
  isSubscribed?: boolean;
  channelSettings?: ChannelSettings;
}

export interface CommunityNotificationPreferences {
  enabled: boolean;
  directMessages: boolean;
  groupMessages: boolean;
  channelPosts: boolean;
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

export interface CommunityMediaPreferences {
  autoDownloadPhotos: boolean;
  autoDownloadFiles: boolean;
  autoPlayVoice: boolean;
  showWaveforms: boolean;
  compressMediaUploads: boolean;
}

export interface CommunityAccessibilityPreferences {
  textSize: "small" | "default" | "large";
  compactMode: boolean;
  reducedMotion: boolean;
  highContrastBubbles: boolean;
}

export interface CommunityProfileUpdateInput {
  fullName: string;
  username: string;
  bio: string;
  department: string;
  batchYear: string;
}

export interface MeetingParticipant {
  userId: string;
  isMuted: boolean;
  isVideoOn: boolean;
  isHost: boolean;
  joinedAt: string;
}

export interface CommitteeMeeting {
  id: string;
  title: string;
  description: string;
  meetingType: MeetingType;
  status: MeetingStatus;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  hostId: string;
  invitedUserIds: string[];
  participants: MeetingParticipant[];
  startedAt?: string;
  endedAt?: string;
  notificationsSentAt?: string;
  allowedRoles: ("committee" | "amir" | "admin")[];
}

export interface ScheduleMeetingInput {
  title: string;
  description: string;
  meetingType: MeetingType;
  scheduledDate: string;
  scheduledTime: string;
  invitedUserIds: string[];
}

export interface SendMessageInput {
  conversationId: string;
  senderId: string;
  text: string;
  replyToId?: string;
  attachments?: MessageAttachment[];
  forwardedFrom?: ForwardedAttribution;
  poll?: PollData;
}

export interface CreateGroupInput {
  title: string;
  description: string;
  creatorId: string;
  memberIds: string[];
  isPublic?: boolean;
}

export interface CreateChannelInput {
  title: string;
  username?: string;
  description: string;
  creatorId: string;
  isPublic?: boolean;
}

export interface CommunitySnapshot {
  currentUserId: string;
  users: Record<string, CommunityUser>;
  conversations: Conversation[];
  messagesByConversation: Record<string, ChatMessage[]>;
  notificationPreferences: CommunityNotificationPreferences;
  privacySettings: CommunityPrivacySettings;
  mediaPreferences: CommunityMediaPreferences;
  accessibilityPreferences: CommunityAccessibilityPreferences;
}

/**
 * Repository abstraction so mock state can later be swapped cleanly
 * with a real-time backend service without changing UI components.
 */
export interface ICommunityRepository {
  getSnapshot(): Promise<CommunitySnapshot>;
  sendMessage(input: SendMessageInput): Promise<ChatMessage>;
  editMessage(conversationId: string, messageId: string, newText: string): Promise<ChatMessage | null>;
  deleteMessage(conversationId: string, messageId: string, forEveryone: boolean): Promise<void>;
  toggleReaction(conversationId: string, messageId: string, userId: string, emoji: string): Promise<void>;
  votePoll(conversationId: string, messageId: string, optionId: string, userId: string): Promise<void>;
  togglePinMessage(conversationId: string, messageId: string): Promise<void>;
  togglePinConversation(conversationId: string): Promise<void>;
  toggleMuteConversation(conversationId: string): Promise<void>;
  setConversationWallpaper(conversationId: string, wallpaperId: string): Promise<void>;
  toggleDisableSharing(conversationId: string): Promise<void>;
  exportConversationHistory(conversationId: string): Promise<{ filename: string; content: string }>;
  markConversationRead(conversationId: string): Promise<void>;
  saveDraft(conversationId: string, draftText: string): Promise<void>;
  clearConversationHistory(conversationId: string): Promise<void>;
  deleteConversation(conversationId: string): Promise<void>;
  leaveConversation(conversationId: string): Promise<void>;
  reportConversation(conversationId: string, reason: string): Promise<void>;
  getOrCreateDirectConversation(userId: string): Promise<Conversation>;
  createGroup(input: CreateGroupInput): Promise<Conversation>;
  createChannel(input: CreateChannelInput): Promise<Conversation>;
  subscribeChannel(conversationId: string): Promise<void>;
  boostChannel(conversationId: string): Promise<void>;
  updateChannelSettings(conversationId: string, settings: Partial<ChannelSettings>): Promise<void>;
  updateGroupDetails(conversationId: string, updates: { title?: string; description?: string; regenerateInvite?: boolean }): Promise<Conversation | null>;
  addGroupMember(conversationId: string, userId: string): Promise<void>;
  removeGroupMember(conversationId: string, userId: string): Promise<void>;
  updateGroupMemberRole(conversationId: string, userId: string, role: GroupRole): Promise<void>;
  updateGroupMemberPermissions(conversationId: string, userId: string, permissions: Partial<GroupMemberPermissions>): Promise<void>;
  toggleBlockUser(userId: string): Promise<void>;
  updateNotificationPreferences(prefs: Partial<CommunityNotificationPreferences>): Promise<CommunityNotificationPreferences>;
  updatePrivacySettings(settings: Partial<CommunityPrivacySettings>): Promise<CommunityPrivacySettings>;
  updateMediaPreferences(prefs: Partial<CommunityMediaPreferences>): Promise<CommunityMediaPreferences>;
  updateAccessibilityPreferences(prefs: Partial<CommunityAccessibilityPreferences>): Promise<CommunityAccessibilityPreferences>;
  updateOwnCommunityProfile(input: CommunityProfileUpdateInput): Promise<CommunityUser | null>;
  clearLocalCache(): Promise<void>;
  exportAllCommunityData(): Promise<{ filename: string; content: string }>;
  // Committee-only meetings (RBAC-enforced)
  getMeetings(actorRoles: readonly string[]): Promise<CommitteeMeeting[]>;
  scheduleMeeting(actorRoles: readonly string[], hostId: string, input: ScheduleMeetingInput): Promise<CommitteeMeeting>;
  startInstantMeeting(actorRoles: readonly string[], hostId: string, title: string, meetingType: MeetingType, invitedUserIds: string[]): Promise<CommitteeMeeting>;
  joinMeeting(actorRoles: readonly string[], meetingId: string, userId: string): Promise<CommitteeMeeting>;
  leaveMeeting(actorRoles: readonly string[], meetingId: string, userId: string): Promise<void>;
  endMeeting(actorRoles: readonly string[], meetingId: string, actorUserId: string): Promise<void>;
  inviteToMeeting(actorRoles: readonly string[], meetingId: string, userId: string): Promise<void>;
  toggleParticipantMute(actorRoles: readonly string[], meetingId: string, targetUserId: string): Promise<void>;
  removeMeetingParticipant(actorRoles: readonly string[], meetingId: string, targetUserId: string): Promise<void>;
}

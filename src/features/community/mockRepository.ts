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
  ICommunityRepository,
  SendMessageInput,
} from "./types";
import eventTafsir from "@/assets/event-tafsir.jpg";
import eventCoding from "@/assets/event-coding.jpg";
import mosqueHero from "@/assets/mosque-hero.jpg";

const minsAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();
const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

const CURRENT_USER_ID = "user-me";

function createInitialSnapshot(): CommunitySnapshot {
  const users: Record<string, CommunityUser> = {
    [CURRENT_USER_ID]: {
      id: CURRENT_USER_ID,
      fullName: "Chera Kemal",
      username: "@chera_k",
      bio: "Software Engineering · ASTU Muslim Jemea member",
      department: "Software Engineering",
      batchYear: "4th Year",
      avatarInitials: "CK",
      avatarColor: "from-emerald-600 to-teal-700",
      status: "online",
      lastSeenAt: minsAgo(0),
      communityRole: "Member",
    },
    "user-yusuf": {
      id: "user-yusuf",
      fullName: "Yusuf Kedir",
      username: "@yusuf_k",
      bio: "Amir of Academic Sector · CSE '26 · Always happy to share study notes & reminders.",
      department: "Computer Science & Engineering",
      batchYear: "4th Year",
      avatarInitials: "YK",
      avatarColor: "from-teal-600 to-cyan-700",
      status: "online",
      lastSeenAt: minsAgo(0),
      communityRole: "Academic Amir",
    },
    "user-fatima": {
      id: "user-fatima",
      fullName: "Fatima Ahmed",
      username: "@fatima_a",
      bio: "Sisters Study Coordinator · Architecture & Urban Planning",
      department: "Architecture",
      batchYear: "3rd Year",
      avatarInitials: "FA",
      avatarColor: "from-violet-600 to-purple-700",
      status: "online",
      lastSeenAt: minsAgo(0),
      communityRole: "Coordinator",
    },
    "user-ibrahim": {
      id: "user-ibrahim",
      fullName: "Ibrahim Abdurahman",
      username: "@ibrahim_ab",
      bio: "Halaqa & Tajweed Facilitator · Electrical Power Engineering",
      department: "Electrical & Computer Engineering",
      batchYear: "5th Year",
      avatarInitials: "IA",
      avatarColor: "from-sky-600 to-blue-700",
      status: "recently",
      lastSeenAt: minsAgo(12),
      communityRole: "Murshid",
    },
    "user-hassan": {
      id: "user-hassan",
      fullName: "Hassan Beriso",
      username: "@hassan_b",
      bio: "Khadim Volunteer Lead · Mechanical Engineering",
      department: "Mechanical Engineering",
      batchYear: "3rd Year",
      avatarInitials: "HB",
      avatarColor: "from-amber-600 to-orange-700",
      status: "offline",
      lastSeenAt: hoursAgo(2),
      communityRole: "Khadim Lead",
    },
    "user-aisha": {
      id: "user-aisha",
      fullName: "Aisha Mohammed",
      username: "@aisha_m",
      bio: "Media & Design Committee · Civil Engineering",
      department: "Civil Engineering",
      batchYear: "2nd Year",
      avatarInitials: "AM",
      avatarColor: "from-rose-600 to-pink-700",
      status: "online",
      lastSeenAt: minsAgo(0),
      communityRole: "Media Team",
    },
    "user-omar": {
      id: "user-omar",
      fullName: "Omar Suleiman",
      username: "@omar_sul",
      bio: "Applied Physics · Freshmen peer tutor & book club organizer",
      department: "Applied Physics",
      batchYear: "2nd Year",
      avatarInitials: "OS",
      avatarColor: "from-indigo-600 to-blue-800",
      status: "recently",
      lastSeenAt: minsAgo(38),
      communityRole: "Tutor",
    },
    "user-bilal": {
      id: "user-bilal",
      fullName: "Bilal Tadesse",
      username: "@bilal_t",
      bio: "Chemical Engineering · Weekend Iftar & Mosque logistics",
      department: "Chemical Engineering",
      batchYear: "4th Year",
      avatarInitials: "BT",
      avatarColor: "from-green-600 to-emerald-800",
      status: "offline",
      lastSeenAt: hoursAgo(5),
      communityRole: "Volunteer",
    },
  };

  const messagesByConversation: Record<string, ChatMessage[]> = {
    "conv-dm-yusuf": [
      {
        id: "msg-101",
        conversationId: "conv-dm-yusuf",
        senderId: "user-yusuf",
        text: "Assalamu Alaikum brother! Did you get a chance to review the Algorithms tutorial sheet for Friday's peer session?",
        createdAt: hoursAgo(3),
        reactions: [{ emoji: "👍", userIds: [CURRENT_USER_ID] }],
        deliveryStatus: "read",
      },
      {
        id: "msg-102",
        conversationId: "conv-dm-yusuf",
        senderId: CURRENT_USER_ID,
        text: "Wa Alaikum Assalam Yusuf! Yes, I finished the dynamic programming problems and annotated the solutions.",
        createdAt: hoursAgo(2.5),
        replyToId: "msg-101",
        reactions: [],
        deliveryStatus: "read",
      },
      {
        id: "msg-103",
        conversationId: "conv-dm-yusuf",
        senderId: CURRENT_USER_ID,
        text: "Here is the PDF packet with worked examples for the 2nd and 3rd year brothers.",
        createdAt: hoursAgo(2.4),
        attachments: [
          {
            id: "att-103",
            type: "file",
            name: "ASTU_Algorithms_Peer_Session_Week06.pdf",
            sizeBytes: 1_420_000,
            mimeType: "application/pdf",
          },
        ],
        reactions: [{ emoji: "🤲", userIds: ["user-yusuf"] }],
        deliveryStatus: "read",
      },
      {
        id: "msg-104",
        conversationId: "conv-dm-yusuf",
        senderId: "user-yusuf",
        text: "MashaAllah, this is super clean! I will pin this in the Academic Circle before Maghrib.",
        createdAt: minsAgo(24),
        reactions: [],
        deliveryStatus: "read",
      },
      {
        id: "msg-105",
        conversationId: "conv-dm-yusuf",
        senderId: "user-yusuf",
        text: "Also sent a quick voice summary on tonight's halaqa schedule.",
        createdAt: minsAgo(3),
        attachments: [
          {
            id: "att-105",
            type: "voice",
            name: "Halaqa schedule note",
            durationSec: 18,
            waveform: [22, 48, 70, 42, 85, 92, 60, 38, 75, 88, 54, 40, 68, 79, 44, 30, 52, 62, 35, 24],
          },
        ],
        reactions: [],
        deliveryStatus: "delivered",
      },
    ],
    "conv-dm-ibrahim": [
      {
        id: "msg-201",
        conversationId: "conv-dm-ibrahim",
        senderId: "user-ibrahim",
        text: "Assalamu Alaikum! Reminder that tonight's Surah Al-Mulk tajweed revision starts right after Maghrib in Room B-12.",
        createdAt: hoursAgo(5),
        reactions: [{ emoji: "❤️", userIds: [CURRENT_USER_ID] }],
        deliveryStatus: "read",
        isPinned: true,
      },
      {
        id: "msg-202",
        conversationId: "conv-dm-ibrahim",
        senderId: CURRENT_USER_ID,
        text: "Wa Alaikum Assalam Ustadh Ibrahim. InshaAllah I will be there 10 minutes early to help arrange the mushafs.",
        createdAt: hoursAgo(4.2),
        reactions: [],
        deliveryStatus: "read",
      },
      {
        id: "msg-203",
        conversationId: "conv-dm-ibrahim",
        senderId: "user-ibrahim",
        text: "BarakAllahu feek! See you at the ders.",
        createdAt: minsAgo(16),
        reactions: [],
        deliveryStatus: "read",
      },
    ],
    "conv-dm-hassan": [
      {
        id: "msg-301",
        conversationId: "conv-dm-hassan",
        senderId: "user-hassan",
        text: "We captured a quick photo of the main mosque courtyard setup before Jumu'ah.",
        createdAt: hoursAgo(6),
        attachments: [
          {
            id: "att-301",
            type: "image",
            name: "mosque-courtyard.jpg",
            url: mosqueHero,
          },
        ],
        reactions: [{ emoji: "🎉", userIds: [CURRENT_USER_ID] }],
        deliveryStatus: "read",
      },
      {
        id: "msg-302",
        conversationId: "conv-dm-hassan",
        senderId: "user-hassan",
        text: "SubhanAllah, great turnout today! Can you cover the Asr water station shift tomorrow?",
        createdAt: minsAgo(52),
        reactions: [],
        deliveryStatus: "delivered",
      },
    ],
    "conv-dm-aisha": [
      {
        id: "msg-401",
        conversationId: "conv-dm-aisha",
        senderId: "user-aisha",
        text: "Assalamu Alaikum Chera, we updated the Ramadan lecture series poster. Does the schedule match the portal?",
        createdAt: daysAgo(1),
        reactions: [],
        deliveryStatus: "read",
      },
      {
        id: "msg-402",
        conversationId: "conv-dm-aisha",
        senderId: CURRENT_USER_ID,
        text: "Wa Alaikum Assalam Aisha! Everything matches — 6:45 PM after Maghrib in the Main Hall.",
        createdAt: hoursAgo(18),
        reactions: [{ emoji: "👍", userIds: ["user-aisha"] }],
        deliveryStatus: "read",
      },
    ],
    "conv-dm-omar": [
      {
        id: "msg-501",
        conversationId: "conv-dm-omar",
        senderId: "user-omar",
        text: "Can you share the Linear Algebra past papers when you're free?",
        createdAt: hoursAgo(8),
        reactions: [],
        deliveryStatus: "read",
      },
    ],
    "conv-grp-general": [
      {
        id: "msg-601",
        conversationId: "conv-grp-general",
        senderId: "user-yusuf",
        text: "Assalamu Alaikum everyone! Welcome to the ASTU Muslim Jemea General Channel. Keep discussions respectful, helpful, and focused on campus spiritual & academic growth.",
        createdAt: daysAgo(2),
        reactions: [
          { emoji: "🤲", userIds: [CURRENT_USER_ID, "user-ibrahim", "user-fatima"] },
          { emoji: "❤️", userIds: ["user-aisha", "user-omar"] },
        ],
        deliveryStatus: "read",
        isPinned: true,
      },
      {
        id: "msg-602",
        conversationId: "conv-grp-general",
        senderId: "user-fatima",
        text: "Reminder: Our weekly Tafsir & Seerah reflection session begins this Thursday at 5:30 PM.",
        createdAt: hoursAgo(4),
        attachments: [
          {
            id: "att-602",
            type: "image",
            name: "weekly-tafsir-session.jpg",
            url: eventTafsir,
          },
        ],
        reactions: [{ emoji: "👍", userIds: [CURRENT_USER_ID, "user-yusuf"] }],
        deliveryStatus: "read",
      },
      {
        id: "msg-603",
        conversationId: "conv-grp-general",
        senderId: "user-ibrahim",
        text: "Iftar water & dates volunteers should check in with Br. Hassan 20 minutes before Adhan.",
        createdAt: minsAgo(45),
        reactions: [],
        deliveryStatus: "read",
      },
      {
        id: "msg-604",
        conversationId: "conv-grp-general",
        senderId: "user-aisha",
        text: "Updated campus prayer timetable for this week is also live under Prayer Times.",
        createdAt: minsAgo(8),
        reactions: [{ emoji: "🎉", userIds: ["user-omar"] }],
        deliveryStatus: "delivered",
      },
    ],
    "conv-grp-academic": [
      {
        id: "msg-701",
        conversationId: "conv-grp-academic",
        senderId: "user-yusuf",
        text: "Pinned: Peer tutoring hours are Mon/Wed 4–6 PM (CS & Math) and Tue/Thu 4–6 PM (Physics & ECE).",
        createdAt: daysAgo(1),
        reactions: [{ emoji: "👍", userIds: [CURRENT_USER_ID, "user-omar"] }],
        deliveryStatus: "read",
        isPinned: true,
      },
      {
        id: "msg-702",
        conversationId: "conv-grp-academic",
        senderId: "user-omar",
        text: "Here's a snapshot from yesterday's Data Structures coding workshop!",
        createdAt: hoursAgo(3),
        attachments: [
          {
            id: "att-702",
            type: "image",
            name: "coding-workshop.jpg",
            url: eventCoding,
          },
        ],
        reactions: [{ emoji: "🔥", userIds: [CURRENT_USER_ID, "user-yusuf"] }],
        deliveryStatus: "read",
      },
      {
        id: "msg-703",
        conversationId: "conv-grp-academic",
        senderId: "user-yusuf",
        text: "Tutoring schedule updated for midterms — let us know which course needs extra review rooms.",
        createdAt: minsAgo(19),
        reactions: [],
        deliveryStatus: "delivered",
      },
    ],
    "conv-grp-qiraat": [
      {
        id: "msg-801",
        conversationId: "conv-grp-qiraat",
        senderId: "user-ibrahim",
        text: "New Makharij & Madd practice audio uploaded for tonight's circle.",
        createdAt: hoursAgo(2),
        attachments: [
          {
            id: "att-801",
            type: "voice",
            name: "Madd practice recitation",
            durationSec: 26,
            waveform: [35, 65, 82, 50, 74, 95, 88, 60, 42, 70, 84, 90, 62, 48, 72, 56, 40, 58, 35, 25],
          },
        ],
        reactions: [{ emoji: "🤲", userIds: ["user-bilal", CURRENT_USER_ID] }],
        deliveryStatus: "read",
        isPinned: true,
      },
    ],
    "conv-grp-khadims": [
      {
        id: "msg-901",
        conversationId: "conv-grp-khadims",
        senderId: "user-hassan",
        text: "Jumu'ah carpet & sound check crew: please confirm availability for Friday 11:15 AM.",
        createdAt: hoursAgo(7),
        reactions: [{ emoji: "👍", userIds: [CURRENT_USER_ID, "user-bilal"] }],
        deliveryStatus: "read",
        isPinned: true,
      },
      {
        id: "msg-902",
        conversationId: "conv-grp-khadims",
        senderId: "user-bilal",
        text: "Count me in for sound check and shoe rack organization.",
        createdAt: hoursAgo(6),
        reactions: [],
        deliveryStatus: "read",
      },
    ],
  };

  const conversations: Conversation[] = [
    {
      id: "conv-dm-yusuf",
      type: "direct",
      title: "Yusuf Kedir",
      username: "@yusuf_k",
      participantIds: [CURRENT_USER_ID, "user-yusuf"],
      pinnedMessageIds: [],
      unreadCount: 2,
      isPinned: true,
      isMuted: false,
      typingUserIds: [],
      updatedAt: minsAgo(3),
      avatarInitials: "YK",
      avatarColor: "from-teal-600 to-cyan-700",
    },
    {
      id: "conv-dm-ibrahim",
      type: "direct",
      title: "Ibrahim Abdurahman",
      username: "@ibrahim_ab",
      participantIds: [CURRENT_USER_ID, "user-ibrahim"],
      pinnedMessageIds: ["msg-201"],
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      typingUserIds: [],
      updatedAt: minsAgo(16),
      avatarInitials: "IA",
      avatarColor: "from-sky-600 to-blue-700",
    },
    {
      id: "conv-dm-hassan",
      type: "direct",
      title: "Hassan Beriso",
      username: "@hassan_b",
      participantIds: [CURRENT_USER_ID, "user-hassan"],
      pinnedMessageIds: [],
      unreadCount: 1,
      isPinned: false,
      isMuted: false,
      typingUserIds: [],
      updatedAt: minsAgo(52),
      avatarInitials: "HB",
      avatarColor: "from-amber-600 to-orange-700",
    },
    {
      id: "conv-dm-aisha",
      type: "direct",
      title: "Aisha Mohammed",
      username: "@aisha_m",
      participantIds: [CURRENT_USER_ID, "user-aisha"],
      pinnedMessageIds: [],
      unreadCount: 0,
      isPinned: false,
      isMuted: true,
      typingUserIds: [],
      updatedAt: hoursAgo(18),
      avatarInitials: "AM",
      avatarColor: "from-rose-600 to-pink-700",
    },
    {
      id: "conv-dm-omar",
      type: "direct",
      title: "Omar Suleiman",
      username: "@omar_sul",
      participantIds: [CURRENT_USER_ID, "user-omar"],
      pinnedMessageIds: [],
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      typingUserIds: [],
      updatedAt: hoursAgo(8),
      avatarInitials: "OS",
      avatarColor: "from-indigo-600 to-blue-800",
    },
    {
      id: "conv-grp-general",
      type: "group",
      title: "ASTU Jemea General",
      description: "Official campus community chat for announcements, daily reminders, and brotherly/sisterly support.",
      inviteLink: "https://astujemea.app/join/general-2026",
      participantIds: [CURRENT_USER_ID, "user-yusuf", "user-fatima", "user-ibrahim", "user-hassan", "user-aisha", "user-omar", "user-bilal"],
      members: [
        { userId: "user-yusuf", role: "owner", joinedAt: daysAgo(90), permissions: { canSendMessages: true, canPinMessages: true, canInviteMembers: true } },
        { userId: "user-fatima", role: "admin", joinedAt: daysAgo(85), permissions: { canSendMessages: true, canPinMessages: true, canInviteMembers: true } },
        { userId: "user-ibrahim", role: "admin", joinedAt: daysAgo(80), permissions: { canSendMessages: true, canPinMessages: true, canInviteMembers: true } },
        { userId: CURRENT_USER_ID, role: "admin", joinedAt: daysAgo(70), permissions: { canSendMessages: true, canPinMessages: true, canInviteMembers: true } },
        { userId: "user-hassan", role: "member", joinedAt: daysAgo(60), permissions: { canSendMessages: true, canPinMessages: false, canInviteMembers: true } },
        { userId: "user-aisha", role: "member", joinedAt: daysAgo(50), permissions: { canSendMessages: true, canPinMessages: false, canInviteMembers: true } },
        { userId: "user-omar", role: "member", joinedAt: daysAgo(40), permissions: { canSendMessages: true, canPinMessages: false, canInviteMembers: false } },
        { userId: "user-bilal", role: "member", joinedAt: daysAgo(30), permissions: { canSendMessages: true, canPinMessages: false, canInviteMembers: false } },
      ],
      pinnedMessageIds: ["msg-601"],
      unreadCount: 4,
      isPinned: true,
      isMuted: false,
      typingUserIds: [],
      updatedAt: minsAgo(8),
      avatarInitials: "AJ",
      avatarColor: "from-emerald-600 to-teal-700",
      isPublic: true,
    },
    {
      id: "conv-grp-academic",
      type: "group",
      title: "Academic Circle · CS & Eng",
      description: "Peer tutoring, exam past papers, coding workshops, and study group coordination across engineering schools.",
      inviteLink: "https://astujemea.app/join/academic-cs",
      participantIds: [CURRENT_USER_ID, "user-yusuf", "user-omar", "user-aisha", "user-fatima"],
      members: [
        { userId: "user-yusuf", role: "owner", joinedAt: daysAgo(65), permissions: { canSendMessages: true, canPinMessages: true, canInviteMembers: true } },
        { userId: CURRENT_USER_ID, role: "member", joinedAt: daysAgo(60), permissions: { canSendMessages: true, canPinMessages: false, canInviteMembers: true } },
        { userId: "user-omar", role: "admin", joinedAt: daysAgo(55), permissions: { canSendMessages: true, canPinMessages: true, canInviteMembers: true } },
        { userId: "user-aisha", role: "member", joinedAt: daysAgo(45), permissions: { canSendMessages: true, canPinMessages: false, canInviteMembers: true } },
        { userId: "user-fatima", role: "member", joinedAt: daysAgo(40), permissions: { canSendMessages: true, canPinMessages: false, canInviteMembers: false } },
      ],
      pinnedMessageIds: ["msg-701"],
      unreadCount: 2,
      isPinned: false,
      isMuted: false,
      typingUserIds: [],
      updatedAt: minsAgo(19),
      avatarInitials: "AC",
      avatarColor: "from-blue-600 to-indigo-700",
      isPublic: true,
    },
    {
      id: "conv-grp-qiraat",
      type: "group",
      title: "Qira'at & Tajweed Circle",
      description: "Daily Quran recitation practice, makharij correction, and weekly Juz memorization check-ins.",
      inviteLink: "https://astujemea.app/join/qiraat-circle",
      participantIds: [CURRENT_USER_ID, "user-ibrahim", "user-bilal", "user-omar"],
      members: [
        { userId: "user-ibrahim", role: "owner", joinedAt: daysAgo(75), permissions: { canSendMessages: true, canPinMessages: true, canInviteMembers: true } },
        { userId: CURRENT_USER_ID, role: "member", joinedAt: daysAgo(50), permissions: { canSendMessages: true, canPinMessages: false, canInviteMembers: true } },
        { userId: "user-bilal", role: "member", joinedAt: daysAgo(42), permissions: { canSendMessages: true, canPinMessages: false, canInviteMembers: false } },
        { userId: "user-omar", role: "member", joinedAt: daysAgo(35), permissions: { canSendMessages: true, canPinMessages: false, canInviteMembers: false } },
      ],
      pinnedMessageIds: ["msg-801"],
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      typingUserIds: [],
      updatedAt: hoursAgo(2),
      avatarInitials: "QT",
      avatarColor: "from-purple-600 to-violet-700",
      isPublic: true,
    },
    {
      id: "conv-grp-khadims",
      type: "group",
      title: "Mosque Khadim Team",
      description: "Shift swaps, Jumu'ah setup, sound system checks, and Ramadan Iftar serving coordination.",
      inviteLink: "https://astujemea.app/join/khadim-crew",
      participantIds: [CURRENT_USER_ID, "user-hassan", "user-bilal", "user-yusuf"],
      members: [
        { userId: "user-hassan", role: "owner", joinedAt: daysAgo(50), permissions: { canSendMessages: true, canPinMessages: true, canInviteMembers: true } },
        { userId: CURRENT_USER_ID, role: "admin", joinedAt: daysAgo(45), permissions: { canSendMessages: true, canPinMessages: true, canInviteMembers: true } },
        { userId: "user-bilal", role: "member", joinedAt: daysAgo(40), permissions: { canSendMessages: true, canPinMessages: false, canInviteMembers: true } },
        { userId: "user-yusuf", role: "member", joinedAt: daysAgo(38), permissions: { canSendMessages: true, canPinMessages: false, canInviteMembers: true } },
      ],
      pinnedMessageIds: ["msg-901"],
      unreadCount: 0,
      isPinned: false,
      isMuted: true,
      typingUserIds: [],
      updatedAt: hoursAgo(6),
      avatarInitials: "MK",
      avatarColor: "from-amber-600 to-yellow-700",
      isPublic: false,
    },
  ];

  const notificationPreferences: CommunityNotificationPreferences = {
    enabled: true,
    directMessages: true,
    groupMessages: true,
    mentionsOnly: false,
    soundEnabled: true,
    showMessagePreview: true,
    quietHoursEnabled: false,
    quietHoursRange: "22:30 – 05:30",
  };

  const privacySettings: CommunityPrivacySettings = {
    lastSeenVisibility: "university",
    profilePhotoVisibility: "university",
    allowDirectMessagesFrom: "everyone",
    readReceiptsEnabled: true,
  };

  return {
    currentUserId: CURRENT_USER_ID,
    users,
    conversations,
    messagesByConversation,
    notificationPreferences,
    privacySettings,
  };
}

class MockCommunityRepository implements ICommunityRepository {
  private state: CommunitySnapshot = createInitialSnapshot();

  async getSnapshot(): Promise<CommunitySnapshot> {
    return structuredClone(this.state);
  }

  async sendMessage(input: SendMessageInput): Promise<ChatMessage> {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      conversationId: input.conversationId,
      senderId: input.senderId,
      text: input.text,
      createdAt: new Date().toISOString(),
      replyToId: input.replyToId,
      forwardedFrom: input.forwardedFrom,
      attachments: input.attachments,
      reactions: [],
      deliveryStatus: "delivered",
    };

    const existing = this.state.messagesByConversation[input.conversationId] ?? [];
    this.state.messagesByConversation[input.conversationId] = [...existing, newMsg];
    this.state.conversations = this.state.conversations.map((c) =>
      c.id === input.conversationId
        ? { ...c, updatedAt: newMsg.createdAt, draftText: "" }
        : c
    );
    return structuredClone(newMsg);
  }

  async editMessage(conversationId: string, messageId: string, newText: string): Promise<ChatMessage | null> {
    const list = this.state.messagesByConversation[conversationId] ?? [];
    let updated: ChatMessage | null = null;
    this.state.messagesByConversation[conversationId] = list.map((m) => {
      if (m.id === messageId) {
        updated = { ...m, text: newText, editedAt: new Date().toISOString() };
        return updated;
      }
      return m;
    });
    return updated ? structuredClone(updated) : null;
  }

  async deleteMessage(conversationId: string, messageId: string, forEveryone: boolean): Promise<void> {
    const list = this.state.messagesByConversation[conversationId] ?? [];
    if (forEveryone) {
      this.state.messagesByConversation[conversationId] = list.map((m) =>
        m.id === messageId
          ? { ...m, text: "", attachments: undefined, deletedForAll: true, reactions: [] }
          : m
      );
    } else {
      this.state.messagesByConversation[conversationId] = list.filter((m) => m.id !== messageId);
    }
    this.state.conversations = this.state.conversations.map((c) =>
      c.id === conversationId
        ? { ...c, pinnedMessageIds: c.pinnedMessageIds.filter((id) => id !== messageId) }
        : c
    );
  }

  async toggleReaction(conversationId: string, messageId: string, userId: string, emoji: string): Promise<void> {
    const list = this.state.messagesByConversation[conversationId] ?? [];
    this.state.messagesByConversation[conversationId] = list.map((m) => {
      if (m.id !== messageId) return m;
      const existing = m.reactions.find((r) => r.emoji === emoji);
      let nextReactions = m.reactions;
      if (existing) {
        const hasUser = existing.userIds.includes(userId);
        const nextUsers = hasUser
          ? existing.userIds.filter((id) => id !== userId)
          : [...existing.userIds, userId];
        nextReactions = nextUsers.length
          ? m.reactions.map((r) => (r.emoji === emoji ? { ...r, userIds: nextUsers } : r))
          : m.reactions.filter((r) => r.emoji !== emoji);
      } else {
        nextReactions = [...m.reactions, { emoji, userIds: [userId] }];
      }
      return { ...m, reactions: nextReactions };
    });
  }

  async togglePinMessage(conversationId: string, messageId: string): Promise<void> {
    const conv = this.state.conversations.find((c) => c.id === conversationId);
    if (!conv) return;
    const isPinned = conv.pinnedMessageIds.includes(messageId);
    const nextPinnedIds = isPinned
      ? conv.pinnedMessageIds.filter((id) => id !== messageId)
      : [messageId, ...conv.pinnedMessageIds];

    this.state.conversations = this.state.conversations.map((c) =>
      c.id === conversationId ? { ...c, pinnedMessageIds: nextPinnedIds } : c
    );
    this.state.messagesByConversation[conversationId] = (this.state.messagesByConversation[conversationId] ?? []).map(
      (m) => (m.id === messageId ? { ...m, isPinned: !isPinned } : m)
    );
  }

  async togglePinConversation(conversationId: string): Promise<void> {
    this.state.conversations = this.state.conversations.map((c) =>
      c.id === conversationId ? { ...c, isPinned: !c.isPinned } : c
    );
  }

  async toggleMuteConversation(conversationId: string): Promise<void> {
    this.state.conversations = this.state.conversations.map((c) =>
      c.id === conversationId ? { ...c, isMuted: !c.isMuted } : c
    );
  }

  async markConversationRead(conversationId: string): Promise<void> {
    this.state.conversations = this.state.conversations.map((c) =>
      c.id === conversationId ? { ...c, unreadCount: 0 } : c
    );
  }

  async saveDraft(conversationId: string, draftText: string): Promise<void> {
    this.state.conversations = this.state.conversations.map((c) =>
      c.id === conversationId ? { ...c, draftText } : c
    );
  }

  async clearConversationHistory(conversationId: string): Promise<void> {
    this.state.messagesByConversation[conversationId] = [];
    this.state.conversations = this.state.conversations.map((c) =>
      c.id === conversationId ? { ...c, pinnedMessageIds: [], unreadCount: 0 } : c
    );
  }

  async getOrCreateDirectConversation(userId: string): Promise<Conversation> {
    const existing = this.state.conversations.find(
      (c) => c.type === "direct" && c.participantIds.includes(userId)
    );
    if (existing) return structuredClone(existing);

    const target = this.state.users[userId];
    if (!target) throw new Error("Contact not found");

    const conv: Conversation = {
      id: `conv-dm-${userId}`,
      type: "direct",
      title: target.fullName,
      username: target.username,
      participantIds: [this.state.currentUserId, userId],
      pinnedMessageIds: [],
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      typingUserIds: [],
      updatedAt: new Date().toISOString(),
      avatarInitials: target.avatarInitials,
      avatarColor: target.avatarColor,
    };

    this.state.conversations = [conv, ...this.state.conversations];
    this.state.messagesByConversation[conv.id] = [];
    return structuredClone(conv);
  }

  async createGroup(input: CreateGroupInput): Promise<Conversation> {
    const slug = input.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 24);
    const uniqueMembers = Array.from(new Set([input.creatorId, ...input.memberIds]));
    const now = new Date().toISOString();
    const words = input.title.trim().split(/\s+/);
    const initials = words.length >= 2
      ? `${words[0][0]}${words[1][0]}`.toUpperCase()
      : input.title.slice(0, 2).toUpperCase();

    const conv: Conversation = {
      id: `conv-grp-${Date.now()}`,
      type: "group",
      title: input.title.trim(),
      description: input.description.trim() || "ASTU Muslim Jemea community group",
      inviteLink: `https://astujemea.app/join/${slug || "group"}-${Math.random().toString(36).slice(2, 6)}`,
      participantIds: uniqueMembers,
      members: uniqueMembers.map((uid) => ({
        userId: uid,
        role: uid === input.creatorId ? "owner" : "member",
        joinedAt: now,
        permissions: {
          canSendMessages: true,
          canPinMessages: uid === input.creatorId,
          canInviteMembers: uid === input.creatorId,
        },
      })),
      pinnedMessageIds: [],
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      typingUserIds: [],
      updatedAt: now,
      avatarInitials: initials || "GR",
      avatarColor: "from-teal-600 to-emerald-700",
      isPublic: Boolean(input.isPublic),
    };

    const welcomeMsg: ChatMessage = {
      id: `msg-welcome-${Date.now()}`,
      conversationId: conv.id,
      senderId: input.creatorId,
      text: `Assalamu Alaikum! Created group "${conv.title}".`,
      createdAt: now,
      reactions: [],
      deliveryStatus: "read",
    };

    this.state.conversations = [conv, ...this.state.conversations];
    this.state.messagesByConversation[conv.id] = [welcomeMsg];
    return structuredClone(conv);
  }

  async updateGroupDetails(
    conversationId: string,
    updates: { title?: string; description?: string; regenerateInvite?: boolean }
  ): Promise<Conversation | null> {
    let updatedConv: Conversation | null = null;
    this.state.conversations = this.state.conversations.map((c) => {
      if (c.id !== conversationId || c.type !== "group") return c;
      updatedConv = {
        ...c,
        title: updates.title !== undefined ? updates.title.trim() : c.title,
        description: updates.description !== undefined ? updates.description.trim() : c.description,
        inviteLink: updates.regenerateInvite
          ? `https://astujemea.app/join/${Math.random().toString(36).slice(2, 10)}`
          : c.inviteLink,
      };
      return updatedConv;
    });
    return updatedConv ? structuredClone(updatedConv) : null;
  }

  async addGroupMember(conversationId: string, userId: string): Promise<void> {
    this.state.conversations = this.state.conversations.map((c) => {
      if (c.id !== conversationId || c.type !== "group") return c;
      if (c.participantIds.includes(userId)) return c;
      const newMember = {
        userId,
        role: "member" as GroupRole,
        joinedAt: new Date().toISOString(),
        permissions: { canSendMessages: true, canPinMessages: false, canInviteMembers: false },
      };
      return {
        ...c,
        participantIds: [...c.participantIds, userId],
        members: [...(c.members ?? []), newMember],
      };
    });
  }

  async removeGroupMember(conversationId: string, userId: string): Promise<void> {
    this.state.conversations = this.state.conversations.map((c) => {
      if (c.id !== conversationId || c.type !== "group") return c;
      return {
        ...c,
        participantIds: c.participantIds.filter((id) => id !== userId),
        members: (c.members ?? []).filter((m) => m.userId !== userId),
      };
    });
  }

  async updateGroupMemberRole(conversationId: string, userId: string, role: GroupRole): Promise<void> {
    this.state.conversations = this.state.conversations.map((c) => {
      if (c.id !== conversationId || c.type !== "group") return c;
      return {
        ...c,
        members: (c.members ?? []).map((m) =>
          m.userId === userId
            ? {
                ...m,
                role,
                permissions:
                  role === "admin" || role === "owner"
                    ? { canSendMessages: true, canPinMessages: true, canInviteMembers: true }
                    : m.permissions,
              }
            : m
        ),
      };
    });
  }

  async updateGroupMemberPermissions(
    conversationId: string,
    userId: string,
    permissions: Partial<GroupMemberPermissions>
  ): Promise<void> {
    this.state.conversations = this.state.conversations.map((c) => {
      if (c.id !== conversationId || c.type !== "group") return c;
      return {
        ...c,
        members: (c.members ?? []).map((m) =>
          m.userId === userId ? { ...m, permissions: { ...m.permissions, ...permissions } } : m
        ),
      };
    });
  }

  async toggleBlockUser(userId: string): Promise<void> {
    const user = this.state.users[userId];
    if (!user) return;
    this.state.users[userId] = { ...user, isBlocked: !user.isBlocked };
  }

  async updateNotificationPreferences(
    prefs: Partial<CommunityNotificationPreferences>
  ): Promise<CommunityNotificationPreferences> {
    this.state.notificationPreferences = { ...this.state.notificationPreferences, ...prefs };
    return structuredClone(this.state.notificationPreferences);
  }

  async updatePrivacySettings(
    settings: Partial<CommunityPrivacySettings>
  ): Promise<CommunityPrivacySettings> {
    this.state.privacySettings = { ...this.state.privacySettings, ...settings };
    return structuredClone(this.state.privacySettings);
  }
}

export const communityRepository: ICommunityRepository = new MockCommunityRepository();

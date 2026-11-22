import { assertCommitteeAccess, canAccessMeetingRecord, canManageCommitteeMeeting } from "./committeeAccess";
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
  ICommunityRepository,
  MeetingType,
  PollData,
  ScheduleMeetingInput,
  SendMessageInput,
} from "./types";
import eventTafsir from "@/assets/event-tafsir.jpg";
import eventCoding from "@/assets/event-coding.jpg";
import eventFiqh from "@/assets/event-fiqh.jpg";
import mosqueHero from "@/assets/mosque-hero.jpg";

const minsAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();
const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

const CURRENT_USER_ID = "user-me";

function createInitialMeetings(): CommitteeMeeting[] {
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  const nextWeek = new Date(Date.now() + 4 * 86_400_000).toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  return [
    {
      id: "mtg-ashura-01",
      title: "Ashura Executive Shura & Ramadan Prep",
      description:
        "Review campus Iftar logistics, Khadim shift allocations, and weekly Tafsir hall reservations.",
      meetingType: "video",
      status: "scheduled",
      scheduledDate: tomorrow,
      scheduledTime: "20:00",
      hostId: "user-yusuf",
      invitedUserIds: [CURRENT_USER_ID, "user-yusuf", "user-fatima", "user-ibrahim", "user-hassan"],
      participants: [],
      notificationsSentAt: hoursAgo(2),
      allowedRoles: ["committee", "amir", "admin"],
    },
    {
      id: "mtg-ashura-02",
      title: "Academic & Mentorship Sector Sync",
      description:
        "Coordinate midterm peer tutoring schedules across CSE, ECE, and Applied Sciences.",
      meetingType: "voice",
      status: "scheduled",
      scheduledDate: nextWeek,
      scheduledTime: "19:30",
      hostId: CURRENT_USER_ID,
      invitedUserIds: [CURRENT_USER_ID, "user-yusuf", "user-fatima", "user-aisha"],
      participants: [],
      notificationsSentAt: hoursAgo(5),
      allowedRoles: ["committee", "amir", "admin"],
    },
    {
      id: "mtg-ashura-past",
      title: "Jumu'ah Operations & Sound Debrief",
      description:
        "Post-Jumu'ah feedback on courtyard overflow mats, audio clarity, and sister's entrance signage.",
      meetingType: "voice",
      status: "ended",
      scheduledDate: yesterday,
      scheduledTime: "17:00",
      hostId: "user-yusuf",
      invitedUserIds: [CURRENT_USER_ID, "user-yusuf", "user-ibrahim", "user-hassan"],
      participants: [
        { userId: "user-yusuf", isMuted: false, isVideoOn: false, isHost: true, joinedAt: daysAgo(1) },
        { userId: CURRENT_USER_ID, isMuted: false, isVideoOn: false, isHost: false, joinedAt: daysAgo(1) },
        { userId: "user-hassan", isMuted: true, isVideoOn: false, isHost: false, joinedAt: daysAgo(1) },
      ],
      startedAt: daysAgo(1),
      endedAt: hoursAgo(23),
      allowedRoles: ["committee", "amir", "admin"],
    },
  ];
}

function createInitialSnapshot(): CommunitySnapshot {
  const users: Record<string, CommunityUser> = {
    [CURRENT_USER_ID]: {
      id: CURRENT_USER_ID,
      fullName: "Chera Kemal",
      username: "@chera_k",
      bio: "Software Engineering · Ashura Committee Member",
      department: "Software Engineering",
      batchYear: "4th Year",
      avatarInitials: "CK",
      avatarColor: "from-emerald-600 to-teal-700",
      status: "online",
      lastSeenAt: minsAgo(0),
      communityRole: "Committee Member",
      portalRoles: ["student", "committee"],
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
      communityRole: "Amir",
      portalRoles: ["student", "amir", "committee"],
    },
    "user-fatima": {
      id: "user-fatima",
      fullName: "Fatima Ahmed",
      username: "@fatima_a",
      bio: "Sisters Study Coordinator · Ashura Committee · Architecture & Urban Planning",
      department: "Architecture",
      batchYear: "3rd Year",
      avatarInitials: "FA",
      avatarColor: "from-violet-600 to-purple-700",
      status: "online",
      lastSeenAt: minsAgo(0),
      communityRole: "Committee Coordinator",
      portalRoles: ["student", "committee"],
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
      portalRoles: ["student", "committee"],
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
      portalRoles: ["student", "committee"],
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
      communityRole: "Media Lead",
      portalRoles: ["student", "committee"],
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
      communityRole: "Member",
      portalRoles: ["student"],
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
      communityRole: "Member",
      portalRoles: ["student"],
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
        text: "Assalamu Alaikum everyone! Welcome to the ASTU Muslim Jemea General Group. Keep discussions respectful, helpful, and focused on campus spiritual & academic growth.",
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
        text: "Which evening works best for the campus Seerah Q&A session?",
        createdAt: minsAgo(8),
        poll: {
          id: "poll-604",
          question: "Preferred day for weekly Seerah Q&A?",
          multipleChoice: false,
          anonymous: false,
          options: [
            { id: "opt-1", text: "Thursday after Maghrib", voterIds: ["user-yusuf", "user-fatima", "user-omar"] },
            { id: "opt-2", text: "Friday after Asr", voterIds: ["user-ibrahim", "user-bilal"] },
            { id: "opt-3", text: "Saturday morning", voterIds: ["user-aisha"] },
          ],
        },
        reactions: [],
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
    // CHANNELS
    "conv-ch-official": [
      {
        id: "msg-ch-101",
        conversationId: "conv-ch-official",
        senderId: "user-yusuf",
        text: "Bismillah. Official Jumu'ah Khutbah this Friday at ASTU Main Mosque begins at 12:35 PM. Topic: Sincerity & Stewardship in University Life.",
        createdAt: daysAgo(1),
        attachments: [
          {
            id: "att-ch-101",
            type: "image",
            name: "mosque-jumuah-notice.jpg",
            url: mosqueHero,
          },
        ],
        viewsCount: 412,
        reactions: [
          { emoji: "🤲", userIds: [CURRENT_USER_ID, "user-ibrahim", "user-fatima"] },
          { emoji: "❤️", userIds: ["user-aisha", "user-omar", "user-bilal"] },
        ],
        deliveryStatus: "read",
        isPinned: true,
      },
      {
        id: "msg-ch-102",
        conversationId: "conv-ch-official",
        senderId: CURRENT_USER_ID,
        text: "Campus Prayer Timetable has been synchronized for this month. Check Prayer Times for exact Iqamah updates.",
        createdAt: minsAgo(32),
        viewsCount: 289,
        reactions: [{ emoji: "👍", userIds: ["user-yusuf", "user-omar"] }],
        deliveryStatus: "read",
      },
    ],
    "conv-ch-hadith": [
      {
        id: "msg-ch-201",
        conversationId: "conv-ch-hadith",
        senderId: "user-ibrahim",
        text: "Hadith of the Day: \"Whoever treads a path seeking knowledge, Allah will make easy for him the path to Paradise.\" (Sahih Muslim 2699)",
        createdAt: hoursAgo(5),
        viewsCount: 534,
        reactions: [{ emoji: "🤲", userIds: [CURRENT_USER_ID, "user-yusuf", "user-aisha"] }],
        deliveryStatus: "read",
        isPinned: true,
      },
      {
        id: "msg-ch-202",
        conversationId: "conv-ch-hadith",
        senderId: "user-ibrahim",
        text: "Short commentary on Fiqh of Seeking Knowledge — tonight after Isha.",
        createdAt: hoursAgo(1),
        attachments: [
          {
            id: "att-ch-202",
            type: "image",
            name: "fiqh-knowledge-banner.jpg",
            url: eventFiqh,
          },
        ],
        viewsCount: 318,
        reactions: [{ emoji: "❤️", userIds: ["user-fatima"] }],
        deliveryStatus: "read",
      },
    ],
    "conv-ch-academic": [
      {
        id: "msg-ch-301",
        conversationId: "conv-ch-academic",
        senderId: "user-yusuf",
        text: "New: Spring semester scholarship & internship prep resources added to the Academic portal.",
        createdAt: hoursAgo(9),
        viewsCount: 245,
        reactions: [{ emoji: "🎉", userIds: ["user-omar", "user-aisha"] }],
        deliveryStatus: "read",
      },
    ],
    "conv-ch-sisters": [
      {
        id: "msg-ch-401",
        conversationId: "conv-ch-sisters",
        senderId: "user-fatima",
        text: "Assalamu Alaikum sisters! Weekly Tajweed & Tarbiyah circle meets every Wednesday at 4:30 PM in Hall S-04.",
        createdAt: hoursAgo(11),
        viewsCount: 196,
        reactions: [{ emoji: "💚", userIds: ["user-aisha"] }],
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
      wallpaperId: "default",
      sharingDisabled: false,
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
      wallpaperId: "default",
      sharingDisabled: false,
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
      wallpaperId: "default",
      sharingDisabled: false,
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
      wallpaperId: "default",
      sharingDisabled: false,
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
      wallpaperId: "default",
      sharingDisabled: false,
    },
    {
      id: "conv-grp-general",
      type: "group",
      title: "ASTU Jemea General",
      description: "Official campus community chat for announcements, daily reminders, and brotherly/sisterly support.",
      inviteLink: "https://astujemea.app/join/general-2026",
      participantIds: [CURRENT_USER_ID, "user-yusuf", "user-fatima", "user-ibrahim", "user-hassan", "user-aisha", "user-omar", "user-bilal"],
      members: [
        { userId: "user-yusuf", role: "owner", joinedAt: daysAgo(90), permissions: { canSendMessages: true, canPinMessages: true, canInviteMembers: true, canCreatePolls: true } },
        { userId: "user-fatima", role: "admin", joinedAt: daysAgo(85), permissions: { canSendMessages: true, canPinMessages: true, canInviteMembers: true, canCreatePolls: true } },
        { userId: "user-ibrahim", role: "admin", joinedAt: daysAgo(80), permissions: { canSendMessages: true, canPinMessages: true, canInviteMembers: true, canCreatePolls: true } },
        { userId: CURRENT_USER_ID, role: "admin", joinedAt: daysAgo(70), permissions: { canSendMessages: true, canPinMessages: true, canInviteMembers: true, canCreatePolls: true } },
        { userId: "user-hassan", role: "member", joinedAt: daysAgo(60), permissions: { canSendMessages: true, canPinMessages: false, canInviteMembers: true, canCreatePolls: false } },
        { userId: "user-aisha", role: "member", joinedAt: daysAgo(50), permissions: { canSendMessages: true, canPinMessages: false, canInviteMembers: true, canCreatePolls: false } },
        { userId: "user-omar", role: "member", joinedAt: daysAgo(40), permissions: { canSendMessages: true, canPinMessages: false, canInviteMembers: false, canCreatePolls: false } },
        { userId: "user-bilal", role: "member", joinedAt: daysAgo(30), permissions: { canSendMessages: true, canPinMessages: false, canInviteMembers: false, canCreatePolls: false } },
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
      wallpaperId: "default",
    },
    {
      id: "conv-grp-academic",
      type: "group",
      title: "Academic Circle · CS & Eng",
      description: "Peer tutoring, exam past papers, coding workshops, and study group coordination across engineering schools.",
      inviteLink: "https://astujemea.app/join/academic-cs",
      participantIds: [CURRENT_USER_ID, "user-yusuf", "user-omar", "user-aisha", "user-fatima"],
      members: [
        { userId: "user-yusuf", role: "owner", joinedAt: daysAgo(65), permissions: { canSendMessages: true, canPinMessages: true, canInviteMembers: true, canCreatePolls: true } },
        { userId: CURRENT_USER_ID, role: "member", joinedAt: daysAgo(60), permissions: { canSendMessages: true, canPinMessages: false, canInviteMembers: true, canCreatePolls: false } },
        { userId: "user-omar", role: "admin", joinedAt: daysAgo(55), permissions: { canSendMessages: true, canPinMessages: true, canInviteMembers: true, canCreatePolls: true } },
        { userId: "user-aisha", role: "member", joinedAt: daysAgo(45), permissions: { canSendMessages: true, canPinMessages: false, canInviteMembers: true, canCreatePolls: false } },
        { userId: "user-fatima", role: "member", joinedAt: daysAgo(40), permissions: { canSendMessages: true, canPinMessages: false, canInviteMembers: false, canCreatePolls: false } },
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
      wallpaperId: "default",
    },
    {
      id: "conv-grp-qiraat",
      type: "group",
      title: "Qira'at & Tajweed Circle",
      description: "Daily Quran recitation practice, makharij correction, and weekly Juz memorization check-ins.",
      inviteLink: "https://astujemea.app/join/qiraat-circle",
      participantIds: [CURRENT_USER_ID, "user-ibrahim", "user-bilal", "user-omar"],
      members: [
        { userId: "user-ibrahim", role: "owner", joinedAt: daysAgo(75), permissions: { canSendMessages: true, canPinMessages: true, canInviteMembers: true, canCreatePolls: true } },
        { userId: CURRENT_USER_ID, role: "member", joinedAt: daysAgo(50), permissions: { canSendMessages: true, canPinMessages: false, canInviteMembers: true, canCreatePolls: false } },
        { userId: "user-bilal", role: "member", joinedAt: daysAgo(42), permissions: { canSendMessages: true, canPinMessages: false, canInviteMembers: false, canCreatePolls: false } },
        { userId: "user-omar", role: "member", joinedAt: daysAgo(35), permissions: { canSendMessages: true, canPinMessages: false, canInviteMembers: false, canCreatePolls: false } },
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
      wallpaperId: "default",
    },
    {
      id: "conv-grp-khadims",
      type: "group",
      title: "Mosque Khadim Team",
      description: "Shift swaps, Jumu'ah setup, sound system checks, and Ramadan Iftar serving coordination.",
      inviteLink: "https://astujemea.app/join/khadim-crew",
      participantIds: [CURRENT_USER_ID, "user-hassan", "user-bilal", "user-yusuf"],
      members: [
        { userId: "user-hassan", role: "owner", joinedAt: daysAgo(50), permissions: { canSendMessages: true, canPinMessages: true, canInviteMembers: true, canCreatePolls: true } },
        { userId: CURRENT_USER_ID, role: "admin", joinedAt: daysAgo(45), permissions: { canSendMessages: true, canPinMessages: true, canInviteMembers: true, canCreatePolls: true } },
        { userId: "user-bilal", role: "member", joinedAt: daysAgo(40), permissions: { canSendMessages: true, canPinMessages: false, canInviteMembers: true, canCreatePolls: false } },
        { userId: "user-yusuf", role: "member", joinedAt: daysAgo(38), permissions: { canSendMessages: true, canPinMessages: false, canInviteMembers: true, canCreatePolls: false } },
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
      wallpaperId: "default",
    },
    // CHANNELS
    {
      id: "conv-ch-official",
      type: "channel",
      title: "ASTU Muslim Jemea Official",
      username: "@astujemea_official",
      description: "Official campus announcements, Jumu'ah khutbah schedules, Ramadan broadcasts, and executive notices.",
      inviteLink: "https://astujemea.app/ch/astujemea_official",
      participantIds: [CURRENT_USER_ID, "user-yusuf", "user-fatima", "user-ibrahim", "user-aisha"],
      members: [
        { userId: "user-yusuf", role: "owner", joinedAt: daysAgo(120), permissions: { canSendMessages: true, canPinMessages: true, canInviteMembers: true, canCreatePolls: true } },
        { userId: CURRENT_USER_ID, role: "admin", joinedAt: daysAgo(100), permissions: { canSendMessages: true, canPinMessages: true, canInviteMembers: true, canCreatePolls: true } },
        { userId: "user-aisha", role: "admin", joinedAt: daysAgo(90), permissions: { canSendMessages: true, canPinMessages: true, canInviteMembers: true, canCreatePolls: true } },
        { userId: "user-fatima", role: "member", joinedAt: daysAgo(80), permissions: { canSendMessages: false, canPinMessages: false, canInviteMembers: false, canCreatePolls: false } },
      ],
      pinnedMessageIds: ["msg-ch-101"],
      unreadCount: 1,
      isPinned: true,
      isMuted: false,
      typingUserIds: [],
      updatedAt: minsAgo(32),
      avatarInitials: "AO",
      avatarColor: "from-emerald-600 to-green-800",
      isPublic: true,
      subscriberCount: 842,
      boostCount: 19,
      isSubscribed: true,
      channelSettings: { allowReactions: true, allowForwarding: true, silentPosts: false },
    },
    {
      id: "conv-ch-hadith",
      type: "channel",
      title: "Daily Hadith & Reminders",
      username: "@astu_hadith",
      description: "Authentic daily narrations with concise reflections curated by our Tarbiyah & Da'wah leads.",
      inviteLink: "https://astujemea.app/ch/astu_hadith",
      participantIds: [CURRENT_USER_ID, "user-ibrahim", "user-yusuf"],
      members: [
        { userId: "user-ibrahim", role: "owner", joinedAt: daysAgo(110), permissions: { canSendMessages: true, canPinMessages: true, canInviteMembers: true, canCreatePolls: true } },
        { userId: CURRENT_USER_ID, role: "member", joinedAt: daysAgo(70), permissions: { canSendMessages: false, canPinMessages: false, canInviteMembers: false, canCreatePolls: false } },
        { userId: "user-yusuf", role: "admin", joinedAt: daysAgo(95), permissions: { canSendMessages: true, canPinMessages: true, canInviteMembers: true, canCreatePolls: true } },
      ],
      pinnedMessageIds: ["msg-ch-201"],
      unreadCount: 2,
      isPinned: false,
      isMuted: false,
      typingUserIds: [],
      updatedAt: hoursAgo(1),
      avatarInitials: "DH",
      avatarColor: "from-teal-600 to-sky-700",
      isPublic: true,
      subscriberCount: 615,
      boostCount: 14,
      isSubscribed: true,
      channelSettings: { allowReactions: true, allowForwarding: true, silentPosts: false },
    },
    {
      id: "conv-ch-academic",
      type: "channel",
      title: "Academic & Scholarship Alerts",
      username: "@astu_scholarships",
      description: "Curated study guides, competitive fellowship deadlines, and campus tutoring broadcasts.",
      inviteLink: "https://astujemea.app/ch/astu_scholarships",
      participantIds: ["user-yusuf", "user-omar"],
      members: [
        { userId: "user-yusuf", role: "owner", joinedAt: daysAgo(60), permissions: { canSendMessages: true, canPinMessages: true, canInviteMembers: true, canCreatePolls: true } },
      ],
      pinnedMessageIds: [],
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      typingUserIds: [],
      updatedAt: hoursAgo(9),
      avatarInitials: "AS",
      avatarColor: "from-blue-600 to-cyan-700",
      isPublic: true,
      subscriberCount: 490,
      boostCount: 8,
      isSubscribed: false,
      channelSettings: { allowReactions: true, allowForwarding: true, silentPosts: false },
    },
    {
      id: "conv-ch-sisters",
      type: "channel",
      title: "Sisters Dawah & Tarbiyah",
      username: "@astu_sisters_dawah",
      description: "Sisters-led halaqa updates, lectures, and mentorship programs on campus.",
      inviteLink: "https://astujemea.app/ch/astu_sisters",
      participantIds: ["user-fatima", "user-aisha"],
      members: [
        { userId: "user-fatima", role: "owner", joinedAt: daysAgo(75), permissions: { canSendMessages: true, canPinMessages: true, canInviteMembers: true, canCreatePolls: true } },
        { userId: "user-aisha", role: "admin", joinedAt: daysAgo(70), permissions: { canSendMessages: true, canPinMessages: true, canInviteMembers: true, canCreatePolls: true } },
      ],
      pinnedMessageIds: [],
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      typingUserIds: [],
      updatedAt: hoursAgo(11),
      avatarInitials: "SD",
      avatarColor: "from-violet-600 to-fuchsia-700",
      isPublic: true,
      subscriberCount: 348,
      boostCount: 11,
      isSubscribed: false,
      channelSettings: { allowReactions: true, allowForwarding: false, silentPosts: false },
    },
  ];

  const notificationPreferences: CommunityNotificationPreferences = {
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

  const privacySettings: CommunityPrivacySettings = {
    lastSeenVisibility: "university",
    profilePhotoVisibility: "university",
    allowDirectMessagesFrom: "everyone",
    readReceiptsEnabled: true,
  };

  const mediaPreferences: CommunityMediaPreferences = {
    autoDownloadPhotos: true,
    autoDownloadFiles: false,
    autoPlayVoice: true,
    showWaveforms: true,
    compressMediaUploads: true,
  };

  const accessibilityPreferences: CommunityAccessibilityPreferences = {
    textSize: "default",
    compactMode: false,
    reducedMotion: false,
    highContrastBubbles: false,
  };

  return {
    currentUserId: CURRENT_USER_ID,
    users,
    conversations,
    messagesByConversation,
    notificationPreferences,
    privacySettings,
    mediaPreferences,
    accessibilityPreferences,
  };
}

class MockCommunityRepository implements ICommunityRepository {
  private state: CommunitySnapshot = createInitialSnapshot();
  private meetings: CommitteeMeeting[] = createInitialMeetings();

  async getSnapshot(): Promise<CommunitySnapshot> {
    return structuredClone(this.state);
  }

  async sendMessage(input: SendMessageInput): Promise<ChatMessage> {
    const conv = this.state.conversations.find((c) => c.id === input.conversationId);
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      conversationId: input.conversationId,
      senderId: input.senderId,
      text: input.text,
      createdAt: new Date().toISOString(),
      replyToId: input.replyToId,
      forwardedFrom: input.forwardedFrom,
      attachments: input.attachments,
      poll: input.poll,
      viewsCount: conv?.type === "channel" ? 1 : undefined,
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
          ? { ...m, text: "", attachments: undefined, poll: undefined, deletedForAll: true, reactions: [] }
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

  async votePoll(conversationId: string, messageId: string, optionId: string, userId: string): Promise<void> {
    const list = this.state.messagesByConversation[conversationId] ?? [];
    this.state.messagesByConversation[conversationId] = list.map((m) => {
      if (m.id !== messageId || !m.poll) return m;
      const poll: PollData = {
        ...m.poll,
        options: m.poll.options.map((opt) => {
          const hasVoted = opt.voterIds.includes(userId);
          if (opt.id === optionId) {
            return {
              ...opt,
              voterIds: hasVoted
                ? opt.voterIds.filter((id) => id !== userId)
                : [...opt.voterIds, userId],
            };
          }
          if (!m.poll?.multipleChoice && hasVoted) {
            return { ...opt, voterIds: opt.voterIds.filter((id) => id !== userId) };
          }
          return opt;
        }),
      };
      return { ...m, poll };
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

  async setConversationWallpaper(conversationId: string, wallpaperId: string): Promise<void> {
    this.state.conversations = this.state.conversations.map((c) =>
      c.id === conversationId ? { ...c, wallpaperId } : c
    );
  }

  async toggleDisableSharing(conversationId: string): Promise<void> {
    this.state.conversations = this.state.conversations.map((c) =>
      c.id === conversationId ? { ...c, sharingDisabled: !c.sharingDisabled } : c
    );
  }

  async exportConversationHistory(conversationId: string): Promise<{ filename: string; content: string }> {
    const conv = this.state.conversations.find((c) => c.id === conversationId);
    const messages = this.state.messagesByConversation[conversationId] ?? [];
    const lines = [
      `Chat History Export: ${conv?.title ?? "Conversation"}`,
      `Exported: ${new Date().toISOString()}`,
      `Total messages: ${messages.length}`,
      "----------------------------------------",
      ...messages.map((m) => {
        const sender = this.state.users[m.senderId]?.fullName ?? "Member";
        const body = m.deletedForAll
          ? "[deleted]"
          : m.poll
            ? `[Poll] ${m.poll.question}`
            : m.text || (m.attachments?.map((a) => `[${a.type}: ${a.name}]`).join(" ") ?? "");
        return `[${new Date(m.createdAt).toLocaleString()}] ${sender}: ${body}`;
      }),
    ];
    const safeName = (conv?.title || "chat").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return {
      filename: `${safeName}-history.txt`,
      content: lines.join("\n"),
    };
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

  async deleteConversation(conversationId: string): Promise<void> {
    this.state.conversations = this.state.conversations.filter((c) => c.id !== conversationId);
    delete this.state.messagesByConversation[conversationId];
  }

  async leaveConversation(conversationId: string): Promise<void> {
    const conv = this.state.conversations.find((c) => c.id === conversationId);
    if (!conv) return;
    if (conv.type === "channel") {
      this.state.conversations = this.state.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              isSubscribed: false,
              subscriberCount: Math.max(0, (c.subscriberCount ?? 1) - 1),
              participantIds: c.participantIds.filter((id) => id !== this.state.currentUserId),
              members: (c.members ?? []).filter((m) => m.userId !== this.state.currentUserId),
            }
          : c
      );
      return;
    }
    this.state.conversations = this.state.conversations.filter((c) => c.id !== conversationId);
  }

  async reportConversation(_conversationId: string, _reason: string): Promise<void> {
    // Recorded for moderation queue when backend is attached.
    return;
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
      wallpaperId: "default",
      sharingDisabled: false,
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
          canCreatePolls: uid === input.creatorId,
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
      wallpaperId: "default",
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

  async createChannel(input: CreateChannelInput): Promise<Conversation> {
    const slug = (input.username || input.title)
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, "_")
      .replace(/(^_|_$)/g, "")
      .slice(0, 24);
    const now = new Date().toISOString();
    const words = input.title.trim().split(/\s+/);
    const initials = words.length >= 2
      ? `${words[0][0]}${words[1][0]}`.toUpperCase()
      : input.title.slice(0, 2).toUpperCase();

    const conv: Conversation = {
      id: `conv-ch-${Date.now()}`,
      type: "channel",
      title: input.title.trim(),
      username: `@${slug || "astu_channel"}`,
      description: input.description.trim() || "ASTU Muslim Jemea broadcast channel",
      inviteLink: `https://astujemea.app/ch/${slug || "channel"}`,
      participantIds: [input.creatorId],
      members: [
        {
          userId: input.creatorId,
          role: "owner",
          joinedAt: now,
          permissions: {
            canSendMessages: true,
            canPinMessages: true,
            canInviteMembers: true,
            canCreatePolls: true,
          },
        },
      ],
      pinnedMessageIds: [],
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      typingUserIds: [],
      updatedAt: now,
      avatarInitials: initials || "CH",
      avatarColor: "from-emerald-600 to-teal-800",
      isPublic: input.isPublic ?? true,
      subscriberCount: 1,
      boostCount: 0,
      isSubscribed: true,
      channelSettings: { allowReactions: true, allowForwarding: true, silentPosts: false },
    };

    this.state.conversations = [conv, ...this.state.conversations];
    this.state.messagesByConversation[conv.id] = [
      {
        id: `msg-ch-init-${Date.now()}`,
        conversationId: conv.id,
        senderId: input.creatorId,
        text: `Channel "${conv.title}" created. Broadcast updates to subscribers here.`,
        createdAt: now,
        viewsCount: 1,
        reactions: [],
        deliveryStatus: "read",
      },
    ];
    return structuredClone(conv);
  }

  async subscribeChannel(conversationId: string): Promise<void> {
    this.state.conversations = this.state.conversations.map((c) => {
      if (c.id !== conversationId || c.type !== "channel") return c;
      if (c.isSubscribed) return c;
      const now = new Date().toISOString();
      const hasMember = (c.members ?? []).some((m) => m.userId === this.state.currentUserId);
      return {
        ...c,
        isSubscribed: true,
        subscriberCount: (c.subscriberCount ?? 0) + 1,
        participantIds: Array.from(new Set([...c.participantIds, this.state.currentUserId])),
        members: hasMember
          ? c.members
          : [
              ...(c.members ?? []),
              {
                userId: this.state.currentUserId,
                role: "member" as GroupRole,
                joinedAt: now,
                permissions: {
                  canSendMessages: false,
                  canPinMessages: false,
                  canInviteMembers: false,
                  canCreatePolls: false,
                },
              },
            ],
      };
    });
  }

  async boostChannel(conversationId: string): Promise<void> {
    this.state.conversations = this.state.conversations.map((c) =>
      c.id === conversationId && c.type === "channel"
        ? { ...c, boostCount: (c.boostCount ?? 0) + 1 }
        : c
    );
  }

  async updateChannelSettings(conversationId: string, settings: Partial<ChannelSettings>): Promise<void> {
    this.state.conversations = this.state.conversations.map((c) => {
      if (c.id !== conversationId || c.type !== "channel") return c;
      const nextSettings: ChannelSettings = {
        allowReactions: c.channelSettings?.allowReactions ?? true,
        allowForwarding: c.channelSettings?.allowForwarding ?? true,
        silentPosts: c.channelSettings?.silentPosts ?? false,
        ...settings,
      };
      return {
        ...c,
        channelSettings: nextSettings,
        sharingDisabled: !nextSettings.allowForwarding,
      };
    });
  }

  async updateGroupDetails(
    conversationId: string,
    updates: { title?: string; description?: string; regenerateInvite?: boolean }
  ): Promise<Conversation | null> {
    let updatedConv: Conversation | null = null;
    this.state.conversations = this.state.conversations.map((c) => {
      if (c.id !== conversationId || (c.type !== "group" && c.type !== "channel")) return c;
      const prefix = c.type === "channel" ? "ch" : "join";
      updatedConv = {
        ...c,
        title: updates.title !== undefined ? updates.title.trim() : c.title,
        description: updates.description !== undefined ? updates.description.trim() : c.description,
        inviteLink: updates.regenerateInvite
          ? `https://astujemea.app/${prefix}/${Math.random().toString(36).slice(2, 10)}`
          : c.inviteLink,
      };
      return updatedConv;
    });
    return updatedConv ? structuredClone(updatedConv) : null;
  }

  async addGroupMember(conversationId: string, userId: string): Promise<void> {
    this.state.conversations = this.state.conversations.map((c) => {
      if (c.id !== conversationId || (c.type !== "group" && c.type !== "channel")) return c;
      if (c.participantIds.includes(userId)) return c;
      const isChannel = c.type === "channel";
      const newMember = {
        userId,
        role: (isChannel ? "admin" : "member") as GroupRole,
        joinedAt: new Date().toISOString(),
        permissions: {
          canSendMessages: true,
          canPinMessages: isChannel,
          canInviteMembers: isChannel,
          canCreatePolls: isChannel,
        },
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
      if (c.id !== conversationId || (c.type !== "group" && c.type !== "channel")) return c;
      return {
        ...c,
        participantIds: c.participantIds.filter((id) => id !== userId),
        members: (c.members ?? []).filter((m) => m.userId !== userId),
      };
    });
  }

  async updateGroupMemberRole(conversationId: string, userId: string, role: GroupRole): Promise<void> {
    this.state.conversations = this.state.conversations.map((c) => {
      if (c.id !== conversationId || (c.type !== "group" && c.type !== "channel")) return c;
      return {
        ...c,
        members: (c.members ?? []).map((m) =>
          m.userId === userId
            ? {
                ...m,
                role,
                permissions:
                  role === "admin" || role === "owner"
                    ? { canSendMessages: true, canPinMessages: true, canInviteMembers: true, canCreatePolls: true }
                    : c.type === "channel"
                      ? { canSendMessages: false, canPinMessages: false, canInviteMembers: false, canCreatePolls: false }
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
      if (c.id !== conversationId || (c.type !== "group" && c.type !== "channel")) return c;
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

  async updateMediaPreferences(
    prefs: Partial<CommunityMediaPreferences>
  ): Promise<CommunityMediaPreferences> {
    this.state.mediaPreferences = { ...this.state.mediaPreferences, ...prefs };
    return structuredClone(this.state.mediaPreferences);
  }

  async updateAccessibilityPreferences(
    prefs: Partial<CommunityAccessibilityPreferences>
  ): Promise<CommunityAccessibilityPreferences> {
    this.state.accessibilityPreferences = { ...this.state.accessibilityPreferences, ...prefs };
    return structuredClone(this.state.accessibilityPreferences);
  }

  async updateOwnCommunityProfile(input: CommunityProfileUpdateInput): Promise<CommunityUser | null> {
    const me = this.state.users[this.state.currentUserId];
    if (!me) return null;
    const cleanName = input.fullName.trim() || me.fullName;
    const rawHandle = input.username.trim().replace(/^@+/, "");
    const cleanHandle = rawHandle ? `@${rawHandle.toLowerCase()}` : me.username;
    const words = cleanName.split(/\s+/).filter(Boolean);
    const initials =
      words.length >= 2
        ? `${words[0][0]}${words[1][0]}`.toUpperCase()
        : cleanName.slice(0, 2).toUpperCase();

    const updated: CommunityUser = {
      ...me,
      fullName: cleanName,
      username: cleanHandle,
      bio: input.bio.trim(),
      department: input.department.trim() || me.department,
      batchYear: input.batchYear.trim() || me.batchYear,
      avatarInitials: initials || me.avatarInitials,
    };
    this.state.users[this.state.currentUserId] = updated;
    return structuredClone(updated);
  }

  async clearLocalCache(): Promise<void> {
    this.state.conversations = this.state.conversations.map((c) => ({ ...c, draftText: "" }));
  }

  async exportAllCommunityData(): Promise<{ filename: string; content: string }> {
    const payload = {
      exportedAt: new Date().toISOString(),
      currentUser: this.state.users[this.state.currentUserId],
      settings: {
        notifications: this.state.notificationPreferences,
        privacy: this.state.privacySettings,
        media: this.state.mediaPreferences,
        accessibility: this.state.accessibilityPreferences,
      },
      conversations: this.state.conversations,
      messagesByConversation: this.state.messagesByConversation,
    };
    return {
      filename: `astu-jemea-community-export-${new Date().toISOString().slice(0, 10)}.json`,
      content: JSON.stringify(payload, null, 2),
    };
  }

  // COMMITTEE-ONLY MEETINGS (RBAC ENFORCED)
  async getMeetings(actorRoles: readonly string[]): Promise<CommitteeMeeting[]> {
    assertCommitteeAccess(actorRoles, "view committee meetings");
    return structuredClone(
      this.meetings.filter((m) => canAccessMeetingRecord(actorRoles, this.state.currentUserId, m))
    );
  }

  async scheduleMeeting(
    actorRoles: readonly string[],
    hostId: string,
    input: ScheduleMeetingInput
  ): Promise<CommitteeMeeting> {
    assertCommitteeAccess(actorRoles, "schedule a committee meeting");
    const authorizedInvites = input.invitedUserIds.filter((uid) => {
      const u = this.state.users[uid];
      return u && (u.portalRoles?.some((r) => ["committee", "amir", "admin"].includes(r)) ?? false);
    });
    const meeting: CommitteeMeeting = {
      id: `mtg-${Date.now()}`,
      title: input.title.trim(),
      description: input.description.trim(),
      meetingType: input.meetingType,
      status: "scheduled",
      scheduledDate: input.scheduledDate,
      scheduledTime: input.scheduledTime,
      hostId,
      invitedUserIds: Array.from(new Set([hostId, ...authorizedInvites])),
      participants: [],
      notificationsSentAt: new Date().toISOString(),
      allowedRoles: ["committee", "amir", "admin"],
    };
    this.meetings = [meeting, ...this.meetings];
    return structuredClone(meeting);
  }

  async startInstantMeeting(
    actorRoles: readonly string[],
    hostId: string,
    title: string,
    meetingType: MeetingType,
    invitedUserIds: string[]
  ): Promise<CommitteeMeeting> {
    assertCommitteeAccess(actorRoles, "start an instant committee meeting");
    const now = new Date();
    const authorizedInvites = invitedUserIds.filter((uid) => {
      const u = this.state.users[uid];
      return u && (u.portalRoles?.some((r) => ["committee", "amir", "admin"].includes(r)) ?? false);
    });
    const meeting: CommitteeMeeting = {
      id: `mtg-live-${Date.now()}`,
      title: title.trim() || "Instant Committee Conference",
      description: "Immediate Ashura Committee coordination call.",
      meetingType,
      status: "live",
      scheduledDate: now.toISOString().slice(0, 10),
      scheduledTime: now.toTimeString().slice(0, 5),
      hostId,
      invitedUserIds: Array.from(new Set([hostId, ...authorizedInvites])),
      participants: [
        {
          userId: hostId,
          isMuted: false,
          isVideoOn: meetingType === "video",
          isHost: true,
          joinedAt: now.toISOString(),
        },
      ],
      startedAt: now.toISOString(),
      notificationsSentAt: now.toISOString(),
      allowedRoles: ["committee", "amir", "admin"],
    };
    this.meetings = [meeting, ...this.meetings];
    return structuredClone(meeting);
  }

  async joinMeeting(
    actorRoles: readonly string[],
    meetingId: string,
    userId: string
  ): Promise<CommitteeMeeting> {
    assertCommitteeAccess(actorRoles, "join a committee meeting");
    const target = this.meetings.find((m) => m.id === meetingId);
    if (!target) throw new Error("Meeting not found");
    if (!canAccessMeetingRecord(actorRoles, userId, target)) {
      assertCommitteeAccess([], "join an uninvited meeting");
    }
    const now = new Date().toISOString();
    let joined: CommitteeMeeting = target;
    this.meetings = this.meetings.map((m) => {
      if (m.id !== meetingId) return m;
      const alreadyIn = m.participants.some((p) => p.userId === userId);
      const nextParticipants = alreadyIn
        ? m.participants
        : [
            ...m.participants,
            {
              userId,
              isMuted: false,
              isVideoOn: m.meetingType === "video",
              isHost: m.hostId === userId,
              joinedAt: now,
            },
          ];
      joined = {
        ...m,
        status: "live",
        startedAt: m.startedAt ?? now,
        participants: nextParticipants,
      };
      return joined;
    });
    return structuredClone(joined);
  }

  async leaveMeeting(actorRoles: readonly string[], meetingId: string, userId: string): Promise<void> {
    assertCommitteeAccess(actorRoles, "leave a committee meeting");
    this.meetings = this.meetings.map((m) =>
      m.id === meetingId
        ? { ...m, participants: m.participants.filter((p) => p.userId !== userId) }
        : m
    );
  }

  async endMeeting(actorRoles: readonly string[], meetingId: string, actorUserId: string): Promise<void> {
    assertCommitteeAccess(actorRoles, "end a committee meeting");
    const target = this.meetings.find((m) => m.id === meetingId);
    if (!target) return;
    if (!canManageCommitteeMeeting(actorRoles, actorUserId, target)) {
      assertCommitteeAccess([], "end another host's meeting");
    }
    this.meetings = this.meetings.map((m) =>
      m.id === meetingId
        ? { ...m, status: "ended", endedAt: new Date().toISOString(), participants: [] }
        : m
    );
  }

  async inviteToMeeting(actorRoles: readonly string[], meetingId: string, userId: string): Promise<void> {
    assertCommitteeAccess(actorRoles, "invite participants to a committee meeting");
    const invitee = this.state.users[userId];
    if (!invitee?.portalRoles?.some((r) => ["committee", "amir", "admin"].includes(r))) {
      throw new Error("Only authorized Ashura Committee or Amir members can be invited.");
    }
    this.meetings = this.meetings.map((m) =>
      m.id === meetingId
        ? {
            ...m,
            invitedUserIds: Array.from(new Set([...m.invitedUserIds, userId])),
            notificationsSentAt: new Date().toISOString(),
          }
        : m
    );
  }

  async toggleParticipantMute(actorRoles: readonly string[], meetingId: string, targetUserId: string): Promise<void> {
    assertCommitteeAccess(actorRoles, "manage meeting participant audio");
    this.meetings = this.meetings.map((m) =>
      m.id === meetingId
        ? {
            ...m,
            participants: m.participants.map((p) =>
              p.userId === targetUserId ? { ...p, isMuted: !p.isMuted } : p
            ),
          }
        : m
    );
  }

  async removeMeetingParticipant(actorRoles: readonly string[], meetingId: string, targetUserId: string): Promise<void> {
    assertCommitteeAccess(actorRoles, "remove a meeting participant");
    this.meetings = this.meetings.map((m) =>
      m.id === meetingId
        ? { ...m, participants: m.participants.filter((p) => p.userId !== targetUserId) }
        : m
    );
  }
}

export const communityRepository: ICommunityRepository = new MockCommunityRepository();

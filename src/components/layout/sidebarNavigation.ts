export type SidebarSectionKey =
  | "overview"
  | "worship"
  | "community"
  | "campus";

export type SidebarIconName =
  | "home"
  | "shield"
  | "globe"
  | "book-open"
  | "graduation-cap"
  | "trophy"
  | "moon"
  | "clock"
  | "message-circle"
  | "users"
  | "newspaper"
  | "shield-check"
  | "vote"
  | "hand-heart"
  | "gift"
  | "building";

export interface SidebarNavItem {
  title: string;
  url: string;
  icon: SidebarIconName;
  section: SidebarSectionKey;
  subtitle?: string;
  badge?: number;
  keywords?: string[];
}

export interface SidebarNavSection {
  key: SidebarSectionKey;
  label: string;
  items: SidebarNavItem[];
}

export interface PortalSidebarConfig {
  portalLabel: string;
  sections: SidebarNavSection[];
  studentSwitchItem: SidebarNavItem | null;
}

const SECTION_LABELS: Record<SidebarSectionKey, string> = {
  overview: "Overview",
  worship: "Worship & Study",
  community: "Community",
  campus: "Service & Trust",
};

const SECTION_ORDER: SidebarSectionKey[] = [
  "overview",
  "worship",
  "community",
  "campus",
];

const STUDENT_ITEMS: SidebarNavItem[] = [
  {
    title: "Home",
    url: "/dashboard",
    icon: "home",
    section: "overview",
    subtitle: "Daily hub & summary",
    keywords: ["dashboard", "overview", "home"],
  },
  {
    title: "Resources",
    url: "/resources",
    icon: "book-open",
    section: "worship",
    subtitle: "Quran, Hadith & Dua",
    keywords: ["quran", "hadith", "dua", "adhkar", "library"],
  },
  {
    title: "Academic",
    url: "/academic",
    icon: "graduation-cap",
    section: "worship",
    subtitle: "Tutorials & study notes",
    keywords: ["courses", "exams", "study", "tutoring"],
  },
  {
    title: "Challenges",
    url: "/challenges",
    icon: "trophy",
    section: "worship",
    subtitle: "Weekly streaks & goals",
    keywords: ["xp", "habits", "streak", "quests"],
  },
  {
    title: "Community",
    url: "/community",
    icon: "message-circle",
    section: "community",
    subtitle: "Chats, voice & video",
    badge: 14,
    keywords: ["chat", "calls", "channels", "messages"],
  },
  {
    title: "Groups",
    url: "/groups",
    icon: "users",
    section: "community",
    subtitle: "Halaqas & departments",
    keywords: ["halaqa", "circles", "department"],
  },
  {
    title: "News",
    url: "/news",
    icon: "newspaper",
    section: "community",
    subtitle: "Campus announcements",
    keywords: ["events", "updates", "notices"],
  },
  {
    title: "Verification",
    url: "/verification",
    icon: "shield-check",
    section: "campus",
    subtitle: "ASTU enrollment check",
    keywords: ["id", "student id", "verify"],
  },
  {
    title: "Governance",
    url: "/governance",
    icon: "vote",
    section: "campus",
    subtitle: "Shura & proposals",
    keywords: ["polls", "voting", "shura"],
  },
  {
    title: "Donations",
    url: "/donations",
    icon: "gift",
    section: "campus",
    subtitle: "Sadaqah & campus aid",
    keywords: ["charity", "sadaqah", "zakat", "aid"],
  },
  {
    title: "University",
    url: "/services",
    icon: "building",
    section: "campus",
    subtitle: "Mosques & ASTU info",
    keywords: ["services", "campus", "adama"],
  },
];

const AMIR_ITEMS: SidebarNavItem[] = [
  {
    title: "Dashboard",
    url: "/portal/amirs",
    icon: "home",
    section: "overview",
    subtitle: "Sector leadership",
    keywords: ["amir", "home", "overview"],
  },
  {
    title: "Resources",
    url: "/resources",
    icon: "book-open",
    section: "worship",
    subtitle: "Quran, Hadith & Dua",
  },
  {
    title: "Ramadan",
    url: "/ramadan",
    icon: "moon",
    section: "worship",
    subtitle: "Iftar & program schedule",
  },
  {
    title: "Community",
    url: "/community",
    icon: "message-circle",
    section: "community",
    subtitle: "Chats, voice & video",
  },
  {
    title: "Groups",
    url: "/groups",
    icon: "users",
    section: "community",
    subtitle: "Halaqas & departments",
  },
  {
    title: "News",
    url: "/news",
    icon: "newspaper",
    section: "community",
    subtitle: "Campus announcements",
  },
  {
    title: "Verification",
    url: "/verification",
    icon: "shield-check",
    section: "campus",
    subtitle: "Student ID review",
  },
  {
    title: "Khadims",
    url: "/khadims",
    icon: "hand-heart",
    section: "campus",
    subtitle: "Volunteer shifts",
  },
  {
    title: "Donations",
    url: "/donations",
    icon: "gift",
    section: "campus",
    subtitle: "Sadaqah & campus aid",
  },
  {
    title: "University",
    url: "/services",
    icon: "building",
    section: "campus",
    subtitle: "Mosques & ASTU info",
  },
];

const COMMITTEE_ITEMS: SidebarNavItem[] = [
  {
    title: "Dashboard",
    url: "/portal/committee",
    icon: "home",
    section: "overview",
    subtitle: "Ashura & council workspace",
  },
  {
    title: "Resources",
    url: "/resources",
    icon: "book-open",
    section: "worship",
    subtitle: "Quran, Hadith & Dua",
  },
  {
    title: "Community",
    url: "/community",
    icon: "message-circle",
    section: "community",
    subtitle: "Committee meetings & chat",
  },
  {
    title: "News",
    url: "/news",
    icon: "newspaper",
    section: "community",
    subtitle: "Campus announcements",
  },
  {
    title: "Verification",
    url: "/verification",
    icon: "shield-check",
    section: "campus",
    subtitle: "ASTU student checks",
  },
  {
    title: "Governance",
    url: "/governance",
    icon: "vote",
    section: "campus",
    subtitle: "Shura & proposals",
  },
  {
    title: "Donations",
    url: "/donations",
    icon: "gift",
    section: "campus",
    subtitle: "Sadaqah & campus aid",
  },
];

const GUEST_ITEMS: SidebarNavItem[] = [
  {
    title: "Explore",
    url: "/portal/guest",
    icon: "globe",
    section: "overview",
    subtitle: "Welcome overview",
  },
  {
    title: "Resources",
    url: "/resources",
    icon: "book-open",
    section: "worship",
    subtitle: "Quran, Hadith & Dua",
  },
  {
    title: "Prayer",
    url: "/prayer-times",
    icon: "clock",
    section: "worship",
    subtitle: "Daily Adama timings",
  },
  {
    title: "News",
    url: "/news",
    icon: "newspaper",
    section: "community",
    subtitle: "Campus announcements",
  },
  {
    title: "Donations",
    url: "/donations",
    icon: "gift",
    section: "campus",
    subtitle: "Support campus campaigns",
  },
];

const STUDENT_SWITCH_ITEM: SidebarNavItem = {
  title: "Student Portal",
  url: "/dashboard",
  icon: "graduation-cap",
  section: "overview",
  subtitle: "Switch to student view",
  keywords: ["student", "dashboard", "switch"],
};

export function groupSidebarItems(items: SidebarNavItem[]): SidebarNavSection[] {
  return SECTION_ORDER.map((key) => ({
    key,
    label: SECTION_LABELS[key],
    items: items.filter((item) => item.section === key),
  })).filter((section) => section.items.length > 0);
}

export function buildSidebarConfig(roles: string[]): PortalSidebarConfig {
  let items = STUDENT_ITEMS;
  let portalLabel = "Student Portal";

  if (roles.includes("admin")) {
    items = [
      {
        title: "Dashboard",
        url: "/admin",
        icon: "shield",
        section: "overview",
        subtitle: "Console & moderation",
        keywords: ["admin", "console", "home"],
      },
      ...STUDENT_ITEMS.filter((item) => item.title !== "Home"),
    ];
    portalLabel = "Admin Portal";
  } else if (roles.includes("committee")) {
    items = COMMITTEE_ITEMS;
    portalLabel = "Committee Portal";
  } else if (roles.includes("amir")) {
    items = AMIR_ITEMS;
    portalLabel = "Amirs' Portal";
  } else if (roles.includes("guest")) {
    items = GUEST_ITEMS;
    portalLabel = "Guest Portal";
  }

  const hasStaffRole = roles.some((role) =>
    ["admin", "amir", "committee"].includes(role)
  );

  return {
    portalLabel,
    sections: groupSidebarItems(items),
    studentSwitchItem: hasStaffRole ? STUDENT_SWITCH_ITEM : null,
  };
}

export function filterSidebarSections(
  sections: SidebarNavSection[],
  query: string
): SidebarNavSection[] {
  const q = query.trim().toLowerCase();
  if (!q) return sections;

  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        const haystack = [
          item.title,
          item.subtitle ?? "",
          ...(item.keywords ?? []),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      }),
    }))
    .filter((section) => section.items.length > 0);
}

export function isSidebarItemActive(pathname: string, itemUrl: string): boolean {
  const base = itemUrl.split("?")[0].split("#")[0];
  if (pathname === base) return true;
  if (
    ["/portal/student", "/portal/amirs", "/portal/committee", "/portal/guest"].includes(
      base
    )
  ) {
    return false;
  }
  return pathname.startsWith(`${base}/`) || pathname.startsWith(base);
}

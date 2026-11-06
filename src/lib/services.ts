import {
  Calendar, Package, Brain, DollarSign, Megaphone, BookOpen,
  Home, Shield, Newspaper, Briefcase, Bus, Stethoscope, BarChart3, Users,
  type LucideIcon,
} from "lucide-react";

export type ServiceField = { key: "subject" | "location"; label: string; placeholder: string };

export type ServiceLink = { to: string; label: string; hint: string };

export type ServiceDef = {
  slug: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  color: string;
  about: string;
  /** Existing app sections this service plugs into. */
  links: ServiceLink[];
  /** When set, students can submit real requests stored in the database. */
  requestKinds?: { value: string; label: string; placeholder: string }[];
  extraFields?: ServiceField[];
  anonymous?: boolean;
};

export const SERVICES: ServiceDef[] = [
  {
    slug: "schedule", icon: Calendar, title: "Academic Scheduling", desc: "Class timetables & exam reminders", color: "text-blue",
    about: "Your study week in one place: classes, study circles and exam reminders, synced with the Academic hub.",
    links: [
      { to: "/academic", label: "Open Academic hub", hint: "Classes, tutoring and study resources" },
      { to: "/challenges", label: "Study challenges", hint: "Gamified revision goals with XP" },
    ],
  },
  {
    slug: "lost-found", icon: Package, title: "Lost & Found", desc: "Campus-wide item recovery", color: "text-teal",
    about: "Report something you lost or something you found. The student desk matches reports and arranges verified pickups.",
    links: [],
    requestKinds: [
      { value: "lost", label: "I lost something", placeholder: "e.g. Black wallet lost near the main library on Tuesday" },
      { value: "found", label: "I found something", placeholder: "e.g. Found a calculator in lecture hall B, row 3" },
    ],
    extraFields: [{ key: "location", label: "Where (optional)", placeholder: "e.g. Main library, 2nd floor" }],
  },
  {
    slug: "wellbeing", icon: Brain, title: "Mental Well-Being", desc: "Peer mentoring & support", color: "text-accent",
    about: "Confidential, non-medical support from trained peer mentors. Choose anonymous if you prefer not to share your name.",
    links: [{ to: "/community", label: "Community chat", hint: "Talk with your brothers/sisters" }],
    requestKinds: [
      { value: "session", label: "Book a peer session", placeholder: "What would you like to talk about? (kept confidential)" },
      { value: "mentoring", label: "Ongoing mentoring", placeholder: "e.g. I'd like a weekly check-in during exams" },
    ],
    anonymous: true,
  },
  {
    slug: "aid", icon: DollarSign, title: "Financial Aid", desc: "Scholarships & tracking", color: "text-primary",
    about: "Apply for need-based support and follow the transparent status of your application.",
    links: [{ to: "/donations", label: "Donations & campaigns", hint: "Community fund-raising" }],
    requestKinds: [
      { value: "scholarship", label: "Scholarship application", placeholder: "Briefly describe your situation and need" },
      { value: "emergency", label: "Emergency support", placeholder: "What happened and what do you need?" },
    ],
  },
  {
    slug: "grievance", icon: Megaphone, title: "Grievance Reporting", desc: "Submit & track complaints", color: "text-accent",
    about: "File academic, administrative or facility complaints and receive status updates from the committee.",
    links: [],
    requestKinds: [
      { value: "academic", label: "Academic complaint", placeholder: "e.g. Grade dispute for MATH-201 midterm" },
      { value: "facility", label: "Facility complaint", placeholder: "e.g. Broken lights in dorm block C" },
      { value: "administrative", label: "Administrative complaint", placeholder: "Describe the issue and the office involved" },
    ],
    anonymous: true,
  },
  {
    slug: "library", icon: BookOpen, title: "Library Access", desc: "Digital academic materials", color: "text-primary",
    about: "E-books, past papers and reference material — plus the full Islamic library of Qur'an, Hadith, Duas and Adhkar.",
    links: [
      { to: "/resources", label: "Islamic library", hint: "Qur'an, Hadith, Duas, Adhkar" },
      { to: "/academic", label: "Academic hub", hint: "Department study material" },
    ],
  },
  {
    slug: "housing", icon: Home, title: "Housing & Café", desc: "Meal cards & dorm notices", color: "text-primary",
    about: "Meal-card eligibility, café menus and dormitory announcements. Café students manage meals during Ramadan via Khadims.",
    links: [
      { to: "/ramadan", label: "Ramadan & meal cards", hint: "Iftar/Suhoor meal cards" },
      { to: "/khadims", label: "Khadim shifts", hint: "Volunteer meal service" },
    ],
    requestKinds: [
      { value: "meal_card", label: "Meal card issue", placeholder: "e.g. My meal card was declined at lunch" },
      { value: "dorm", label: "Dormitory issue", placeholder: "e.g. Water outage in block A since Monday" },
    ],
  },
  {
    slug: "safety", icon: Shield, title: "Safety Reporting", desc: "Anonymous safety reports", color: "text-accent",
    about: "Report harassment or safety concerns — anonymously if you wish. Reports go straight to the campus safety officer.",
    links: [],
    requestKinds: [
      { value: "incident", label: "Report an incident", placeholder: "What happened, when, and where?" },
      { value: "concern", label: "Safety concern", placeholder: "e.g. Unlit path behind the workshop at night" },
    ],
    extraFields: [{ key: "location", label: "Where (optional)", placeholder: "e.g. Behind block C" }],
    anonymous: true,
  },
  {
    slug: "news", icon: Newspaper, title: "Campus News", desc: "Latest updates", color: "text-blue",
    about: "Centralised announcements from the administration, faculties and student bodies — including event coverage.",
    links: [{ to: "/news", label: "Open News & Events", hint: "Articles, announcements and events" }],
  },
  {
    slug: "career", icon: Briefcase, title: "Career Services", desc: "Internships & jobs", color: "text-teal",
    about: "Job board, CV reviews and partner internships. Request a CV review and the career desk will get back to you.",
    links: [],
    requestKinds: [
      { value: "cv_review", label: "CV review", placeholder: "Your target role and a link or summary of your CV" },
      { value: "internship", label: "Internship enquiry", placeholder: "Which field and semester are you aiming for?" },
    ],
  },
  {
    slug: "transport", icon: Bus, title: "Transportation", desc: "Bus & shuttle schedules", color: "text-blue",
    about: "Shuttle timetables and route questions. Report a route problem and the transport desk will follow up.",
    links: [],
    requestKinds: [
      { value: "route_issue", label: "Route problem", placeholder: "e.g. The 7 AM shuttle from campus gate left early" },
      { value: "question", label: "Timetable question", placeholder: "e.g. Is there a weekend shuttle to the market?" },
    ],
  },
  {
    slug: "health", icon: Stethoscope, title: "Health Services", desc: "Clinic & appointments", color: "text-accent",
    about: "Book a clinic visit and ask basic health questions. For emergencies always call the campus clinic directly.",
    links: [],
    requestKinds: [
      { value: "appointment", label: "Book a clinic visit", placeholder: "Preferred day/time and the reason (kept confidential)" },
      { value: "question", label: "Health question", placeholder: "Your question for the clinic staff" },
    ],
    anonymous: true,
  },
  {
    slug: "grades", icon: BarChart3, title: "Grade Tracking", desc: "Exam results", color: "text-accent",
    about: "Follow your courses and revision progress through the Academic hub while official results come from the registrar.",
    links: [{ to: "/academic", label: "Open Academic hub", hint: "Courses, tutoring and progress" }],
  },
  {
    slug: "union", icon: Users, title: "Student Union", desc: "Governance & representation", color: "text-teal",
    about: "Meet your representatives, follow open motions, and take part in the annual Jemea elections.",
    links: [{ to: "/governance", label: "Open Governance", hint: "Nominations, candidates and voting" }],
  },
];

export const getService = (slug: string | undefined) => SERVICES.find(s => s.slug === slug);

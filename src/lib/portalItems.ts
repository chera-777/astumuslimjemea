import eventTafsir from "@/assets/event-tafsir.svg";
import eventHadith from "@/assets/event-hadith.svg";
import eventFiqh from "@/assets/event-fiqh.svg";
import eventMath from "@/assets/event-math.svg";
import eventCoding from "@/assets/event-coding.svg";
import eventChallenge from "@/assets/event-challenge.svg";

export type EventItem = {
  title: string;
  subtitle: string;
  description: string;
  time: string;
  location: string;
  image: string;
  tag: string;
  tagColor: string;
  xp?: number;
  participants?: number;
  gradient: string;
};

export const classesItems: EventItem[] = [
  { title: "Tafsir Al-Kahf", subtitle: "Sheikh Ahmed", description: "Weekly tafsir circle covering the lessons & wisdom of Surah Al-Kahf with live Q&A after each session.", time: "Today · 6:30 PM", location: "Masjid Al-Noor", image: eventTafsir, tag: "Islamic", tagColor: "bg-primary/20 text-primary border-primary/30", xp: 20, participants: 34, gradient: "from-emerald-500/30 via-transparent to-transparent" },
  { title: "Hadith: 40 Nawawi", subtitle: "Ustaz Bilal", description: "Deep-dive into Imam Nawawi's 40 hadith — narration, meaning & daily application.", time: "Tomorrow · 7:00 PM", location: "University Musalla", image: eventHadith, tag: "Hadith", tagColor: "bg-green-500/20 text-green-500 border-green-500/30", xp: 25, participants: 21, gradient: "from-green-500/30 via-transparent to-transparent" },
  { title: "Fiqh of Salah", subtitle: "Ustaz Hamza", description: "Conditions, pillars and common mistakes of salah with practical demonstrations.", time: "Friday · 4:00 PM", location: "Room 204", image: eventFiqh, tag: "Fiqh", tagColor: "bg-gold/20 text-gold border-gold/30", xp: 30, participants: 18, gradient: "from-amber-500/30 via-transparent to-transparent" },
];

export const tutoringItems: EventItem[] = [
  { title: "Calculus II", subtitle: "Br. Yusuf · 5 spots", description: "Integrals, series and applications. Free peer tutoring for first-year students.", time: "Mon/Wed · 2:00 PM", location: "Room 302", image: eventMath, tag: "Math", tagColor: "bg-blue-500/20 text-blue-500 border-blue-500/30", xp: 15, participants: 5, gradient: "from-blue-500/30 via-transparent to-transparent" },
  { title: "Programming", subtitle: "Sr. Fatima · 8 spots", description: "Python & web fundamentals. Bring your laptop — beginner-friendly project labs.", time: "Sat · 10:00 AM", location: "Lab 201", image: eventCoding, tag: "Code", tagColor: "bg-purple-500/20 text-purple-500 border-purple-500/30", xp: 20, participants: 8, gradient: "from-purple-500/30 via-transparent to-transparent" },
];

export const challengeItems: EventItem[] = [
  { title: "Quran Memorization Sprint", subtitle: "Memorize Juz Amma in 30 days", description: "Daily checkpoints, partner accountability, and live revisions every weekend.", time: "Ends May 30", location: "Online", image: eventChallenge, tag: "Trophy", tagColor: "bg-gold/20 text-gold border-gold/30", xp: 150, participants: 45, gradient: "from-amber-500/30 via-transparent to-transparent" },
  { title: "Daily Dhikr Challenge", subtitle: "Morning & evening adhkar", description: "Build a daily dhikr habit with reminders, streaks and community leaderboard.", time: "Daily", location: "Anywhere", image: eventTafsir, tag: "Zikr", tagColor: "bg-pink-500/20 text-pink-500 border-pink-500/30", xp: 100, participants: 120, gradient: "from-pink-500/30 via-transparent to-transparent" },
];

export const eventsItems: EventItem[] = [
  { title: "Qur'an Competition", subtitle: "Annual community event", description: "Memorisation & recitation tracks. Open to all students — register at the office.", time: "May 25 · 10:00 AM", location: "Auditorium A", image: eventChallenge, tag: "Event", tagColor: "bg-gold/20 text-gold border-gold/30", xp: 50, participants: 80, gradient: "from-amber-500/30 via-transparent to-transparent" },
  { title: "Ramadan Iftar Program", subtitle: "Community iftar with dua", description: "Shared iftar, group salah and a short reminder before taraweeh. All welcome.", time: "May 29 · 6:00 PM", location: "Main Masjid", image: eventFiqh, tag: "Ramadan", tagColor: "bg-primary/20 text-primary border-primary/30", xp: 40, participants: 200, gradient: "from-emerald-500/30 via-transparent to-transparent" },
];

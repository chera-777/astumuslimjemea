import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  Clock, MapPin, ChevronRight, BookOpen, Trophy, Calendar as CalendarIcon,
  AlarmClock, FileText, Library, GraduationCap as GradCap, Utensils, Bed,
  Bus, Stethoscope, Search, HelpCircle, Heart, MoreHorizontal,
  BookText, Music2, Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import mosqueHero from "@/assets/mosque-hero.jpg";
import eventTafsir from "@/assets/event-tafsir.jpg";
import eventHadith from "@/assets/event-hadith.jpg";
import eventFiqh from "@/assets/event-fiqh.jpg";
import eventMath from "@/assets/event-math.jpg";
import eventCoding from "@/assets/event-coding.jpg";
import eventChallenge from "@/assets/event-challenge.jpg";
// Progress import removed (unused)

type EventItem = {
  title: string; subtitle: string; time: string; location: string;
  image: string; tag: string; tagColor: string;
};

const classesItems: EventItem[] = [
  { title: "Tafsir Al-Kahf", subtitle: "Sheikh Ahmed", time: "Today · 6:30 PM", location: "Masjid Al-Noor", image: eventTafsir, tag: "Islamic", tagColor: "bg-primary/20 text-primary border-primary/30" },
  { title: "Hadith: 40 Nawawi", subtitle: "Ustaz Bilal", time: "Tomorrow · 7:00 PM", location: "University Musalla", image: eventHadith, tag: "Hadith", tagColor: "bg-green-500/20 text-green-500 border-green-500/30" },
  { title: "Fiqh of Salah", subtitle: "Ustaz Hamza", time: "Friday · 4:00 PM", location: "Room 204", image: eventFiqh, tag: "Fiqh", tagColor: "bg-gold/20 text-gold border-gold/30" },
];

const tutoringItems: EventItem[] = [
  { title: "Calculus II", subtitle: "Br. Yusuf · 5 spots", time: "Mon/Wed · 2:00 PM", location: "Room 302", image: eventMath, tag: "Math", tagColor: "bg-blue-500/20 text-blue-500 border-blue-500/30" },
  { title: "Programming", subtitle: "Sr. Fatima · 8 spots", time: "Sat · 10:00 AM", location: "Lab 201", image: eventCoding, tag: "Code", tagColor: "bg-purple-500/20 text-purple-500 border-purple-500/30" },
];

const challengeItems: EventItem[] = [
  { title: "Quran Memorization Sprint", subtitle: "Memorize Juz Amma in 30 days · 150 XP", time: "Ends May 30", location: "45 joined", image: eventChallenge, tag: "Trophy", tagColor: "bg-gold/20 text-gold border-gold/30" },
  { title: "Daily Dhikr Challenge", subtitle: "Morning & evening adhkar · 100 XP", time: "Daily", location: "120 joined", image: eventTafsir, tag: "Zikr", tagColor: "bg-pink-500/20 text-pink-500 border-pink-500/30" },
];

const eventsItems: EventItem[] = [
  { title: "Qur'an Competition", subtitle: "Annual community event · prizes", time: "May 25 · 10:00 AM", location: "Auditorium A", image: eventChallenge, tag: "Event", tagColor: "bg-gold/20 text-gold border-gold/30" },
  { title: "Ramadan Iftar Program", subtitle: "Community iftar with dua", time: "May 29 · 6:00 PM", location: "Main Masjid", image: eventFiqh, tag: "Ramadan", tagColor: "bg-primary/20 text-primary border-primary/30" },
];

// summaryCards removed — content relocated to Profile / News

const quickAccess = [
  { label: "Qur'an", icon: BookOpen, link: "/quran/1", color: "bg-primary/15 text-primary" },
  { label: "Hadith", icon: BookText, link: "/hadith", color: "bg-blue-500/15 text-blue-500" },
  { label: "Kitabs", icon: Library, link: "/resources", color: "bg-accent/15 text-accent" },
  { label: "Zikr", icon: Music2, link: "/tasbih", color: "bg-purple-500/15 text-purple-500" },
  { label: "Azan", icon: AlarmClock, link: "/azan", color: "bg-green-500/15 text-green-500" },
  { label: "Calendar", icon: CalendarIcon, link: "/prayer-times", color: "bg-gold/15 text-gold" },
  { label: "Dua", icon: Heart, link: "/dua", color: "bg-pink-500/15 text-pink-500" },
  { label: "Adhkar", icon: Sparkles, link: "/adhkar", color: "bg-primary/15 text-primary" },
  { label: "Academic", icon: GradCap, link: "/academic", color: "bg-blue-500/15 text-blue-500" },
  { label: "Challenges", icon: Trophy, link: "/challenges", color: "bg-gold/15 text-gold" },
  { label: "Charity", icon: Heart, link: "/charity", color: "bg-accent/15 text-accent" },
  { label: "More", icon: MoreHorizontal, link: "/resources", color: "bg-muted text-muted-foreground" },
];

const universityServices = [
  { label: "Schedule", icon: CalendarIcon, color: "text-blue-500" },
  { label: "Exams", icon: AlarmClock, color: "text-accent" },
  { label: "Assignments", icon: FileText, color: "text-purple-500" },
  { label: "Library", icon: Library, color: "text-primary" },
  { label: "Grades", icon: GradCap, color: "text-green-500" },
  { label: "Café", icon: Utensils, color: "text-gold" },
  { label: "Dorm", icon: Bed, color: "text-pink-500" },
  { label: "Transport", icon: Bus, color: "text-blue-500" },
  { label: "Health", icon: Stethoscope, color: "text-destructive" },
  { label: "Lost & Found", icon: Search, color: "text-muted-foreground" },
  { label: "Help", icon: HelpCircle, color: "text-accent" },
];

function EventCard({ item }: { item: EventItem }) {
  return (
    <Card className="overflow-hidden border-border/60 hover:shadow-glow transition-all group">
      <div className="flex flex-col sm:flex-row">
        <div className="relative w-full sm:w-40 h-32 sm:h-auto shrink-0 overflow-hidden">
          <img src={item.image} alt={item.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-card/40" />
          <Badge className={`absolute top-2 left-2 text-[9px] font-body border ${item.tagColor}`}>{item.tag}</Badge>
        </div>
        <CardContent className="p-3 flex-1 flex flex-col justify-between min-w-0">
          <div className="min-w-0">
            <p className="font-display text-sm font-bold text-foreground leading-tight truncate">{item.title}</p>
            <p className="font-body text-[10px] text-muted-foreground mt-0.5 truncate">{item.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
            <span className="font-body text-[10px] text-primary flex items-center gap-1">
              <Clock className="h-3 w-3" /> {item.time}
            </span>
            <span className="font-body text-[10px] text-muted-foreground flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3" /> {item.location}
            </span>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

const StudentPortal = () => {
  const { profile, user } = useAuth();
  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Student";
  const firstName = displayName.split(" ")[0];
  const pt = usePrayerTimes();

  return (
    <AppLayout>
      <div className="w-full max-w-6xl mx-auto overflow-x-hidden p-3 md:p-5 space-y-4">
        {/* ---- 1. Welcome Hero — restored original style with name, location, hijri date, next prayer ---- */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="relative overflow-hidden border-border/50 min-h-[200px]">
            <div className="absolute inset-0">
              <img src={mosqueHero} alt="Mosque" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
            </div>
            <CardContent className="relative p-4 md:p-6 text-white">
              {/* Top row: location left, hijri date right */}
              <div className="flex items-start justify-between gap-2">
                <Badge className="bg-white/15 backdrop-blur text-white border-white/20 text-[10px] font-body">
                  <MapPin className="h-3 w-3 mr-1" /> {pt.city || "—"}
                </Badge>
                <Badge className="bg-white/15 backdrop-blur text-white border-white/20 text-[10px] font-body">
                  <CalendarIcon className="h-3 w-3 mr-1" /> {pt.hijriDate || "—"}
                </Badge>
              </div>

              {/* Welcome message */}
              <div className="mt-4">
                <h1 className="font-display text-xl md:text-3xl font-bold drop-shadow">
                  Welcome back, {firstName} 👋
                </h1>
                <p className="font-body text-xs md:text-sm text-white/85 mt-1">
                  Assalamu Alaikum — May Allah bless your day.
                </p>
              </div>

              {/* Next prayer center showcase */}
              {!pt.loading && (
                <div className="mt-5 text-center">
                  <p className="font-body text-xs uppercase tracking-wider text-white/70">{pt.nextPrayer}</p>
                  <p className="font-display text-3xl md:text-4xl font-bold text-white mt-0.5">{pt.nextTime}</p>
                  <p className="font-body text-[11px] text-white/70 mt-0.5">Next prayer</p>
                </div>
              )}

              {/* Compact azan strip */}
              <div className="mt-4 rounded-xl bg-white/10 backdrop-blur border border-white/15 p-2">
                <div className="grid grid-cols-5 gap-1 text-center">
                  {[
                    { name: "Fajr", time: pt.fajr },
                    { name: "Dhuhr", time: pt.dhuhr },
                    { name: "Asr", time: pt.asr },
                    { name: "Maghrib", time: pt.maghrib },
                    { name: "Isha", time: pt.isha },
                  ].map((p) => {
                    const isNext = p.name === pt.nextPrayer;
                    return (
                      <div key={p.name} className={`rounded-lg py-1 ${isNext ? "bg-white/25" : ""}`}>
                        <p className="font-body text-[10px] font-semibold text-white">{p.name}</p>
                        <p className="font-body text-[10px] text-white/85">{p.time || "--:--"}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ---- 2. Quick Access (horizontal scroll) ---- */}
        <Card className="border-border/60">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-sm font-bold">Quick Access</h3>
              <Link to="/resources" className="text-[10px] font-body text-primary flex items-center gap-0.5">
                All Tools <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
              {quickAccess.map((q) => (
                <Link key={q.label} to={q.link} className="shrink-0">
                  <div className="flex flex-col items-center gap-1.5 group w-14">
                    <div className={`w-12 h-12 rounded-2xl ${q.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                      <q.icon className="h-5 w-5" />
                    </div>
                    <p className="font-body text-[9px] text-center text-foreground/80 leading-tight line-clamp-2">{q.label}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ---- 3. University Services ---- */}
        <Card className="border-border/60">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-sm font-bold">University Services</h3>
              <Link to="/services" className="text-[10px] font-body text-primary flex items-center gap-0.5">
                All <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
              {universityServices.map((s) => (
                <Link key={s.label} to="/services" className="shrink-0">
                  <div className="flex flex-col items-center gap-1.5 group w-16">
                    <div className="w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/5 transition-all">
                      <s.icon className={`h-4 w-4 ${s.color}`} />
                    </div>
                    <p className="font-body text-[9px] text-center text-foreground/80 leading-tight line-clamp-2">{s.label}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* (Summary cards moved: Daily Goal & Group Sessions → Profile, Café → Profile, Announcements → News) */}

        {/* ---- 5. Tabs: Classes / Tutoring / Challenges / Events ---- */}
        <div id="challenges">
          <Tabs defaultValue="classes" className="w-full">
            <TabsList className="w-full flex overflow-x-auto scrollbar-hide h-auto bg-secondary/50 justify-start">
              <TabsTrigger value="classes" className="font-body text-xs py-2 px-3 shrink-0">✨ Classes</TabsTrigger>
              <TabsTrigger value="tutoring" className="font-body text-xs py-2 px-3 shrink-0">📚 Tutoring</TabsTrigger>
              <TabsTrigger value="challenges" className="font-body text-xs py-2 px-3 shrink-0">🏆 Challenges</TabsTrigger>
              <TabsTrigger value="events" className="font-body text-xs py-2 px-3 shrink-0">📅 Events</TabsTrigger>
            </TabsList>
            <TabsContent value="classes" className="mt-3 space-y-2.5">
              {classesItems.map((c, i) => <EventCard key={i} item={c} />)}
            </TabsContent>
            <TabsContent value="tutoring" className="mt-3 space-y-2.5">
              {tutoringItems.map((c, i) => <EventCard key={i} item={c} />)}
            </TabsContent>
            <TabsContent value="challenges" className="mt-3 space-y-2.5">
              {challengeItems.map((c, i) => <EventCard key={i} item={c} />)}
            </TabsContent>
            <TabsContent value="events" className="mt-3 space-y-2.5">
              {eventsItems.map((c, i) => <EventCard key={i} item={c} />)}
            </TabsContent>
          </Tabs>
        </div>

        {/* ---- 6. Donation Goal (single, not redundant) ---- */}
        <Card className="border-border/60 bg-gradient-to-br from-primary/10 to-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-display text-sm font-bold">Ramadan Meal Fund</h4>
                <p className="font-body text-[10px] text-muted-foreground">Bringing barakah to students in need.</p>
              </div>
              <Trophy className="h-5 w-5 text-gold" />
            </div>
            <Progress value={78} className="h-2 mb-2" />
            <div className="flex items-center justify-between">
              <p className="font-body text-[11px] text-muted-foreground">Birr 78,450 / 100,000</p>
              <span className="font-display text-sm font-bold text-primary">78%</span>
            </div>
            <Button asChild size="sm" className="w-full mt-3 h-8 text-xs">
              <Link to="/donations">Contribute</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default StudentPortal;

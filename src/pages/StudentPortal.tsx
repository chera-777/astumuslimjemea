import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  Play, Clock, MapPin, ChevronRight, Megaphone, BookOpen, Users,
  GraduationCap, CreditCard, Trophy, Calendar as CalendarIcon, Compass,
  AlarmClock, FileText, Library, GraduationCap as GradCap, Utensils, Bed,
  Bus, Stethoscope, Search, HelpCircle, AlertTriangle, Heart, MoreHorizontal,
  BookMarked, BookText, Music2, Sparkles, Sunrise, Sunset, Moon
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
import { Progress } from "@/components/ui/progress";

type EventItem = {
  title: string; subtitle: string; time: string; location: string;
  image: string; tag: string; tagColor: string; cta?: string;
};

const classesItems: EventItem[] = [
  { title: "Tafsir Al-Kahf", subtitle: "Sheikh Ahmed", time: "Today · 6:30 PM", location: "Masjid Al-Noor", image: eventTafsir, tag: "Islamic", tagColor: "bg-primary/20 text-primary border-primary/30" },
  { title: "Hadith: 40 Nawawi", subtitle: "Ustaz Bilal", time: "Tomorrow · 7:00 PM", location: "University Musalla", image: eventHadith, tag: "Hadith", tagColor: "bg-green-500/20 text-green-500 border-green-500/30" },
  { title: "Fiqh of Salah", subtitle: "Ustaz Hamza", time: "Friday · 4:00 PM", location: "Room 204", image: eventFiqh, tag: "Fiqh", tagColor: "bg-gold/20 text-gold border-gold/30" },
];

const tutoringItems: EventItem[] = [
  { title: "Calculus II", subtitle: "Br. Yusuf · 5 spots", time: "Mon/Wed · 2:00 PM", location: "Room 302", image: eventMath, tag: "Math", tagColor: "bg-blue-500/20 text-blue-500 border-blue-500/30" },
  { title: "Physics I", subtitle: "Br. Ibrahim · 3 spots", time: "Tue/Thu · 3:00 PM", location: "Room 105", image: eventMath, tag: "Physics", tagColor: "bg-blue-500/20 text-blue-500 border-blue-500/30" },
  { title: "Programming", subtitle: "Sr. Fatima · 8 spots", time: "Sat · 10:00 AM", location: "Lab 201", image: eventCoding, tag: "Code", tagColor: "bg-purple-500/20 text-purple-500 border-purple-500/30" },
];

const challengeItems: EventItem[] = [
  { title: "Quran Memorization Sprint", subtitle: "Memorize Juz Amma in 30 days · 150 XP", time: "Ends May 30", location: "45 joined", image: eventChallenge, tag: "Trophy", tagColor: "bg-gold/20 text-gold border-gold/30" },
  { title: "Daily Dhikr Challenge", subtitle: "Morning & evening adhkar · 100 XP", time: "Daily", location: "120 joined", image: eventTafsir, tag: "Zikr", tagColor: "bg-pink-500/20 text-pink-500 border-pink-500/30" },
  { title: "Community Service", subtitle: "Volunteer 5 events · 200 XP", time: "Open", location: "28 joined", image: eventFiqh, tag: "Service", tagColor: "bg-accent/20 text-accent border-accent/30" },
];

const dersItems: EventItem[] = [
  { title: "Aqeedah Tahawiyyah", subtitle: "Sheikh Mu'adh", time: "Sun · 5:00 PM", location: "Online (Zoom)", image: eventTafsir, tag: "Aqeedah", tagColor: "bg-primary/20 text-primary border-primary/30" },
  { title: "Seerah Series", subtitle: "Ustaz Ibrahim", time: "Wed · 8:00 PM", location: "Main Hall", image: eventFiqh, tag: "Seerah", tagColor: "bg-accent/20 text-accent border-accent/30" },
];

const eventsItems: EventItem[] = [
  { title: "Qur'an Competition", subtitle: "Annual community event · prizes", time: "May 25 · 10:00 AM", location: "Auditorium A", image: eventChallenge, tag: "Event", tagColor: "bg-gold/20 text-gold border-gold/30" },
  { title: "Ramadan Iftar Program", subtitle: "Community iftar with dua", time: "May 29 · 6:00 PM", location: "Main Masjid", image: eventFiqh, tag: "Ramadan", tagColor: "bg-primary/20 text-primary border-primary/30" },
  { title: "Hadith Study Circle", subtitle: "Open weekly halaqa", time: "May 26 · 3:30 PM", location: "Room 110", image: eventHadith, tag: "Halaqa", tagColor: "bg-green-500/20 text-green-500 border-green-500/30" },
];

const summaryCards = [
  {
    title: "Daily Goal", subtitle: "Qur'an & Zikr", progress: 75, footer: "10 / 14 today",
    icon: BookMarked, gradient: "from-primary/30 via-primary/10 to-card", accent: "text-primary", link: "/quran/1",
  },
  {
    title: "Group Sessions", subtitle: "Group 7B", value: "Halaqa Tonight", footer: "14 members · 8:00 PM",
    icon: Users, gradient: "from-blue-500/30 via-blue-500/10 to-card", accent: "text-blue-500", link: "/groups",
  },
  {
    title: "Café Student", subtitle: "Meal Card", value: "Active", footer: "Lunch & Dinner",
    icon: CreditCard, gradient: "from-green-500/30 via-green-500/10 to-card", accent: "text-green-500", link: "/services",
  },
  {
    title: "Announcements", subtitle: "From Amirs", value: "5 New", footer: "Tap to view",
    icon: Megaphone, gradient: "from-pink-500/30 via-pink-500/10 to-card", accent: "text-pink-500", link: "/news",
  },
  {
    title: "Challenges", subtitle: "Top 10%", value: "5,230 XP", footer: "Rank #7",
    icon: Trophy, gradient: "from-gold/30 via-gold/10 to-card", accent: "text-gold", link: "#challenges",
  },
];

const quickAccess = [
  { label: "Qur'an", icon: BookOpen, link: "/quran/1", color: "bg-primary/15 text-primary" },
  { label: "Hadith", icon: BookText, link: "/hadith", color: "bg-blue-500/15 text-blue-500" },
  { label: "Kitabs", icon: Library, link: "/resources", color: "bg-accent/15 text-accent" },
  { label: "Zikr", icon: Music2, link: "/tasbih", color: "bg-purple-500/15 text-purple-500" },
  { label: "Azan", icon: AlarmClock, link: "/azan", color: "bg-green-500/15 text-green-500" },
  { label: "Calendar", icon: CalendarIcon, link: "/prayer-times", color: "bg-gold/15 text-gold" },
  { label: "Dua", icon: Heart, link: "/dua", color: "bg-pink-500/15 text-pink-500" },
  { label: "Adhkar", icon: Sparkles, link: "/adhkar", color: "bg-primary/15 text-primary" },
  { label: "Qibla", icon: Compass, link: "/prayer-times", color: "bg-teal-500/15 text-primary" },
  { label: "Halal Map", icon: MapPin, link: "/services", color: "bg-green-500/15 text-green-500" },
  { label: "More", icon: MoreHorizontal, link: "/resources", color: "bg-muted text-muted-foreground" },
];

const universityServices = [
  { label: "Class Schedule", icon: CalendarIcon, color: "text-blue-500" },
  { label: "Exam Reminders", icon: AlarmClock, color: "text-accent" },
  { label: "Assignments", icon: FileText, color: "text-purple-500" },
  { label: "Library", icon: Library, color: "text-primary" },
  { label: "Grades", icon: GradCap, color: "text-green-500" },
  { label: "Café & Meal", icon: Utensils, color: "text-gold" },
  { label: "Dormitory", icon: Bed, color: "text-pink-500" },
  { label: "Transport", icon: Bus, color: "text-blue-500" },
  { label: "Health", icon: Stethoscope, color: "text-destructive" },
  { label: "Lost & Found", icon: Search, color: "text-muted-foreground" },
  { label: "Grievance", icon: HelpCircle, color: "text-accent" },
];

const leaderboard = [
  { rank: 1, name: "Yusuf Ali", points: 12540 },
  { rank: 2, name: "Aisha Mohammed", points: 9320 },
  { rank: 3, name: "Omar Hassan", points: 8410 },
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
        <CardContent className="p-3 flex-1 flex flex-col justify-between">
          <div>
            <p className="font-display text-sm font-bold text-foreground leading-tight">{item.title}</p>
            <p className="font-body text-[10px] text-muted-foreground mt-0.5">{item.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
            <span className="font-body text-[10px] text-primary flex items-center gap-1">
              <Clock className="h-3 w-3" /> {item.time}
            </span>
            <span className="font-body text-[10px] text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {item.location}
            </span>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

const StudentPortal = () => {
  const { profile } = useAuth();
  const displayName = profile?.full_name?.split(" ")[0] || "Student";
  const pt = usePrayerTimes();

  const prayerList = [
    { name: "Fajr", time: pt.times?.Fajr, icon: Sunrise },
    { name: "Dhuhr", time: pt.times?.Dhuhr, icon: Sparkles },
    { name: "Asr", time: pt.times?.Asr, icon: Sparkles },
    { name: "Maghrib", time: pt.times?.Maghrib, icon: Sunset },
    { name: "Isha", time: pt.times?.Isha, icon: Moon },
  ];

  return (
    <AppLayout>
      <div className="space-y-4 max-w-6xl mx-auto overflow-x-hidden p-3 md:p-5">
        {/* ---- 1. Welcome Hero with Azan strip ---- */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="relative overflow-hidden border-border/50">
            <div className="absolute inset-0">
              <img src={mosqueHero} alt="Mosque" className="w-full h-full object-cover opacity-50" />
              <div className="absolute inset-0 bg-gradient-to-r from-card via-card/85 to-card/30" />
            </div>
            <CardContent className="relative p-4 md:p-6">
              <div className="flex flex-col gap-3">
                <div>
                  <h1 className="font-display text-xl md:text-3xl font-bold text-foreground">
                    Assalamu Alaikum, {displayName} 👋
                  </h1>
                  <p className="font-body text-xs md:text-sm text-muted-foreground mt-1 max-w-md">
                    May Allah bless your knowledge and increase you in goodness.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px] font-body">
                      <MapPin className="h-3 w-3 mr-1" /> {pt.city}
                    </Badge>
                    <Badge className="bg-accent/15 text-accent border-accent/30 text-[10px] font-body">
                      {pt.hijriDate}
                    </Badge>
                    {!pt.loading && (
                      <Badge className="bg-gold/15 text-gold border-gold/30 text-[10px] font-body">
                        <Clock className="h-3 w-3 mr-1" /> Next: {pt.nextPrayer} {pt.nextTime}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Azan strip */}
                <div className="rounded-xl bg-card/70 backdrop-blur border border-border/60 p-2.5">
                  <div className="grid grid-cols-5 gap-1">
                    {prayerList.map((p) => {
                      const isNext = p.name === pt.nextPrayer;
                      return (
                        <div key={p.name} className={`flex flex-col items-center gap-0.5 rounded-lg py-1.5 px-1 ${isNext ? "bg-primary/15 ring-1 ring-primary/40" : ""}`}>
                          <p.icon className={`h-3.5 w-3.5 ${isNext ? "text-primary" : "text-muted-foreground"}`} />
                          <p className={`font-body text-[10px] font-semibold ${isNext ? "text-primary" : "text-foreground/80"}`}>{p.name}</p>
                          <p className="font-body text-[10px] text-muted-foreground">{p.time || "--:--"}</p>
                        </div>
                      );
                    })}
                  </div>
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

        {/* ---- 3. University Services (horizontal scroll) ---- */}
        <Card className="border-border/60">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-sm font-bold">University Services</h3>
              <Link to="/services" className="text-[10px] font-body text-primary flex items-center gap-0.5">
                All Services <ChevronRight className="h-3 w-3" />
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

        {/* ---- 4. Redesigned summary cards (bigger, beautiful) ---- */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {summaryCards.map((c, i) => (
            <motion.div key={c.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link to={c.link}>
                <Card className={`bg-gradient-to-br ${c.gradient} border-border/60 hover:shadow-glow transition-all h-full overflow-hidden relative`}>
                  <div className="absolute -right-3 -top-3 opacity-10">
                    <c.icon className="h-16 w-16" />
                  </div>
                  <CardContent className="p-3.5 relative">
                    <div className="flex items-start justify-between mb-2">
                      <div className={`w-8 h-8 rounded-xl bg-card/70 backdrop-blur flex items-center justify-center`}>
                        <c.icon className={`h-4 w-4 ${c.accent}`} />
                      </div>
                      <Badge variant="outline" className="text-[8px] font-body border-border/60">{c.subtitle}</Badge>
                    </div>
                    <p className="font-display text-base font-bold text-foreground leading-tight">{c.title}</p>
                    {c.progress !== undefined ? (
                      <div className="mt-2.5">
                        <div className="flex items-end justify-between mb-1">
                          <span className={`font-display text-xl font-bold ${c.accent}`}>{c.progress}%</span>
                        </div>
                        <Progress value={c.progress} className="h-1.5" />
                      </div>
                    ) : (
                      <p className={`font-display text-lg font-bold ${c.accent} mt-2`}>{c.value}</p>
                    )}
                    <p className="font-body text-[10px] text-muted-foreground mt-1.5 truncate">{c.footer}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* ---- 5. Daily Inspiration + Reading Athkar (matching style) + Leaderboard ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Daily Inspiration */}
          <Card className="border-border/60 bg-gradient-to-br from-primary/15 via-card to-accent/15 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-7xl opacity-10">✨</div>
            <CardContent className="p-4 relative">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display text-sm font-bold flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> Daily Inspiration
                </h3>
                <Badge className="bg-primary/15 text-primary border-primary/30 text-[9px]">Qur'an 94:6</Badge>
              </div>
              <p className="text-right text-2xl leading-loose text-foreground my-2" dir="rtl" style={{ fontFamily: "'Amiri Quran', 'Amiri', serif" }}>
                إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا
              </p>
              <p className="font-body text-xs italic text-foreground/80 text-center">
                "Indeed, with hardship [will be] ease."
              </p>
              <div className="flex justify-center gap-1 mt-3">
                {[0,1,2,3,4].map(i => (
                  <div key={i} className={`h-1 rounded-full transition-all ${i === 0 ? 'w-4 bg-primary' : 'w-1 bg-muted'}`} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reading Athkar — redesigned to match Daily Inspiration */}
          <Link to="/adhkar">
            <Card className="border-border/60 bg-gradient-to-br from-accent/15 via-card to-gold/15 relative overflow-hidden h-full hover:shadow-glow transition-all">
              <div className="absolute -right-4 -top-4 text-7xl opacity-10">🌅</div>
              <CardContent className="p-4 relative">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display text-sm font-bold flex items-center gap-1.5">
                    <Sunrise className="h-3.5 w-3.5 text-accent" /> Reading Athkar
                  </h3>
                  <Badge className="bg-accent/15 text-accent border-accent/30 text-[9px]">Morning</Badge>
                </div>
                <p className="text-right text-xl leading-loose text-foreground my-2" dir="rtl" style={{ fontFamily: "'Amiri Quran', 'Amiri', serif" }}>
                  يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ
                </p>
                <p className="font-body text-xs italic text-foreground/80 text-center">
                  "O Ever-Living, O Sustainer, by Your mercy I seek help."
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-3 text-primary">
                  <Play className="h-3 w-3" />
                  <span className="font-body text-[10px] font-semibold">Continue Adhkar</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Zikr Leaderboard */}
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-sm font-bold flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5 text-gold" /> Zikr Leaderboard
                </h3>
                <span className="text-[10px] font-body text-muted-foreground">This Week</span>
              </div>
              <div className="space-y-2">
                {leaderboard.map((u) => (
                  <div key={u.rank} className="flex items-center gap-2.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      u.rank === 1 ? 'bg-gold/20 text-gold' :
                      u.rank === 2 ? 'bg-muted text-foreground' :
                      'bg-accent/20 text-accent'
                    }`}>{u.rank}</div>
                    <div className="w-6 h-6 rounded-full gradient-teal flex items-center justify-center text-[9px] text-primary-foreground font-bold">
                      {u.name[0]}
                    </div>
                    <p className="font-body text-xs flex-1 truncate">{u.name}</p>
                    <p className="font-body text-xs font-bold text-primary">{u.points.toLocaleString()}</p>
                  </div>
                ))}
                <div className="border-t border-border pt-2 mt-2">
                  <p className="text-[9px] font-body text-muted-foreground mb-1">Your Rank</p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">7</div>
                    <div className="w-6 h-6 rounded-full gradient-pink flex items-center justify-center text-[9px] text-accent-foreground font-bold">
                      {displayName[0]}
                    </div>
                    <p className="font-body text-xs flex-1 truncate">{profile?.full_name || displayName}</p>
                    <p className="font-body text-xs font-bold text-accent">5,230</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ---- 6. Classes / Tutoring / Challenges / Ders / Events (with images) ---- */}
        <div id="challenges">
          <Tabs defaultValue="classes" className="w-full">
            <TabsList className="w-full flex overflow-x-auto scrollbar-hide h-auto bg-secondary/50 justify-start">
              <TabsTrigger value="classes" className="font-body text-xs py-2 px-3 shrink-0">✨ Classes</TabsTrigger>
              <TabsTrigger value="tutoring" className="font-body text-xs py-2 px-3 shrink-0">📚 Tutoring</TabsTrigger>
              <TabsTrigger value="challenges" className="font-body text-xs py-2 px-3 shrink-0">🏆 Challenges</TabsTrigger>
              <TabsTrigger value="ders" className="font-body text-xs py-2 px-3 shrink-0">🕌 Ders</TabsTrigger>
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
            <TabsContent value="ders" className="mt-3 space-y-2.5">
              {dersItems.map((c, i) => <EventCard key={i} item={c} />)}
            </TabsContent>
            <TabsContent value="events" className="mt-3 space-y-2.5">
              {eventsItems.map((c, i) => <EventCard key={i} item={c} />)}
            </TabsContent>
          </Tabs>
        </div>

        {/* ---- 7. Stats / Donation Goal / Emergency (Recent Donations removed) ---- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="border-border/60">
            <CardContent className="p-4">
              <h4 className="font-display text-sm font-bold mb-3">Community Stats</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="font-display text-xl font-bold text-primary">24,632</p>
                  <p className="font-body text-[10px] text-muted-foreground">Active Students</p>
                </div>
                <div>
                  <p className="font-display text-xl font-bold text-accent">512</p>
                  <p className="font-body text-[10px] text-muted-foreground">Active Groups</p>
                </div>
                <div>
                  <p className="font-display text-xl font-bold text-blue-500">120+</p>
                  <p className="font-body text-[10px] text-muted-foreground">Events / Month</p>
                </div>
                <div>
                  <p className="font-display text-xl font-bold text-green-500">98%</p>
                  <p className="font-body text-[10px] text-muted-foreground">Verified Members</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-gradient-to-br from-primary/10 to-card">
            <CardContent className="p-4">
              <h4 className="font-display text-sm font-bold mb-1">Donation Goal</h4>
              <p className="font-body text-[10px] text-muted-foreground mb-2">Ramadan Meal Fund</p>
              <p className="font-body text-[10px] text-muted-foreground italic mb-3">Bringing barakah to students in need.</p>
              <Progress value={78} className="h-2 mb-2" />
              <div className="flex items-center justify-between">
                <p className="font-body text-[10px] text-muted-foreground">Birr 78,450 / 100,000</p>
                <span className="font-display text-sm font-bold text-primary">78%</span>
              </div>
              <Button asChild size="sm" className="w-full mt-3 h-8 text-xs">
                <Link to="/donations">Contribute</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/30 bg-gradient-to-br from-destructive/10 to-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                <h4 className="font-display text-sm font-bold text-destructive">Emergency Alert</h4>
              </div>
              <p className="font-body text-xs font-semibold text-foreground mb-1">Need Immediate Help?</p>
              <p className="font-body text-[10px] text-muted-foreground mb-3">
                If you are in danger or need urgent support, alert the community Amirs instantly.
              </p>
              <Button variant="destructive" size="sm" className="w-full h-8 text-xs">Send Alert</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentPortal;

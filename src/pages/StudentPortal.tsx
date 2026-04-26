import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  Play, Clock, MapPin, ChevronRight, Loader2, Megaphone, BookOpen, Users,
  GraduationCap, CreditCard, Trophy, Calendar as CalendarIcon, Compass,
  AlarmClock, FileText, Library, GraduationCap as GradCap, Utensils, Bed,
  Bus, Stethoscope, Search, HelpCircle, AlertTriangle, Heart, MoreHorizontal,
  BookMarked, BookText, Music2
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import mosqueHero from "@/assets/mosque-hero.jpg";
import { Progress } from "@/components/ui/progress";

const featuredClasses = [
  { title: "Tafsir Al-Kahf", speaker: "Sheikh Ahmed", time: "Today, 6:30 PM", location: "Masjid Al-Noor", emoji: "📖", type: "Islamic" },
  { title: "Hadith Session: 40 Nawawi", speaker: "Ustaz Bilal", time: "Tomorrow, 7:00 PM", location: "University Musalla", emoji: "📚", type: "Islamic" },
  { title: "Fiqh of Salah", speaker: "Ustaz Hamza", time: "Friday, 4:00 PM", location: "Room 204", emoji: "🕌", type: "Islamic" },
];

const tutoringSchedule = [
  { subject: "Calculus II", tutor: "Br. Yusuf (3rd year)", time: "Mon/Wed 2:00 PM", room: "Room 302", spots: 5 },
  { subject: "Physics I", tutor: "Br. Ibrahim (4th year)", time: "Tue/Thu 3:00 PM", room: "Room 105", spots: 3 },
  { subject: "Programming", tutor: "Sr. Fatima (3rd year)", time: "Sat 10:00 AM", room: "Lab 201", spots: 8 },
];

const challenges = [
  { title: "Quran Memorization Sprint", desc: "Memorize Juz Amma in 30 days", participants: 45, icon: "🏆", reward: "150 XP" },
  { title: "Daily Dhikr Challenge", desc: "Complete morning & evening adhkar", participants: 120, icon: "⭐", reward: "100 XP" },
  { title: "Community Service", desc: "Volunteer for 5 campus events", participants: 28, icon: "🤝", reward: "200 XP" },
];

const summaryCards = [
  { title: "Qur'an & Zikr", subtitle: "Daily Goal", progress: 75, footer: "Great progress!", icon: BookMarked, accent: "from-primary/20 to-primary/5", link: "/quran/1" },
  { title: "Groups", subtitle: "Your Group", value: "Group 7B", footer: "14 Members", icon: Users, accent: "from-blue-500/20 to-blue-500/5", link: "/groups" },
  { title: "Ders & Tutoring", subtitle: "Next Session", value: "Fiqh of Worship", footer: "Today, 4:00 PM", icon: GraduationCap, accent: "from-accent/20 to-accent/5", link: "/resources" },
  { title: "Meal Card", subtitle: "Café Student", value: "Active", footer: "View Card", icon: CreditCard, accent: "from-green-500/20 to-green-500/5", link: "/services" },
  { title: "Announcements", subtitle: "New Updates", value: "5 New", footer: "View All", icon: Megaphone, accent: "from-pink-500/20 to-pink-500/5", link: "/news" },
  { title: "Challenges", subtitle: "Top 10%", value: "Trophy", footer: "Keep going", icon: Trophy, accent: "from-gold/20 to-gold/5", link: "#challenges" },
];

const upcomingEvents = [
  { title: "Qur'an Competition", date: "May 25, 2025 · 10:00 AM", icon: "🏆", color: "text-accent" },
  { title: "Hadith Study Circle", date: "May 26, 2025 · 3:30 PM", icon: "📚", color: "text-primary" },
  { title: "Zikr Challenge", date: "May 27, 2025 · 8:00 PM", icon: "📿", color: "text-blue-500" },
  { title: "Ramadan Iftar Program", date: "May 29, 2025 · 6:00 PM", icon: "🌙", color: "text-gold" },
];

const leaderboard = [
  { rank: 1, name: "Yusuf Ali", points: 12540 },
  { rank: 2, name: "Aisha Mohammed", points: 9320 },
  { rank: 3, name: "Omar Hassan", points: 8410 },
];

const quickAccess = [
  { label: "Qur'an", icon: BookOpen, link: "/quran/1", color: "bg-primary/15 text-primary" },
  { label: "Hadith", icon: BookText, link: "/hadith", color: "bg-blue-500/15 text-blue-500" },
  { label: "Kitabs", icon: Library, link: "/resources", color: "bg-accent/15 text-accent" },
  { label: "Zikr", icon: Music2, link: "/tasbih", color: "bg-purple-500/15 text-purple-500" },
  { label: "Azan Player", icon: AlarmClock, link: "/azan", color: "bg-green-500/15 text-green-500" },
  { label: "Calendar", icon: CalendarIcon, link: "/prayer-times", color: "bg-gold/15 text-gold" },
  { label: "Dua & Supp.", icon: Heart, link: "/dua", color: "bg-pink-500/15 text-pink-500" },
  { label: "Qibla Finder", icon: Compass, link: "/prayer-times", color: "bg-teal-500/15 text-primary" },
  { label: "Halal Places", icon: MapPin, link: "/services", color: "bg-green-500/15 text-green-500" },
  { label: "More Tools", icon: MoreHorizontal, link: "/resources", color: "bg-muted text-muted-foreground" },
];

const universityServices = [
  { label: "Class Schedule", icon: CalendarIcon, color: "text-blue-500" },
  { label: "Exam Reminders", icon: AlarmClock, color: "text-accent" },
  { label: "Assignments", icon: FileText, color: "text-purple-500" },
  { label: "Library Access", icon: Library, color: "text-primary" },
  { label: "Grades & Results", icon: GradCap, color: "text-green-500" },
  { label: "Café & Meal Card", icon: Utensils, color: "text-gold" },
  { label: "Dormitory & Housing", icon: Bed, color: "text-pink-500" },
  { label: "Transport & Shuttle", icon: Bus, color: "text-blue-500" },
  { label: "Health Services", icon: Stethoscope, color: "text-destructive" },
  { label: "Lost & Found", icon: Search, color: "text-muted-foreground" },
  { label: "Grievance Services", icon: HelpCircle, color: "text-accent" },
];

const recentDonations = [
  { name: "Abdullah M.", amount: 500 },
  { name: "Aisha H.", amount: 300 },
  { name: "Anonymous", amount: 200 },
];

const StudentPortal = () => {
  const { profile } = useAuth();
  const displayName = profile?.full_name?.split(" ")[0] || "Student";
  const pt = usePrayerTimes();

  return (
    <AppLayout>
      <div className="space-y-4 max-w-6xl mx-auto overflow-x-hidden p-3 md:p-5">
        {/* ---- 1. Greeting Hero with mosque ---- */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="relative overflow-hidden border-border/50">
            <div className="absolute inset-0">
              <img src={mosqueHero} alt="Mosque" className="w-full h-full object-cover opacity-50" />
              <div className="absolute inset-0 bg-gradient-to-r from-card via-card/80 to-transparent" />
            </div>
            <CardContent className="relative p-5 md:p-7 min-h-[140px] md:min-h-[180px] flex flex-col justify-center">
              <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground">
                Assalamu Alaikum, {displayName} <span className="inline-block">👋</span>
              </h1>
              <p className="font-body text-sm md:text-base text-muted-foreground mt-1 max-w-md">
                May Allah bless your knowledge and increase you in goodness.
              </p>
              <div className="flex items-center gap-3 mt-3">
                <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px] font-body">
                  <MapPin className="h-3 w-3 mr-1" /> {pt.city}
                </Badge>
                <Badge className="bg-accent/15 text-accent border-accent/30 text-[10px] font-body">
                  {pt.hijriDate}
                </Badge>
                {!pt.loading && (
                  <Badge className="bg-gold/15 text-gold border-gold/30 text-[10px] font-body">
                    <Clock className="h-3 w-3 mr-1" /> {pt.nextPrayer} {pt.nextTime}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ---- 2. Summary cards row ---- */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {summaryCards.map((c, i) => (
            <motion.div key={c.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link to={c.link}>
                <Card className={`bg-gradient-to-br ${c.accent} border-border/60 hover:shadow-glow transition-all h-full`}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-1.5">
                      <c.icon className="h-4 w-4 text-foreground/70" />
                      <span className="text-[9px] font-body text-muted-foreground">{c.subtitle}</span>
                    </div>
                    <p className="font-display text-sm font-bold text-foreground leading-tight">{c.title}</p>
                    {c.progress !== undefined ? (
                      <div className="mt-2">
                        <div className="relative w-12 h-12 mx-auto">
                          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="16" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                            <circle cx="18" cy="18" r="16" fill="none" stroke="hsl(var(--primary))" strokeWidth="3"
                              strokeDasharray={`${c.progress} 100`} strokeLinecap="round" pathLength="100" />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-primary">{c.progress}%</span>
                        </div>
                      </div>
                    ) : (
                      <p className="font-body text-xs text-foreground/80 mt-1.5">{c.value}</p>
                    )}
                    <p className="font-body text-[9px] text-muted-foreground mt-1.5 truncate">{c.footer}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* ---- 3. Three-column: Events / Inspiration / Leaderboard ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Upcoming Events */}
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-sm font-bold">Upcoming Events</h3>
                <Link to="/events" className="text-[10px] font-body text-primary flex items-center gap-0.5">
                  View All <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-2.5">
                {upcomingEvents.map((e) => (
                  <div key={e.title} className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-base shrink-0`}>{e.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-xs font-semibold text-foreground truncate">{e.title}</p>
                      <p className="font-body text-[10px] text-muted-foreground">{e.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Daily Inspiration */}
          <Card className="border-border/60 bg-gradient-to-br from-primary/10 via-card to-accent/10 relative overflow-hidden">
            <CardContent className="p-4 relative">
              <h3 className="font-display text-sm font-bold mb-3">Daily Inspiration</h3>
              <p className="text-right text-xl leading-loose text-foreground" dir="rtl" style={{ fontFamily: "'Amiri Quran', 'Amiri', serif" }}>
                إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا
              </p>
              <p className="font-body text-[11px] italic text-muted-foreground text-center mt-2">
                Indeed, with hardship [will be] ease.
              </p>
              <p className="font-body text-[10px] text-center text-primary font-medium mt-1">(Qur'an 94:6)</p>
              <div className="flex justify-center gap-1 mt-3">
                {[0,1,2,3,4].map(i => (
                  <div key={i} className={`h-1 rounded-full transition-all ${i === 0 ? 'w-4 bg-primary' : 'w-1 bg-muted'}`} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Zikr Leaderboard */}
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-sm font-bold">Zikr Leaderboard</h3>
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

        {/* ---- 4. Quick Access ---- */}
        <Card className="border-border/60">
          <CardContent className="p-4">
            <h3 className="font-display text-sm font-bold mb-3">Quick Access</h3>
            <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-10 gap-2.5">
              {quickAccess.map((q) => (
                <Link key={q.label} to={q.link}>
                  <div className="flex flex-col items-center gap-1.5 group">
                    <div className={`w-11 h-11 rounded-2xl ${q.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <q.icon className="h-5 w-5" />
                    </div>
                    <p className="font-body text-[9px] text-center text-foreground/80 leading-tight">{q.label}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ---- 5. University Services ---- */}
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-sm font-bold">University Services</h3>
              <Link to="/services" className="text-[10px] font-body text-primary flex items-center gap-0.5">
                All Services <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-11 gap-2.5">
              {universityServices.map((s) => (
                <Link key={s.label} to="/services">
                  <div className="flex flex-col items-center gap-1.5 group">
                    <div className="w-11 h-11 rounded-xl bg-secondary border border-border flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/5 transition-all">
                      <s.icon className={`h-4 w-4 ${s.color}`} />
                    </div>
                    <p className="font-body text-[9px] text-center text-foreground/80 leading-tight line-clamp-2">{s.label}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ---- 6. Stats / Donation / Recent / Emergency ---- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
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
                  <p className="font-body text-[10px] text-muted-foreground">Events This Month</p>
                </div>
                <div>
                  <p className="font-display text-xl font-bold text-green-500">98%</p>
                  <p className="font-body text-[10px] text-muted-foreground">Verified Members</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
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

          <Card className="border-border/60">
            <CardContent className="p-4">
              <h4 className="font-display text-sm font-bold mb-3">Recent Donations</h4>
              <div className="space-y-2">
                {recentDonations.map((d) => (
                  <div key={d.name} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-foreground">
                      {d.name[0]}
                    </div>
                    <p className="font-body text-xs flex-1 truncate">{d.name}</p>
                    <p className="font-body text-xs font-bold text-primary">{d.amount} Birr</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/30 bg-gradient-to-br from-destructive/10 to-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                <h4 className="font-display text-sm font-bold text-destructive">Emergency Alert</h4>
              </div>
              <p className="font-body text-xs font-semibold text-foreground mb-1">Emergency Support</p>
              <p className="font-body text-[10px] text-muted-foreground mb-3">
                If you are in danger or need immediate help, alert the community.
              </p>
              <Button variant="destructive" size="sm" className="w-full h-8 text-xs">Send Alert</Button>
            </CardContent>
          </Card>
        </div>

        {/* ---- 7. Reading Athkar (preserved) ---- */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/adhkar">
            <Card className="border border-primary/20 bg-gradient-to-r from-card to-primary/5 hover:shadow-glow transition-all">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <span className="text-lg">🌍</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-base font-bold flex items-center gap-1">
                      Reading Athkar <Play className="h-3 w-3 text-primary" />
                    </h3>
                    <p className="font-body text-[10px] text-muted-foreground">Morning Remembrance</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="font-body text-sm text-muted-foreground italic">
                  Ya hayyu ya qayyoom, birahmatika astagheeth...
                </p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* ---- 8. Classes / Tutoring / Challenges (preserved) ---- */}
        <Tabs defaultValue="classes" className="w-full" id="challenges">
          <TabsList className="w-full grid grid-cols-3 h-auto bg-secondary/50">
            <TabsTrigger value="classes" className="font-body text-xs py-2">✨ Classes</TabsTrigger>
            <TabsTrigger value="academic" className="font-body text-xs py-2">📚 Tutoring</TabsTrigger>
            <TabsTrigger value="challenges" className="font-body text-xs py-2">🏆 Challenges</TabsTrigger>
          </TabsList>

          <TabsContent value="classes" className="mt-3 space-y-2">
            {featuredClasses.map((c, i) => (
              <Card key={i} className="border border-border bg-card hover:shadow-glow transition-all overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    <div className="w-1.5 bg-gradient-to-b from-primary to-accent shrink-0" />
                    <div className="p-3 flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{c.emoji}</span>
                          <div>
                            <p className="font-body text-sm font-bold">{c.title}</p>
                            <p className="font-body text-[10px] text-muted-foreground">{c.speaker}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[8px] font-body shrink-0">{c.type}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="font-body text-[10px] text-primary flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {c.time}
                        </span>
                        <span className="font-body text-[10px] text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {c.location}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="academic" className="mt-3 space-y-2">
            {tutoringSchedule.map((t, i) => (
              <Card key={i} className="border border-border bg-card hover:shadow-glow transition-all overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    <div className="w-1.5 bg-gradient-to-b from-blue-500 to-blue-300 shrink-0" />
                    <div className="p-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-body text-sm font-bold">{t.subject}</p>
                        <Badge className="text-[8px] bg-blue-500/10 text-blue-500 border-0">{t.spots} spots</Badge>
                      </div>
                      <p className="font-body text-[10px] text-muted-foreground mt-0.5">{t.tutor}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="font-body text-[10px] text-primary flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {t.time}
                        </span>
                        <span className="font-body text-[10px] text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {t.room}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="challenges" className="mt-3 space-y-2">
            {challenges.map((c, i) => (
              <Card key={i} className="border border-border bg-card hover:shadow-glow transition-all overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    <div className="w-1.5 bg-gradient-to-b from-accent to-yellow-400 shrink-0" />
                    <div className="p-3 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{c.icon}</span>
                          <div>
                            <p className="font-body text-sm font-bold">{c.title}</p>
                            <p className="font-body text-[10px] text-muted-foreground">{c.desc}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="outline" className="text-[8px] font-body">{c.participants} joined</Badge>
                        <Badge className="text-[8px] bg-accent/10 text-accent border-0">{c.reward}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default StudentPortal;

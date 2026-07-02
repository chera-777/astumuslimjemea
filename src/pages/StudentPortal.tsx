import { useState } from "react";
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
  BookText, Music2, Sparkles, Users
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import mosqueHero from "@/assets/mosque-hero.jpg";
import { Progress } from "@/components/ui/progress";
import { classesItems, tutoringItems, challengeItems, eventsItems, type EventItem } from "@/lib/portalItems";
import { EventDetailsDialog } from "@/components/EventDetailsDialog";

// summaryCards removed — content relocated to Profile / News

// Unified services rail — Quick Access (Islamic tools) + University Services merged.
// Each item carries its own icon background style so the rail stays vivid while
// visually grouping the two original sections.
type ServiceItem = { label: string; icon: typeof BookOpen; link: string; color: string };

const servicesRail: ServiceItem[] = [
  // Quick Access (Islamic tools)
  { label: "Qur'an",     icon: BookOpen,    link: "/quran/1",      color: "bg-primary/15 text-primary" },
  { label: "Hadith",     icon: BookText,    link: "/hadith",       color: "bg-blue-500/15 text-blue-500" },
  { label: "Kitabs",     icon: Library,     link: "/resources",    color: "bg-accent/15 text-accent" },
  { label: "Zikr",       icon: Music2,      link: "/tasbih",       color: "bg-purple-500/15 text-purple-500" },
  { label: "Azan",       icon: AlarmClock,  link: "/azan",         color: "bg-green-500/15 text-green-500" },
  { label: "Calendar",   icon: CalendarIcon,link: "/prayer-times", color: "bg-gold/15 text-gold" },
  { label: "Dua",        icon: Heart,       link: "/dua",          color: "bg-pink-500/15 text-pink-500" },
  { label: "Adhkar",     icon: Sparkles,    link: "/adhkar",       color: "bg-primary/15 text-primary" },
  { label: "Academic",   icon: GradCap,     link: "/academic",     color: "bg-blue-500/15 text-blue-500" },
  { label: "Challenges", icon: Trophy,      link: "/challenges",   color: "bg-gold/15 text-gold" },
  { label: "Donate",     icon: Heart,       link: "/donations",    color: "bg-accent/15 text-accent" },
  // University Services
  { label: "Schedule",    icon: CalendarIcon, link: "/services",  color: "bg-blue-500/15 text-blue-500" },
  { label: "Exams",       icon: AlarmClock,   link: "/services",  color: "bg-accent/15 text-accent" },
  { label: "Assignments", icon: FileText,     link: "/services",  color: "bg-purple-500/15 text-purple-500" },
  { label: "Library",     icon: Library,      link: "/resources", color: "bg-primary/15 text-primary" },
  { label: "Grades",      icon: GradCap,      link: "/services",  color: "bg-green-500/15 text-green-500" },
  { label: "Café",        icon: Utensils,     link: "/services",  color: "bg-gold/15 text-gold" },
  { label: "Dorm",        icon: Bed,          link: "/services",  color: "bg-pink-500/15 text-pink-500" },
  { label: "Transport",   icon: Bus,          link: "/services",  color: "bg-blue-500/15 text-blue-500" },
  { label: "Health",      icon: Stethoscope,  link: "/services",  color: "bg-destructive/15 text-destructive" },
  { label: "Lost & Found",icon: Search,      link: "/services",   color: "bg-muted text-muted-foreground" },
  { label: "Help",        icon: HelpCircle,   link: "/support",   color: "bg-accent/15 text-accent" },
  { label: "More",        icon: MoreHorizontal,link: "/resources",color: "bg-muted text-muted-foreground" },
];

function EventCard({ item, onClick }: { item: EventItem; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left group relative overflow-hidden rounded-2xl border border-border/60 bg-card hover:border-primary/50 hover:shadow-glow transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="relative h-32 overflow-hidden">
        <img src={item.image} alt={item.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className={`absolute inset-0 bg-gradient-to-tr ${item.gradient}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
        <Badge className={`absolute top-2 left-2 text-[9px] font-body border ${item.tagColor}`}>{item.tag}</Badge>
        {item.xp && (
          <Badge className="absolute top-2 right-2 bg-gold text-black border-0 text-[9px] gap-0.5 shadow-md">
            <Sparkles className="h-2.5 w-2.5" /> +{item.xp}
          </Badge>
        )}
        <div className="absolute bottom-2 left-3 right-3">
          <p className="font-display text-base font-bold text-foreground leading-tight drop-shadow-md">{item.title}</p>
          <p className="font-body text-[10px] text-foreground/80 truncate">{item.subtitle}</p>
        </div>
      </div>
      <div className="p-3 space-y-2">
        <p className="font-body text-[11px] text-muted-foreground line-clamp-2">{item.description}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-body text-[10px] text-primary flex items-center gap-1">
            <Clock className="h-3 w-3" /> {item.time}
          </span>
          <span className="font-body text-[10px] text-muted-foreground flex items-center gap-1 truncate">
            <MapPin className="h-3 w-3" /> {item.location}
          </span>
          {item.participants && (
            <span className="font-body text-[10px] text-accent flex items-center gap-1 ml-auto">
              <Users className="h-3 w-3" /> {item.participants}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

const StudentPortal = () => {
  const { profile, user } = useAuth();
  // Prefer real first + last name from profile; never leak the email local-part.
  const fullName = (profile?.full_name || "").trim();
  const [firstName, ...rest] = fullName ? fullName.split(/\s+/) : [];
  const lastName = rest.length ? rest[rest.length - 1] : "";
  const greetingName = fullName
    ? `${firstName}${lastName && lastName !== firstName ? ` ${lastName}` : ""}`
    : "friend";
  const pt = usePrayerTimes();
  const [selected, setSelected] = useState<EventItem | null>(null);

  return (
    <AppLayout>
      <div className="w-full max-w-6xl mx-auto overflow-x-hidden p-3 md:p-5 space-y-4">
        {/* ---- 1. Welcome Hero — restored original style with name, location, hijri date, next prayer ---- */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="relative overflow-hidden border-border/50 min-h-[200px]">
            <div className="absolute inset-0">
              <img src={mosqueHero} alt="ASTU Muslim Jemea community mosque at sunset" className="w-full h-full object-cover" />
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
                  Welcome back, {greetingName} 👋
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

        {/* ---- 2. Unified Services rail (Quick Access + University Services merged) ---- */}
        <Card className="border-border/60">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-sm font-bold">Services</h3>
              <Link to="/services" className="text-[10px] font-body text-primary flex items-center gap-0.5">
                All Tools <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div
              role="list"
              aria-label="Services"
              className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-hide pb-2 pt-1 -mx-2 px-2 snap-x snap-mandatory scroll-px-2 [scroll-behavior:smooth] touch-pan-x"
            >
              {servicesRail.map((s) => (
                <Link
                  key={s.label}
                  to={s.link}
                  role="listitem"
                  className="shrink-0 snap-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
                >
                  <div className="flex flex-col items-center gap-2 group w-16 md:w-20">
                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl ${s.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                      <s.icon className="h-6 w-6 md:h-7 md:w-7" />
                    </div>
                    <p className="font-body text-[10px] md:text-[11px] text-center text-foreground/80 leading-tight line-clamp-2 min-h-[2.2em]">{s.label}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ---- 5. Tabs: Classes / Tutoring / Challenges / Events ---- */}
        <div id="challenges">
          <Tabs defaultValue="classes" className="w-full">
            <TabsList className="w-full grid grid-cols-4 h-auto bg-secondary/50 gap-1 p-1">
              <TabsTrigger value="classes" className="font-body text-xs py-2 px-2 w-full">✨ Classes</TabsTrigger>
              <TabsTrigger value="tutoring" className="font-body text-xs py-2 px-2 w-full">📚 Tutoring</TabsTrigger>
              <TabsTrigger value="challenges" className="font-body text-xs py-2 px-2 w-full">🏆 Challenges</TabsTrigger>
              <TabsTrigger value="events" className="font-body text-xs py-2 px-2 w-full">📅 Events</TabsTrigger>
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

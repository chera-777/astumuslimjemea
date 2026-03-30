import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  BookOpen, GraduationCap, Moon, Play, Clock,
  Calendar, Sparkles, Trophy, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const quickFeatures = [
  { icon: "🤲", title: "Dua", link: "/resources" },
  { icon: "📚", title: "Hadith", link: "/resources" },
  { icon: "🕌", title: "Athkar", link: "/resources" },
  { icon: "📅", title: "Calendar", link: "/prayer-times" },
  { icon: "📿", title: "Tasbih", link: "/resources" },
  { icon: "🌙", title: "Ramadan", link: "/ramadan" },
  { icon: "📖", title: "Quran", link: "/resources" },
  { icon: "🎯", title: "Quiz", link: "/resources" },
];

const prayerTimes = [
  { name: "Fajr", time: "5:12 AM" },
  { name: "Dhuhr", time: "12:27 PM" },
  { name: "Asr", time: "3:37 PM" },
  { name: "Maghrib", time: "6:33 PM" },
  { name: "Isha'a", time: "7:39 PM" },
];

const featuredClasses = [
  { title: "Tafsir Al-Kahf", speaker: "Sheikh Ahmed", time: "Today, 6:30 PM", emoji: "📖" },
  { title: "Hadith Session: 40 Nawawi", speaker: "Ustaz Bilal", time: "Tomorrow, 7:00 PM", emoji: "📚" },
  { title: "Fiqh of Salah", speaker: "Ustaz Hamza", time: "Friday, 4:00 PM", emoji: "🕌" },
];

const tutoringSchedule = [
  { subject: "Calculus II", tutor: "Br. Yusuf (3rd year)", time: "Mon/Wed 2:00 PM", room: "Room 302" },
  { subject: "Physics I", tutor: "Br. Ibrahim (4th year)", time: "Tue/Thu 3:00 PM", room: "Room 105" },
  { subject: "Programming", tutor: "Sr. Fatima (3rd year)", time: "Sat 10:00 AM", room: "Lab 201" },
];

const StudentPortal = () => {
  const { profile } = useAuth();
  const displayName = profile?.full_name?.split(" ")[0] || "Student";
  const currentHour = new Date().getHours();
  const nextPrayer = currentHour < 5 ? "Fajr" : currentHour < 12 ? "Dhuhr" : currentHour < 15 ? "Asr" : currentHour < 18 ? "Maghrib" : "Isha'a";
  const nextTime = prayerTimes.find(p => p.name === nextPrayer)?.time || "";

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-4 max-w-4xl mx-auto">
        {/* Prayer Time Hero - V Muslims Style */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="overflow-hidden border-0 relative" style={{
            background: "linear-gradient(135deg, hsl(168 65% 18%), hsl(168 55% 32%), hsl(168 50% 42%))"
          }}>
            <div className="absolute inset-0 islamic-pattern opacity-10" />
            <CardContent className="p-5 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <p className="font-body text-sm text-white/70">Adama</p>
                <p className="font-body text-sm text-white/70">11 Shawwal 1447 AH</p>
              </div>
              <div className="text-center py-4">
                <p className="font-body text-sm text-white/60">{nextPrayer}</p>
                <h2 className="font-display text-4xl font-bold text-white mt-1">{nextTime}</h2>
                <p className="font-body text-xs text-white/50 mt-1">Salaam, {displayName}! 👋</p>
              </div>
              {/* Mini prayer times row */}
              <div className="grid grid-cols-5 gap-1 mt-2">
                {prayerTimes.map(p => (
                  <div key={p.name} className={`text-center p-1.5 rounded-lg ${p.name === nextPrayer ? 'bg-white/20' : 'bg-white/5'}`}>
                    <p className="text-[9px] text-white/60 font-body">{p.name}</p>
                    <p className="text-[11px] text-white font-body font-medium">{p.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Feature Icons - Scrollable Row */}
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex gap-3 w-max">
            {quickFeatures.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Link to={f.link}>
                  <div className="flex flex-col items-center gap-1.5 w-16">
                    <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center text-2xl hover:shadow-glow hover:-translate-y-1 transition-all">
                      {f.icon}
                    </div>
                    <p className="font-body text-[10px] font-medium text-foreground">{f.title}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Reading Athkar Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-0 bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl gradient-green flex items-center justify-center">
                  <span className="text-lg">🌍</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-base font-bold flex items-center gap-1">
                    Reading Athkar <Play className="h-3 w-3" />
                  </h3>
                </div>
              </div>
              <p className="font-body text-sm text-muted-foreground italic">
                Ya hayyu ya qayyoom, birahmatika astagheeth, aslih lee sha/nee kullah, wala ...
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Verse Daily Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="border-0 bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl gradient-teal flex items-center justify-center">
                  <span className="text-lg">📖</span>
                </div>
                <div>
                  <h3 className="font-display text-base font-bold flex items-center gap-1">
                    Verse Daily <Play className="h-3 w-3" />
                  </h3>
                  <p className="font-body text-xs text-muted-foreground">Al-An'aam (6:114)</p>
                </div>
              </div>
              <p className="font-body text-right text-lg leading-relaxed text-foreground" dir="rtl" style={{ fontFamily: "'Amiri', serif" }}>
                أَفَغَيْرَ ٱللَّهِ أَبْتَغِى حَكَمًا وَهُوَ ٱلَّذِىٓ أَنزَلَ إِلَيْكُمُ ٱلْكِتَـٰبَ مُفَصَّلًا
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Featured Classes & Tutoring */}
        <Tabs defaultValue="classes" className="w-full">
          <TabsList className="w-full grid grid-cols-3 h-auto">
            <TabsTrigger value="classes" className="font-body text-xs py-2">✨ Classes</TabsTrigger>
            <TabsTrigger value="academic" className="font-body text-xs py-2">📚 Tutoring</TabsTrigger>
            <TabsTrigger value="challenges" className="font-body text-xs py-2">🏆 Challenges</TabsTrigger>
          </TabsList>

          <TabsContent value="classes" className="mt-3 space-y-2">
            {featuredClasses.map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border border-border bg-card hover:shadow-glow transition-all">
                  <CardContent className="p-3 flex items-center gap-3">
                    <span className="text-2xl">{c.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm font-semibold truncate">{c.title}</p>
                      <p className="font-body text-xs text-muted-foreground">{c.speaker}</p>
                    </div>
                    <p className="font-body text-xs text-primary font-medium shrink-0">{c.time}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="academic" className="mt-3 space-y-2">
            {tutoringSchedule.map((t, i) => (
              <Card key={i} className="border border-border bg-card">
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="font-body text-sm font-medium">{t.subject}</p>
                    <p className="font-body text-xs text-muted-foreground">{t.tutor} • {t.room}</p>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span className="font-body text-xs">{t.time}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="challenges" className="mt-3">
            <Card className="border border-border bg-card">
              <CardContent className="p-6 text-center">
                <Trophy className="h-12 w-12 text-gold mx-auto mb-3" />
                <h3 className="font-display text-xl font-bold mb-2">Challenges & Leaderboards</h3>
                <p className="text-muted-foreground font-body text-sm mb-4">Compete in Zikr, Qur'an hifz & more</p>
                <Button className="gradient-teal text-primary-foreground border-0 rounded-xl">View Leaderboard</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default StudentPortal;

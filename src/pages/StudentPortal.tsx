import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Play, Clock, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import mosqueHero from "@/assets/mosque-hero.jpg";

const quickFeatures = [
  { icon: "🤲", title: "Dua", link: "/resources" },
  { icon: "📚", title: "Hadith", link: "/resources" },
  { icon: "🕌", title: "Athkar", link: "/resources" },
  { icon: "📅", title: "Calendar", link: "/prayer-times" },
  { icon: "📿", title: "Tasbih", link: "/resources" },
  { icon: "🌙", title: "Ramadan", link: "/ramadan" },
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
      <div className="space-y-4 max-w-4xl mx-auto overflow-x-hidden">
        {/* Prayer Time Hero with Mosque Image */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="relative w-full h-[280px] md:h-[320px] overflow-hidden">
            <img
              src={mosqueHero}
              alt="Mosque"
              className="absolute inset-0 w-full h-full object-cover"
              width={800}
              height={512}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />
            <div className="absolute inset-0 z-10 flex flex-col justify-between p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/80 flex items-center justify-center text-xs text-primary-foreground font-bold">☪</div>
                  <span className="text-white/90 font-body text-sm font-medium">Adama</span>
                </div>
                <span className="text-white/80 font-body text-sm">11 Shawwal 1447 AH</span>
              </div>
              <div className="text-center flex-1 flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-accent/90 flex items-center justify-center mb-2">
                  <span className="text-lg">☀️</span>
                </div>
                <p className="text-white/70 font-body text-sm">{nextPrayer}</p>
                <h2 className="text-white text-5xl font-bold font-display tracking-tight">{nextTime}</h2>
                <p className="text-primary-foreground/80 font-body text-sm mt-1">will start in 2 hours 19 minutes</p>
              </div>
              <div className="flex justify-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-white/40" />
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div className="w-2 h-2 rounded-full bg-white/40" />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="px-4 space-y-4">
          {/* Quick Feature Icons - Grid that fits screen */}
          <div className="grid grid-cols-6 gap-2">
            {quickFeatures.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Link to={f.link}>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-card border border-border flex items-center justify-center text-xl md:text-2xl hover:shadow-glow hover:-translate-y-1 transition-all">
                      {f.icon}
                    </div>
                    <p className="font-body text-[10px] font-medium text-foreground text-center">{f.title}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Pagination dots for features */}
          <div className="flex justify-center gap-1">
            <div className="w-6 h-1.5 rounded-full bg-primary" />
            <div className="w-1.5 h-1.5 rounded-full bg-muted" />
          </div>

          {/* Reading Athkar Card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-0 bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <span className="text-lg">🌍</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-base font-bold flex items-center gap-1">
                      Reading Athkar <Play className="h-3 w-3 text-primary" />
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
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <span className="text-lg">📖</span>
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold flex items-center gap-1">
                      Verse Daily <Play className="h-3 w-3 text-primary" />
                    </h3>
                    <p className="font-body text-xs text-muted-foreground">Al-An'aam (6:114)</p>
                  </div>
                </div>
                <p className="font-body text-right text-lg leading-loose text-foreground" dir="rtl" style={{ fontFamily: "'Amiri', serif" }}>
                  أَفَغَيْرَ ٱللَّهِ أَبْتَغِى حَكَمًا وَهُوَ ٱلَّذِىٓ أَنزَلَ إِلَيْكُمُ ٱلْكِتَـٰبَ مُفَصَّلًا وَٱلَّذِينَ ءَاتَيْنَـٰهُمُ ٱلْكِتَـٰبَ يَعْلَمُونَ أَنَّهُۥ مُنَزَّلٌ مِّن رَّبِّكَ بِٱلْحَقِّ فَلَا تَكُونَنَّ مِنَ ٱلْمُمْتَرِينَ
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
                  <Trophy className="h-12 w-12 text-primary mx-auto mb-3" />
                  <h3 className="font-display text-xl font-bold mb-2">Challenges & Leaderboards</h3>
                  <p className="text-muted-foreground font-body text-sm mb-4">Compete in Zikr, Qur'an hifz & more</p>
                  <Button className="bg-primary text-primary-foreground border-0 rounded-xl">View Leaderboard</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentPortal;

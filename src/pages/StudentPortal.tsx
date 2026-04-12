import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Play, Clock, Trophy, Loader2, MapPin, Bell, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import mosqueHero from "@/assets/mosque-hero.jpg";

const quickFeatures = [
  { icon: "🤲", title: "Dua", link: "/dua" },
  { icon: "📚", title: "Hadith", link: "/hadith" },
  { icon: "🕌", title: "Adhkar", link: "/adhkar" },
  { icon: "📅", title: "Calendar", link: "/prayer-times" },
  { icon: "📿", title: "Tasbih", link: "/tasbih" },
  { icon: "🌙", title: "Ramadan", link: "/ramadan" },
];

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
  { title: "Daily Dhikr Challenge", desc: "Complete morning & evening adhkar for 7 days", participants: 120, icon: "⭐", reward: "100 XP" },
  { title: "Community Service", desc: "Volunteer for 5 campus events", participants: 28, icon: "🤝", reward: "200 XP" },
];

const StudentPortal = () => {
  const { profile } = useAuth();
  const displayName = profile?.full_name?.split(" ")[0] || "Student";
  const pt = usePrayerTimes();

  return (
    <AppLayout>
      <div className="space-y-4 max-w-4xl mx-auto overflow-x-hidden">
        {/* Prayer Time Hero with Mosque Image */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="relative w-full h-[280px] md:h-[320px] overflow-hidden">
            <img src={mosqueHero} alt="Mosque" className="absolute inset-0 w-full h-full object-cover" width={800} height={512} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />
            <div className="absolute inset-0 z-10 flex flex-col justify-between p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/80 flex items-center justify-center text-xs text-primary-foreground font-bold">☪</div>
                  <div>
                    <span className="text-white/90 font-body text-sm font-medium flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {pt.city}
                    </span>
                  </div>
                </div>
                <span className="text-white/80 font-body text-xs bg-white/10 px-2 py-1 rounded-full">{pt.hijriDate}</span>
              </div>
              <div className="text-center flex-1 flex flex-col items-center justify-center">
                {pt.loading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-white/60" />
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-accent/80 flex items-center justify-center mb-2">
                      <span className="text-lg">☀️</span>
                    </div>
                    <p className="text-white/70 font-body text-sm">{pt.nextPrayer}</p>
                    <h2 className="text-white text-5xl font-bold font-display tracking-tight">{pt.nextTime}</h2>
                    <p className="text-white/60 font-body text-sm mt-1">Salaam, {displayName}! 👋</p>
                  </>
                )}
              </div>
              {/* Mini prayer row */}
              <div className="grid grid-cols-5 gap-1">
                {pt.prayers.map(p => (
                  <div key={p.name} className={`text-center p-1.5 rounded-lg transition-all ${p.name === pt.nextPrayer ? 'bg-white/25 ring-1 ring-white/40' : 'bg-white/10'}`}>
                    <p className="text-[9px] text-white/60 font-body">{p.name}</p>
                    <p className="text-[11px] text-white font-body font-medium">{p.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="px-4 space-y-4">
          {/* Quick Feature Icons - Grid */}
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

          <div className="flex justify-center gap-1">
            <div className="w-6 h-1.5 rounded-full bg-primary" />
            <div className="w-1.5 h-1.5 rounded-full bg-muted" />
          </div>

          {/* Reading Athkar */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
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

          {/* Verse Daily */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Link to="/quran/6">
              <Card className="border border-accent/20 bg-gradient-to-r from-card to-accent/5 hover:shadow-glow transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                      <span className="text-lg">📖</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-base font-bold flex items-center gap-1">
                        Verse Daily <Play className="h-3 w-3 text-accent" />
                      </h3>
                      <p className="font-body text-xs text-muted-foreground">Al-An'aam (6:114)</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="font-body text-right text-lg leading-loose text-foreground" dir="rtl" style={{ fontFamily: "'Amiri Quran', 'Amiri', serif" }}>
                    أَفَغَيْرَ ٱللَّهِ أَبْتَغِى حَكَمًا وَهُوَ ٱلَّذِىٓ أَنزَلَ إِلَيْكُمُ ٱلْكِتَـٰبَ مُفَصَّلًا
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          {/* Classes & Tutoring Tabs — Announcement style */}
          <Tabs defaultValue="classes" className="w-full">
            <TabsList className="w-full grid grid-cols-3 h-auto bg-secondary/50">
              <TabsTrigger value="classes" className="font-body text-xs py-2">✨ Classes</TabsTrigger>
              <TabsTrigger value="academic" className="font-body text-xs py-2">📚 Tutoring</TabsTrigger>
              <TabsTrigger value="challenges" className="font-body text-xs py-2">🏆 Challenges</TabsTrigger>
            </TabsList>

            <TabsContent value="classes" className="mt-3 space-y-2">
              {featuredClasses.map((c, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="border border-border bg-card hover:shadow-glow transition-all overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex">
                        {/* Color accent bar */}
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
                </motion.div>
              ))}
            </TabsContent>

            <TabsContent value="academic" className="mt-3 space-y-2">
              {tutoringSchedule.map((t, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="border border-border bg-card hover:shadow-glow transition-all overflow-hidden">
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
                </motion.div>
              ))}
            </TabsContent>

            <TabsContent value="challenges" className="mt-3 space-y-2">
              {challenges.map((c, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="border border-border bg-card hover:shadow-glow transition-all overflow-hidden">
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
                </motion.div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentPortal;

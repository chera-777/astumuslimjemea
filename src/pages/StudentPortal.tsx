import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  BookOpen, GraduationCap, Moon, Play, Award, Clock,
  Calendar, MessageCircle, Heart, Sparkles, Trophy, Star
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const quickFeatures = [
  { icon: "📖", title: "Quran Study", gradient: "gradient-green" },
  { icon: "📚", title: "Hadith", gradient: "gradient-blue" },
  { icon: "🤲", title: "Prayer", gradient: "gradient-teal" },
  { icon: "🕌", title: "Events", gradient: "gradient-pink" },
  { icon: "💡", title: "Charity", gradient: "gradient-gold" },
  { icon: "🌍", title: "Community", gradient: "gradient-purple" },
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

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-5 max-w-4xl mx-auto">
        {/* Welcome Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Salaam, {displayName}! 👋
          </h1>
          <p className="text-muted-foreground font-body text-sm mt-1">Your academic & spiritual hub</p>
        </motion.div>

        {/* Daily Quiz Banner */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Card className="overflow-hidden border-0" style={{
            background: "linear-gradient(135deg, hsl(var(--blue)), hsl(var(--purple)))"
          }}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-display text-lg font-bold text-white">Daily Quiz</p>
                <p className="font-body text-xs text-white/70">Test your Islamic knowledge</p>
              </div>
              <Button size="sm" className="bg-white/20 text-white hover:bg-white/30 border-0 font-body rounded-xl">
                Play Now ▶
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Feature Icons Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {quickFeatures.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.04 }}>
              <Card className="hover:shadow-glow transition-all hover:-translate-y-1 border-0 bg-card cursor-pointer">
                <CardContent className="p-3 flex flex-col items-center text-center gap-1">
                  <div className={`w-11 h-11 rounded-xl ${f.gradient} flex items-center justify-center text-lg`}>
                    {f.icon}
                  </div>
                  <p className="font-body text-[10px] font-semibold text-foreground">{f.title}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Featured Classes */}
        <div>
          <h3 className="font-display text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold" /> Featured Classes
          </h3>
          <div className="space-y-2">
            {featuredClasses.map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
                <Card className="gamification-card">
                  <CardContent className="p-3 flex items-center gap-3">
                    <span className="text-2xl">{c.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm font-semibold text-foreground truncate">{c.title}</p>
                      <p className="font-body text-xs text-muted-foreground">{c.speaker}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-body text-xs text-primary font-medium">{c.time}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tabs for Academic & Ramadan */}
        <Tabs defaultValue="academic" className="w-full">
          <TabsList className="w-full grid grid-cols-3 h-auto">
            <TabsTrigger value="academic" className="font-body text-xs py-2">📚 Academic</TabsTrigger>
            <TabsTrigger value="ramadan" className="font-body text-xs py-2">🌙 Ramadan</TabsTrigger>
            <TabsTrigger value="challenges" className="font-body text-xs py-2">🏆 Challenges</TabsTrigger>
          </TabsList>

          <TabsContent value="academic" className="mt-4 space-y-3">
            <h3 className="font-display text-lg font-bold flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" /> Tutoring Schedule
            </h3>
            {tutoringSchedule.map((t, i) => (
              <Card key={i} className="gamification-card">
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

          <TabsContent value="ramadan" className="mt-4">
            <Card className="border-accent/30">
              <CardContent className="p-6 text-center">
                <Moon className="h-12 w-12 text-gold mx-auto mb-3" />
                <h3 className="font-display text-xl font-bold mb-2">Ramadan Tools</h3>
                <p className="text-muted-foreground font-body text-sm mb-4">Meal cards, fasting calendar, and prayer times</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="rounded-xl" asChild>
                    <Link to="/ramadan">View Calendar</Link>
                  </Button>
                  <Button className="gradient-gold text-white border-0 rounded-xl">My Meal Card</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="challenges" className="mt-4">
            <Card className="gamification-card">
              <CardContent className="p-6 text-center">
                <Trophy className="h-12 w-12 text-gold mx-auto mb-3" />
                <h3 className="font-display text-xl font-bold mb-2">Challenges & Leaderboards</h3>
                <p className="text-muted-foreground font-body text-sm mb-4">Compete in Zikr counts, Qur'an hifz, and more</p>
                <Button className="gradient-teal text-white border-0 rounded-xl">View Leaderboard</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default StudentPortal;

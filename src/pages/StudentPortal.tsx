import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BookOpen, GraduationCap, Moon, Clock, Play, Award } from "lucide-react";
import { motion } from "framer-motion";

const tutoringSchedule = [
  { subject: "Calculus II", tutor: "Br. Yusuf (3rd year)", time: "Mon/Wed 2:00 PM", room: "Room 302" },
  { subject: "Physics I", tutor: "Br. Ibrahim (4th year)", time: "Tue/Thu 3:00 PM", room: "Room 105" },
  { subject: "Programming", tutor: "Sr. Fatima (3rd year)", time: "Sat 10:00 AM", room: "Lab 201" },
];

const dersSchedule = [
  { title: "Tafsir Al-Kahf", speaker: "Sheikh Ahmed", time: "Today, 6:30 PM", location: "Masjid Hall" },
  { title: "Hadith Session: 40 Nawawi", speaker: "Ustaz Bilal", time: "Tomorrow, 7:00 PM", location: "Room 110" },
  { title: "Fiqh of Salah", speaker: "Ustaz Hamza", time: "Friday, 4:00 PM", location: "Masjid Hall" },
];

const StudentPortal = () => {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl font-bold text-foreground">Student Portal</h1>
          <p className="text-muted-foreground font-body text-sm">Your academic & spiritual hub</p>
        </motion.div>

        <Tabs defaultValue="spiritual" className="w-full">
          <TabsList className="w-full grid grid-cols-4 h-auto">
            <TabsTrigger value="spiritual" className="font-body text-xs py-2">Spiritual</TabsTrigger>
            <TabsTrigger value="academic" className="font-body text-xs py-2">Academic</TabsTrigger>
            <TabsTrigger value="ramadan" className="font-body text-xs py-2">Ramadan</TabsTrigger>
            <TabsTrigger value="challenges" className="font-body text-xs py-2">Challenges</TabsTrigger>
          </TabsList>

          <TabsContent value="spiritual" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: BookOpen, title: "Qur'an", desc: "Read & listen" },
                { icon: BookOpen, title: "Hadith", desc: "Collections" },
                { icon: Play, title: "Zikr", desc: "Detector & counter" },
                { icon: Moon, title: "Azan", desc: "Prayer times" },
              ].map((item) => (
                <Card key={item.title} className="hover:shadow-emerald transition-all cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <item.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-body text-sm font-semibold">{item.title}</p>
                    <p className="font-body text-[10px] text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardHeader><CardTitle className="font-display text-lg">Upcoming Ders</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {dersSchedule.map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                    <div>
                      <p className="font-body text-sm font-medium">{d.title}</p>
                      <p className="font-body text-xs text-muted-foreground">{d.speaker} • {d.location}</p>
                    </div>
                    <span className="font-body text-xs text-primary font-medium">{d.time}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="academic" className="space-y-4 mt-4">
            <Card>
              <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><GraduationCap className="h-5 w-5" /> Tutoring Schedule</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {tutoringSchedule.map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                    <div>
                      <p className="font-body text-sm font-medium">{t.subject}</p>
                      <p className="font-body text-xs text-muted-foreground">{t.tutor} • {t.room}</p>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span className="font-body text-xs">{t.time}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ramadan" className="space-y-4 mt-4">
            <Card className="border-accent/30">
              <CardContent className="p-6 text-center">
                <Moon className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="font-display text-xl font-bold mb-2">Ramadan Tools</h3>
                <p className="text-muted-foreground font-body text-sm mb-4">Meal cards, fasting calendar, and prayer times</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline">View Calendar</Button>
                  <Button variant="gold">My Meal Card</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="challenges" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Award className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="font-display text-xl font-bold mb-2">Challenges & Leaderboards</h3>
                <p className="text-muted-foreground font-body text-sm mb-4">Compete in Zikr counts, Qur'an hifz, and more</p>
                <Button variant="hero">View Leaderboard</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default StudentPortal;

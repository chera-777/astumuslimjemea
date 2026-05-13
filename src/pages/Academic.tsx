import { AppLayout } from "@/components/layout/AppLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  GraduationCap, BookOpen, Users, Calendar, FileText, Award,
  Clock, MapPin, ChevronRight, Library, PenTool, Brain, Target
} from "lucide-react";
import eventMath from "@/assets/event-math.jpg";
import eventCoding from "@/assets/event-coding.jpg";
import eventTafsir from "@/assets/event-tafsir.jpg";

const tutoringSessions = [
  { title: "Calculus II — Live Tutoring", tutor: "Br. Yusuf K.", level: "Year 2", time: "Mon/Wed · 2:00 PM", location: "Room 302", spots: "5 / 10", image: eventMath, color: "from-blue-500/30" },
  { title: "Programming Fundamentals", tutor: "Sr. Fatima A.", level: "Year 1", time: "Sat · 10:00 AM", location: "Lab 201", spots: "8 / 15", image: eventCoding, color: "from-purple-500/30" },
  { title: "Arabic Grammar Intensive", tutor: "Sh. Bilal H.", level: "All", time: "Sun · 4:00 PM", location: "Masjid Hall", spots: "12 / 20", image: eventTafsir, color: "from-primary/30" },
];

const studyMaterials = [
  { title: "Calculus II Notes", subject: "Mathematics", pages: 124, downloads: 340, icon: PenTool, color: "text-blue-500" },
  { title: "Quran Recitation Guide", subject: "Islamic Studies", pages: 56, downloads: 890, icon: BookOpen, color: "text-primary" },
  { title: "Programming Cheatsheet", subject: "Computer Science", pages: 18, downloads: 512, icon: FileText, color: "text-purple-500" },
  { title: "Hadith Methodology", subject: "Islamic Studies", pages: 88, downloads: 230, icon: Library, color: "text-green-500" },
];

const exams = [
  { subject: "Calculus II", date: "May 20, 2026", time: "9:00 AM", room: "Hall A", status: "upcoming" },
  { subject: "Tafsir of Surah Al-Kahf", date: "May 22, 2026", time: "2:00 PM", room: "Masjid", status: "upcoming" },
  { subject: "Computer Networks", date: "May 25, 2026", time: "10:00 AM", room: "Lab 3", status: "upcoming" },
];

const myStats = [
  { label: "GPA", value: "3.8", icon: Award, color: "text-gold" },
  { label: "Completed Courses", value: "12", icon: BookOpen, color: "text-primary" },
  { label: "Tutoring Hours", value: "48h", icon: Clock, color: "text-blue-500" },
  { label: "Goals Hit", value: "85%", icon: Target, color: "text-green-500" },
];

const Academic = () => {
  return (
    <AppLayout>
      <SEO title="Academic Support — Tutoring & Study Materials" description="Access tutoring sessions, study materials, exam schedules, and academic support." path="/academic" />
      <div className="w-full max-w-5xl mx-auto p-3 md:p-5 space-y-4 overflow-x-hidden">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden border-border/50 relative bg-[radial-gradient(ellipse_at_top_left,hsl(215_80%_55%/0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,hsl(168_65%_45%/0.3),transparent_55%),linear-gradient(135deg,hsl(var(--card)),hsl(var(--card)))]">
            <div className="absolute -right-10 -top-10 opacity-15">
              <GraduationCap className="h-52 w-52 text-blue-500" />
            </div>
            <CardContent className="p-5 relative">
              <Badge className="bg-blue-500/25 text-blue-400 border-blue-500/40 text-[10px] mb-2 backdrop-blur">🎓 Academic Hub</Badge>
              <h1 className="font-display text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-primary to-teal-400 bg-clip-text text-transparent">
                Learn. Grow. Excel.
              </h1>
              <p className="font-body text-xs text-muted-foreground mt-1">
                Tutoring, study materials, exam schedules and academic mentorship — all in one place.
              </p>
              <div className="grid grid-cols-4 gap-2 mt-4">
                {myStats.map((s) => (
                  <motion.div
                    key={s.label}
                    whileHover={{ y: -2, scale: 1.04 }}
                    className="rounded-2xl bg-card/70 backdrop-blur p-2.5 text-center border border-border/50 shadow-sm"
                  >
                    <s.icon className={`h-4 w-4 mx-auto ${s.color}`} />
                    <p className={`font-display text-base font-bold mt-1 ${s.color}`}>{s.value}</p>
                    <p className="font-body text-[9px] text-muted-foreground leading-tight">{s.label}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="tutoring" className="w-full">
          <TabsList className="w-full flex overflow-x-auto scrollbar-hide h-auto bg-secondary/50 justify-start">
            <TabsTrigger value="tutoring" className="font-body text-xs py-2 px-3 shrink-0">📚 Tutoring</TabsTrigger>
            <TabsTrigger value="materials" className="font-body text-xs py-2 px-3 shrink-0">📄 Materials</TabsTrigger>
            <TabsTrigger value="exams" className="font-body text-xs py-2 px-3 shrink-0">📅 Exams</TabsTrigger>
            <TabsTrigger value="mentors" className="font-body text-xs py-2 px-3 shrink-0">🧑‍🏫 Mentors</TabsTrigger>
          </TabsList>

          <TabsContent value="tutoring" className="mt-3 space-y-2.5">
            {tutoringSessions.map((t) => (
              <Card key={t.title} className="overflow-hidden border-border/60 hover:shadow-glow transition-all group">
                <div className="flex">
                  <div className="relative w-32 h-auto shrink-0 overflow-hidden">
                    <img src={t.image} alt={t.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className={`absolute inset-0 bg-gradient-to-r ${t.color} to-transparent`} />
                  </div>
                  <CardContent className="p-3 flex-1 min-w-0">
                    <Badge variant="outline" className="text-[9px] mb-1">{t.level}</Badge>
                    <p className="font-display text-sm font-bold leading-tight truncate">{t.title}</p>
                    <p className="font-body text-[10px] text-muted-foreground mt-0.5">{t.tutor}</p>
                    <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1.5">
                      <span className="text-[10px] text-primary flex items-center gap-1"><Clock className="h-3 w-3" />{t.time}</span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{t.location}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-body text-[10px] text-muted-foreground"><Users className="h-3 w-3 inline mr-1" />{t.spots}</span>
                      <Button size="sm" className="h-7 text-[10px]">Join</Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="materials" className="mt-3 grid grid-cols-2 gap-2.5">
            {studyMaterials.map((m) => (
              <Card key={m.title} className="hover:shadow-glow transition-all cursor-pointer">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className={`w-9 h-9 rounded-xl bg-secondary flex items-center justify-center`}>
                      <m.icon className={`h-4 w-4 ${m.color}`} />
                    </div>
                    <Badge variant="outline" className="text-[8px]">{m.pages}p</Badge>
                  </div>
                  <p className="font-display text-xs font-bold leading-tight">{m.title}</p>
                  <p className="font-body text-[10px] text-muted-foreground mt-0.5">{m.subject}</p>
                  <p className="font-body text-[9px] text-muted-foreground mt-1.5">⬇ {m.downloads} downloads</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="exams" className="mt-3 space-y-2">
            {exams.map((e) => (
              <Card key={e.subject} className="border-l-4 border-l-primary">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-display text-sm font-bold truncate">{e.subject}</p>
                    <div className="flex flex-wrap gap-x-3 mt-1">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{e.date}</span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{e.time}</span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{e.room}</span>
                    </div>
                  </div>
                  <Badge className="text-[9px] shrink-0">Soon</Badge>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="mentors" className="mt-3 grid grid-cols-2 gap-2.5">
            {[
              { name: "Sh. Ahmed Mahmood", field: "Tafsir & Arabic", students: 45 },
              { name: "Dr. Ibrahim Salah", field: "Mathematics", students: 32 },
              { name: "Ust. Bilal Hassan", field: "Hadith Studies", students: 28 },
              { name: "Sr. Fatima Ali", field: "Computer Science", students: 56 },
            ].map((m) => (
              <Card key={m.name} className="hover:shadow-glow transition-all">
                <CardContent className="p-3 text-center">
                  <div className="w-12 h-12 rounded-full gradient-teal mx-auto flex items-center justify-center mb-2">
                    <Brain className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <p className="font-display text-xs font-bold">{m.name}</p>
                  <p className="font-body text-[10px] text-muted-foreground">{m.field}</p>
                  <p className="font-body text-[9px] text-primary mt-1">{m.students} students</p>
                  <Button size="sm" variant="outline" className="h-6 text-[9px] mt-2 w-full">Contact</Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Academic;

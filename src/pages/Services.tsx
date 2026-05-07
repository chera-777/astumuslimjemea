import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Calendar, Package, Brain, DollarSign, Megaphone, BookOpen,
  Home, Shield, Newspaper, Briefcase, Bus, Stethoscope, BarChart3, Users, ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

type Service = {
  slug: string; icon: typeof Calendar; title: string; desc: string; color: string;
  details: string; actions: string[];
};

const services: Service[] = [
  { slug: "schedule", icon: Calendar, title: "Academic Scheduling", desc: "Class timetables & exam reminders", color: "from-blue-500/30",
    details: "View today's lectures, upcoming exams, and assignment due dates synced to your courses.",
    actions: ["Today's Classes", "Exam Calendar", "Sync to Phone"] },
  { slug: "lost-found", icon: Package, title: "Lost & Found", desc: "Campus-wide item recovery", color: "from-amber-500/30",
    details: "Browse recently found items or report something you've lost. Verified pickups at the student desk.",
    actions: ["Report Lost", "Browse Found", "My Reports"] },
  { slug: "wellbeing", icon: Brain, title: "Mental Well-Being", desc: "Peer mentoring & support", color: "from-purple-500/30",
    details: "Confidential sessions with trained peer mentors. Non-medical guidance available 24/7 via chat.",
    actions: ["Book Session", "Chat Now", "Resources"] },
  { slug: "aid", icon: DollarSign, title: "Financial Aid", desc: "Scholarships & tracking", color: "from-green-500/30",
    details: "Apply for need-based scholarships and view a transparent breakdown of awarded funds.",
    actions: ["Apply", "My Status", "Disbursements"] },
  { slug: "grievance", icon: Megaphone, title: "Grievance Reporting", desc: "Submit & track complaints", color: "from-rose-500/30",
    details: "File academic, administrative or facility complaints. Receive status updates from the committee.",
    actions: ["New Complaint", "My Cases", "FAQ"] },
  { slug: "library", icon: BookOpen, title: "Library Access", desc: "Digital academic materials", color: "from-primary/30",
    details: "Access e-books, past exam papers, and reference materials curated for your department.",
    actions: ["Search Catalog", "Borrowed", "Reservations"] },
  { slug: "housing", icon: Home, title: "Housing & Café", desc: "Meal cards & dorm notices", color: "from-gold/30",
    details: "Check meal eligibility, café menu, and dormitory announcements at one place.",
    actions: ["Meal Card", "Today's Menu", "Dorm Notices"] },
  { slug: "safety", icon: Shield, title: "Safety Reporting", desc: "Anonymous safety reports", color: "from-red-500/30",
    details: "Report harassment or safety concerns anonymously. Routed directly to the campus safety officer.",
    actions: ["Report Now", "Safety Tips", "Emergency"] },
  { slug: "news", icon: Newspaper, title: "Campus News", desc: "Latest updates", color: "from-indigo-500/30",
    details: "Centralised announcements from administration, faculties and student bodies.",
    actions: ["Latest", "By Faculty", "Subscribe"] },
  { slug: "career", icon: Briefcase, title: "Career Services", desc: "Internships & jobs", color: "from-teal-500/30",
    details: "Job board, CV reviews and partner internships. Workshops every Thursday.",
    actions: ["Job Board", "CV Review", "Workshops"] },
  { slug: "transport", icon: Bus, title: "Transportation", desc: "Bus & shuttle schedules", color: "from-blue-500/30",
    details: "Live shuttle tracker plus weekday/weekend bus timetables.",
    actions: ["Live Tracker", "Timetable", "Routes"] },
  { slug: "health", icon: Stethoscope, title: "Health Services", desc: "Clinic & appointments", color: "from-pink-500/30",
    details: "Book a clinic appointment, view your visit history, and access basic health resources.",
    actions: ["Book Visit", "My Records", "Pharmacy"] },
  { slug: "grades", icon: BarChart3, title: "Grade Tracking", desc: "Exam results", color: "from-violet-500/30",
    details: "Per-course grades, GPA trends and projected outcomes for the semester.",
    actions: ["Current GPA", "By Semester", "Trends"] },
  { slug: "union", icon: Users, title: "Student Union", desc: "Governance & representation", color: "from-cyan-500/30",
    details: "Meet your representatives, view current motions, and submit ideas for the union.",
    actions: ["Reps", "Open Motions", "Submit Idea"] },
];

const Services = () => {
  const [active, setActive] = useState<Service | null>(null);

  return (
    <AppLayout>
      <div className="p-3 md:p-5 space-y-4 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl font-bold text-foreground">University Services</h1>
          <p className="text-muted-foreground font-body text-xs">Tap any service to open its dedicated page</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {services.map((s, i) => (
            <motion.div key={s.slug} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card
                onClick={() => setActive(s)}
                className={`cursor-pointer overflow-hidden border-border/60 hover:shadow-glow hover:-translate-y-0.5 transition-all bg-gradient-to-br ${s.color} to-card h-full`}
              >
                <CardContent className="p-3.5 flex flex-col gap-2">
                  <div className="w-10 h-10 rounded-xl bg-card/80 backdrop-blur flex items-center justify-center">
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-display text-sm font-bold leading-tight">{s.title}</p>
                  <p className="font-body text-[10px] text-muted-foreground line-clamp-2">{s.desc}</p>
                  <div className="flex items-center justify-end mt-auto">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-md">
          {active && (
            <>
              <DialogHeader>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                  <active.icon className="h-6 w-6 text-primary" />
                </div>
                <DialogTitle className="font-display">{active.title}</DialogTitle>
                <DialogDescription className="font-body text-xs">{active.details}</DialogDescription>
              </DialogHeader>
              <div className="space-y-2 mt-2">
                {active.actions.map((a) => (
                  <Button key={a} variant="outline" className="w-full justify-between font-body text-xs">
                    {a} <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                ))}
                <Badge variant="outline" className="text-[10px] mt-2">Coming soon · live data</Badge>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Services;

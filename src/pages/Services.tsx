import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Calendar, Package, Brain, DollarSign, Megaphone, BookOpen,
  Home, Shield, Newspaper, Briefcase, Bus, Stethoscope, BarChart3, Users
} from "lucide-react";

const services = [
  { icon: Calendar, title: "Academic Scheduling", desc: "Class timetables, exam reminders & assignment deadlines" },
  { icon: Package, title: "Lost & Found", desc: "Campus-wide item recovery system" },
  { icon: Brain, title: "Mental Well-Being", desc: "Peer mentoring, stress relief & non-medical support" },
  { icon: DollarSign, title: "Financial Aid", desc: "Scholarships, application tracking & transparent allocation" },
  { icon: Megaphone, title: "Grievance Reporting", desc: "Complaint submission & resolution tracking" },
  { icon: BookOpen, title: "Library Access", desc: "Digital library for academic materials" },
  { icon: Home, title: "Housing & Café", desc: "Meal card eligibility, café menus & dormitory notices" },
  { icon: Shield, title: "Safety Reporting", desc: "Anonymous anti-harassment & safety reports" },
  { icon: Newspaper, title: "Campus News", desc: "Centralized university updates & announcements" },
  { icon: Briefcase, title: "Career Services", desc: "Internships, job postings & CV workshops" },
  { icon: Bus, title: "Transportation", desc: "Bus schedules & campus shuttle info" },
  { icon: Stethoscope, title: "Health Services", desc: "Clinic hours & appointment booking" },
  { icon: BarChart3, title: "Grade Tracking", desc: "Exam results linked to student profiles" },
  { icon: Users, title: "Student Union", desc: "Broader campus governance & representation" },
];

const Services = () => {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl font-bold text-foreground">University Services</h1>
          <p className="text-muted-foreground font-body text-sm">Essential campus-wide solutions</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {services.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="hover:shadow-emerald transition-all h-full cursor-pointer hover:-translate-y-0.5">
                <CardContent className="p-4 flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-body text-sm font-semibold text-foreground">{s.title}</p>
                    <p className="font-body text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Services;

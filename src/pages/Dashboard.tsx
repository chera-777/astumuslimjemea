import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  BookOpen, Users, Shield, Vote, MessageCircle, Moon, Newspaper,
  GraduationCap, Heart, Briefcase, Bell, Calendar
} from "lucide-react";

const quickLinks = [
  { icon: BookOpen, title: "Resources", desc: "Qur'an, Hadith & more", path: "/resources", color: "bg-primary/10 text-primary" },
  { icon: GraduationCap, title: "Student Portal", desc: "Your academic hub", path: "/portal/student", color: "bg-accent/20 text-accent-foreground" },
  { icon: Shield, title: "Amirs Portal", desc: "Leadership dashboard", path: "/portal/amirs", color: "bg-primary/10 text-primary" },
  { icon: Vote, title: "Governance", desc: "Elections & voting", path: "/governance", color: "bg-accent/20 text-accent-foreground" },
  { icon: Users, title: "My Group", desc: "Group of 14", path: "/groups", color: "bg-primary/10 text-primary" },
  { icon: MessageCircle, title: "Community", desc: "Chat & connect", path: "/community", color: "bg-accent/20 text-accent-foreground" },
  { icon: Moon, title: "Ramadan", desc: "Tools & meal cards", path: "/ramadan", color: "bg-primary/10 text-primary" },
  { icon: Newspaper, title: "News", desc: "Campus updates", path: "/news", color: "bg-accent/20 text-accent-foreground" },
  { icon: Briefcase, title: "Services", desc: "University tools", path: "/services", color: "bg-primary/10 text-primary" },
  { icon: Calendar, title: "Events", desc: "Upcoming programs", path: "/events", color: "bg-accent/20 text-accent-foreground" },
  { icon: Heart, title: "Support", desc: "Donations & aid", path: "/support", color: "bg-primary/10 text-primary" },
  { icon: Bell, title: "Announcements", desc: "Latest notices", path: "/news", color: "bg-accent/20 text-accent-foreground" },
];

const announcements = [
  { title: "Ders Session: Tafsir Al-Kahf", time: "Today, 6:30 PM", type: "ders" },
  { title: "Tutoring: Calculus II — Room 302", time: "Tomorrow, 2:00 PM", type: "academic" },
  { title: "Ramadan Iftar Registration Open", time: "March 10", type: "ramadan" },
];

const Dashboard = () => {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Assalamu Alaikum, <span className="text-primary">Ahmed</span>
          </h1>
          <p className="text-muted-foreground font-body text-sm mt-1">Welcome to your community dashboard</p>
        </motion.div>

        {/* Announcements */}
        <Card className="border-accent/30 bg-accent/5">
          <CardContent className="p-4">
            <h3 className="font-display text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Bell className="h-5 w-5 text-accent" /> Latest Announcements
            </h3>
            <div className="space-y-2">
              {announcements.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-card">
                  <div>
                    <p className="font-body text-sm font-medium text-foreground">{a.title}</p>
                    <p className="font-body text-xs text-muted-foreground">{a.time}</p>
                  </div>
                  <span className="text-[10px] font-body font-semibold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {a.type}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {quickLinks.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link to={item.path}>
                <Card className="hover:shadow-emerald transition-all duration-200 hover:-translate-y-0.5 h-full">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color}`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-body text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="font-body text-[10px] text-muted-foreground">{item.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;

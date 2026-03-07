import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  BookOpen, Users, Shield, Vote, MessageCircle, Moon, Newspaper,
  GraduationCap, Heart, Briefcase, Bell, Calendar, HandHeart, Award, Zap, TrendingUp
} from "lucide-react";

const quickLinks = [
  { icon: BookOpen, title: "Resources", desc: "Qur'an & Hadith", path: "/resources", gradient: "gradient-teal" },
  { icon: GraduationCap, title: "Student", desc: "Academic hub", path: "/portal/student", gradient: "gradient-blue" },
  { icon: Shield, title: "Amirs", desc: "Leadership", path: "/portal/amirs", gradient: "gradient-green" },
  { icon: Vote, title: "Governance", desc: "Elections", path: "/governance", gradient: "gradient-purple" },
  { icon: Users, title: "Groups", desc: "Group of 14", path: "/groups", gradient: "gradient-pink" },
  { icon: MessageCircle, title: "Community", desc: "Chat", path: "/community", gradient: "gradient-teal" },
  { icon: Moon, title: "Ramadan", desc: "Tools", path: "/ramadan", gradient: "gradient-gold" },
  { icon: Newspaper, title: "News", desc: "Updates", path: "/news", gradient: "gradient-blue" },
  { icon: Briefcase, title: "Services", desc: "Tools", path: "/services", gradient: "gradient-green" },
  { icon: Calendar, title: "Events", desc: "Programs", path: "/events", gradient: "gradient-pink" },
  { icon: Heart, title: "Support", desc: "Donate", path: "/support", gradient: "gradient-purple" },
  { icon: HandHeart, title: "Khadims", desc: "Volunteer", path: "/khadims", gradient: "gradient-gold" },
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
        {/* Welcome with gamification */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Assalamu Alaikum ✨
          </h1>
          <p className="text-muted-foreground font-body text-sm mt-1">Welcome to your community dashboard</p>

          {/* XP Bar */}
          <div className="mt-3 p-3 rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-gold" />
                <span className="font-body text-xs font-semibold">Level 5 — Active Member</span>
              </div>
              <span className="font-body text-[10px] text-muted-foreground">750 / 1000 XP</span>
            </div>
            <div className="xp-bar">
              <div className="xp-bar-fill" style={{ width: '75%' }} />
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="streak-badge">🔥 7 day streak</span>
              <span className="streak-badge">📖 15 Juz read</span>
              <span className="streak-badge">🤲 30 Zikr</span>
            </div>
          </div>
        </motion.div>

        {/* Announcements */}
        <Card className="gamification-card">
          <CardContent className="p-4">
            <h3 className="font-display text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Bell className="h-5 w-5 text-accent" /> Latest Announcements
            </h3>
            <div className="space-y-2">
              {announcements.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-secondary">
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
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {quickLinks.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link to={item.path}>
                <Card className="hover:shadow-glow transition-all duration-300 hover:-translate-y-1 h-full border-0 bg-card">
                  <CardContent className="p-3 flex flex-col items-center text-center gap-1.5">
                    <div className={`w-10 h-10 rounded-xl ${item.gradient} flex items-center justify-center`}>
                      <item.icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <p className="font-body text-xs font-semibold text-foreground">{item.title}</p>
                    <p className="font-body text-[9px] text-muted-foreground leading-tight">{item.desc}</p>
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

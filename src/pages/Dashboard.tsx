import { useEffect } from "react";
import { SEO } from "@/components/SEO";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  BookOpen, Newspaper, Calendar, Moon, HandHeart, Gift, Bell, Award
} from "lucide-react";
import { OnboardingDialog } from "@/components/OnboardingDialog";

const quickLinks = [
  { icon: Newspaper, title: "News", path: "/news", gradient: "gradient-blue" },
  { icon: BookOpen, title: "Resources", path: "/resources", gradient: "gradient-teal" },
  { icon: Calendar, title: "Events", path: "/news#events", gradient: "gradient-pink" },
  { icon: Moon, title: "Ramadan", path: "/ramadan", gradient: "gradient-gold" },
  { icon: HandHeart, title: "Khadims", path: "/khadims", gradient: "gradient-green" },
  { icon: Gift, title: "Donations", path: "/donations", gradient: "gradient-purple" },
];

const announcements = [
  { title: "Ders Session: Tafsir Al-Kahf", time: "Today, 6:30 PM", type: "ders" },
  { title: "Tutoring: Calculus II — Room 302", time: "Tomorrow, 2:00 PM", type: "academic" },
  { title: "Ramadan Iftar Registration Open", time: "March 10", type: "ramadan" },
];

const Dashboard = () => {
  const { user, profile, roles } = useAuth();
  const navigate = useNavigate();
  const displayName = profile?.full_name?.split(" ")[0] || "Student";

  // Redirect to appropriate portal based on role
  useEffect(() => {
    if (roles.length > 0) {
      if (roles.includes("admin") || roles.includes("amir")) {
        navigate("/portal/amirs", { replace: true });
      } else if (roles.includes("committee")) {
        navigate("/portal/committee", { replace: true });
      } else if (roles.includes("guest")) {
        navigate("/portal/guest", { replace: true });
      } else {
        navigate("/portal/student", { replace: true });
      }
    }
  }, [roles, navigate]);

  return (
    <AppLayout>
      <SEO title="Dashboard — ASTU Muslim Jemea" description="Your personal dashboard with prayer times, announcements, and quick access to community features." path="/dashboard" />
      <OnboardingDialog />
      <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Salaam, {displayName}! ✨
          </h1>
          <p className="text-muted-foreground font-body text-sm mt-1">Redirecting to your portal...</p>
        </motion.div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {quickLinks.map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
              <Link to={item.path}>
                <Card className="hover:shadow-glow transition-all duration-300 hover:-translate-y-1 h-full border-0 bg-card">
                  <CardContent className="p-3 flex flex-col items-center text-center gap-1.5">
                    <div className={`w-10 h-10 rounded-xl ${item.gradient} flex items-center justify-center`}>
                      <item.icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <p className="font-body text-xs font-semibold text-foreground">{item.title}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

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
      </div>
    </AppLayout>
  );
};

export default Dashboard;

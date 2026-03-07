import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, BookOpen, Calendar, Heart, ArrowRight, Newspaper, Star, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const features = [
  { icon: Newspaper, title: "Public News", desc: "Read the latest announcements and updates from the community", path: "/news", gradient: "gradient-blue" },
  { icon: BookOpen, title: "Islamic Resources", desc: "Access curated Qur'an, Hadith, and Islamic learning materials", path: "/resources", gradient: "gradient-green" },
  { icon: Calendar, title: "Events Calendar", desc: "View upcoming community events and programs", path: "/events", gradient: "gradient-pink" },
  { icon: Heart, title: "Donate / Sadaqah", desc: "Support Muslim students with charitable donations", path: "/support", gradient: "gradient-gold" },
];

const impactStats = [
  { label: "Students Served", value: "500+", icon: Users },
  { label: "Events Held", value: "50+", icon: Calendar },
  { label: "Resources", value: "200+", icon: BookOpen },
];

const GuestPortal = () => {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-12 h-12 rounded-xl gradient-purple flex items-center justify-center mx-auto mb-3">
            <Globe className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Welcome, Guest!</h1>
          <p className="text-muted-foreground font-body text-sm">Explore what ASTU Muslim Jemea has to offer</p>
        </motion.div>

        {/* Impact Stats */}
        <div className="grid grid-cols-3 gap-3">
          {impactStats.map((stat) => (
            <Card key={stat.label} className="gamification-card">
              <CardContent className="p-3 text-center">
                <stat.icon className="h-6 w-6 text-primary mx-auto mb-1" />
                <p className="font-display text-xl font-bold">{stat.value}</p>
                <p className="font-body text-[10px] text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Link to={f.path}>
                <Card className="gamification-card h-full group">
                  <CardContent className="p-5">
                    <div className={`w-11 h-11 rounded-xl ${f.gradient} flex items-center justify-center mb-3`}>
                      <f.icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <h3 className="font-display text-lg font-bold mb-1 group-hover:text-primary transition-colors">{f.title}</h3>
                    <p className="text-muted-foreground font-body text-sm mb-3">{f.desc}</p>
                    <span className="font-body text-xs text-primary font-medium flex items-center gap-1">
                      Explore <ArrowRight className="h-3 w-3" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <Card className="gamification-card bg-primary/5 border-primary/20">
          <CardContent className="p-6 text-center">
            <Star className="h-10 w-10 text-primary mx-auto mb-3" />
            <h3 className="font-display text-xl font-bold mb-2">Want Full Access?</h3>
            <p className="text-muted-foreground font-body text-sm mb-4 max-w-md mx-auto">
              Register as a student member to unlock all portals, community features, and exclusive resources.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/register">Register Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default GuestPortal;

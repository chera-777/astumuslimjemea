import { AppLayout } from "@/components/layout/AppLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, BookOpen, Calendar, Heart, ArrowRight, Star, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { AuthDialog } from "@/components/AuthDialog";

const features = [
  { icon: "📖", title: "Quran", link: "/resources" },
  { icon: "📚", title: "Hadith", link: "/resources" },
  { icon: "🤲", title: "Prayer", link: "/prayer-times" },
  { icon: "🕌", title: "Khadims", link: "/khadims" },
  { icon: "🌙", title: "Ramadan", link: "/ramadan" },
  { icon: "🎓", title: "Lectures", link: "/resources" },
  { icon: "💝", title: "Donate", link: "/donations" },
  { icon: "📰", title: "News", link: "/news" },
];

const impactStats = [
  { label: "Students Served", value: "500+", icon: Users },
  { label: "Events Held", value: "50+", icon: Calendar },
  { label: "Resources", value: "200+", icon: BookOpen },
];

const GuestPortal = () => {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <AppLayout>
      <SEO title="Guest Portal | ASTU Muslim Jemea" description="Explore ASTU Muslim Jemea: prayer times, Islamic resources, events and donations." path="/portal/guest" />
      <div className="p-4 md:p-6 space-y-5 max-w-4xl mx-auto">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-14 h-14 rounded-2xl gradient-teal flex items-center justify-center mx-auto mb-3">
            <Globe className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold">Welcome, Guest!</h1>
          <p className="text-muted-foreground font-body text-sm mt-1">Explore Islamic resources & community</p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-4 gap-3">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
              <Link to={f.link}>
                <Card className="border border-border bg-card hover:shadow-glow hover:-translate-y-1 transition-all">
                  <CardContent className="p-3 flex flex-col items-center text-center gap-1">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-xl">
                      {f.icon}
                    </div>
                    <p className="font-body text-[10px] font-medium">{f.title}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Impact Stats */}
        <div className="grid grid-cols-3 gap-3">
          {impactStats.map((stat) => (
            <Card key={stat.label} className="border border-border bg-card">
              <CardContent className="p-3 text-center">
                <stat.icon className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="font-display text-xl font-bold">{stat.value}</p>
                <p className="font-body text-[10px] text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border border-border bg-card">
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 text-gold mx-auto mb-3" />
              <h3 className="font-display text-xl font-bold mb-2">Want Full Access?</h3>
              <p className="text-muted-foreground font-body text-sm mb-4">Register to unlock all portals and features</p>
              <Button
                onClick={() => setAuthOpen(true)}
                className="gradient-pink text-primary-foreground border-0 rounded-xl font-body"
              >
                Register Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} defaultMode="register" />
    </AppLayout>
  );
};

export default GuestPortal;

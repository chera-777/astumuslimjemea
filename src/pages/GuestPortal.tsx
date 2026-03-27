import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, BookOpen, Calendar, Heart, ArrowRight, Newspaper, Star, Users, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { AuthDialog } from "@/components/AuthDialog";

const features = [
  { icon: "📖", title: "Quran Study", gradient: "gradient-green" },
  { icon: "📚", title: "Hadith", gradient: "gradient-blue" },
  { icon: "🤲", title: "Prayer", gradient: "gradient-teal" },
  { icon: "🕌", title: "Events", gradient: "gradient-pink" },
  { icon: "🌙", title: "Mority", gradient: "gradient-gold" },
  { icon: "🏛️", title: "Islamic History", gradient: "gradient-purple" },
  { icon: "🎓", title: "Lectures", gradient: "gradient-blue" },
  { icon: "🌍", title: "Community", gradient: "gradient-green" },
];

const impactStats = [
  { label: "Students Served", value: "500+", icon: Users },
  { label: "Events Held", value: "50+", icon: Calendar },
  { label: "Resources", value: "200+", icon: BookOpen },
];

const GuestPortal = () => {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{
      background: "linear-gradient(180deg, hsl(220, 40%, 12%) 0%, hsl(215, 50%, 18%) 40%, hsl(210, 45%, 25%) 70%, hsl(200, 35%, 30%) 100%)"
    }}>
      {/* Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 25 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 40}%`,
              opacity: Math.random() * 0.5 + 0.2,
            }}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: Math.random() * 3 + 2, repeat: Infinity }}
          />
        ))}
      </div>

      <div className="relative z-10 p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center pt-6">
          <h1 className="font-display text-3xl font-bold text-white">Welcome to</h1>
          <h2 className="font-display text-2xl font-bold text-gold">Amir Home!</h2>
          <p className="text-white/60 font-body text-sm mt-2">Explore Your Resources & Goals</p>
        </motion.div>

        {/* Feature Icons Grid */}
        <div className="grid grid-cols-4 gap-3">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
              <Card className="border-0 bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                <CardContent className="p-3 flex flex-col items-center text-center gap-1">
                  <div className={`w-12 h-12 rounded-xl ${f.gradient} flex items-center justify-center text-xl`}>
                    {f.icon}
                  </div>
                  <p className="font-body text-[10px] font-medium text-white/80">{f.title}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Impact Stats */}
        <div className="grid grid-cols-3 gap-3">
          {impactStats.map((stat) => (
            <Card key={stat.label} className="border-0 bg-white/5">
              <CardContent className="p-3 text-center">
                <stat.icon className="h-5 w-5 text-gold mx-auto mb-1" />
                <p className="font-display text-xl font-bold text-white">{stat.value}</p>
                <p className="font-body text-[10px] text-white/50">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-0 bg-white/5 backdrop-blur">
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 text-gold mx-auto mb-3" />
              <h3 className="font-display text-xl font-bold text-white mb-2">Want Full Access?</h3>
              <p className="text-white/50 font-body text-sm mb-4">Register to unlock all portals and features</p>
              <Button
                onClick={() => setAuthOpen(true)}
                className="gradient-pink text-white border-0 rounded-xl font-body"
              >
                Register Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <div className="text-center pb-6">
          <Button variant="outline" size="sm" className="border-white/20 text-white/60 hover:text-white hover:bg-white/10 rounded-xl font-body">
            Back
          </Button>
        </div>
      </div>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} defaultMode="register" />
    </div>
  );
};

export default GuestPortal;

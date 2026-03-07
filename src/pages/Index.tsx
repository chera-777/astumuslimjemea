import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { AuthDialog } from "@/components/AuthDialog";
import {
  Moon, Star, ArrowRight, BookOpen, Users, Shield, Heart,
  Sparkles, GraduationCap, Globe
} from "lucide-react";

const highlights = [
  { icon: BookOpen, label: "Resources", gradient: "gradient-teal" },
  { icon: Users, label: "Community", gradient: "gradient-blue" },
  { icon: Shield, label: "Portals", gradient: "gradient-green" },
  { icon: Moon, label: "Ramadan", gradient: "gradient-gold" },
  { icon: Heart, label: "Support", gradient: "gradient-pink" },
  { icon: GraduationCap, label: "Study", gradient: "gradient-purple" },
];

const Index = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"register" | "signin">("register");
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const openRegister = () => { setAuthMode("register"); setAuthOpen(true); };
  const openSignIn = () => { setAuthMode("signin"); setAuthOpen(true); };
  const openGuest = () => { setAuthMode("register"); setAuthOpen(true); };

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col relative">
      {/* Full-screen hero */}
      <div className="flex-1 relative flex flex-col">
        <div className="absolute inset-0 gradient-hero opacity-95" />
        <div className="absolute inset-0 islamic-pattern opacity-20" />

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl gradient-pink flex items-center justify-center">
              <Moon className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-primary-foreground">ASTU MSJ</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={openSignIn}
            className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 font-body text-sm"
          >
            Sign In
          </Button>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-gold" />
              <span className="text-gold font-body text-xs font-semibold tracking-widest uppercase">
                بسم الله الرحمن الرحيم
              </span>
              <Sparkles className="h-4 w-4 text-gold" />
            </div>

            <h1 className="font-display text-4xl md:text-6xl font-bold text-primary-foreground leading-tight mb-3">
              ASTU Muslim<br /><span className="text-gold">Jemea</span>
            </h1>

            <p className="font-body text-primary-foreground/75 text-sm md:text-base max-w-md mx-auto mb-8 leading-relaxed">
              Strengthening the academic, spiritual, and social life of Muslim students at Ethiopian universities.
            </p>

            {/* Highlight icons row */}
            <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
              {highlights.map((h, i) => (
                <motion.div
                  key={h.label}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex flex-col items-center gap-1"
                >
                  <div className={`w-10 h-10 rounded-xl ${h.gradient} flex items-center justify-center`}>
                    <h.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="text-primary-foreground/60 font-body text-[10px] font-medium">{h.label}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
              <Button
                size="lg"
                onClick={openRegister}
                className="flex-1 gradient-pink text-primary-foreground border-0 shadow-pink hover:opacity-90 font-body"
              >
                Join the Community <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={openGuest}
                className="flex-1 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground font-body"
              >
                <Globe className="mr-2 h-4 w-4" /> Explore as Guest
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Bottom tagline */}
        <div className="relative z-10 text-center pb-6">
          <p className="text-primary-foreground/40 font-body text-xs">
            Built on Islamic values • <Star className="h-3 w-3 inline text-gold" /> Strengthening community
          </p>
        </div>
      </div>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} defaultMode={authMode} />
    </div>
  );
};

export default Index;

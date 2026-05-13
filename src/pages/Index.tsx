import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { AuthDialog } from "@/components/AuthDialog";
import { Moon, Star, Sparkles } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useEffect } from "react";

const Index = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"register" | "signin">("register");
  const [logoClicks, setLogoClicks] = useState(0);
  const [showAdminReg, setShowAdminReg] = useState(false);
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      // Route to role-specific portal
      if (roles.includes("admin") || roles.includes("amir")) {
        navigate("/portal/amirs");
      } else if (roles.includes("committee")) {
        navigate("/portal/committee");
      } else if (roles.includes("guest")) {
        navigate("/portal/guest");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, roles, loading, navigate]);

  const handleLogoClick = () => {
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    if (newCount >= 5) {
      setShowAdminReg(true);
      setLogoClicks(0);
    }
    // Reset after 3 seconds of no clicking
    setTimeout(() => setLogoClicks(0), 3000);
  };

  const openRegister = () => { setAuthMode("register"); setAuthOpen(true); };
  const openSignIn = () => { setAuthMode("signin"); setAuthOpen(true); };

  return (
    <>
    <SEO
      title="ASTU Muslim Jemea — Learn, Engage & Grow in Faith"
      description="ASTU Muslim Jemea connects students with prayer times, Quran, Hadith, lectures, donations, Khadims and community portals — all in one place."
      path="/"
    />
    <div className="h-screen overflow-hidden flex flex-col relative" style={{
      background: "linear-gradient(180deg, hsl(220, 40%, 12%) 0%, hsl(215, 50%, 18%) 40%, hsl(210, 45%, 25%) 70%, hsl(200, 35%, 30%) 100%)"
    }}>
      {/* Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
      </div>

      {/* Mosque silhouette */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1200 300" className="w-full" preserveAspectRatio="xMidYMax meet" style={{ opacity: 0.15 }}>
          <defs>
            <linearGradient id="mosqueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(168, 65%, 35%)" />
              <stop offset="100%" stopColor="hsl(220, 40%, 12%)" />
            </linearGradient>
          </defs>
          {/* Central dome */}
          <ellipse cx="600" cy="180" rx="120" ry="100" fill="url(#mosqueGrad)" />
          {/* Minarets */}
          <rect x="400" y="100" width="20" height="200" rx="4" fill="url(#mosqueGrad)" />
          <ellipse cx="410" cy="100" rx="14" ry="20" fill="url(#mosqueGrad)" />
          <rect x="780" y="100" width="20" height="200" rx="4" fill="url(#mosqueGrad)" />
          <ellipse cx="790" cy="100" rx="14" ry="20" fill="url(#mosqueGrad)" />
          {/* Base */}
          <rect x="350" y="200" width="500" height="100" fill="url(#mosqueGrad)" />
          {/* Side domes */}
          <ellipse cx="450" cy="190" rx="50" ry="40" fill="url(#mosqueGrad)" />
          <ellipse cx="750" cy="190" rx="50" ry="40" fill="url(#mosqueGrad)" />
        </svg>
      </div>

      {/* Crescent moon */}
      <motion.div
        className="absolute top-8 right-12 md:right-24"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        <div className="relative">
          <Moon className="h-16 w-16 md:h-20 md:w-20 text-gold fill-gold/30" />
          <Sparkles className="absolute -top-2 -left-3 h-4 w-4 text-gold/70" />
          <Sparkles className="absolute -bottom-1 -right-2 h-3 w-3 text-gold/50" />
        </div>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md"
        >
          {/* Logo (5-click for admin) */}
          <button
            onClick={handleLogoClick}
            className="mx-auto mb-6 focus:outline-none"
            aria-label="ASTU Muslim Jemea logo (tap 5 times for admin registration)"
          >
            <div className="w-16 h-16 rounded-2xl gradient-teal flex items-center justify-center shadow-glow">
              <Moon className="h-8 w-8 text-primary-foreground" aria-hidden="true" />
            </div>
          </button>

          <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight mb-2">
            Welcome to <span className="text-gold">ASTU Muslim Jemea</span> — Learn, Engage &amp; Grow in Faith
          </h1>

          <p className="font-body text-white/60 text-sm md:text-base mb-10 leading-relaxed">
            Learn, Engage & Grow in Faith
          </p>

          {/* CTA Buttons */}
          <div className="space-y-3 max-w-xs mx-auto">
            <Button
              size="lg"
              onClick={openRegister}
              className="w-full h-12 gradient-pink text-white border-0 shadow-pink hover:opacity-90 font-body text-base font-semibold rounded-xl"
            >
              Get Started
            </Button>
            <button
              onClick={openSignIn}
              className="w-full text-white/70 hover:text-white font-body text-sm font-medium transition-colors py-2"
            >
              Login
            </button>
          </div>

          {/* Hidden admin registration */}
          {showAdminReg && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setAuthMode("register");
                  setAuthOpen(true);
                }}
                className="border-gold/30 text-gold hover:bg-gold/10 font-body text-xs"
              >
                <Star className="mr-1 h-3 w-3" /> Admin / Committee Registration
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Bottom tagline */}
      <div className="relative z-10 text-center pb-6">
        <p className="text-white/30 font-body text-xs flex items-center justify-center gap-2">
          بسم الله الرحمن الرحيم <Star className="h-3 w-3 text-gold/50" />
        </p>
      </div>

      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        defaultMode={authMode}
        showAdminOption={showAdminReg}
      />
    </div>
    </>
  );
};

export default Index;

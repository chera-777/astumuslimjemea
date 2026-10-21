import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { AuthDialog } from "@/components/AuthDialog";
import { Star } from "lucide-react";
import { NatureScreen, NatureHeader } from "@/components/auth/NatureShell";
import logo from "@/assets/logo-leaf.png";
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
    <NatureScreen>
      <div className="flex-1 flex flex-col">
        <div className="pt-10">
          <NatureHeader
            title="Welcome"
            subtitle="Learn, engage & grow in faith with ASTU Muslim Jemea"
            onLogoClick={handleLogoClick}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex-1 flex items-center justify-center py-8"
        >
          <div className="relative h-56 w-56 rounded-full flex items-center justify-center" style={{ background: "radial-gradient(circle, hsl(110 50% 90%), hsl(120 30% 97% / 0))" }}>
            <img src={logo} alt="" aria-hidden="true" className="h-40 w-40 object-contain drop-shadow-xl" />
          </div>
        </motion.div>

        <div className="space-y-3 pb-4">
          <button onClick={openRegister} className="nature-btn">Get Started</button>
          <p className="nature-muted text-center text-sm">
            Already have an account?{" "}
            <button onClick={openSignIn} className="nature-link hover:underline">Log in</button>
          </p>

          {showAdminReg && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <button onClick={openRegister} className="nature-link text-xs inline-flex items-center gap-1">
                <Star className="h-3 w-3" /> Admin / Committee Registration
              </button>
            </motion.div>
          )}
          <p className="nature-muted text-center text-xs pt-2">بسم الله الرحمن الرحيم</p>
        </div>
      </div>


      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        defaultMode={authMode}
        showAdminOption={showAdminReg}
      />
    </NatureScreen>
    </>
  );
};

export default Index;

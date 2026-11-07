import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { AuthDialog } from "@/components/AuthDialog";
import { StaffAuthDialog } from "@/components/auth/StaffAuthDialog";
import { portalHome } from "@/lib/portalAccess";
import { NatureScreen, NatureHeader } from "@/components/auth/NatureShell";
import logo from "@/assets/logo-leaf.svg";
import { SEO } from "@/components/SEO";
import { useEffect } from "react";

const Index = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"register" | "signin">("register");
  const [logoClicks, setLogoClicks] = useState(0);
  const [staffOpen, setStaffOpen] = useState(false);
  const clickTimer = useRef<ReturnType<typeof setTimeout>>();
  const { user, roles, loading, authError, retryAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !authError && user && !staffOpen) {
      navigate(portalHome(roles), { replace: true });
    }
  }, [user, roles, loading, authError, staffOpen, navigate]);

  useEffect(() => () => clearTimeout(clickTimer.current), []);

  const handleLogoClick = () => {
    clearTimeout(clickTimer.current);
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    if (newCount === 5) {
      setAuthOpen(false);
      setStaffOpen(true);
      setLogoClicks(0);
    }
    // Reset after 3 seconds of no clicking
    clickTimer.current = setTimeout(() => setLogoClicks(0), 3000);
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
          <Button onClick={openRegister} className="nature-btn border-0">Get Started</Button>
          <p className="nature-muted text-center text-sm">
            Already have an account?{" "}
            <Button variant="link" onClick={openSignIn} className="nature-link h-auto p-0">Log in</Button>
          </p>

          {authError && <div role="alert" className="text-center text-sm text-destructive"><p>{authError}</p><Button variant="link" onClick={() => void retryAuth()}>Try again</Button></div>}
          <p className="nature-muted text-center text-xs pt-2">بسم الله الرحمن الرحيم</p>
        </div>
      </div>


      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        defaultMode={authMode}
      />
      <StaffAuthDialog open={staffOpen} onOpenChange={setStaffOpen} />
    </NatureScreen>
    </>
  );
};

export default Index;

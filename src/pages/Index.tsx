import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { AuthDialog } from "@/components/AuthDialog";
import { StaffAuthDialog } from "@/components/auth/StaffAuthDialog";
import { portalHome } from "@/lib/portalAccess";
import { NatureScreen } from "@/components/auth/NatureShell";
import logo from "@/assets/logo-leaf.png";
import mosqueHero from "@/assets/mosque-hero.jpg";
import { SEO } from "@/components/SEO";
import { ArrowRight, BookOpen, Calendar, PhoneCall, ShieldCheck } from "lucide-react";

const capabilities = [
  {
    num: "01",
    icon: BookOpen,
    title: "Quran, Tafsir & Halaqa Circles",
    summary:
      "Join department and batch study circles, track daily Surah and Juz goals, and access authentic Hadith and Dua collections offline or on campus.",
    detail: "Structured weekly sessions · Offline-ready reader",
    span: "md:col-span-2",
  },
  {
    num: "02",
    icon: Calendar,
    title: "Campus Prayer Times & Adhan",
    summary:
      "Follow Adama campus timings synced with full-screen Adhan alerts and Ramadan suhoor/iftar countdowns.",
    detail: "Adama Science & Technology University coordinates",
    span: "md:col-span-1",
  },
  {
    num: "03",
    icon: PhoneCall,
    title: "Real-Time Messaging & Dedicated Calls",
    summary:
      "Message peers, department groups, and channels with instant receipts, or launch full-screen voice and video calls on dedicated routes.",
    detail: "1:1 voice & video · Group rooms · Channel broadcasts",
    span: "md:col-span-1",
  },
  {
    num: "04",
    icon: ShieldCheck,
    title: "Two-Layer ASTU Student Verification",
    summary:
      "Verify your student status via smart ASTU portal name matching without sharing passwords, or submit your physical student ID card for Jemea review.",
    detail: "Automated lookup + private ID storage review",
    span: "md:col-span-2",
  },
];

const campusHighlights = [
  { value: "5 Daily", label: "Adama Prayer Alerts" },
  { value: "1:1 & Group", label: "Voice & Video Calling" },
  { value: "2-Layer", label: "ASTU Student Check" },
  { value: "4 Portals", label: "Students, Amirs & Khadims" },
];

const Index = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"register" | "signin">("register");
  const [logoClicks, setLogoClicks] = useState(0);
  const [staffOpen, setStaffOpen] = useState(false);
  const clickTimer = useRef<ReturnType<typeof setTimeout>>();
  const { user, roles, loading, authError, oauthError, clearOAuthError, retryAuth } = useAuth();
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
    clickTimer.current = setTimeout(() => setLogoClicks(0), 3000);
  };

  const openRegister = () => {
    clearOAuthError();
    setAuthMode("register");
    setAuthOpen(true);
  };
  const openSignIn = () => {
    clearOAuthError();
    setAuthMode("signin");
    setAuthOpen(true);
  };

  return (
    <>
      <SEO
        title="ASTU Muslim Jemea — Learn, Engage & Grow in Faith"
        description="ASTU Muslim Jemea connects students with prayer times, Quran, Hadith, lectures, donations, Khadims and community portals — all in one place."
        path="/"
      />
      <NatureScreen containerClassName="max-w-6xl px-5 sm:px-8 py-5 sm:py-7 justify-between gap-8 sm:gap-10">
        {/* Clean 3-Zone Top Bar */}
        <header className="flex items-center justify-between gap-6 pb-4 border-b border-[hsl(var(--nature-line))]">
          <button
            type="button"
            onClick={handleLogoClick}
            aria-label="ASTU Muslim Jemea logo"
            className="flex items-center gap-2.5 text-left focus:outline-none whitespace-nowrap shrink-0"
          >
            <img src={logo} alt="" width={40} height={40} className="h-9 w-9 sm:h-10 sm:w-10 object-contain" />
            <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-[hsl(var(--nature-ink))]">
              ASTU Muslim Jemea
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-6 text-sm font-body font-medium text-[hsl(var(--nature-muted))]">
            <a href="#features" className="hover:text-[hsl(var(--nature-ink))] transition-colors whitespace-nowrap shrink-0">
              Platform
            </a>
            <a href="#campus-hub" className="hover:text-[hsl(var(--nature-ink))] transition-colors whitespace-nowrap shrink-0">
              Campus Hub
            </a>
            <a href="#verification" className="hover:text-[hsl(var(--nature-ink))] transition-colors whitespace-nowrap shrink-0">
              Verification
            </a>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openSignIn}
              className="h-9 px-4 rounded-xl border-[hsl(var(--nature-line))] bg-white/85 hover:bg-white text-[hsl(var(--nature-ink))] font-body text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0"
            >
              Log In
            </Button>
          </div>
        </header>

        {/* Main Hero Split */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch"
        >
          <div className="lg:col-span-7 flex flex-col justify-center space-y-5 text-center lg:text-left">
            <p className="font-body text-xs sm:text-sm font-semibold tracking-wide text-[hsl(var(--nature-leaf))]">
              Adama Science &amp; Technology University · Student Jemea Portal
            </p>

            <h1 className="font-display text-3xl sm:text-5xl lg:text-[3.35rem] font-bold tracking-tight leading-[1.08] text-[hsl(var(--nature-ink))] [text-wrap:balance]">
              Learn, Connect &amp; Serve Together on Campus.
            </h1>

            <p className="font-body text-sm sm:text-base text-[hsl(var(--nature-muted))] leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Your unified spiritual and academic companion at ASTU: Adama prayer timetables, Quran study circles, real-time messaging with voice and video calls, Khadim volunteer shifts, and two-layer student verification.
            </p>

            {oauthError && (
              <div
                role="alert"
                className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-center text-xs text-destructive space-y-1"
              >
                <p>{oauthError}</p>
                <Button
                  type="button"
                  variant="link"
                  onClick={clearOAuthError}
                  className="h-auto p-0 text-xs text-destructive underline"
                >
                  Dismiss
                </Button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
              <Button
                type="button"
                onClick={openRegister}
                className="nature-btn w-full sm:w-auto px-7 h-12 text-sm sm:text-base font-semibold whitespace-nowrap shrink-0 inline-flex items-center justify-center gap-2"
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                onClick={openSignIn}
                variant="outline"
                className="w-full sm:w-auto px-6 h-12 rounded-xl border-[hsl(var(--nature-line))] bg-white/80 hover:bg-white text-[hsl(var(--nature-ink))] text-sm sm:text-base font-semibold whitespace-nowrap shrink-0"
              >
                Log In to Account
              </Button>
            </div>

            {authError && (
              <div role="alert" className="text-center lg:text-left text-sm text-destructive space-x-2">
                <span>{authError}</span>
                <Button variant="link" onClick={() => void retryAuth()} className="p-0 h-auto">
                  Try again
                </Button>
              </div>
            )}
          </div>

          {/* Right Editorial Visual */}
          <div id="campus-hub" className="lg:col-span-5 flex">
            <div className="relative w-full min-h-[290px] lg:min-h-[380px] rounded-2xl overflow-hidden border border-[hsl(var(--nature-line))] shadow-xl bg-slate-900 group">
              <img
                src={mosqueHero}
                alt="ASTU Campus Mosque"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 via-45% to-slate-950/15 flex flex-col justify-end p-6 text-left">
                <p className="font-body text-xs font-medium text-emerald-200">
                  ASTU Main Campus · Adama, Ethiopia
                </p>
                <h2 className="font-display text-2xl font-bold text-white mt-1">
                  Masjid &amp; Student Hub
                </h2>
                <p className="font-body text-xs text-slate-100/95 mt-1.5 leading-relaxed">
                  Daily Jama’ah prayer alerts, department Halaqas, Amir coordination, and transparent campus aid campaigns.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Full-Width Campus Summary Strip */}
        <section
          aria-label="Platform highlights"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 py-4 px-5 rounded-2xl border border-[hsl(var(--nature-line))] bg-white/80"
        >
          {campusHighlights.map((item) => (
            <div key={item.label} className="space-y-0.5 text-left">
              <p className="font-display text-xl sm:text-2xl font-bold text-[hsl(var(--nature-ink))] tabular-nums">
                {item.value}
              </p>
              <p className="font-body text-xs text-[hsl(var(--nature-muted))]">{item.label}</p>
            </div>
          ))}
        </section>

        {/* Asymmetric Capabilities Bento */}
        <section id="features" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[hsl(var(--nature-ink))]">
                Built for Daily Student Life at ASTU
              </h2>
              <p className="font-body text-sm text-[hsl(var(--nature-muted))] mt-1">
                Every core pillar — worship, study, real-time communication, and campus trust — in one place.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {capabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <article
                  id={cap.num === "04" ? "verification" : undefined}
                  key={cap.num}
                  className={`rounded-2xl border border-[hsl(var(--nature-line))] bg-white/85 p-5 sm:p-6 flex flex-col justify-between gap-4 hover:border-[hsl(var(--nature-leaf))] transition-colors ${cap.span}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-body text-xs font-semibold text-[hsl(var(--nature-leaf))] tabular-nums">
                        {cap.num}. Campus Pillar
                      </span>
                      <Icon className="h-4 w-4 text-[hsl(var(--nature-leaf))] shrink-0" aria-hidden="true" />
                    </div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-[hsl(var(--nature-ink))] leading-snug">
                      {cap.title}
                    </h3>
                    <p className="font-body text-xs sm:text-sm text-[hsl(var(--nature-muted))] leading-relaxed">
                      {cap.summary}
                    </p>
                  </div>
                  <p className="font-body text-xs font-medium text-[hsl(var(--nature-ink))] pt-3 border-t border-[hsl(var(--nature-line))]">
                    {cap.detail}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Quiet Footer */}
        <footer className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t border-[hsl(var(--nature-line))] text-xs font-body text-[hsl(var(--nature-muted))]">
          <span>بسم الله الرحمن الرحيم · ASTU Muslim Jemea</span>
          <span>Adama Science and Technology University</span>
        </footer>

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

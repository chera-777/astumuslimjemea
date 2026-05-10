import {
  Home, MessageCircle, User, Plus, X,
  Newspaper, Bell, Heart, Calendar, Trophy, GraduationCap,
  Building2, Users, Vote, HandHeart, Library, Shield,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

// 10 quick-access actions arranged in a circular/radial fan above the FAB
const quickActions = [
  { label: "News",         icon: Newspaper,    path: "/news",         color: "from-purple-500 to-fuchsia-500" },
  { label: "Adhan",        icon: Bell,         path: "/azan",         color: "from-yellow-400 to-amber-500" },
  { label: "Khadim",       icon: Shield,       path: "/khadims",      color: "from-amber-500 to-orange-600" },
  { label: "Donations",    icon: Heart,        path: "/donations",    color: "from-red-500 to-rose-600" },
  { label: "Prayers",      icon: HandHeart,    path: "/prayer-times", color: "from-orange-400 to-red-500" },
  { label: "Challenges",   icon: Trophy,       path: "/challenges",   color: "from-cyan-400 to-blue-500" },
  { label: "University",   icon: Building2,    path: "/services",     color: "from-amber-700 to-yellow-700" },
  { label: "Academic",     icon: GraduationCap,path: "/academic",     color: "from-indigo-500 to-blue-600" },
  { label: "Group prayers",icon: Users,        path: "/groups",       color: "from-blue-500 to-sky-500" },
  { label: "Governance",   icon: Vote,         path: "/governance",   color: "from-violet-500 to-purple-600" },
];

function RadialMenu({ onClose, originRight = false }: { onClose: () => void; originRight?: boolean }) {
  const isMobile = useIsMobile();
  const total = quickActions.length;

  // Compute viewport-aware radius so icons never overflow.
  // We use a half-circle arc (180°) above the FAB for centered (mobile) layouts,
  // and a quarter+ arc tucked into the upper-left for the desktop corner FAB.
  const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
  const vh = typeof window !== "undefined" ? window.innerHeight : 768;

  let startDeg: number, endDeg: number, radius: number;

  if (originRight) {
    // Desktop FAB anchored at bottom-right. Fan strictly into the upper-left
    // quadrant (90° → 180°) so no icon ever drops below the anchor and clips
    // the bottom of the viewport.
    startDeg = 90;
    endDeg = 180;
    const maxR = Math.min(vw - 120, vh - 140, 320);
    radius = Math.max(180, maxR);
  } else {
    // Centered above bottom nav. 180° arc keeps every icon strictly above the FAB.
    startDeg = 180;
    endDeg = 0;
    // Constrain by viewport width so end-icons don't get clipped. Min radius
    // is large enough that adjacent icons (44px) keep a comfortable gap.
    const safeR = Math.min((vw - 90) / 2, vh - 220, isMobile ? 150 : 220);
    radius = Math.max(130, safeR);
  }

  const stepDeg = (startDeg - endDeg) / (total - 1);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-background/85 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Anchor sits where the FAB is */}
      <div
        role="menu"
        aria-label="Quick navigation"
        className={cn(
          "fixed z-50 pointer-events-none",
          originRight
            ? "bottom-12 right-12"
            : "left-1/2 -translate-x-1/2 bottom-20"
        )}
      >
        <div className="relative">
          {quickActions.map((a, i) => {
            const deg = startDeg - stepDeg * i;
            const rad = (deg * Math.PI) / 180;
            const x = Math.cos(rad) * radius;
            const y = -Math.sin(rad) * radius;
            return (
              <motion.div
                key={a.label}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0.3 }}
                animate={{ opacity: 1, x, y, scale: 1 }}
                exit={{ opacity: 0, x: 0, y: 0, scale: 0.3 }}
                transition={{ type: "spring", stiffness: 260, damping: 22, delay: i * 0.025 }}
                className="absolute pointer-events-auto"
                style={{ left: 0, top: 0 }}
              >
                <Link
                  to={a.path}
                  onClick={onClose}
                  role="menuitem"
                  aria-label={a.label}
                  title={a.label}
                  className="group relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
                  style={{ minWidth: 44, minHeight: 44 }}
                >
                  {/* Label sits clearly above the icon, never overlapping it */}
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-body text-[10px] md:text-xs text-foreground/90 whitespace-nowrap drop-shadow pointer-events-none">
                    {a.label}
                  </span>
                  <div
                    className={cn(
                      "w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white shadow-lg ring-2 ring-background/60 bg-gradient-to-br group-hover:scale-110 transition-transform",
                      a.color
                    )}
                  >
                    <a.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export function BottomNav() {
  const location = useLocation();
  const [showActions, setShowActions] = useState(false);
  const { roles } = useAuth();

  if (location.pathname === "/community" && location.hash === "#chat") return null;

  const homePath = roles.includes("admin") || roles.includes("amir")
    ? "/portal/amirs"
    : roles.includes("committee")
    ? "/portal/committee"
    : roles.includes("guest")
    ? "/portal/guest"
    : "/portal/student";

  const navItems = [
    { icon: Home, label: "Home", path: homePath },
    { icon: Library, label: "Resources", path: "/resources" },
    { icon: MessageCircle, label: "Community", path: "/community" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <>
      <AnimatePresence>
        {showActions && <RadialMenu onClose={() => setShowActions(false)} />}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-pb">
        <div className="flex items-center h-16 px-1">
          {navItems.slice(0, 2).map((item) => {
            const active = location.pathname === item.path || (item.path !== homePath && location.pathname.startsWith(item.path));
            return (
              <Link key={item.path} to={item.path}
                className={cn("flex-1 flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl transition-all",
                  active ? "text-primary" : "text-muted-foreground")}>
                <item.icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
                <span className="text-[10px] font-body font-medium">{item.label}</span>
              </Link>
            );
          })}

          <div className="flex-1 flex items-center justify-center">
            <button
              onClick={() => setShowActions(!showActions)}
              className={cn(
                "relative -mt-7 flex items-center justify-center w-14 h-14 rounded-full shadow-glow transition-all",
                showActions ? "bg-pink-500 rotate-45" : "gradient-pink"
              )}
              aria-label="Quick menu"
            >
              {showActions ? <X className="h-6 w-6 text-primary-foreground" /> : <Plus className="h-6 w-6 text-primary-foreground" />}
            </button>
          </div>

          {navItems.slice(2).map((item) => {
            const active = location.pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path}
                className={cn("flex-1 flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl transition-all",
                  active ? "text-primary" : "text-muted-foreground")}>
                <item.icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
                <span className="text-[10px] font-body font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

/** Floating Action Button for desktop / sidebar layouts. Mounted in AppLayout. */
export function DesktopFAB() {
  const isMobile = useIsMobile();
  const [showActions, setShowActions] = useState(false);
  const location = useLocation();
  if (isMobile) return null;
  if (location.pathname === "/community" && location.hash === "#chat") return null;

  return (
    <>
      <AnimatePresence>
        {showActions && <RadialMenu onClose={() => setShowActions(false)} originRight />}
      </AnimatePresence>
      <button
        onClick={() => setShowActions(!showActions)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-glow flex items-center justify-center transition-all",
          showActions ? "bg-pink-500 rotate-45" : "gradient-pink"
        )}
        aria-label="Quick menu"
      >
        {showActions ? <X className="h-6 w-6 text-primary-foreground" /> : <Plus className="h-6 w-6 text-primary-foreground" />}
      </button>
    </>
  );
}

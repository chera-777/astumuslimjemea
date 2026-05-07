import {
  Home, BookOpen, MessageCircle, User, Plus,
  Newspaper, Bell, Heart, Calendar, Trophy, GraduationCap,
  Building2, Users, Vote, HandHeart, Library, X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

// 12 quick-access actions in a clean grid
const quickActions = [
  { label: "News", icon: Newspaper, path: "/news", color: "from-purple-500 to-fuchsia-500" },
  { label: "Adhan", icon: Bell, path: "/azan", color: "from-yellow-400 to-amber-500" },
  { label: "Khadims", icon: HandHeart, path: "/khadims", color: "from-amber-500 to-orange-600" },
  { label: "Events", icon: Calendar, path: "/events", color: "from-pink-500 to-rose-500" },
  { label: "Donations", icon: Heart, path: "/donations", color: "from-red-500 to-rose-600" },
  { label: "Prayers", icon: HandHeart, path: "/prayer-times", color: "from-orange-400 to-red-500" },
  { label: "Challenges", icon: Trophy, path: "/challenges", color: "from-cyan-400 to-blue-500" },
  { label: "Services", icon: Building2, path: "/services", color: "from-amber-700 to-yellow-700" },
  { label: "Charity", icon: HandHeart, path: "/charity", color: "from-green-500 to-emerald-500" },
  { label: "Academic", icon: GraduationCap, path: "/academic", color: "from-indigo-500 to-blue-600" },
  { label: "Groups", icon: Users, path: "/groups", color: "from-blue-500 to-sky-500" },
  { label: "Vote", icon: Vote, path: "/governance", color: "from-violet-500 to-purple-600" },
];

function QuickMenu({ onClose }: { onClose: () => void }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-background/80 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.92 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 md:bottom-24 md:right-6 md:left-auto md:translate-x-0 z-50 w-[calc(100vw-2rem)] max-w-[360px] rounded-3xl border border-border bg-card/95 backdrop-blur-xl shadow-glow p-4"
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="font-display text-sm font-bold">Quick Actions</p>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          {quickActions.map((a, i) => (
            <motion.div
              key={a.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.025 }}
            >
              <Link
                to={a.path}
                onClick={onClose}
                className="flex flex-col items-center gap-1.5 py-1 group"
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform bg-gradient-to-br",
                  a.color
                )}>
                  <a.icon className="h-5 w-5" />
                </div>
                <span className="font-body text-[10px] text-foreground/90 text-center leading-tight font-medium">
                  {a.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
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
        {showActions && <QuickMenu onClose={() => setShowActions(false)} />}
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
              <Plus className="h-6 w-6 text-primary-foreground" />
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
        {showActions && <QuickMenu onClose={() => setShowActions(false)} />}
      </AnimatePresence>
      <button
        onClick={() => setShowActions(!showActions)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-glow flex items-center justify-center transition-all",
          showActions ? "bg-pink-500 rotate-45" : "gradient-pink"
        )}
        aria-label="Quick menu"
      >
        <Plus className="h-6 w-6 text-primary-foreground" />
      </button>
    </>
  );
}

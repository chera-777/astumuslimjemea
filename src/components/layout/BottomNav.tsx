import {
  Home, BookOpen, MessageCircle, User, Plus,
  Newspaper, Bell, Heart, Calendar, Trophy, GraduationCap,
  Building2, Users, Vote, HandHeart, Library,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

// 12 quick-access actions arranged radially around the FAB
const radialActions = [
  { label: "News", icon: Newspaper, path: "/news", color: "bg-purple-500", glow: "shadow-[0_0_18px_hsl(270_60%_55%/0.6)]" },
  { label: "Adhan", icon: Bell, path: "/azan", color: "bg-yellow-500", glow: "shadow-[0_0_18px_hsl(42_85%_55%/0.6)]" },
  { label: "Khadim", icon: HandHeart, path: "/khadims", color: "bg-amber-600", glow: "shadow-[0_0_18px_hsl(30_75%_50%/0.6)]" },
  { label: "Event", icon: Calendar, path: "/events", color: "bg-pink-500", glow: "shadow-[0_0_18px_hsl(340_75%_55%/0.6)]" },
  { label: "Donations", icon: Heart, path: "/donations", color: "bg-red-500", glow: "shadow-[0_0_18px_hsl(0_75%_55%/0.6)]" },
  { label: "Prayers", icon: HandHeart, path: "/prayer-times", color: "bg-orange-500", glow: "shadow-[0_0_18px_hsl(20_75%_55%/0.6)]" },
  { label: "Challenges", icon: Trophy, path: "/challenges", color: "bg-cyan-500", glow: "shadow-[0_0_18px_hsl(190_75%_50%/0.6)]" },
  { label: "University", icon: Building2, path: "/services", color: "bg-amber-700", glow: "shadow-[0_0_18px_hsl(30_60%_45%/0.6)]" },
  { label: "Charity", icon: HandHeart, path: "/charity", color: "bg-green-500", glow: "shadow-[0_0_18px_hsl(145_60%_45%/0.6)]" },
  { label: "Academic", icon: GraduationCap, path: "/academic", color: "bg-indigo-500", glow: "shadow-[0_0_18px_hsl(240_60%_55%/0.6)]" },
  { label: "Group prayers", icon: Users, path: "/groups", color: "bg-blue-500", glow: "shadow-[0_0_18px_hsl(215_80%_55%/0.6)]" },
  { label: "Governance", icon: Vote, path: "/governance", color: "bg-violet-500", glow: "shadow-[0_0_18px_hsl(260_60%_55%/0.6)]" },
];

export function BottomNav() {
  const location = useLocation();
  const [showActions, setShowActions] = useState(false);
  const { roles } = useAuth();

  // Hide bottom nav in active chat conversation
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

  // Radius for radial menu (px). Items get positioned with trig.
  const radius = 110;
  const total = radialActions.length;

  return (
    <>
      <AnimatePresence>
        {showActions && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-md"
              onClick={() => setShowActions(false)}
            />
            {/* Radial expanded menu */}
            <div className="fixed inset-x-0 bottom-24 z-50 pointer-events-none flex justify-center">
              <div className="relative w-[280px] h-[280px] pointer-events-auto">
                {radialActions.map((action, i) => {
                  // Distribute across upper hemisphere (180deg arc)
                  const angle = Math.PI - (Math.PI * (i / (total - 1)));
                  const x = Math.cos(angle) * radius;
                  const y = -Math.sin(angle) * radius;
                  return (
                    <motion.div
                      key={action.path + action.label}
                      initial={{ opacity: 0, x: 0, y: 0, scale: 0.3 }}
                      animate={{ opacity: 1, x, y, scale: 1 }}
                      exit={{ opacity: 0, x: 0, y: 0, scale: 0.3 }}
                      transition={{ delay: i * 0.025, type: "spring", stiffness: 320, damping: 22 }}
                      className="absolute left-1/2 bottom-0 -translate-x-1/2"
                    >
                      <Link
                        to={action.path}
                        onClick={() => setShowActions(false)}
                        className="flex flex-col items-center gap-1 group"
                      >
                        <div className={cn(
                          "w-11 h-11 rounded-full flex items-center justify-center text-white border-2 border-white/20 group-hover:scale-110 transition-transform",
                          action.color, action.glow
                        )}>
                          <action.icon className="h-5 w-5" />
                        </div>
                        <span className="font-body text-[10px] text-foreground/90 whitespace-nowrap font-medium drop-shadow">{action.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-pb">
        <div className="flex items-center h-16 px-1">
          {navItems.slice(0, 2).map((item) => {
            const active = location.pathname === item.path || (item.path !== homePath && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl transition-all",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
                <span className="text-[10px] font-body font-medium">{item.label}</span>
              </Link>
            );
          })}

          {/* Center FAB */}
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
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl transition-all",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
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

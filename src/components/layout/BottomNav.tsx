import { Home, BookOpen, Newspaper, MessageCircle, User, Plus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: BookOpen, label: "Resources", path: "/resources" },
  { icon: MessageCircle, label: "Community", path: "/community" },
  { icon: User, label: "Profile", path: "/profile" },
];

const quickActions = [
  { label: "📰 News", path: "/news" },
  { label: "🕌 Ramadan", path: "/ramadan" },
  { label: "🤝 Khadims", path: "/khadims" },
  { label: "📅 Events", path: "/events" },
];

export function BottomNav() {
  const location = useLocation();
  const [showActions, setShowActions] = useState(false);

  return (
    <>
      {/* Quick actions popup */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-card rounded-2xl shadow-glow border border-border p-3 grid grid-cols-2 gap-2 min-w-[200px]"
          >
            {quickActions.map((action) => (
              <Link
                key={action.path}
                to={action.path}
                onClick={() => setShowActions(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-secondary hover:bg-primary/10 transition-colors font-body text-sm font-medium text-foreground"
              >
                {action.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-pb">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.slice(0, 2).map((item) => {
            const active = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all min-w-[48px]",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
                <span className="text-[10px] font-body font-medium">{item.label}</span>
              </Link>
            );
          })}

          {/* Center News/Action button */}
          <button
            onClick={() => setShowActions(!showActions)}
            className={cn(
              "relative -mt-6 flex items-center justify-center w-14 h-14 rounded-full shadow-glow transition-all",
              showActions ? "gradient-pink rotate-45" : "gradient-teal"
            )}
          >
            {showActions ? (
              <Plus className="h-6 w-6 text-primary-foreground" />
            ) : (
              <Newspaper className="h-6 w-6 text-primary-foreground" />
            )}
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-[8px] text-accent-foreground font-bold flex items-center justify-center">3</span>
          </button>

          {navItems.slice(2).map((item) => {
            const active = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all min-w-[48px]",
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

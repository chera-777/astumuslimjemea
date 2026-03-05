import { Home, BookOpen, Newspaper, Vote, MessageCircle, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: BookOpen, label: "Resources", path: "/resources" },
  { icon: Newspaper, label: "News", path: "/news" },
  { icon: Vote, label: "Governance", path: "/governance" },
  { icon: MessageCircle, label: "Community", path: "/community" },
  { icon: User, label: "Profile", path: "/profile" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors min-w-[48px]",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
              <span className="text-[10px] font-body font-medium">{item.label}</span>
              {active && (
                <div className="w-1 h-1 rounded-full bg-accent mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

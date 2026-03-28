import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Bell, Moon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function AppHeader() {
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-40 h-14 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-lg px-4">
      <div className="flex items-center gap-2">
        {!isMobile && <SidebarTrigger className="mr-1" />}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-teal flex items-center justify-center">
            <Moon className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="font-display text-sm font-bold text-foreground leading-tight">Muslim Jemea</p>
            {!isMobile && <p className="text-[9px] text-muted-foreground font-body leading-tight">ASTU Community</p>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
          <Link to="/profile">
            <div className="w-7 h-7 rounded-full gradient-pink flex items-center justify-center">
              <User className="h-3.5 w-3.5 text-accent-foreground" />
            </div>
          </Link>
        </Button>
      </div>
    </header>
  );
}

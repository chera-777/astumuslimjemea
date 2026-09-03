import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Bell, MessageSquare, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { XpChip } from "@/components/XpChip";


export function AppHeader() {
  const isMobile = useIsMobile();
  const { profile } = useAuth();
  const initial = profile?.full_name?.[0]?.toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-40 h-14 flex items-center justify-between border-b border-border bg-card/95 backdrop-blur-lg px-3 md:px-5 gap-3">
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {!isMobile && <SidebarTrigger className="mr-1" />}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">☪</span>
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="font-display text-sm font-bold text-foreground">ASTU</p>
            <p className="text-[9px] text-muted-foreground font-body">Muslim Jemea</p>
          </div>
        </Link>
      </div>

      {/* Search bar — desktop only */}
      {!isMobile && (
        <div className="flex-1 max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          <Input aria-label="Search the site" placeholder="Search anything…" className="h-9 pl-9 bg-secondary/60 border-0 text-xs rounded-full" />
        </div>
      )}

      <div className="flex items-center gap-1 shrink-0">
        <XpChip />
        {!isMobile && (
          <button className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary/60 text-xs font-body font-medium text-foreground hover:bg-secondary">
            ASTU <ChevronDown className="h-3 w-3" />
          </button>
        )}
        <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label="Notifications">

          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent" />
        </Button>
        {!isMobile && (
          <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Open community messages" asChild>
            <Link to="/community"><MessageSquare className="h-4 w-4" /></Link>
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" aria-label="Open your profile" asChild>
          <Link to="/profile">
            <div className="w-7 h-7 rounded-full gradient-teal flex items-center justify-center ring-2 ring-primary/30">
              <span className="text-[11px] text-primary-foreground font-bold">{initial}</span>
            </div>
          </Link>
        </Button>
      </div>
    </header>
  );
}

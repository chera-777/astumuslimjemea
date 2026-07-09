import {
  Home, BookOpen, Newspaper, Calendar, Moon, HandHeart, Gift, Heart,
  Sparkles, Clock, Users, Vote, Globe, GraduationCap, Building2,
  MoreHorizontal, Trophy, MessageCircle, Shield
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
  SidebarFooter, SidebarHeader,
} from "@/components/ui/sidebar";

const studentItems = [
  { title: "Home", url: "/portal/student", icon: Home },
  { title: "Resources", url: "/resources", icon: BookOpen },
  { title: "News", url: "/news", icon: Newspaper },
  { title: "Governance", url: "/governance", icon: Vote },
  { title: "Community", url: "/community", icon: MessageCircle, badge: 14 },
  { title: "Groups", url: "/groups", icon: Users },
  { title: "Academic", url: "/academic", icon: GraduationCap },
  { title: "Challenges", url: "/challenges", icon: Trophy },
  { title: "Donations", url: "/donations", icon: Gift },
  { title: "University", url: "/services", icon: Building2 },
];

const amirItems = [
  { title: "Dashboard", url: "/portal/amirs", icon: Home },
  { title: "Resources", url: "/resources", icon: BookOpen },
  { title: "News", url: "/news", icon: Newspaper },
  { title: "Community", url: "/community", icon: MessageCircle },
  { title: "Groups", url: "/groups", icon: Users },
  { title: "Ramadan", url: "/ramadan", icon: Moon },
  { title: "Khadims", url: "/khadims", icon: HandHeart },
  { title: "Donations", url: "/donations", icon: Gift },
  { title: "University", url: "/services", icon: Building2 },
];

const committeeItems = [
  { title: "Dashboard", url: "/portal/committee", icon: Home },
  { title: "Resources", url: "/resources", icon: BookOpen },
  { title: "News", url: "/news", icon: Newspaper },
  { title: "Community", url: "/community", icon: MessageCircle },
  { title: "Governance", url: "/governance", icon: Vote },
  { title: "Donations", url: "/donations", icon: Gift },
];

const guestItems = [
  { title: "Explore", url: "/portal/guest", icon: Globe },
  { title: "Resources", url: "/resources", icon: BookOpen },
  { title: "Prayer", url: "/prayer-times", icon: Clock },
  { title: "News", url: "/news", icon: Newspaper },
  { title: "Donations", url: "/donations", icon: Gift },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { roles, profile } = useAuth();
  const isActive = (path: string) => {
    const base = path.split("?")[0].split("#")[0];
    return location.pathname === base ||
      (!["/portal/student", "/portal/amirs", "/portal/committee", "/portal/guest"].includes(base) && location.pathname.startsWith(base));
  };

  let items: typeof studentItems = studentItems;
  let portalLabel = "Student Portal";
  if (roles.includes("admin") || roles.includes("amir")) {
    items = amirItems as typeof studentItems;
    portalLabel = "Amirs' Portal";
  } else if (roles.includes("committee")) {
    items = committeeItems as typeof studentItems;
    portalLabel = "Committee Portal";
  } else if (roles.includes("guest")) {
    items = guestItems as typeof studentItems;
    portalLabel = "Guest Portal";
  }

  const initial = profile?.full_name?.[0]?.toUpperCase() || "U";
  const dept = profile?.department || "Student";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-3 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
            <span className="text-primary text-base font-bold">☪</span>
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <p className="font-display text-sm font-bold text-sidebar-foreground">ASTU</p>
              <p className="text-[10px] text-sidebar-foreground/60 font-body">Muslim Jemea</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto scrollbar-hide pt-2">
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-sidebar-foreground/50 font-body text-[10px] uppercase tracking-wider flex items-center gap-1.5 px-2">
              <Sparkles className="h-3 w-3" />
              {portalLabel}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title} className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary-foreground overflow-hidden">
                    <NavLink to={item.url} end={item.url.startsWith("/portal/")} activeClassName="bg-sidebar-accent text-sidebar-foreground font-semibold" className="min-w-0">
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-xs truncate min-w-0">{item.title}</span>
                          {"badge" in item && item.badge && (
                            <span className="ml-auto shrink-0 bg-sidebar-primary text-sidebar-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full">{item.badge as number}</span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Ramadan Kareem widget */}
        {!collapsed && (
          <div className="mx-3 mt-4 mb-2 rounded-2xl bg-gradient-to-br from-sidebar-accent to-sidebar-background border border-sidebar-border p-3 relative overflow-hidden">
            <div className="absolute -right-2 -top-2 text-3xl opacity-30">🌙</div>
            <p className="font-display text-xs font-bold text-sidebar-foreground">Ramadan Kareem</p>
            <p className="text-2xl font-bold text-sidebar-primary font-display mt-0.5">19 <span className="text-[10px] text-sidebar-foreground/70 font-body">Days Left</span></p>
            <p className="text-[9px] text-sidebar-foreground/60 font-body mt-1">May Allah accept our<br/>fasts and deeds.</p>
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/profile")} tooltip="Profile & Settings">
              <NavLink to="/profile" activeClassName="bg-sidebar-accent text-sidebar-foreground font-semibold">
                <div className="w-6 h-6 rounded-full gradient-teal flex items-center justify-center mr-2 shrink-0">
                  <span className="text-[10px] text-primary-foreground font-bold">{initial}</span>
                </div>
                {!collapsed && (
                  <div className="leading-tight flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{profile?.full_name || "Profile"}</p>
                    <p className="text-[9px] text-sidebar-foreground/60 truncate">{dept}</p>
                  </div>
                )}
                {!collapsed && <MoreHorizontal className="h-3 w-3 text-sidebar-foreground/60" />}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

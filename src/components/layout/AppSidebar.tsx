import {
  Home, GraduationCap, Shield, Users, Globe, BookOpen, Newspaper,
  MessageCircle, User, Calendar, Moon, HandHeart, Heart, Gift,
  Settings, LogOut, ChevronRight, Sparkles
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
  SidebarFooter,
} from "@/components/ui/sidebar";

const studentItems = [
  { title: "Home", url: "/portal/student", icon: Home },
  { title: "Resources", url: "/resources", icon: BookOpen },
  { title: "News", url: "/news", icon: Newspaper },
  { title: "Community", url: "/community", icon: MessageCircle },
  { title: "Events", url: "/events", icon: Calendar },
  { title: "Ramadan", url: "/ramadan", icon: Moon },
  { title: "Khadims", url: "/khadims", icon: HandHeart },
  { title: "Donations", url: "/donations", icon: Gift },
  { title: "Support", url: "/support", icon: Heart },
];

const amirItems = [
  { title: "Dashboard", url: "/portal/amirs", icon: Home },
  { title: "Resources", url: "/resources", icon: BookOpen },
  { title: "News", url: "/news", icon: Newspaper },
  { title: "Community", url: "/community", icon: MessageCircle },
  { title: "Events", url: "/events", icon: Calendar },
  { title: "Ramadan", url: "/ramadan", icon: Moon },
  { title: "Khadims", url: "/khadims", icon: HandHeart },
  { title: "Donations", url: "/donations", icon: Gift },
];

const committeeItems = [
  { title: "Dashboard", url: "/portal/committee", icon: Home },
  { title: "Resources", url: "/resources", icon: BookOpen },
  { title: "News", url: "/news", icon: Newspaper },
  { title: "Community", url: "/community", icon: MessageCircle },
  { title: "Events", url: "/events", icon: Calendar },
  { title: "Donations", url: "/donations", icon: Gift },
];

const guestItems = [
  { title: "Explore", url: "/portal/guest", icon: Globe },
  { title: "News", url: "/news", icon: Newspaper },
  { title: "Events", url: "/events", icon: Calendar },
  { title: "Donations", url: "/donations", icon: Gift },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { roles, signOut } = useAuth();
  const isActive = (path: string) => location.pathname === path || (path !== "/portal/student" && path !== "/portal/amirs" && path !== "/portal/committee" && path !== "/portal/guest" && location.pathname.startsWith(path));

  // Determine which items to show based on role
  let items = studentItems;
  let portalLabel = "Student Portal";
  if (roles.includes("admin") || roles.includes("amir")) {
    items = amirItems;
    portalLabel = "Amirs' Portal";
  } else if (roles.includes("committee")) {
    items = committeeItems;
    portalLabel = "Committee Portal";
  } else if (roles.includes("guest")) {
    items = guestItems;
    portalLabel = "Guest Portal";
  }

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="pt-2 overflow-y-auto scrollbar-hide">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 font-body text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" />
            {!collapsed && portalLabel}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end={item.url.startsWith("/portal/")} activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/profile")}>
              <NavLink to="/profile" activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold">
                <User className="mr-2 h-4 w-4" />
                {!collapsed && <span>Profile</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut} className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <LogOut className="mr-2 h-4 w-4" />
              {!collapsed && <span>Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

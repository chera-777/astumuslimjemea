import {
  Home, BookOpen, Newspaper, Vote, MessageCircle, User, Shield,
  Users, Globe, Calendar, Heart, GraduationCap, Briefcase, Moon
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "News", url: "/news", icon: Newspaper },
  { title: "Community", url: "/community", icon: MessageCircle },
  { title: "Profile", url: "/profile", icon: User },
];

const portalItems = [
  { title: "Student Portal", url: "/portal/student", icon: GraduationCap },
  { title: "Amirs' Portal", url: "/portal/amirs", icon: Shield },
  { title: "Committee Portal", url: "/portal/committee", icon: Users },
  { title: "Guest Portal", url: "/portal/guest", icon: Globe },
];

const featureItems = [
  { title: "Resources", url: "/resources", icon: BookOpen },
  { title: "Governance", url: "/governance", icon: Vote },
  { title: "Groups", url: "/groups", icon: Users },
  { title: "Services", url: "/services", icon: Briefcase },
  { title: "Ramadan", url: "/ramadan", icon: Moon },
  { title: "Events", url: "/events", icon: Calendar },
  { title: "Support", url: "/support", icon: Heart },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const renderGroup = (label: string, items: typeof mainItems) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-sidebar-foreground/60 font-body text-xs uppercase tracking-wider">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive(item.url)}>
                <NavLink to={item.url} end activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold">
                  <item.icon className="mr-2 h-4 w-4" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg gradient-emerald flex items-center justify-center">
          <Moon className="h-5 w-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-display text-sm font-bold text-sidebar-foreground">Muslim Jemea</p>
            <p className="text-[10px] text-sidebar-foreground/50 font-body">ASTU Community</p>
          </div>
        )}
      </div>
      <SidebarContent className="pt-2">
        {renderGroup("Main", mainItems)}
        {renderGroup("Portals", portalItems)}
        {renderGroup("Features", featureItems)}
      </SidebarContent>
    </Sidebar>
  );
}

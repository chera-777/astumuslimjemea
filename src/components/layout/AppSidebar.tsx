import {
  Home, GraduationCap, Shield, Users, Globe, BookOpen, Newspaper,
  MessageCircle, User, Calendar, Moon, HandHeart, Heart, Gift
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

const moreItems = [
  { title: "Resources", url: "/resources", icon: BookOpen },
  { title: "Events", url: "/events", icon: Calendar },
  { title: "Ramadan", url: "/ramadan", icon: Moon },
  { title: "Khadims", url: "/khadims", icon: HandHeart },
  { title: "Donations", url: "/donations", icon: Gift },
  { title: "Support", url: "/support", icon: Heart },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

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
                <NavLink to={item.url} end={item.url === "/dashboard"} activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold">
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
      <SidebarContent className="pt-2 overflow-y-auto scrollbar-hide">
        {renderGroup("Main", mainItems)}
        {renderGroup("Portals", portalItems)}
        {renderGroup("More", moreItems)}
      </SidebarContent>
    </Sidebar>
  );
}

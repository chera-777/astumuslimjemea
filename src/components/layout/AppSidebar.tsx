import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Building2,
  ChevronDown,
  ChevronRight,
  Clock,
  Compass,
  Gift,
  Globe,
  GraduationCap,
  HandHeart,
  Home,
  MessageCircle,
  Moon,
  MoreHorizontal,
  Newspaper,
  Search,
  Shield,
  ShieldCheck,
  Sun,
  Trophy,
  Users,
  Vote,
  X,
  type LucideIcon,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useXp } from "@/hooks/useXp";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo-leaf.png";
import {
  buildSidebarConfig,
  filterSidebarSections,
  isSidebarItemActive,
  type SidebarIconName,
  type SidebarNavItem,
  type SidebarSectionKey,
} from "./sidebarNavigation";

const ICON_MAP: Record<SidebarIconName, LucideIcon> = {
  home: Home,
  shield: Shield,
  globe: Globe,
  "book-open": BookOpen,
  "graduation-cap": GraduationCap,
  trophy: Trophy,
  moon: Moon,
  clock: Clock,
  "message-circle": MessageCircle,
  users: Users,
  newspaper: Newspaper,
  "shield-check": ShieldCheck,
  vote: Vote,
  "hand-heart": HandHeart,
  gift: Gift,
  building: Building2,
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { roles, profile } = useAuth();
  const { nextPrayer, nextTime, hijriDate, city } = usePrayerTimes();
  const { xp, level, progress } = useXp();

  const [filterQuery, setFilterQuery] = useState("");
  const [collapsedSections, setCollapsedSections] = useState<
    Partial<Record<SidebarSectionKey, boolean>>
  >({});
  const [isDark, setIsDark] = useState(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : true
  );
  const filterInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleSlashShortcut = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || target?.isContentEditable) {
        return;
      }
      if (!collapsed && filterInputRef.current) {
        event.preventDefault();
        filterInputRef.current.focus();
      }
    };
    window.addEventListener("keydown", handleSlashShortcut);
    return () => window.removeEventListener("keydown", handleSlashShortcut);
  }, [collapsed]);

  const { portalLabel, sections, studentSwitchItem } = useMemo(
    () => buildSidebarConfig(roles),
    [roles]
  );

  const visibleSections = useMemo(
    () => filterSidebarSections(sections, filterQuery),
    [sections, filterQuery]
  );

  const isFiltering = filterQuery.trim().length > 0;
  const initial = profile?.full_name?.[0]?.toUpperCase() || "U";
  const dept = profile?.department || "ASTU Student";

  const toggleSection = (key: SidebarSectionKey) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const renderNavRow = (item: SidebarNavItem) => {
    const Icon = ICON_MAP[item.icon];
    const active = isSidebarItemActive(location.pathname, item.url);

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          asChild
          isActive={active}
          tooltip={item.subtitle ? `${item.title} — ${item.subtitle}` : item.title}
          className={cn(
            "group/nav h-[30px] rounded-lg px-2 py-0.5 transition-[background-color,color,transform] duration-150",
            "hover:bg-sidebar-accent/75 hover:text-sidebar-foreground",
            "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-foreground data-[active=true]:ring-1 data-[active=true]:ring-sidebar-primary/30",
            collapsed && "justify-center !p-0 !h-8 !w-8 mx-auto"
          )}
        >
          <NavLink
            to={item.url}
            end={item.url.startsWith("/portal/")}
            className={cn(
              "flex items-center gap-2 min-w-0 w-full",
              collapsed && "justify-center"
            )}
          >
            <span
              className={cn(
                "flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md transition-[background-color,color,transform] duration-150",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "bg-sidebar-accent/80 text-sidebar-foreground/75 group-hover/nav:bg-sidebar-primary/15 group-hover/nav:text-sidebar-primary group-hover/nav:scale-105"
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            </span>

            {!collapsed && (
              <>
                <span
                  className={cn(
                    "flex-1 text-[13px] truncate",
                    active ? "font-semibold text-sidebar-foreground" : "font-medium"
                  )}
                >
                  {item.title}
                </span>

                {typeof item.badge === "number" && item.badge > 0 ? (
                  <span className="ml-auto shrink-0 rounded-md bg-sidebar-primary/15 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-sidebar-primary">
                    {item.badge}
                  </span>
                ) : (
                  <ChevronRight
                    className={cn(
                      "ml-auto h-3.5 w-3.5 shrink-0 transition-[opacity,transform] duration-150",
                      active
                        ? "opacity-75 text-sidebar-primary translate-x-0"
                        : "opacity-0 -translate-x-1 group-hover/nav:opacity-55 group-hover/nav:translate-x-0"
                    )}
                    aria-hidden="true"
                  />
                )}
              </>
            )}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground"
    >
      {/* Brand Lockup + Theme Toggle + Quick Jump Search */}
      <SidebarHeader className="px-3 py-2.5 border-b border-sidebar-border/80 space-y-2">
        <div
          className={cn(
            "flex items-center justify-between gap-2",
            collapsed && "justify-center"
          )}
        >
          <Link
            to="/dashboard"
            className={cn(
              "flex items-center gap-2.5 min-w-0 rounded-xl transition-opacity hover:opacity-90",
              collapsed && "justify-center"
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent border border-sidebar-border/80 p-1">
              <img
                src={logo}
                alt="ASTU Muslim Jemea"
                referrerPolicy="no-referrer"
                className="h-full w-full object-contain"
              />
            </div>
            {!collapsed && (
              <div className="min-w-0 leading-tight">
                <p className="font-display text-sm font-bold text-sidebar-foreground truncate">
                  ASTU Jemea
                </p>
                <p className="text-[11px] text-sidebar-primary font-body font-medium truncate">
                  {portalLabel}
                </p>
              </div>
            )}
          </Link>

          {!collapsed && (
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle color theme"
              aria-pressed={!isDark}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-sidebar-border/80 bg-sidebar-accent/50 text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
            >
              {isDark ? (
                <Sun className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Moon className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </button>
          )}
        </div>

        {!collapsed && (
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-sidebar-foreground/45"
              aria-hidden="true"
            />
            <SidebarInput
              ref={filterInputRef}
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Quick jump…"
              aria-label="Filter navigation menu"
              className="h-8 rounded-lg border border-sidebar-border/80 bg-sidebar-accent/45 pl-8 pr-11 text-xs text-sidebar-foreground placeholder:text-sidebar-foreground/45 focus-visible:ring-1 focus-visible:ring-sidebar-primary"
            />
            {isFiltering ? (
              <button
                type="button"
                onClick={() => setFilterQuery("")}
                aria-label="Clear menu filter"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-sidebar-foreground/55 hover:text-sidebar-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-sidebar-border px-1.5 py-0.5 font-mono text-[10px] leading-none text-sidebar-foreground/45">
                /
              </kbd>
            )}
          </div>
        )}
      </SidebarHeader>

      {/* Scrollable Navigation Sections + Live Prayer Companion */}
      <SidebarContent className="overflow-y-auto scrollbar-hide px-2 py-1.5 space-y-0.5">
        {visibleSections.length === 0 ? (
          <div className="mx-1 my-3 rounded-xl border border-dashed border-sidebar-border p-4 text-center space-y-2">
            <p className="font-body text-xs text-sidebar-foreground/70">
              No menu items match "{filterQuery}".
            </p>
            <button
              type="button"
              onClick={() => setFilterQuery("")}
              className="text-xs font-body font-semibold text-sidebar-primary hover:underline"
            >
              Clear filter
            </button>
          </div>
        ) : (
          visibleSections.map((section, idx) => {
            const isSectionCollapsed = !isFiltering && Boolean(collapsedSections[section.key]);
            return (
              <SidebarGroup key={section.key} className={cn("p-0", idx > 0 && "pt-1")}>
                {!collapsed && (
                  <button
                    type="button"
                    onClick={() => toggleSection(section.key)}
                    aria-expanded={!isSectionCollapsed}
                    className="flex w-full items-center justify-between px-2 py-0.5 text-left text-[11px] font-body font-medium text-sidebar-foreground/55 hover:text-sidebar-foreground/85 transition-colors"
                  >
                    <span>{section.label}</span>
                    <ChevronDown
                      className={cn(
                        "h-3 w-3 transition-transform duration-150",
                        isSectionCollapsed && "-rotate-90"
                      )}
                      aria-hidden="true"
                    />
                  </button>
                )}

                {(!isSectionCollapsed || collapsed) && (
                  <SidebarGroupContent className="mt-0.5">
                    <SidebarMenu className="gap-px">
                      {section.items.map(renderNavRow)}
                    </SidebarMenu>
                  </SidebarGroupContent>
                )}
              </SidebarGroup>
            );
          })
        )}

        {/* Staff -> Student Portal Switch */}
        {studentSwitchItem && !isFiltering && (
          <SidebarGroup className="p-0 pt-1 border-t border-sidebar-border/70">
            {!collapsed && (
              <p className="px-2 py-0.5 text-[11px] font-body font-medium text-sidebar-foreground/55">
                Switch View
              </p>
            )}
            <SidebarGroupContent className="mt-0.5">
              <SidebarMenu>{renderNavRow(studentSwitchItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Interactive Spiritual Companion Card (Live Prayer + Quick Worship Actions) */}
        {collapsed ? (
          <div className="pt-1.5 flex justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/prayer-times"
                  aria-label={`Next prayer: ${nextPrayer} at ${nextTime}`}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-sidebar-border/80 bg-sidebar-accent/70 text-sidebar-primary hover:bg-sidebar-primary hover:text-sidebar-primary-foreground transition-colors"
                >
                  <Compass className="h-4 w-4" aria-hidden="true" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                Next: {nextPrayer} · {nextTime}
              </TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <div className="mx-0.5 mt-2 rounded-xl border border-sidebar-border/90 bg-sidebar-accent/55 p-2.5 space-y-2">
            <Link
              to="/prayer-times"
              className="group/prayer block rounded-lg transition-opacity hover:opacity-90"
            >
              <div className="flex items-center justify-between gap-2 text-[10px] font-body text-sidebar-foreground/65">
                <span className="truncate">{hijriDate}</span>
                <span className="shrink-0">{city}</span>
              </div>
              <div className="mt-0.5 flex items-baseline justify-between gap-2">
                <span className="font-display text-sm font-bold text-sidebar-foreground">
                  Next: {nextPrayer}
                </span>
                <span className="font-mono text-xs font-semibold tabular-nums text-sidebar-primary">
                  {nextTime || "—"}
                </span>
              </div>
            </Link>

            <div className="grid grid-cols-2 gap-1.5">
              <Link
                to="/prayer-times"
                className="flex items-center justify-center gap-1.5 rounded-lg border border-sidebar-border/80 bg-sidebar/80 px-2 py-1 text-[11px] font-body font-medium text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors whitespace-nowrap"
              >
                <Clock className="h-3 w-3 text-sidebar-primary shrink-0" aria-hidden="true" />
                <span>Prayers</span>
              </Link>
              <Link
                to="/tasbih"
                className="flex items-center justify-center gap-1.5 rounded-lg border border-sidebar-border/80 bg-sidebar/80 px-2 py-1 text-[11px] font-body font-medium text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors whitespace-nowrap"
              >
                <Compass className="h-3 w-3 text-sidebar-primary shrink-0" aria-hidden="true" />
                <span>Tasbih</span>
              </Link>
            </div>
          </div>
        )}
      </SidebarContent>

      {/* Profile + Real XP Progress Footer */}
      <SidebarFooter className="border-t border-sidebar-border/80 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isSidebarItemActive(location.pathname, "/profile")}
              tooltip="Profile & Settings"
              className={cn(
                "h-auto rounded-xl p-2 hover:bg-sidebar-accent/80 data-[active=true]:bg-sidebar-accent",
                collapsed && "justify-center !p-0 !h-9 !w-9 mx-auto"
              )}
            >
              <NavLink
                to="/profile"
                className={cn(
                  "flex flex-col gap-2 w-full min-w-0",
                  collapsed && "items-center justify-center"
                )}
              >
                <div
                  className={cn(
                    "flex items-center gap-2.5 w-full min-w-0",
                    collapsed && "justify-center"
                  )}
                >
                  {profile?.profile_photo_url ? (
                    <img
                      src={profile.profile_photo_url}
                      alt={profile.full_name || "Profile"}
                      referrerPolicy="no-referrer"
                      className="h-8 w-8 rounded-lg object-cover shrink-0 border border-sidebar-border"
                    />
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-teal">
                      <span className="text-xs font-bold text-white">
                        {initial}
                      </span>
                    </div>
                  )}

                  {!collapsed && (
                    <>
                      <div className="min-w-0 flex-1 leading-tight">
                        <div className="flex items-center gap-1 min-w-0">
                          <p className="text-xs font-semibold text-sidebar-foreground truncate">
                            {profile?.full_name || "Student Profile"}
                          </p>
                          {profile?.is_verified && (
                            <ShieldCheck
                              className="h-3.5 w-3.5 shrink-0 text-sidebar-primary"
                              aria-label="Verified ASTU student"
                            />
                          )}
                        </div>
                        <p className="text-[10px] text-sidebar-foreground/60 truncate">
                          {dept}
                        </p>
                      </div>
                      <MoreHorizontal
                        className="h-3.5 w-3.5 shrink-0 text-sidebar-foreground/55"
                        aria-hidden="true"
                      />
                    </>
                  )}
                </div>

                {!collapsed && (
                  <div className="w-full space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-body text-sidebar-foreground/70 tabular-nums">
                      <span>Level {level}</span>
                      <span>{xp} XP</span>
                    </div>
                    <div
                      className="h-1.5 w-full overflow-hidden rounded-full bg-sidebar-accent"
                      aria-hidden="true"
                    >
                      <div
                        className="h-full rounded-full bg-sidebar-primary transition-[width] duration-300"
                        style={{ width: `${Math.max(progress, 6)}%` }}
                      />
                    </div>
                  </div>
                )}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

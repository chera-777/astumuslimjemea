import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Accessibility,
  ArrowLeft,
  Ban,
  Bell,
  ChevronRight,
  Database,
  Download,
  ExternalLink,
  Film,
  HelpCircle,
  Image as ImageIcon,
  Laptop,
  Lock,
  LogOut,
  Palette,
  Save,
  Shield,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunity } from "@/features/community/CommunityContext";
import { getPushProviderStatus } from "@/features/community/notifications";
import { CHAT_WALLPAPERS } from "@/features/community/wallpapers";
import { ASTU_DEPARTMENTS, CLASS_YEARS } from "@/lib/astuDepartments";
import { cn } from "@/lib/utils";
import { AvatarBadge } from "./AvatarBadge";
import { ProfileDetailsEditor } from "@/components/ProfileDetailsEditor";
import { toast } from "sonner";

type SettingsSection =
  | "overview"
  | "account"
  | "privacy"
  | "notifications"
  | "appearance"
  | "blocked"
  | "sessions"
  | "storage"
  | "media"
  | "accessibility"
  | "support";

const SECTION_TITLES: Record<SettingsSection, string> = {
  overview: "Settings",
  account: "Account & Profile",
  privacy: "Privacy & Security",
  notifications: "Notifications",
  appearance: "Chat Appearance",
  blocked: "Blocked Users",
  sessions: "Active Sessions & Devices",
  storage: "Data & Storage",
  media: "Media Preferences",
  accessibility: "Accessibility",
  support: "Help & Support",
};

function useIsBelowLg() {
  const [belowLg, setBelowLg] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.innerWidth < 1024 : false
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(max-width: 1023px)");
    const update = () => setBelowLg(window.innerWidth < 1024);
    mql.addEventListener("change", update);
    update();
    return () => mql.removeEventListener("change", update);
  }, []);

  return belowLg;
}

export function CommunitySettingsView() {
  const isBelowLg = useIsBelowLg();
  const navigate = useNavigate();
  const { user, profile, signOut, signOutOtherDevices } = useAuth();
  const {
    snapshot,
    activeConversation,
    infoPanelOpen,
    setInfoPanelOpen,
    rightPaneMode,
    setRightPaneMode,
    isRealtimeBackendActive,
    updateOwnCommunityProfile,
    updatePrivacySettings,
    updateNotificationPreferences,
    updateMediaPreferences,
    updateAccessibilityPreferences,
    setConversationWallpaper,
    toggleBlockUser,
    clearLocalCache,
    exportAllCommunityData,
  } = useCommunity();

  const [section, setSection] = useState<SettingsSection>("overview");
  const [fullProfileOpen, setFullProfileOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [signingOutOthers, setSigningOutOthers] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const me = snapshot ? snapshot.users[snapshot.currentUserId] : undefined;

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [department, setDepartment] = useState("");
  const [batchYear, setBatchYear] = useState("");

  useEffect(() => {
    if (!me) return;
    setFullName(me.fullName);
    setUsername(me.username);
    setBio(me.bio);
    setDepartment(me.department);
    setBatchYear(me.batchYear);
  }, [me]);

  const storageStats = useMemo(() => {
    if (!snapshot) return { conversations: 0, messages: 0, media: 0, drafts: 0 };
    const allMessages = Object.values(snapshot.messagesByConversation).flat();
    const media = allMessages.reduce((acc, m) => acc + (m.attachments?.length ?? 0), 0);
    const drafts = snapshot.conversations.filter((c) => Boolean(c.draftText?.trim())).length;
    return {
      conversations: snapshot.conversations.length,
      messages: allMessages.length,
      media,
      drafts,
    };
  }, [snapshot]);

  if (!infoPanelOpen || rightPaneMode !== "settings" || !snapshot || !me) return null;

  const {
    notificationPreferences: np,
    privacySettings: ps,
    mediaPreferences: mp,
    accessibilityPreferences: ap,
  } = snapshot;
  const blockedUsers = Object.values(snapshot.users).filter((u) => u.isBlocked);
  const pushStatus = getPushProviderStatus();

  const handleClose = () => {
    setSection("overview");
    if (!isBelowLg && activeConversation) {
      setRightPaneMode("info");
    } else {
      setInfoPanelOpen(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    setSavingProfile(true);
    try {
      await updateOwnCommunityProfile({
        fullName,
        username,
        bio,
        department,
        batchYear,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSignOutOtherDevices = async () => {
    setSigningOutOthers(true);
    try {
      await signOutOtherDevices();
      toast.success(
        isRealtimeBackendActive
          ? "Signed out of all other active devices"
          : "Local preview session has no remote sessions"
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not revoke other sessions");
    } finally {
      setSigningOutOthers(false);
    }
  };

  const handleLogOut = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      toast.success("Logged out cleanly");
      navigate("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not log out");
    } finally {
      setLoggingOut(false);
    }
  };

  const navItems: {
    id: SettingsSection;
    label: string;
    subtitle: string;
    icon: typeof User;
    badge?: string;
  }[] = [
    {
      id: "account",
      label: "Account & Profile",
      subtitle: `${me.username} · ${me.department}`,
      icon: User,
    },
    {
      id: "privacy",
      label: "Privacy & Security",
      subtitle: ps.readReceiptsEnabled ? "Read receipts on" : "Read receipts off",
      icon: Lock,
    },
    {
      id: "notifications",
      label: "Notifications",
      subtitle: np.enabled ? "Alerts enabled" : "Muted globally",
      icon: Bell,
    },
    {
      id: "appearance",
      label: "Chat Appearance & Wallpapers",
      subtitle: activeConversation
        ? `Active: ${CHAT_WALLPAPERS.find((w) => w.id === (activeConversation.wallpaperId || "default"))?.name ?? "Default"}`
        : "Customize thread backdrops",
      icon: Palette,
    },
    {
      id: "blocked",
      label: "Blocked Users",
      subtitle: blockedUsers.length ? `${blockedUsers.length} blocked` : "No blocked contacts",
      icon: Ban,
      badge: blockedUsers.length > 0 ? String(blockedUsers.length) : undefined,
    },
    {
      id: "sessions",
      label: "Active Sessions & Devices",
      subtitle: isRealtimeBackendActive ? "Supabase session active" : "Local preview session",
      icon: Laptop,
    },
    {
      id: "storage",
      label: "Data & Storage",
      subtitle: `${storageStats.messages} messages · ${storageStats.drafts} drafts`,
      icon: Database,
    },
    {
      id: "media",
      label: "Media Preferences",
      subtitle: mp.autoDownloadPhotos ? "Auto-download photos on" : "Manual media download",
      icon: Film,
    },
    {
      id: "accessibility",
      label: "Accessibility",
      subtitle: `Text: ${ap.textSize} · ${ap.compactMode ? "Compact" : "Standard"}`,
      icon: Accessibility,
    },
    {
      id: "support",
      label: "Help & Support",
      subtitle: "Campus guidelines & support ticket",
      icon: HelpCircle,
    },
  ];

  const body = (
    <div className="flex flex-col h-full bg-card text-card-foreground">
      {/* Header */}
      <div className="h-14 shrink-0 px-3 border-b border-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {section !== "overview" && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setSection("overview")}
              aria-label="Back to settings menu"
              className="h-8 w-8 rounded-full shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <h3 className="font-body text-sm font-semibold truncate">
            {SECTION_TITLES[section]}
          </h3>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {activeConversation && !isBelowLg && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSection("overview");
                setRightPaneMode("info");
              }}
              className="h-7 px-2 text-[11px] font-body"
            >
              Info
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClose}
            aria-label="Close settings panel"
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {section === "overview" && (
          <>
            {/* Profile Banner */}
            <button
              type="button"
              onClick={() => setSection("account")}
              className="w-full flex items-center gap-3 rounded-xl border border-border bg-secondary/35 hover:bg-secondary/60 p-3 text-left transition-colors"
            >
              <AvatarBadge
                initials={me.avatarInitials}
                colorClass={me.avatarColor}
                name={me.fullName}
                status="online"
                showPresence
                size="lg"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="font-display text-sm font-bold truncate">{me.fullName}</p>
                  {profile?.is_verified && (
                    <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" aria-label="Verified" />
                  )}
                </div>
                <p className="font-body text-xs text-primary truncate">{me.username}</p>
                <p className="font-body text-[11px] text-muted-foreground truncate">
                  {user?.email || `${me.department} · ${me.batchYear}`}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>

            {/* Categorized Telegram Settings Menu */}
            <div className="rounded-xl border border-border overflow-hidden divide-y divide-border/60 bg-background/40">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSection(item.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/50 text-left transition-colors"
                  >
                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-body text-xs font-semibold truncate">{item.label}</p>
                      <p className="font-body text-[11px] text-muted-foreground truncate">
                        {item.subtitle}
                      </p>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded-full bg-destructive/15 text-destructive text-[10px] font-semibold tabular-nums">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground/70 shrink-0" />
                  </button>
                );
              })}
            </div>
          </>
        )}

        {section === "account" && (
          <form onSubmit={(e) => void handleSaveProfile(e)} className="space-y-3.5">
            <div className="flex items-center gap-3 pb-2 border-b border-border/60">
              <AvatarBadge
                initials={me.avatarInitials}
                colorClass={me.avatarColor}
                name={me.fullName}
                size="lg"
              />
              <div className="min-w-0">
                <p className="text-xs font-body font-semibold truncate">{me.fullName}</p>
                <p className="text-[11px] font-body text-muted-foreground truncate">
                  {user?.email || "ASTU Student Member"}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="settings-fullname" className="text-xs font-body">
                Full name
              </Label>
              <Input
                id="settings-fullname"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                maxLength={120}
                className="h-9 text-xs font-body"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="settings-username" className="text-xs font-body">
                Username
              </Label>
              <Input
                id="settings-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@username"
                maxLength={32}
                className="h-9 text-xs font-body"
              />
              <p className="text-[10px] font-body text-muted-foreground">
                3–24 letters, numbers, or underscores so peers can find you.
              </p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="settings-bio" className="text-xs font-body">
                Bio
              </Label>
              <Textarea
                id="settings-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your study focus, interests, or role…"
                maxLength={160}
                className="text-xs font-body min-h-16"
              />
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <div className="space-y-1">
                <Label className="text-xs font-body">Department</Label>
                <Select value={department || undefined} onValueChange={setDepartment}>
                  <SelectTrigger className="h-9 text-xs font-body">
                    <SelectValue placeholder="Choose department" />
                  </SelectTrigger>
                  <SelectContent>
                    {(department && !ASTU_DEPARTMENTS.includes(department)
                      ? [department, ...ASTU_DEPARTMENTS]
                      : ASTU_DEPARTMENTS
                    ).map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-body">Class year</Label>
                <Select value={batchYear || undefined} onValueChange={setBatchYear}>
                  <SelectTrigger className="h-9 text-xs font-body">
                    <SelectValue placeholder="Choose year" />
                  </SelectTrigger>
                  <SelectContent>
                    {(batchYear && !CLASS_YEARS.includes(batchYear)
                      ? [batchYear, ...CLASS_YEARS]
                      : CLASS_YEARS
                    ).map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" disabled={savingProfile} className="w-full h-9 text-xs font-body">
              <Save className="h-3.5 w-3.5 mr-1.5" />
              {savingProfile ? "Saving…" : "Save Profile"}
            </Button>

            {user && profile && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setFullProfileOpen(true)}
                className="w-full h-9 text-xs font-body"
              >
                Edit Phone, Student ID &amp; Photo
              </Button>
            )}
          </form>
        )}

        {section === "privacy" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-body">Last seen &amp; online status</Label>
              <Select
                value={ps.lastSeenVisibility}
                onValueChange={(val) =>
                  void updatePrivacySettings({
                    lastSeenVisibility: val as "everyone" | "university" | "nobody",
                  })
                }
              >
                <SelectTrigger className="h-9 text-xs font-body" aria-label="Last seen visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Everyone</SelectItem>
                  <SelectItem value="university">ASTU Members Only</SelectItem>
                  <SelectItem value="nobody">Nobody</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-body">Profile photo visibility</Label>
              <Select
                value={ps.profilePhotoVisibility}
                onValueChange={(val) =>
                  void updatePrivacySettings({
                    profilePhotoVisibility: val as "everyone" | "university" | "contacts",
                  })
                }
              >
                <SelectTrigger className="h-9 text-xs font-body" aria-label="Profile photo visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Same-gender campus members</SelectItem>
                  <SelectItem value="university">Verified ASTU members</SelectItem>
                  <SelectItem value="contacts">Direct chat contacts</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] font-body text-muted-foreground">
                Campus policy enforces cross-gender photo privacy automatically.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-body">Who can message me directly</Label>
              <Select
                value={ps.allowDirectMessagesFrom}
                onValueChange={(val) =>
                  void updatePrivacySettings({
                    allowDirectMessagesFrom: val as "everyone" | "group_members",
                  })
                }
              >
                <SelectTrigger className="h-9 text-xs font-body" aria-label="Direct message permissions">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">All University Members</SelectItem>
                  <SelectItem value="group_members">Shared Group Members Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <div>
                <p className="text-xs font-body font-medium">Read receipts</p>
                <p className="text-[11px] font-body text-muted-foreground">
                  Show blue double-checks when you view messages
                </p>
              </div>
              <Switch
                checked={ps.readReceiptsEnabled}
                onCheckedChange={(checked) =>
                  void updatePrivacySettings({ readReceiptsEnabled: checked })
                }
                aria-label="Toggle read receipts"
              />
            </div>

            <button
              type="button"
              onClick={() => setSection("blocked")}
              className="w-full flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-xs font-body hover:bg-secondary/50"
            >
              <span className="flex items-center gap-2 font-medium">
                <Ban className="h-3.5 w-3.5 text-destructive" /> Blocked users
              </span>
              <span className="text-muted-foreground tabular-nums">
                {blockedUsers.length} <ChevronRight className="inline h-3.5 w-3.5" />
              </span>
            </button>
          </div>
        )}

        {section === "notifications" && (
          <div className="space-y-3.5">
            <div className="rounded-lg border border-border bg-secondary/40 p-3 space-y-1">
              <div className="flex items-center justify-between text-xs font-body font-semibold">
                <span className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-primary" /> Push Delivery (OneSignal)
                </span>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {pushStatus.isConfigured ? "Ready" : "Pending App ID"}
                </span>
              </div>
              <p className="text-[11px] font-body text-muted-foreground leading-relaxed">
                {pushStatus.statusNote}
              </p>
            </div>

            {[
              {
                key: "enabled" as const,
                label: "All message notifications",
                desc: "Enable alerts for Community messages",
                value: np.enabled,
              },
              {
                key: "directMessages" as const,
                label: "Direct chats",
                desc: "Notify for 1-on-1 messages",
                value: np.directMessages,
              },
              {
                key: "groupMessages" as const,
                label: "Group chats",
                desc: "Notify for group conversations",
                value: np.groupMessages,
              },
              {
                key: "channelPosts" as const,
                label: "Channel broadcasts",
                desc: "Notify when subscribed channels post",
                value: np.channelPosts,
              },
              {
                key: "mentionsOnly" as const,
                label: "Mentions only in groups",
                desc: "Mute general chatter unless mentioned",
                value: np.mentionsOnly,
              },
              {
                key: "soundEnabled" as const,
                label: "In-app notification sound",
                desc: "Play gentle chime on incoming messages",
                value: np.soundEnabled,
              },
              {
                key: "showMessagePreview" as const,
                label: "Show message preview",
                desc: "Display message snippet in push alerts",
                value: np.showMessagePreview,
              },
              {
                key: "quietHoursEnabled" as const,
                label: `Quiet hours (${np.quietHoursRange})`,
                desc: "Silence alerts during night prayer & rest",
                value: np.quietHoursEnabled,
              },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-body font-medium">{item.label}</p>
                  <p className="text-[11px] font-body text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  checked={item.value}
                  onCheckedChange={(checked) =>
                    void updateNotificationPreferences({ [item.key]: checked })
                  }
                  aria-label={item.label}
                />
              </div>
            ))}
          </div>
        )}

        {section === "appearance" && (
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-secondary/35 p-3 space-y-1">
              <p className="text-xs font-body font-semibold flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-primary" /> Thread Wallpaper
              </p>
              <p className="text-[11px] font-body text-muted-foreground">
                {activeConversation
                  ? `Applying backdrop to "${activeConversation.title}"`
                  : "Open a chat thread to apply a custom wallpaper."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {CHAT_WALLPAPERS.map((wp) => {
                const selected =
                  (activeConversation?.wallpaperId || "default") === wp.id;
                return (
                  <button
                    key={wp.id}
                    type="button"
                    disabled={!activeConversation}
                    onClick={() => {
                      if (activeConversation) {
                        void setConversationWallpaper(activeConversation.id, wp.id);
                      }
                    }}
                    className={cn(
                      "rounded-xl border p-2 text-left space-y-1.5 transition-all disabled:opacity-50",
                      selected
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className={cn("h-12 w-full rounded-lg", wp.previewClass)} />
                    <p className="text-[11px] font-body font-medium truncate">{wp.name}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {section === "blocked" && (
          <div className="space-y-3">
            <p className="text-xs font-body text-muted-foreground">
              Blocked members cannot send you direct messages or view your online presence.
            </p>
            {blockedUsers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-center space-y-1.5">
                <Ban className="h-6 w-6 mx-auto text-muted-foreground/50" />
                <p className="text-xs font-body font-medium">No blocked users</p>
                <p className="text-[11px] font-body text-muted-foreground">
                  You can block or unblock someone anytime from their profile.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {blockedUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between gap-2.5 rounded-xl border border-border px-3 py-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <AvatarBadge
                        initials={u.avatarInitials}
                        colorClass={u.avatarColor}
                        name={u.fullName}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-body font-semibold truncate">{u.fullName}</p>
                        <p className="text-[11px] font-body text-muted-foreground truncate">
                          {u.username}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void toggleBlockUser(u.id)}
                      className="h-7 text-xs shrink-0"
                    >
                      Unblock
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {section === "sessions" && (
          <div className="space-y-3.5">
            <div className="rounded-xl border border-border bg-secondary/35 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-body font-semibold flex items-center gap-1.5">
                  <Laptop className="h-4 w-4 text-primary" /> This Device
                </span>
                <span className="text-[10px] font-body font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                  Active now
                </span>
              </div>
              <div className="text-[11px] font-body text-muted-foreground space-y-0.5">
                <p>Account: {user?.email || "Local preview account"}</p>
                <p>
                  Sign-in method:{" "}
                  {user?.app_metadata?.provider === "google"
                    ? "Google OAuth"
                    : isRealtimeBackendActive
                      ? "Email & Password"
                      : "Offline Preview Mode"}
                </p>
                <p>
                  Realtime sync: {isRealtimeBackendActive ? "Connected (Supabase)" : "Local storage"}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={signingOutOthers}
              onClick={() => void handleSignOutOtherDevices()}
              className="w-full h-9 text-xs font-body justify-start"
            >
              <Shield className="h-3.5 w-3.5 mr-2 text-primary" />
              {signingOutOthers ? "Revoking sessions…" : "Sign Out Other Devices"}
            </Button>

            <Button
              type="button"
              variant="destructive"
              disabled={loggingOut}
              onClick={() => void handleLogOut()}
              className="w-full h-9 text-xs font-body justify-start"
            >
              <LogOut className="h-3.5 w-3.5 mr-2" />
              {loggingOut ? "Logging out…" : "Log Out of This Session"}
            </Button>
          </div>
        )}

        {section === "storage" && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Conversations", value: storageStats.conversations },
                { label: "Messages", value: storageStats.messages },
                { label: "Attachments", value: storageStats.media },
                { label: "Saved Drafts", value: storageStats.drafts },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border bg-secondary/35 p-2.5"
                >
                  <p className="font-display text-lg font-bold tabular-nums">{stat.value}</p>
                  <p className="font-body text-[11px] text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => void clearLocalCache()}
              className="w-full h-9 text-xs font-body justify-start"
            >
              <Trash2 className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              Clear Local Drafts &amp; Cache
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => void exportAllCommunityData()}
              className="w-full h-9 text-xs font-body justify-start"
            >
              <Download className="h-3.5 w-3.5 mr-2 text-primary" />
              Export All Community Data (.json)
            </Button>
          </div>
        )}

        {section === "media" && (
          <div className="space-y-3.5">
            {[
              {
                key: "autoDownloadPhotos" as const,
                label: "Auto-download photos",
                desc: "Load shared study notes and photos automatically",
                value: mp.autoDownloadPhotos,
              },
              {
                key: "autoDownloadFiles" as const,
                label: "Auto-download documents",
                desc: "Prefetch PDFs and slides on Wi-Fi",
                value: mp.autoDownloadFiles,
              },
              {
                key: "autoPlayVoice" as const,
                label: "Auto-play voice notes",
                desc: "Continue to the next voice message automatically",
                value: mp.autoPlayVoice,
              },
              {
                key: "showWaveforms" as const,
                label: "Show audio waveforms",
                desc: "Render visual equalizer bars on voice messages",
                value: mp.showWaveforms,
              },
              {
                key: "compressMediaUploads" as const,
                label: "Compress uploaded photos",
                desc: "Save campus bandwidth when sharing images",
                value: mp.compressMediaUploads,
              },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-body font-medium">{item.label}</p>
                  <p className="text-[11px] font-body text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  checked={item.value}
                  onCheckedChange={(checked) =>
                    void updateMediaPreferences({ [item.key]: checked })
                  }
                  aria-label={item.label}
                />
              </div>
            ))}
          </div>
        )}

        {section === "accessibility" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-body">Message text size</Label>
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-secondary p-1">
                {(["small", "default", "large"] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => void updateAccessibilityPreferences({ textSize: sz })}
                    className={cn(
                      "py-1.5 rounded-md text-xs font-body font-medium capitalize transition-colors",
                      ap.textSize === sz
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {[
              {
                key: "compactMode" as const,
                label: "Compact message bubbles",
                desc: "Tighter spacing to fit more conversation history",
                value: ap.compactMode,
              },
              {
                key: "highContrastBubbles" as const,
                label: "High-contrast bubbles",
                desc: "Stronger borders and contrast on message cards",
                value: ap.highContrastBubbles,
              },
              {
                key: "reducedMotion" as const,
                label: "Reduce motion",
                desc: "Minimize hover and transition animations",
                value: ap.reducedMotion,
              },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-body font-medium">{item.label}</p>
                  <p className="text-[11px] font-body text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  checked={item.value}
                  onCheckedChange={(checked) =>
                    void updateAccessibilityPreferences({ [item.key]: checked })
                  }
                  aria-label={item.label}
                />
              </div>
            ))}
          </div>
        )}

        {section === "support" && (
          <div className="space-y-3.5">
            <div className="rounded-xl border border-border bg-secondary/35 p-3 space-y-1.5">
              <p className="text-xs font-body font-semibold flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> ASTU Muslim Jemea Etiquette
              </p>
              <p className="text-[11px] font-body text-muted-foreground leading-relaxed">
                Keep discussions respectful, verify religious or academic announcements before forwarding, and respect brothers/sisters privacy settings across campus groups.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/support")}
              className="w-full h-9 text-xs font-body justify-between"
            >
              <span>Open Support &amp; Help Center</span>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>

            <div className="rounded-xl border border-border p-3 space-y-1">
              <p className="text-xs font-body font-semibold">Push &amp; Sync Diagnostics</p>
              <p className="text-[11px] font-body text-muted-foreground">
                Push status: {pushStatus.statusNote}
              </p>
              <p className="text-[11px] font-body text-muted-foreground">
                Storage mode: {isRealtimeBackendActive ? "Supabase Cloud + Realtime" : "Local Offline Storage"}
              </p>
            </div>
          </div>
        )}
      </div>

      {user && profile && (
        <ProfileDetailsEditor open={fullProfileOpen} onOpenChange={setFullProfileOpen} />
      )}
    </div>
  );

  if (!isBelowLg) {
    return (
      <aside
        aria-label="Community settings"
        className="hidden lg:flex w-[320px] xl:w-[340px] shrink-0 border-l border-border h-full flex-col"
      >
        {body}
      </aside>
    );
  }

  return (
    <Sheet
      open={infoPanelOpen && rightPaneMode === "settings"}
      onOpenChange={(open) => {
        if (!open) setInfoPanelOpen(false);
      }}
    >
      <SheetContent side="right" className="p-0 w-full sm:max-w-sm">
        <SheetTitle className="sr-only">Community Settings</SheetTitle>
        <SheetDescription className="sr-only">
          Manage your account, privacy, notifications, storage, media, and accessibility settings.
        </SheetDescription>
        {body}
      </SheetContent>
    </Sheet>
  );
}

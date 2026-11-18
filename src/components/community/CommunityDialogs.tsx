import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Ban,
  Bell,
  BookOpen,
  Calendar,
  Check,
  Clock,
  Forward,
  Gift,
  GraduationCap,
  Home,
  Lock,
  MessageCircle,
  Moon,
  Search,
  Settings,
  Shield,
  Sun,
  Trophy,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { portalHome } from "@/lib/portalAccess";
import { useCommunity } from "@/features/community/CommunityContext";
import { formatLastSeen } from "@/features/community/formatters";
import { getPushProviderStatus } from "@/features/community/notifications";
import { AvatarBadge } from "./AvatarBadge";
import { toast } from "sonner";

/* 1. Left App Navigation & Account Drawer */
interface CommunityNavDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenContacts: () => void;
  onOpenNewGroup: () => void;
  onOpenSettings: () => void;
}

export function CommunityNavDrawer({
  open,
  onOpenChange,
  onOpenContacts,
  onOpenNewGroup,
  onOpenSettings,
}: CommunityNavDrawerProps) {
  const { roles } = useAuth();
  const { snapshot } = useCommunity();
  const [isDark, setIsDark] = useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );

  const toggleTheme = () => {
    const html = document.documentElement;
    const nextDark = !html.classList.contains("dark");
    html.classList.toggle("dark", nextDark);
    setIsDark(nextDark);
  };

  const me = snapshot ? snapshot.users[snapshot.currentUserId] : null;
  const homePath = portalHome(roles);

  const appLinks = [
    { label: "Home", path: homePath, icon: Home },
    { label: "Resources", path: "/resources", icon: BookOpen },
    { label: "Groups Directory", path: "/groups", icon: Users },
    { label: "Prayer Times", path: "/prayer-times", icon: Clock },
    { label: "Academic", path: "/academic", icon: GraduationCap },
    { label: "Challenges", path: "/challenges", icon: Trophy },
    { label: "Donations", path: "/donations", icon: Gift },
    { label: "Profile", path: "/profile", icon: User },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="p-0 w-[290px] sm:w-[320px] flex flex-col">
        <SheetTitle className="sr-only">Community Navigation &amp; Settings</SheetTitle>
        {/* User summary */}
        <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between gap-3">
          {me && (
            <div className="flex items-center gap-3 min-w-0">
              <AvatarBadge
                initials={me.avatarInitials}
                colorClass={me.avatarColor}
                name={me.fullName}
                status="online"
                showPresence
                size="lg"
              />
              <div className="min-w-0">
                <p className="font-body text-sm font-semibold truncate">{me.fullName}</p>
                <p className="font-body text-xs text-muted-foreground truncate">{me.username}</p>
                <p className="font-body text-[11px] text-muted-foreground truncate">
                  {me.department}
                </p>
              </div>
            </div>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            className="h-9 w-9 rounded-full shrink-0"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>

        {/* Messaging shortcuts */}
        <div className="p-2 border-b border-border space-y-0.5">
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onOpenContacts();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary text-sm font-body font-medium text-left"
          >
            <UserPlus className="h-4 w-4 text-primary" /> Contacts
          </button>
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onOpenNewGroup();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary text-sm font-body font-medium text-left"
          >
            <Users className="h-4 w-4 text-primary" /> New Group
          </button>
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onOpenSettings();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary text-sm font-body font-medium text-left"
          >
            <Settings className="h-4 w-4 text-primary" /> Privacy &amp; Notifications
          </button>
        </div>

        {/* App navigation */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          <p className="px-3 py-1.5 text-[11px] font-body font-semibold text-muted-foreground">
            ASTU Muslim Jemea
          </p>
          {appLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary text-sm font-body text-foreground/90"
            >
              <item.icon className="h-4 w-4 text-muted-foreground" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* 2. Contacts Discovery Dialog */
export function ContactsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { snapshot, openDirectChat, setProfileUserId } = useCommunity();
  const [query, setQuery] = useState("");

  const contacts = useMemo(() => {
    if (!snapshot) return [];
    const q = query.trim().toLowerCase();
    return Object.values(snapshot.users)
      .filter((u) => u.id !== snapshot.currentUserId)
      .filter((u) => {
        if (!q) return true;
        return (
          u.fullName.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.department.toLowerCase().includes(q)
        );
      });
  }, [snapshot, query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-3 border-b border-border">
          <DialogTitle className="font-display text-lg">Contacts</DialogTitle>
          <DialogDescription className="font-body text-xs">
            Discover ASTU Muslim Jemea members and start a direct conversation.
          </DialogDescription>
          <div className="relative pt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-0.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, @username, or department…"
              aria-label="Search contacts"
              className="pl-9 h-9 text-sm font-body"
            />
          </div>
        </DialogHeader>

        <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
          {contacts.length === 0 ? (
            <p className="text-center text-xs font-body text-muted-foreground py-8">
              No matching contacts found.
            </p>
          ) : (
            contacts.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-secondary/40"
              >
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    setProfileUserId(u.id);
                  }}
                  className="flex items-center gap-3 min-w-0 flex-1 text-left"
                >
                  <AvatarBadge
                    initials={u.avatarInitials}
                    colorClass={u.avatarColor}
                    name={u.fullName}
                    status={u.status}
                    showPresence={!u.isBlocked}
                    size="md"
                  />
                  <div className="min-w-0">
                    <p className="font-body text-sm font-semibold truncate">{u.fullName}</p>
                    <p className="font-body text-xs text-muted-foreground truncate">
                      {u.username} · {u.department}
                    </p>
                  </div>
                </button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    onOpenChange(false);
                    void openDirectChat(u.id);
                  }}
                  className="shrink-0 h-8 text-xs"
                >
                  <MessageCircle className="h-3.5 w-3.5 mr-1.5" /> Message
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* 3. User Profile Modal (opened when clicking a group member or contact) */
export function UserProfileDialog() {
  const { snapshot, profileUserId, setProfileUserId, openDirectChat, toggleBlockUser } =
    useCommunity();

  const user = snapshot && profileUserId ? snapshot.users[profileUserId] : null;
  const commonGroups = useMemo(() => {
    if (!snapshot || !profileUserId) return [];
    return snapshot.conversations.filter(
      (c) => c.type === "group" && c.participantIds.includes(profileUserId)
    );
  }, [snapshot, profileUserId]);

  return (
    <Dialog open={Boolean(user)} onOpenChange={(o) => !o && setProfileUserId(null)}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="sr-only">Member profile</DialogTitle>
          <DialogDescription className="sr-only">
            Profile details and messaging actions
          </DialogDescription>
        </DialogHeader>
        {user && snapshot && (
          <div className="space-y-4">
            <div className="flex flex-col items-center text-center space-y-2">
              <AvatarBadge
                initials={user.avatarInitials}
                colorClass={user.avatarColor}
                name={user.fullName}
                status={user.status}
                showPresence={!user.isBlocked}
                size="xl"
              />
              <div>
                <h3 className="font-display text-xl font-bold">{user.fullName}</h3>
                <p className="font-body text-xs text-muted-foreground">
                  {user.username} ·{" "}
                  {formatLastSeen(
                    user,
                    snapshot.privacySettings.lastSeenVisibility === "nobody"
                  )}
                </p>
              </div>
              <p className="font-body text-xs text-foreground/90">{user.bio}</p>
              <p className="font-body text-xs text-muted-foreground">
                {user.department} · {user.batchYear}
              </p>
            </div>

            {commonGroups.length > 0 && (
              <div className="border-t border-border pt-3 space-y-1.5">
                <p className="text-[11px] font-body font-semibold text-muted-foreground">
                  Groups in common ({commonGroups.length})
                </p>
                <div className="space-y-1">
                  {commonGroups.map((g) => (
                    <p key={g.id} className="text-xs font-body text-foreground/90">
                      · {g.title}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                onClick={() => void openDirectChat(user.id)}
                className="flex-1 h-10 text-xs font-body"
              >
                <MessageCircle className="h-4 w-4 mr-1.5" /> Send Message
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => void toggleBlockUser(user.id)}
                className="h-10 text-xs font-body text-destructive hover:text-destructive"
              >
                <Ban className="h-4 w-4 mr-1.5" />
                {user.isBlocked ? "Unblock" : "Block"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* 4. Create New Group Dialog */
export function NewGroupDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { snapshot, createGroup } = useCommunity();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const contacts = useMemo(() => {
    if (!snapshot) return [];
    return Object.values(snapshot.users).filter((u) => u.id !== snapshot.currentUserId);
  }, [snapshot]);

  const toggleMember = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    await createGroup({
      title,
      description,
      memberIds: selectedIds,
      isPublic,
    });
    setTitle("");
    setDescription("");
    setSelectedIds([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">Create Group</DialogTitle>
          <DialogDescription className="font-body text-xs">
            Start a study circle, halaqa, or project group with ASTU members.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-group-title" className="text-xs font-body">
              Group name
            </Label>
            <Input
              id="new-group-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Tafsir & Reflection Circle"
              required
              className="h-9 text-sm font-body"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new-group-desc" className="text-xs font-body">
              Description (optional)
            </Label>
            <Textarea
              id="new-group-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Purpose, meeting schedule, or guidelines…"
              className="text-xs font-body min-h-16"
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-xs font-body font-medium">Public campus group</p>
              <p className="text-[11px] font-body text-muted-foreground">
                Allow university members to join via invite link
              </p>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} aria-label="Public group" />
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-body font-medium">
              Add members ({selectedIds.length} selected)
            </p>
            <div className="max-h-44 overflow-y-auto rounded-lg border border-border divide-y divide-border/50">
              {contacts.map((u) => {
                const checked = selectedIds.includes(u.id);
                return (
                  <label
                    key={u.id}
                    className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-secondary/40"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleMember(u.id)}
                    />
                    <AvatarBadge
                      initials={u.avatarInitials}
                      colorClass={u.avatarColor}
                      name={u.fullName}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-body font-semibold truncate">{u.fullName}</p>
                      <p className="text-[11px] font-body text-muted-foreground truncate">
                        {u.department}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Check className="h-4 w-4 mr-1.5" /> Create Group
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* 5. Forward Message Dialog */
export function ForwardMessageDialog() {
  const { snapshot, forwardingMessage, setForwardingMessage, forwardToConversation } =
    useCommunity();
  const [query, setQuery] = useState("");

  const targets = useMemo(() => {
    if (!snapshot) return [];
    const q = query.trim().toLowerCase();
    return snapshot.conversations.filter(
      (c) => !q || c.title.toLowerCase().includes(q)
    );
  }, [snapshot, query]);

  return (
    <Dialog
      open={Boolean(forwardingMessage)}
      onOpenChange={(o) => !o && setForwardingMessage(null)}
    >
      <DialogContent className="sm:max-w-sm p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-3 border-b border-border">
          <DialogTitle className="font-display text-lg flex items-center gap-2">
            <Forward className="h-4 w-4 text-primary" /> Forward to…
          </DialogTitle>
          <DialogDescription className="sr-only">
            Select a chat or group to forward this message to
          </DialogDescription>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats or groups…"
            className="mt-2 h-9 text-sm font-body"
          />
        </DialogHeader>

        <div className="max-h-72 overflow-y-auto divide-y divide-border/50">
          {targets.map((conv) => (
            <button
              key={conv.id}
              type="button"
              onClick={() => void forwardToConversation(conv.id)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/50 text-left"
            >
              <AvatarBadge
                initials={conv.avatarInitials}
                colorClass={conv.avatarColor}
                name={conv.title}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-body font-medium truncate">{conv.title}</p>
                <p className="text-[11px] font-body text-muted-foreground">
                  {conv.type === "group" ? "Group" : "Direct chat"}
                </p>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* 6. Privacy & Notification Preferences Dialog */
export function CommunitySettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const {
    snapshot,
    updateNotificationPreferences,
    updatePrivacySettings,
    toggleBlockUser,
  } = useCommunity();
  const [tab, setTab] = useState<"notifications" | "privacy">("notifications");
  const pushStatus = getPushProviderStatus();

  if (!snapshot) return null;
  const { notificationPreferences: np, privacySettings: ps } = snapshot;
  const blockedUsers = Object.values(snapshot.users).filter((u) => u.isBlocked);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            Community Preferences
          </DialogTitle>
          <DialogDescription className="font-body text-xs">
            Manage messaging notifications, OneSignal readiness, and chat privacy.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 border-b border-border text-xs font-body">
          <button
            type="button"
            onClick={() => setTab("notifications")}
            className={
              tab === "notifications"
                ? "py-2.5 font-semibold text-primary border-b-2 border-primary flex items-center justify-center gap-1.5"
                : "py-2.5 text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5"
            }
          >
            <Bell className="h-3.5 w-3.5" /> Notifications
          </button>
          <button
            type="button"
            onClick={() => setTab("privacy")}
            className={
              tab === "privacy"
                ? "py-2.5 font-semibold text-primary border-b-2 border-primary flex items-center justify-center gap-1.5"
                : "py-2.5 text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5"
            }
          >
            <Lock className="h-3.5 w-3.5" /> Privacy &amp; Safety
          </button>
        </div>

        {tab === "notifications" ? (
          <div className="space-y-3.5 pt-1">
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
                key: "mentionsOnly" as const,
                label: "Mentions only in groups",
                desc: "Mute general group chatter unless mentioned",
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
        ) : (
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label className="text-xs font-body">Last seen &amp; online visibility</Label>
              <Select
                value={ps.lastSeenVisibility}
                onValueChange={(val) =>
                  void updatePrivacySettings({
                    lastSeenVisibility: val as "everyone" | "university" | "nobody",
                  })
                }
              >
                <SelectTrigger className="h-9 text-xs font-body">
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
              <Label className="text-xs font-body">Who can message me directly</Label>
              <Select
                value={ps.allowDirectMessagesFrom}
                onValueChange={(val) =>
                  void updatePrivacySettings({
                    allowDirectMessagesFrom: val as "everyone" | "group_members",
                  })
                }
              >
                <SelectTrigger className="h-9 text-xs font-body">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">All University Members</SelectItem>
                  <SelectItem value="group_members">Shared Group Members Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-body font-medium">Read receipts</p>
                <p className="text-[11px] font-body text-muted-foreground">
                  Show blue double-checks when you read messages
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

            <div className="border-t border-border pt-3 space-y-2">
              <p className="text-xs font-body font-medium">
                Blocked users ({blockedUsers.length})
              </p>
              {blockedUsers.length === 0 ? (
                <p className="text-[11px] font-body text-muted-foreground">
                  You haven't blocked anyone.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {blockedUsers.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between gap-2 rounded-lg bg-secondary/50 px-3 py-1.5"
                    >
                      <span className="text-xs font-body font-medium">{u.fullName}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => void toggleBlockUser(u.id)}
                        className="h-7 text-xs"
                      >
                        Unblock
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { useMemo, useState } from "react";
import {
  Ban,
  BarChart3,
  Bell,
  Check,
  Copy,
  Flag,
  Forward,
  Image as ImageIcon,
  Link2,
  Lock,
  Megaphone,
  MessageCircle,
  Plus,
  Search,
  Shield,
  Trash2,
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
import { useCommunity } from "@/features/community/CommunityContext";
import { formatLastSeen } from "@/features/community/formatters";
import { getPushProviderStatus } from "@/features/community/notifications";
import { CHAT_WALLPAPERS } from "@/features/community/wallpapers";
import { cn } from "@/lib/utils";
import { AvatarBadge } from "./AvatarBadge";
import { toast } from "sonner";

/* 1. Contacts Discovery Dialog */
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

/* 2. User Profile Modal */
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

/* 3. Create New Group Dialog */
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

/* 4. Create New Channel Dialog */
export function NewChannelDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { createChannel } = useCommunity();
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a channel name");
      return;
    }
    await createChannel({ title, username, description, isPublic });
    setTitle("");
    setUsername("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-primary" /> Create Channel
          </DialogTitle>
          <DialogDescription className="font-body text-xs">
            Broadcast announcements, reminders, and campus updates to subscribers.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-channel-title" className="text-xs font-body">
              Channel name
            </Label>
            <Input
              id="new-channel-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. ASTU Mosque Reminders"
              required
              className="h-9 text-sm font-body"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new-channel-handle" className="text-xs font-body">
              Public handle (optional)
            </Label>
            <Input
              id="new-channel-handle"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@astu_reminders"
              className="h-9 text-sm font-body"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new-channel-desc" className="text-xs font-body">
              Description
            </Label>
            <Textarea
              id="new-channel-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What subscribers will receive in this channel…"
              className="text-xs font-body min-h-16"
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-xs font-body font-medium">Public channel</p>
              <p className="text-[11px] font-body text-muted-foreground">
                Appear in Discover Channels for ASTU students
              </p>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} aria-label="Public channel" />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Check className="h-4 w-4 mr-1.5" /> Create Channel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* 5. Create Poll Dialog */
export function CreatePollDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { sendMessage } = useCommunity();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [multipleChoice, setMultipleChoice] = useState(false);
  const [anonymous, setAnonymous] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = options.map((o) => o.trim()).filter(Boolean);
    if (!question.trim() || cleaned.length < 2) {
      toast.error("Provide a question and at least 2 options");
      return;
    }
    await sendMessage("", undefined, {
      id: `poll-${Date.now()}`,
      question: question.trim(),
      options: cleaned.map((text, idx) => ({
        id: `opt-${Date.now()}-${idx}`,
        text,
        voterIds: [],
      })),
      multipleChoice,
      anonymous,
    });
    setQuestion("");
    setOptions(["", ""]);
    onOpenChange(false);
    toast.success("Poll published");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> Create Poll
          </DialogTitle>
          <DialogDescription className="font-body text-xs">
            Gather quick votes or feedback from members.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3.5">
          <div className="space-y-1">
            <Label htmlFor="poll-question" className="text-xs font-body">Question</Label>
            <Input
              id="poll-question"
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question…"
              className="h-9 text-sm font-body"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-body">Options</Label>
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={opt}
                  onChange={(e) =>
                    setOptions((prev) => prev.map((v, i) => (i === idx ? e.target.value : v)))
                  }
                  placeholder={`Option ${idx + 1}`}
                  className="h-9 text-xs font-body"
                />
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setOptions((prev) => prev.filter((_, i) => i !== idx))}
                    aria-label="Remove option"
                    className="h-8 w-8 text-muted-foreground"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
            {options.length < 5 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOptions((prev) => [...prev, ""])}
                className="h-8 text-xs font-body"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Option
              </Button>
            )}
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-body">Anonymous voting</span>
              <Switch checked={anonymous} onCheckedChange={setAnonymous} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-body">Allow multiple answers</span>
              <Switch checked={multipleChoice} onCheckedChange={setMultipleChoice} />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Publish Poll</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* 6. Set Wallpaper Dialog */
export function WallpaperDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { activeConversation, setConversationWallpaper } = useCommunity();

  if (!activeConversation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-lg flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-primary" /> Chat Wallpaper
          </DialogTitle>
          <DialogDescription className="font-body text-xs">
            Choose a backdrop for {activeConversation.title}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {CHAT_WALLPAPERS.map((wp) => {
            const selected = (activeConversation.wallpaperId || "default") === wp.id;
            return (
              <button
                key={wp.id}
                type="button"
                onClick={() => {
                  void setConversationWallpaper(activeConversation.id, wp.id);
                  onOpenChange(false);
                }}
                className={cn(
                  "rounded-xl border p-2 text-left space-y-1.5 transition-all",
                  selected
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className={cn("h-14 w-full rounded-lg", wp.previewClass)} />
                <p className="text-xs font-body font-medium truncate">{wp.name}</p>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* 7. Report Conversation Dialog */
export function ReportConversationDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { activeConversation, reportConversation } = useCommunity();
  const [reason, setReason] = useState("spam");
  const [details, setDetails] = useState("");

  if (!activeConversation) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await reportConversation(activeConversation.id, `${reason}: ${details}`.trim());
    setDetails("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-lg flex items-center gap-2">
            <Flag className="h-4 w-4 text-destructive" /> Report {activeConversation.title}
          </DialogTitle>
          <DialogDescription className="font-body text-xs">
            Reports are reviewed by ASTU Muslim Jemea moderators.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3.5">
          <div className="space-y-1">
            <Label className="text-xs font-body">Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="h-9 text-xs font-body">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spam">Spam or unsolicited promotion</SelectItem>
                <SelectItem value="harassment">Harassment or disrespectful conduct</SelectItem>
                <SelectItem value="misinformation">Misleading religious or academic info</SelectItem>
                <SelectItem value="other">Other concern</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="report-notes" className="text-xs font-body">Details (optional)</Label>
            <Textarea
              id="report-notes"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Share context for moderators…"
              className="text-xs font-body min-h-20"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive">Submit Report</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* 8. Forward Message Dialog */
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
            Select a chat, group, or channel to forward this message to
          </DialogDescription>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats, groups, or channels…"
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
                  {conv.type === "channel"
                    ? "Channel"
                    : conv.type === "group"
                      ? "Group"
                      : "Direct chat"}
                </p>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* 9. Privacy & Notification Preferences Dialog */
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
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
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
                key: "channelPosts" as const,
                label: "Channel broadcasts",
                desc: "Notify when subscribed channels post",
                value: np.channelPosts,
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

/* 10. Start New Chat Dialog */
export function StartNewChatDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { snapshot, openDirectChat } = useCommunity();
  const [query, setQuery] = useState("");

  const contacts = useMemo(() => {
    if (!snapshot) return [];
    const q = query.trim().toLowerCase();
    return Object.values(snapshot.users)
      .filter((u) => u.id !== snapshot.currentUserId && !u.isBlocked)
      .filter((u) => {
        if (!q) return true;
        return (
          u.fullName.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.department.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [snapshot, query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-3 border-b border-border">
          <DialogTitle className="font-display text-lg flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" /> Start New Chat
          </DialogTitle>
          <DialogDescription className="font-body text-xs">
            Choose a campus member to start or jump into a direct conversation.
          </DialogDescription>
          <div className="relative pt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-0.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search member by name, @username, or dept…"
              aria-label="Search member for new chat"
              className="pl-9 h-9 text-sm font-body"
            />
          </div>
        </DialogHeader>

        <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
          {contacts.length === 0 ? (
            <p className="text-center text-xs font-body text-muted-foreground py-8">
              No matching campus members found.
            </p>
          ) : (
            contacts.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  void openDirectChat(u.id);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/50 text-left transition-colors"
              >
                <AvatarBadge
                  initials={u.avatarInitials}
                  colorClass={u.avatarColor}
                  name={u.fullName}
                  status={u.status}
                  showPresence
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-body text-sm font-semibold truncate">{u.fullName}</p>
                  <p className="font-body text-xs text-muted-foreground truncate">
                    {u.username} · {u.department}
                  </p>
                </div>
                <span className="text-[11px] font-body font-medium text-primary shrink-0">
                  Message
                </span>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* 11. Add Contact / Campus Directory Lookup Dialog */
export function AddContactDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { snapshot, openDirectChat, setProfileUserId, setActiveTab } = useCommunity();
  const [handleQuery, setHandleQuery] = useState("");

  const matches = useMemo(() => {
    if (!snapshot) return [];
    const normalized = handleQuery.trim().replace(/^@/, "").toLowerCase();
    return Object.values(snapshot.users)
      .filter((u) => u.id !== snapshot.currentUserId)
      .filter((u) => {
        if (!normalized) return true;
        return (
          u.username.replace(/^@/, "").toLowerCase().includes(normalized) ||
          u.fullName.toLowerCase().includes(normalized) ||
          u.department.toLowerCase().includes(normalized)
        );
      });
  }, [snapshot, handleQuery]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-3 border-b border-border">
          <DialogTitle className="font-display text-lg flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" /> Add Contact
          </DialogTitle>
          <DialogDescription className="font-body text-xs">
            Find an ASTU student or organizer by @username, full name, or department.
          </DialogDescription>
          <div className="relative pt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-0.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={handleQuery}
              onChange={(e) => setHandleQuery(e.target.value)}
              placeholder="Enter @username or name…"
              aria-label="Lookup contact by username"
              className="pl-9 h-9 text-sm font-body"
            />
          </div>
        </DialogHeader>

        <div className="max-h-72 overflow-y-auto divide-y divide-border/50">
          {matches.length === 0 ? (
            <div className="text-center py-8 px-4 space-y-1">
              <p className="text-xs font-body font-medium">No matching member found</p>
              <p className="text-[11px] font-body text-muted-foreground">
                Ask your peer to set a @username in Community Settings → Account &amp; Profile.
              </p>
            </div>
          ) : (
            matches.map((u) => (
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
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="font-body text-xs font-semibold truncate">{u.fullName}</p>
                    <p className="font-body text-[11px] text-muted-foreground truncate">
                      {u.username} · {u.department}
                    </p>
                  </div>
                </button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    void openDirectChat(u.id);
                  }}
                  className="h-8 text-xs shrink-0"
                >
                  Connect
                </Button>
              </div>
            ))
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-border bg-secondary/30 flex items-center justify-between">
          <span className="text-[11px] font-body text-muted-foreground">
            {matches.length} campus directory member(s)
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onOpenChange(false);
              setActiveTab("contacts");
            }}
            className="h-7 text-xs"
          >
            Browse Contacts Tab
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* 12. Invite Members Dialog */
export function InviteMembersDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { snapshot, activeConversation, addGroupMember } = useCommunity();
  const [selectedConvId, setSelectedConvId] = useState<string>("");
  const [query, setQuery] = useState("");
  const [invitingId, setInvitingId] = useState<string | null>(null);

  const manageableSpaces = useMemo(() => {
    if (!snapshot) return [];
    return snapshot.conversations.filter(
      (c) => c.type === "group" || c.type === "channel"
    );
  }, [snapshot]);

  const targetConversation = useMemo(() => {
    if (
      activeConversation &&
      (activeConversation.type === "group" || activeConversation.type === "channel") &&
      !selectedConvId
    ) {
      return activeConversation;
    }
    return (
      manageableSpaces.find((c) => c.id === selectedConvId) ??
      manageableSpaces[0] ??
      null
    );
  }, [activeConversation, manageableSpaces, selectedConvId]);

  const candidates = useMemo(() => {
    if (!snapshot || !targetConversation) return [];
    const q = query.trim().toLowerCase();
    return Object.values(snapshot.users)
      .filter(
        (u) =>
          u.id !== snapshot.currentUserId &&
          !u.isBlocked &&
          !targetConversation.participantIds.includes(u.id)
      )
      .filter((u) => {
        if (!q) return true;
        return (
          u.fullName.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.department.toLowerCase().includes(q)
        );
      });
  }, [snapshot, targetConversation, query]);

  const shareLink =
    targetConversation?.inviteLink ||
    (typeof window !== "undefined" ? `${window.location.origin}/community` : "https://astu-jemea.app/community");

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success("Invite link copied to clipboard");
    } catch {
      toast.info(shareLink);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-3 border-b border-border">
          <DialogTitle className="font-display text-lg flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Invite Members
          </DialogTitle>
          <DialogDescription className="font-body text-xs">
            Add ASTU students directly to a group/channel or share an invite link.
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 space-y-3.5">
          {manageableSpaces.length > 0 && (
            <div className="space-y-1">
              <Label className="text-xs font-body">Target Group or Channel</Label>
              <Select
                value={targetConversation?.id}
                onValueChange={setSelectedConvId}
              >
                <SelectTrigger className="h-9 text-xs font-body" aria-label="Target group or channel">
                  <SelectValue placeholder="Choose a group or channel" />
                </SelectTrigger>
                <SelectContent>
                  {manageableSpaces.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title} ({c.type === "channel" ? "Channel" : "Group"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="rounded-xl border border-border bg-secondary/35 p-3 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-body font-semibold flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5 text-primary shrink-0" /> Shareable Invite Link
              </p>
              <p className="text-[11px] font-body text-muted-foreground truncate mt-0.5">
                {shareLink}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => void copyLink()}
              className="h-8 text-xs shrink-0"
            >
              <Copy className="h-3.5 w-3.5 mr-1" /> Copy
            </Button>
          </div>

          {targetConversation && (
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search members to add…"
                  aria-label="Search members to invite"
                  className="pl-8 h-8 text-xs font-body"
                />
              </div>

              <div className="max-h-52 overflow-y-auto rounded-lg border border-border divide-y divide-border/50">
                {candidates.length === 0 ? (
                  <p className="text-center text-xs font-body text-muted-foreground py-6">
                    All matching contacts are already members.
                  </p>
                ) : (
                  candidates.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between gap-2.5 px-3 py-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <AvatarBadge
                          initials={u.avatarInitials}
                          colorClass={u.avatarColor}
                          name={u.fullName}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-body font-semibold truncate">
                            {u.fullName}
                          </p>
                          <p className="text-[11px] font-body text-muted-foreground truncate">
                            {u.username} · {u.department}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        disabled={invitingId === u.id}
                        onClick={async () => {
                          setInvitingId(u.id);
                          try {
                            await addGroupMember(targetConversation.id, u.id);
                          } finally {
                            setInvitingId(null);
                          }
                        }}
                        className="h-7 text-xs shrink-0"
                      >
                        <UserPlus className="h-3 w-3 mr-1" /> Add
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

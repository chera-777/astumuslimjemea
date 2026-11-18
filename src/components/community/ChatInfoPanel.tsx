import { useMemo, useState } from "react";
import {
  Ban,
  Bell,
  BellOff,
  Check,
  Copy,
  Crown,
  FileText,
  Image as ImageIcon,
  Link2,
  Pencil,
  Pin,
  PinOff,
  RefreshCw,
  Shield,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCommunity } from "@/features/community/CommunityContext";
import { formatBytes, formatLastSeen } from "@/features/community/formatters";
import type { GroupRole } from "@/features/community/types";
import { AvatarBadge } from "./AvatarBadge";
import { toast } from "sonner";

export function ChatInfoPanel() {
  const isMobile = useIsMobile();
  const {
    snapshot,
    activeConversation,
    activeMessages,
    infoPanelOpen,
    setInfoPanelOpen,
    toggleMuteConversation,
    clearHistory,
    toggleBlockUser,
    togglePinMessage,
    updateGroupDetails,
    addGroupMember,
    removeGroupMember,
    updateGroupMemberRole,
    updateGroupMemberPermissions,
    openDirectChat,
    setProfileUserId,
    getPeerUser,
  } = useCommunity();

  const [tab, setTab] = useState<"overview" | "media" | "files" | "pinned">("overview");
  const [editingGroup, setEditingGroup] = useState(false);
  const [groupTitle, setGroupTitle] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [addingMember, setAddingMember] = useState(false);

  const sharedMedia = useMemo(
    () =>
      activeMessages.flatMap((m) =>
        (m.attachments ?? [])
          .filter((a) => (a.type === "image" || a.type === "video") && a.url)
          .map((a) => ({ ...a, createdAt: m.createdAt }))
      ),
    [activeMessages]
  );

  const sharedFiles = useMemo(
    () =>
      activeMessages.flatMap((m) =>
        (m.attachments ?? [])
          .filter((a) => a.type === "file")
          .map((a) => ({ ...a, createdAt: m.createdAt }))
      ),
    [activeMessages]
  );

  const pinnedMessages = useMemo(() => {
    if (!activeConversation) return [];
    return activeConversation.pinnedMessageIds
      .map((id) => activeMessages.find((m) => m.id === id))
      .filter((m): m is NonNullable<typeof m> => Boolean(m && !m.deletedForAll));
  }, [activeConversation, activeMessages]);

  if (!infoPanelOpen || !snapshot || !activeConversation) return null;

  const isGroup = activeConversation.type === "group";
  const peer = getPeerUser(activeConversation);
  const myMember = isGroup
    ? activeConversation.members?.find((m) => m.userId === snapshot.currentUserId)
    : undefined;
  const canManageGroup = myMember?.role === "owner" || myMember?.role === "admin";
  const isOwner = myMember?.role === "owner";

  const availableContacts = isGroup
    ? Object.values(snapshot.users).filter(
        (u) => u.id !== snapshot.currentUserId && !activeConversation.participantIds.includes(u.id)
      )
    : [];

  const copyInvite = async () => {
    if (!activeConversation.inviteLink) return;
    try {
      await navigator.clipboard.writeText(activeConversation.inviteLink);
      toast.success("Invite link copied");
    } catch {
      toast.info(activeConversation.inviteLink);
    }
  };

  const startEditGroup = () => {
    setGroupTitle(activeConversation.title);
    setGroupDesc(activeConversation.description || "");
    setEditingGroup(true);
  };

  const saveGroupEdit = async () => {
    if (!groupTitle.trim()) return;
    await updateGroupDetails(activeConversation.id, {
      title: groupTitle,
      description: groupDesc,
    });
    setEditingGroup(false);
  };

  const panelBody = (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="h-14 shrink-0 px-4 border-b border-border flex items-center justify-between">
        <h3 className="font-body text-sm font-semibold">
          {isGroup ? "Group Info" : "Contact Info"}
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setInfoPanelOpen(false)}
          aria-label="Close info panel"
          className="h-8 w-8 rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Identity hero */}
        <div className="px-4 py-5 border-b border-border/60 flex flex-col items-center text-center space-y-2.5">
          <AvatarBadge
            initials={activeConversation.avatarInitials}
            colorClass={activeConversation.avatarColor}
            name={activeConversation.title}
            status={peer?.status}
            showPresence={!isGroup && !peer?.isBlocked}
            size="xl"
          />
          {editingGroup ? (
            <div className="w-full space-y-2 text-left">
              <Input
                value={groupTitle}
                onChange={(e) => setGroupTitle(e.target.value)}
                aria-label="Group name"
                placeholder="Group name"
                className="h-9 text-sm font-body"
              />
              <Textarea
                value={groupDesc}
                onChange={(e) => setGroupDesc(e.target.value)}
                aria-label="Group description"
                placeholder="Group description"
                className="text-xs font-body min-h-20"
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setEditingGroup(false)}>
                  Cancel
                </Button>
                <Button type="button" size="sm" onClick={() => void saveGroupEdit()}>
                  <Check className="h-3.5 w-3.5 mr-1" /> Save
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <h4 className="font-display text-lg font-bold">{activeConversation.title}</h4>
                {isGroup && canManageGroup && (
                  <button
                    type="button"
                    onClick={startEditGroup}
                    aria-label="Edit group info"
                    className="p-1 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <p className="font-body text-xs text-muted-foreground">
                {isGroup
                  ? `${activeConversation.participantIds.length} members · ${activeConversation.isPublic ? "Public group" : "Private group"}`
                  : `${peer?.username || ""} · ${peer ? formatLastSeen(peer, snapshot.privacySettings.lastSeenVisibility === "nobody") : ""}`}
              </p>
              {isGroup && activeConversation.description && (
                <p className="font-body text-xs text-foreground/85 leading-relaxed max-w-xs">
                  {activeConversation.description}
                </p>
              )}
              {!isGroup && peer && (
                <div className="text-xs font-body text-muted-foreground space-y-1 pt-1">
                  <p className="text-foreground/90">{peer.bio}</p>
                  <p>
                    {peer.department} · {peer.batchYear}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Notification & Chat actions */}
        <div className="px-4 py-3 border-b border-border/60 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs font-body font-medium">
              {activeConversation.isMuted ? (
                <BellOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Bell className="h-4 w-4 text-primary" />
              )}
              <span>Notifications</span>
            </div>
            <Switch
              checked={!activeConversation.isMuted}
              onCheckedChange={() => void toggleMuteConversation(activeConversation.id)}
              aria-label="Toggle chat notifications"
            />
          </div>

          {isGroup && activeConversation.inviteLink && (
            <div className="rounded-lg bg-secondary/50 p-2.5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-[11px] font-body font-semibold text-muted-foreground">
                  <Link2 className="h-3.5 w-3.5" /> Invite Link
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => void copyInvite()}
                    className="text-[11px] font-body font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    <Copy className="h-3 w-3" /> Copy
                  </button>
                  {canManageGroup && (
                    <button
                      type="button"
                      onClick={() =>
                        void updateGroupDetails(activeConversation.id, { regenerateInvite: true })
                      }
                      aria-label="Regenerate invite link"
                      className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-[11px] font-mono text-muted-foreground truncate">
                {activeConversation.inviteLink}
              </p>
            </div>
          )}
        </div>

        {/* Sub-tabs */}
        <div className="grid grid-cols-4 border-b border-border/60 text-xs font-body">
          {[
            { id: "overview" as const, label: isGroup ? "Members" : "Actions" },
            { id: "pinned" as const, label: `Pins (${pinnedMessages.length})` },
            { id: "media" as const, label: `Media (${sharedMedia.length})` },
            { id: "files" as const, label: `Files (${sharedFiles.length})` },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={
                tab === item.id
                  ? "py-2.5 font-semibold text-primary border-b-2 border-primary"
                  : "py-2.5 text-muted-foreground hover:text-foreground"
              }
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Sub-tab content */}
        <div className="p-3 space-y-2">
          {tab === "overview" && isGroup && (
            <div className="space-y-3">
              {canManageGroup && (
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAddingMember((a) => !a)}
                    className="w-full justify-start text-xs h-9"
                  >
                    <UserPlus className="h-3.5 w-3.5 mr-2" />
                    {addingMember ? "Close member picker" : "Add member"}
                  </Button>
                  {addingMember && (
                    <div className="rounded-lg border border-border p-2 space-y-1 max-h-44 overflow-y-auto">
                      {availableContacts.length === 0 ? (
                        <p className="text-xs font-body text-muted-foreground px-2 py-1">
                          All contacts are already in this group.
                        </p>
                      ) : (
                        availableContacts.map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => void addGroupMember(activeConversation.id, u.id)}
                            className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded hover:bg-secondary text-left"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <AvatarBadge
                                initials={u.avatarInitials}
                                colorClass={u.avatarColor}
                                name={u.fullName}
                                size="sm"
                              />
                              <span className="text-xs font-body font-medium truncate">
                                {u.fullName}
                              </span>
                            </div>
                            <span className="text-[11px] font-body text-primary shrink-0">
                              + Add
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="divide-y divide-border/50">
                {(activeConversation.members ?? []).map((member) => {
                  const u = snapshot.users[member.userId];
                  if (!u) return null;
                  const isSelf = u.id === snapshot.currentUserId;
                  return (
                    <div key={member.userId} className="py-2.5 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (!isSelf) setProfileUserId(u.id);
                          }}
                          className="flex items-center gap-2.5 min-w-0 text-left"
                        >
                          <AvatarBadge
                            initials={u.avatarInitials}
                            colorClass={u.avatarColor}
                            name={u.fullName}
                            status={u.status}
                            showPresence={!isSelf}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-body font-semibold truncate">
                              {u.fullName}
                              {isSelf ? " (You)" : ""}
                            </p>
                            <p className="text-[11px] font-body text-muted-foreground truncate">
                              {u.department}
                            </p>
                          </div>
                        </button>

                        <div className="flex items-center gap-1 shrink-0 text-[11px] font-body text-muted-foreground">
                          {member.role === "owner" && (
                            <span className="flex items-center gap-1 text-primary font-medium">
                              <Crown className="h-3 w-3" /> Owner
                            </span>
                          )}
                          {member.role === "admin" && (
                            <span className="flex items-center gap-1 text-primary font-medium">
                              <Shield className="h-3 w-3" /> Admin
                            </span>
                          )}
                          {member.role === "member" && <span>Member</span>}
                        </div>
                      </div>

                      {/* Admin controls for non-owner members */}
                      {canManageGroup && !isSelf && member.role !== "owner" && (
                        <div className="flex flex-wrap items-center justify-between gap-2 pl-10 text-[11px] font-body">
                          <div className="flex items-center gap-2">
                            {isOwner && (
                              <button
                                type="button"
                                onClick={() =>
                                  void updateGroupMemberRole(
                                    activeConversation.id,
                                    u.id,
                                    member.role === "admin" ? "member" : ("admin" as GroupRole)
                                  )
                                }
                                className="text-primary hover:underline"
                              >
                                {member.role === "admin" ? "Demote" : "Make admin"}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                void updateGroupMemberPermissions(activeConversation.id, u.id, {
                                  canSendMessages: !member.permissions.canSendMessages,
                                })
                              }
                              className="text-muted-foreground hover:text-foreground"
                            >
                              {member.permissions.canSendMessages ? "Mute member" : "Allow send"}
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => void openDirectChat(u.id)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              Message
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                void removeGroupMember(activeConversation.id, u.id)
                              }
                              aria-label={`Remove ${u.fullName}`}
                              className="text-destructive hover:underline flex items-center gap-0.5"
                            >
                              <UserMinus className="h-3 w-3" /> Remove
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "overview" && !isGroup && peer && (
            <div className="space-y-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void clearHistory(activeConversation.id)}
                className="w-full justify-start text-xs font-body text-muted-foreground hover:text-foreground"
              >
                <Trash2 className="h-4 w-4 mr-2.5" /> Clear chat history
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void toggleBlockUser(peer.id)}
                className="w-full justify-start text-xs font-body text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Ban className="h-4 w-4 mr-2.5" />
                {peer.isBlocked ? `Unblock ${peer.fullName}` : `Block ${peer.fullName}`}
              </Button>
            </div>
          )}

          {tab === "pinned" && (
            <div className="space-y-2">
              {pinnedMessages.length === 0 ? (
                <p className="text-xs font-body text-muted-foreground text-center py-6">
                  No pinned messages yet.
                </p>
              ) : (
                pinnedMessages.map((pm) => (
                  <div
                    key={pm.id}
                    className="rounded-lg border border-border/70 p-2.5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-body font-semibold text-primary">
                        {pm.senderId === snapshot.currentUserId
                          ? "You"
                          : snapshot.users[pm.senderId]?.fullName || "Member"}
                      </span>
                      <button
                        type="button"
                        onClick={() => void togglePinMessage(pm.id)}
                        aria-label="Unpin message"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <PinOff className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-xs font-body text-foreground/90">
                      {pm.text || pm.attachments?.[0]?.name || "Attachment"}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "media" && (
            <div>
              {sharedMedia.length === 0 ? (
                <div className="text-center py-8 space-y-1.5">
                  <ImageIcon className="h-6 w-6 mx-auto text-muted-foreground/50" />
                  <p className="text-xs font-body text-muted-foreground">
                    No photos or videos shared yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1.5">
                  {sharedMedia.map((m) => (
                    <div key={m.id} className="aspect-square overflow-hidden rounded-md bg-secondary">
                      {m.type === "image" ? (
                        <img
                          src={m.url}
                          alt={m.name}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <video src={m.url} className="h-full w-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "files" && (
            <div className="space-y-1.5">
              {sharedFiles.length === 0 ? (
                <div className="text-center py-8 space-y-1.5">
                  <FileText className="h-6 w-6 mx-auto text-muted-foreground/50" />
                  <p className="text-xs font-body text-muted-foreground">
                    No files shared yet.
                  </p>
                </div>
              ) : (
                sharedFiles.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center gap-2.5 rounded-lg border border-border/60 p-2"
                  >
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-body font-medium truncate">{f.name}</p>
                      <p className="text-[10px] font-body text-muted-foreground tabular-nums">
                        {formatBytes(f.sizeBytes)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Desktop wide panel vs Tablet/Mobile Sheet
  if (!isMobile) {
    return (
      <aside
        aria-label="Conversation info"
        className="hidden lg:flex w-[320px] xl:w-[340px] shrink-0 border-l border-border h-full flex-col"
      >
        {panelBody}
      </aside>
    );
  }

  return (
    <Sheet open={infoPanelOpen} onOpenChange={setInfoPanelOpen}>
      <SheetContent side="right" className="p-0 w-full sm:max-w-sm">
        <SheetTitle className="sr-only">Conversation details</SheetTitle>
        {panelBody}
      </SheetContent>
    </Sheet>
  );
}

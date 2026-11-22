import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  BarChart3,
  Bell,
  BellOff,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Flag,
  Forward,
  Image as ImageIcon,
  Lock,
  LogOut,
  MessageSquare,
  MoreVertical,
  Phone,
  Pin,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  Sparkles,
  Trash2,
  UserCheck,
  Users,
  Video,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCommunity } from "@/features/community/CommunityContext";
import {
  formatCountCompact,
  formatDateDivider,
  formatLastSeen,
} from "@/features/community/formatters";
import { getWallpaperById } from "@/features/community/wallpapers";
import type { ChatMessage } from "@/features/community/types";
import { cn } from "@/lib/utils";
import { AvatarBadge } from "./AvatarBadge";
import { MessageBubble } from "./MessageBubble";
import { MessageComposer } from "./MessageComposer";

interface ChatThreadPaneProps {
  onOpenWallpaper: () => void;
  onOpenCreatePoll: () => void;
  onOpenReport: () => void;
}

type ConfirmAction = "clear" | "deleteChat" | "leave" | "bulkDelete" | null;

export function ChatThreadPane({
  onOpenWallpaper,
  onOpenCreatePoll,
  onOpenReport,
}: ChatThreadPaneProps) {
  const {
    snapshot,
    activeConversation,
    activeMessages,
    selectConversation,
    typingMap,
    setReplyTo,
    setEditingMessage,
    deleteMessage,
    toggleReaction,
    votePoll,
    setForwardingMessage,
    selectedMessageIds,
    selectionMode,
    toggleSelectMessage,
    clearSelection,
    bulkCopySelected,
    bulkDeleteSelected,
    bulkForwardSelected,
    togglePinMessage,
    toggleMuteConversation,
    toggleDisableSharing,
    exportChatHistory,
    clearHistory,
    deleteConversation,
    leaveConversation,
    subscribeChannel,
    boostChannel,
    toggleBlockUser,
    infoPanelOpen,
    setInfoPanelOpen,
    rightPaneMode,
    setRightPaneMode,
    setInfoPanelTab,
    setProfileUserId,
    inChatSearchOpen,
    setInChatSearchOpen,
    getPeerUser,
    startCall,
  } = useCommunity();

  const [inChatQuery, setInChatQuery] = useState("");
  const [searchMatchIdx, setSearchMatchIdx] = useState(0);
  const [pinnedIdx, setPinnedIdx] = useState(0);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; caption?: string } | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [deleteTargetMessage, setDeleteTargetMessage] = useState<ChatMessage | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);

  // Reset search when switching chats
  useEffect(() => {
    setInChatQuery("");
    setSearchMatchIdx(0);
    setPinnedIdx(0);
  }, [activeConversation?.id]);

  // Auto-scroll to bottom on new message or conversation change
  useEffect(() => {
    bottomAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.id, activeMessages.length]);

  const jumpToMessage = (messageId: string) => {
    const el = document.getElementById(`msg-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedId(messageId);
      setTimeout(() => setHighlightedId((curr) => (curr === messageId ? null : curr)), 1600);
    }
  };

  const searchMatches = useMemo(() => {
    const q = inChatQuery.trim().toLowerCase();
    if (!q) return [];
    return activeMessages.filter(
      (m) => !m.deletedForAll && m.text.toLowerCase().includes(q)
    );
  }, [activeMessages, inChatQuery]);

  const pinnedMessages = useMemo(() => {
    if (!activeConversation) return [];
    return activeConversation.pinnedMessageIds
      .map((id) => activeMessages.find((m) => m.id === id))
      .filter((m): m is NonNullable<typeof m> => Boolean(m && !m.deletedForAll));
  }, [activeConversation, activeMessages]);

  if (!snapshot || !activeConversation) {
    return (
      <section
        aria-label="Active conversation"
        className="flex-1 flex flex-col items-center justify-center h-full bg-background/60 px-6 text-center"
      >
        <div className="max-w-sm space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <MessageSquare className="h-7 w-7" />
          </div>
          <h2 className="font-display text-xl font-bold">Select a conversation</h2>
          <p className="font-body text-sm text-muted-foreground">
            Choose a direct chat, study group, or channel from the left panel to message, share resources, or follow broadcasts.
          </p>
        </div>
      </section>
    );
  }

  const peer = getPeerUser(activeConversation);
  const typingIds = typingMap[activeConversation.id] ?? [];
  const isDirect = activeConversation.type === "direct";
  const isGroup = activeConversation.type === "group";
  const isChannel = activeConversation.type === "channel";

  const currentMember =
    isGroup || isChannel
      ? activeConversation.members?.find((m) => m.userId === snapshot.currentUserId)
      : undefined;
  const isAdminOrOwner =
    currentMember?.role === "owner" || currentMember?.role === "admin";

  const onlineGroupCount = isGroup
    ? activeConversation.participantIds.filter(
        (id) => snapshot.users[id]?.status === "online"
      ).length
    : 0;

  let subtitle = "";
  if (typingIds.length > 0) {
    if (isGroup) {
      const typer = snapshot.users[typingIds[0]]?.fullName.split(" ")[0] || "Someone";
      subtitle = `${typer} is typing…`;
    } else {
      subtitle = "typing…";
    }
  } else if (isChannel) {
    subtitle = `${formatCountCompact(activeConversation.subscriberCount ?? 0)} subscribers · ${activeConversation.boostCount ?? 0} boosts`;
  } else if (isGroup) {
    subtitle = `${activeConversation.participantIds.length} members · ${onlineGroupCount} online`;
  } else if (peer) {
    subtitle = formatLastSeen(
      peer,
      snapshot.privacySettings.lastSeenVisibility === "nobody"
    );
  }

  const sharingDisabled =
    Boolean(activeConversation.sharingDisabled) ||
    (isChannel && activeConversation.channelSettings?.allowForwarding === false);

  const allowReactions = isChannel
    ? activeConversation.channelSettings?.allowReactions !== false
    : true;

  const canPinMessages = isDirect || Boolean(currentMember?.permissions.canPinMessages);
  const canCreatePoll =
    (isGroup && (isAdminOrOwner || Boolean(currentMember?.permissions.canCreatePolls))) ||
    (isChannel && isAdminOrOwner);

  const composerDisabled =
    (peer?.isBlocked ?? false) ||
    (isGroup && currentMember && !currentMember.permissions.canSendMessages) ||
    (isChannel && !isAdminOrOwner);

  const composerDisabledReason = peer?.isBlocked
    ? `You blocked ${peer.fullName}. Unblock to send messages.`
    : isChannel
      ? "Only channel administrators can broadcast posts."
      : "Sending messages is restricted for your role in this group.";

  const activePinned = pinnedMessages[pinnedIdx % Math.max(1, pinnedMessages.length)];
  const wallpaper = getWallpaperById(activeConversation.wallpaperId);

  const stepSearchMatch = (delta: number) => {
    if (searchMatches.length === 0) return;
    const nextIdx = (searchMatchIdx + delta + searchMatches.length) % searchMatches.length;
    setSearchMatchIdx(nextIdx);
    jumpToMessage(searchMatches[nextIdx].id);
  };

  const openInfoSection = (tab: "overview" | "members" | "permissions" | "settings") => {
    setRightPaneMode("info");
    setInfoPanelTab(tab);
    setInfoPanelOpen(true);
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    if (confirmAction === "clear") {
      await clearHistory(activeConversation.id);
    } else if (confirmAction === "deleteChat") {
      await deleteConversation(activeConversation.id);
    } else if (confirmAction === "leave") {
      await leaveConversation(activeConversation.id);
    } else if (confirmAction === "bulkDelete") {
      await bulkDeleteSelected(false);
    }
    setConfirmAction(null);
  };

  return (
    <section
      aria-label={activeConversation.title}
      className="relative flex-1 flex flex-col h-full min-w-0 bg-background"
    >
      {/* CHAT HEADER: Back + Clickable Identity (Profile/Group/Channel Info) + Voice Call + Video Call + Three-Dot Menu */}
      <header className="h-14 shrink-0 px-3 sm:px-4 border-b border-border bg-card flex items-center justify-between gap-2 z-20">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => void selectConversation(null)}
            aria-label="Back to conversation list"
            className="md:hidden h-9 w-9 rounded-full shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <button
            type="button"
            onClick={() => {
              setRightPaneMode("info");
              setInfoPanelTab("overview");
              setInfoPanelOpen(rightPaneMode === "settings" ? true : !infoPanelOpen);
            }}
            aria-label={`Open ${activeConversation.title} details`}
            className="flex items-center gap-2.5 min-w-0 text-left rounded-lg py-1 pr-2 hover:bg-secondary/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <AvatarBadge
              initials={activeConversation.avatarInitials}
              colorClass={activeConversation.avatarColor}
              name={activeConversation.title}
              status={peer?.status}
              showPresence={isDirect && !peer?.isBlocked}
              size="sm"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <h2 className="font-body text-sm font-semibold truncate leading-tight">
                  {activeConversation.title}
                </h2>
                {activeConversation.isMuted && (
                  <VolumeX
                    className="h-3 w-3 text-muted-foreground shrink-0"
                    aria-label="Notifications muted"
                  />
                )}
              </div>
              <p
                className={
                  typingIds.length > 0
                    ? "font-body text-xs text-primary font-medium truncate"
                    : "font-body text-xs text-muted-foreground truncate tabular-nums"
                }
              >
                {subtitle}
              </p>
            </div>
          </button>
        </div>

        {/* Right Side: ONLY Voice Call, Video Call, and Three-Dot Menu */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => startCall(activeConversation, "voice")}
            aria-label={
              isChannel
                ? "Start audio broadcast"
                : isGroup
                  ? "Start group voice call"
                  : "Start voice call"
            }
            title={isChannel ? "Live Audio Stream" : "Voice Call"}
            className="h-9 w-9 rounded-full"
          >
            <Phone className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => startCall(activeConversation, "video")}
            aria-label={
              isChannel
                ? "Start video broadcast"
                : isGroup
                  ? "Start group video call"
                  : "Start video call"
            }
            title={isChannel ? "Live Video Broadcast" : "Video Call"}
            className="h-9 w-9 rounded-full"
          >
            <Video className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Conversation options"
                title="More options"
                className="h-9 w-9 rounded-full"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 font-body text-xs">
              {/* DIRECT CHAT MENU */}
              {isDirect && (
                <>
                  <DropdownMenuItem
                    onClick={() => void toggleMuteConversation(activeConversation.id)}
                    className="gap-2.5 text-xs"
                  >
                    {activeConversation.isMuted ? (
                      <Volume2 className="h-4 w-4" />
                    ) : (
                      <VolumeX className="h-4 w-4" />
                    )}
                    {activeConversation.isMuted ? "Unmute Notifications" : "Mute Notifications"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onOpenWallpaper} className="gap-2.5 text-xs">
                    <ImageIcon className="h-4 w-4" /> Set Wallpaper
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => void toggleDisableSharing(activeConversation.id)}
                    className="gap-2.5 text-xs"
                  >
                    <Lock className="h-4 w-4" />
                    {activeConversation.sharingDisabled ? "Enable Sharing" : "Disable Sharing"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => void exportChatHistory(activeConversation.id)}
                    className="gap-2.5 text-xs"
                  >
                    <Download className="h-4 w-4" /> Export Chat History
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setConfirmAction("clear")}
                    className="gap-2.5 text-xs text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" /> Clear Chat History
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setConfirmAction("deleteChat")}
                    className="gap-2.5 text-xs text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" /> Delete Chat
                  </DropdownMenuItem>
                </>
              )}

              {/* GROUP CHAT MENU */}
              {isGroup && (
                <>
                  <DropdownMenuItem
                    onClick={() => void toggleMuteConversation(activeConversation.id)}
                    className="gap-2.5 text-xs"
                  >
                    {activeConversation.isMuted ? (
                      <Bell className="h-4 w-4" />
                    ) : (
                      <BellOff className="h-4 w-4" />
                    )}
                    {activeConversation.isMuted ? "Unmute Notifications" : "Mute Notifications"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onOpenWallpaper} className="gap-2.5 text-xs">
                    <ImageIcon className="h-4 w-4" /> Set Group Wallpaper
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setInChatSearchOpen(true)}
                    className="gap-2.5 text-xs"
                  >
                    <Search className="h-4 w-4" /> Search in Conversation
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => void exportChatHistory(activeConversation.id)}
                    className="gap-2.5 text-xs"
                  >
                    <Download className="h-4 w-4" /> Export Chat History
                  </DropdownMenuItem>

                  {isAdminOrOwner && (
                    <>
                      <DropdownMenuSeparator />
                      {canCreatePoll && (
                        <DropdownMenuItem onClick={onOpenCreatePoll} className="gap-2.5 text-xs">
                          <BarChart3 className="h-4 w-4" /> Create Poll
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => openInfoSection("overview")}
                        className="gap-2.5 text-xs"
                      >
                        <Settings className="h-4 w-4" /> Manage Group
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openInfoSection("members")}
                        className="gap-2.5 text-xs"
                      >
                        <Users className="h-4 w-4" /> Manage Members
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openInfoSection("permissions")}
                        className="gap-2.5 text-xs"
                      >
                        <Shield className="h-4 w-4" /> Group Permissions
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onOpenReport} className="gap-2.5 text-xs">
                    <Flag className="h-4 w-4" /> Report Group
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setConfirmAction("leave")}
                    className="gap-2.5 text-xs text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" /> Leave Group
                  </DropdownMenuItem>
                </>
              )}

              {/* CHANNEL MENU */}
              {isChannel && (
                <>
                  <DropdownMenuItem
                    onClick={() => void toggleMuteConversation(activeConversation.id)}
                    className="gap-2.5 text-xs"
                  >
                    {activeConversation.isMuted ? (
                      <Bell className="h-4 w-4" />
                    ) : (
                      <BellOff className="h-4 w-4" />
                    )}
                    {activeConversation.isMuted ? "Unmute Notifications" : "Mute Notifications"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => void boostChannel(activeConversation.id)}
                    className="gap-2.5 text-xs"
                  >
                    <Sparkles className="h-4 w-4" /> Boost Channel
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setInChatSearchOpen(true)}
                    className="gap-2.5 text-xs"
                  >
                    <Search className="h-4 w-4" /> Search in Channel
                  </DropdownMenuItem>
                  {(isAdminOrOwner || !sharingDisabled) && (
                    <DropdownMenuItem
                      onClick={() => void exportChatHistory(activeConversation.id)}
                      className="gap-2.5 text-xs"
                    >
                      <Download className="h-4 w-4" /> Export Channel History
                    </DropdownMenuItem>
                  )}

                  {isAdminOrOwner && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={onOpenCreatePoll} className="gap-2.5 text-xs">
                        <BarChart3 className="h-4 w-4" /> Create Poll
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openInfoSection("overview")}
                        className="gap-2.5 text-xs"
                      >
                        <Settings className="h-4 w-4" /> Manage Channel
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openInfoSection("settings")}
                        className="gap-2.5 text-xs"
                      >
                        <Shield className="h-4 w-4" /> Channel Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openInfoSection("members")}
                        className="gap-2.5 text-xs"
                      >
                        <UserCheck className="h-4 w-4" /> Manage Administrators
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onOpenReport} className="gap-2.5 text-xs">
                    <Flag className="h-4 w-4" /> Report Channel
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setConfirmAction("leave")}
                    className="gap-2.5 text-xs text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" /> Leave Channel
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* MULTI-SELECT ACTION BAR */}
      {selectionMode && (
        <div className="shrink-0 flex items-center justify-between gap-2 px-3 sm:px-4 py-2 border-b border-border bg-primary/10">
          <span className="text-xs font-body font-semibold tabular-nums">
            {selectedMessageIds.length} selected
          </span>
          <div className="flex items-center gap-1.5">
            {!sharingDisabled && (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => void bulkCopySelected()}
                  className="h-8 text-xs font-body"
                >
                  <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={bulkForwardSelected}
                  className="h-8 text-xs font-body"
                >
                  <Forward className="h-3.5 w-3.5 mr-1" /> Forward
                </Button>
              </>
            )}
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => setConfirmAction("bulkDelete")}
              className="h-8 text-xs font-body"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={clearSelection}
              className="h-8 text-xs font-body"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* IN-CHAT SEARCH BAR */}
      {inChatSearchOpen && (
        <div className="shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 border-b border-border bg-card/95">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            autoFocus
            value={inChatQuery}
            onChange={(e) => {
              setInChatQuery(e.target.value);
              setSearchMatchIdx(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") stepSearchMatch(1);
            }}
            placeholder={isChannel ? "Search posts in this channel…" : "Search messages in this chat…"}
            aria-label="Search messages in this chat"
            className="h-8 border-0 bg-secondary/60 text-xs font-body"
          />
          {inChatQuery.trim() && (
            <span className="text-xs font-body text-muted-foreground tabular-nums whitespace-nowrap">
              {searchMatches.length === 0
                ? "0 results"
                : `${(searchMatchIdx % searchMatches.length) + 1} / ${searchMatches.length}`}
            </span>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={searchMatches.length === 0}
            onClick={() => stepSearchMatch(-1)}
            aria-label="Previous match"
            className="h-7 w-7 shrink-0"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={searchMatches.length === 0}
            onClick={() => stepSearchMatch(1)}
            aria-label="Next match"
            className="h-7 w-7 shrink-0"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              setInChatSearchOpen(false);
              setInChatQuery("");
            }}
            aria-label="Close in-chat search"
            className="h-7 w-7 shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* PINNED MESSAGE BAR */}
      {activePinned && (
        <div className="shrink-0 flex items-center justify-between gap-3 px-3 sm:px-4 py-2 border-b border-border/70 bg-card/85">
          <button
            type="button"
            onClick={() => {
              jumpToMessage(activePinned.id);
              if (pinnedMessages.length > 1) {
                setPinnedIdx((i) => (i + 1) % pinnedMessages.length);
              }
            }}
            className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
          >
            <Pin className="h-4 w-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-body font-semibold text-primary">
                Pinned message
                {pinnedMessages.length > 1
                  ? ` · ${(pinnedIdx % pinnedMessages.length) + 1} of ${pinnedMessages.length}`
                  : ""}
              </p>
              <p className="text-xs font-body text-muted-foreground truncate">
                {activePinned.poll
                  ? `Poll: ${activePinned.poll.question}`
                  : activePinned.text || activePinned.attachments?.[0]?.name || "Media attachment"}
              </p>
            </div>
          </button>
          {canPinMessages && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Unpin message"
              onClick={() => void togglePinMessage(activePinned.id)}
              className="h-7 w-7 shrink-0 text-muted-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}

      {/* SHARING RESTRICTED NOTICE */}
      {sharingDisabled && (
        <div className="shrink-0 flex items-center gap-2 px-4 py-1.5 bg-secondary/70 border-b border-border text-[11px] font-body text-muted-foreground">
          <Lock className="h-3.5 w-3.5 shrink-0" />
          <span>Content copying and forwarding are disabled in this {activeConversation.type}.</span>
        </div>
      )}

      {/* BLOCKED BANNER */}
      {peer?.isBlocked && (
        <div className="shrink-0 flex items-center justify-between gap-2 px-4 py-2 bg-destructive/10 border-b border-destructive/20 text-xs font-body">
          <span className="flex items-center gap-2 text-destructive font-medium">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            You have blocked {peer.fullName}.
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void toggleBlockUser(peer.id)}
            className="h-7 text-xs"
          >
            Unblock
          </Button>
        </div>
      )}

      {/* SCROLLABLE MESSAGE FEED WITH SELECTED WALLPAPER */}
      <div
        ref={scrollContainerRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
          setShowScrollBottom(distFromBottom > 240);
        }}
        className={cn(
          "flex-1 overflow-y-auto py-3",
          snapshot.accessibilityPreferences.compactMode ? "space-y-1" : "space-y-1.5",
          wallpaper.canvasClass
        )}
      >
        {activeMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 py-12 space-y-2">
            <p className="font-body text-sm font-medium">No messages here yet</p>
            <p className="font-body text-xs text-muted-foreground max-w-xs">
              {isChannel
                ? "Channel broadcasts and announcements will appear here."
                : "Send a greeting below to start the conversation."}
            </p>
          </div>
        ) : (
          activeMessages.map((msg, idx) => {
            const prev = activeMessages[idx - 1];
            const dateLabel = formatDateDivider(msg.createdAt);
            const prevDateLabel = prev ? formatDateDivider(prev.createdAt) : null;
            const showDateDivider = dateLabel !== prevDateLabel;
            const showSenderHeader =
              !prev || prev.senderId !== msg.senderId || showDateDivider;
            const replyTarget = msg.replyToId
              ? activeMessages.find((m) => m.id === msg.replyToId)
              : undefined;
            const isMine = msg.senderId === snapshot.currentUserId;

            return (
              <div key={msg.id} className="space-y-1.5">
                {showDateDivider && (
                  <div className="flex justify-center py-2">
                    <span className="px-3 py-0.5 rounded-full bg-secondary/80 text-[11px] font-body font-medium text-muted-foreground">
                      {dateLabel}
                    </span>
                  </div>
                )}
                <MessageBubble
                  message={msg}
                  mine={isMine}
                  isGroup={isGroup}
                  isChannel={isChannel}
                  showSenderHeader={showSenderHeader}
                  sender={snapshot.users[msg.senderId]}
                  replyTarget={replyTarget}
                  replyTargetSender={
                    replyTarget ? snapshot.users[replyTarget.senderId] : undefined
                  }
                  currentUserId={snapshot.currentUserId}
                  readReceiptsEnabled={snapshot.privacySettings.readReceiptsEnabled}
                  sharingDisabled={sharingDisabled}
                  allowReactions={allowReactions}
                  canEdit={
                    isMine &&
                    Boolean(msg.text) &&
                    (!isChannel || isAdminOrOwner)
                  }
                  canPin={canPinMessages}
                  highlighted={highlightedId === msg.id}
                  selectionMode={selectionMode}
                  isSelected={selectedMessageIds.includes(msg.id)}
                  onToggleSelect={toggleSelectMessage}
                  onReply={setReplyTo}
                  onEdit={setEditingMessage}
                  onRequestDelete={(target) => setDeleteTargetMessage(target)}
                  onForward={setForwardingMessage}
                  onToggleReaction={(id, emoji) => void toggleReaction(id, emoji)}
                  onVotePoll={(id, optionId) => void votePoll(id, optionId)}
                  onTogglePin={(id) => void togglePinMessage(id)}
                  onJumpToMessage={jumpToMessage}
                  onOpenImage={(url, caption) => setLightboxImage({ url, caption })}
                  onSelectSender={(uid) => setProfileUserId(uid)}
                  textSize={snapshot.accessibilityPreferences.textSize}
                  compactMode={snapshot.accessibilityPreferences.compactMode}
                  highContrastBubbles={snapshot.accessibilityPreferences.highContrastBubbles}
                  reducedMotion={snapshot.accessibilityPreferences.reducedMotion}
                />
              </div>
            );
          })
        )}
        <div ref={bottomAnchorRef} />
      </div>

      {/* SCROLL TO BOTTOM JUMP BUTTON */}
      {showScrollBottom && (
        <Button
          type="button"
          size="icon"
          variant="secondary"
          aria-label="Scroll to latest messages"
          onClick={() => bottomAnchorRef.current?.scrollIntoView({ behavior: "smooth" })}
          className="absolute bottom-20 right-4 h-10 w-10 rounded-full shadow-md border border-border z-20"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      )}

      {/* COMPOSER OR CHANNEL SUBSCRIBER FOOTER */}
      {isChannel && !isAdminOrOwner ? (
        <div className="shrink-0 border-t border-border bg-card px-4 py-2.5 flex items-center justify-center gap-3">
          {!activeConversation.isSubscribed ? (
            <Button
              type="button"
              onClick={() => void subscribeChannel(activeConversation.id)}
              className="w-full max-w-xs h-10 text-xs font-body font-semibold"
            >
              Join Channel
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => void toggleMuteConversation(activeConversation.id)}
                className="flex-1 max-w-[180px] h-10 text-xs font-body"
              >
                {activeConversation.isMuted ? (
                  <>
                    <Bell className="h-4 w-4 mr-1.5" /> Unmute
                  </>
                ) : (
                  <>
                    <BellOff className="h-4 w-4 mr-1.5" /> Mute
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => void boostChannel(activeConversation.id)}
                className="flex-1 max-w-[180px] h-10 text-xs font-body"
              >
                <Sparkles className="h-4 w-4 mr-1.5 text-primary" /> Boost ({activeConversation.boostCount ?? 0})
              </Button>
            </>
          )}
        </div>
      ) : (
        <MessageComposer
          disabled={composerDisabled}
          disabledReason={composerDisabledReason}
          placeholder={isChannel ? "Broadcast a post to subscribers…" : "Message"}
        />
      )}

      {/* IMAGE LIGHTBOX DIALOG */}
      <Dialog open={Boolean(lightboxImage)} onOpenChange={(o) => !o && setLightboxImage(null)}>
        <DialogContent className="max-w-3xl p-2 bg-card border-border">
          <DialogTitle className="sr-only">Image preview</DialogTitle>
          {lightboxImage && (
            <div className="space-y-2">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.caption || "Shared photo"}
                referrerPolicy="no-referrer"
                className="max-h-[75vh] w-full object-contain rounded-lg"
              />
              {lightboxImage.caption && (
                <p className="px-2 pb-1 text-xs font-body text-muted-foreground">
                  {lightboxImage.caption}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MESSAGE DELETE CONFIRMATION DIALOG */}
      <AlertDialog
        open={Boolean(deleteTargetMessage)}
        onOpenChange={(o) => !o && setDeleteTargetMessage(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete message?</AlertDialogTitle>
            <AlertDialogDescription>
              Choose whether to remove this message only from your view or for everyone in the conversation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (deleteTargetMessage) void deleteMessage(deleteTargetMessage.id, false);
                setDeleteTargetMessage(null);
              }}
            >
              Delete for me
            </Button>
            {deleteTargetMessage &&
              (deleteTargetMessage.senderId === snapshot.currentUserId || isAdminOrOwner) && (
                <AlertDialogAction
                  onClick={() => {
                    void deleteMessage(deleteTargetMessage.id, true);
                    setDeleteTargetMessage(null);
                  }}
                >
                  Delete for everyone
                </AlertDialogAction>
              )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* CONVERSATION DESTRUCTIVE ACTION CONFIRMATION DIALOG */}
      <AlertDialog open={Boolean(confirmAction)} onOpenChange={(o) => !o && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === "clear"
                ? "Clear chat history?"
                : confirmAction === "deleteChat"
                  ? "Delete this conversation?"
                  : confirmAction === "bulkDelete"
                    ? `Delete ${selectedMessageIds.length} selected message(s)?`
                    : isChannel
                      ? `Leave ${activeConversation.title}?`
                      : `Leave ${activeConversation.title}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === "clear"
                ? "All messages in this thread will be cleared from your history."
                : confirmAction === "deleteChat"
                  ? "This will permanently remove this direct chat and its messages from your list."
                  : confirmAction === "bulkDelete"
                    ? "Selected messages will be removed from your view."
                    : isChannel
                      ? "You will unsubscribe from this channel and stop receiving broadcasts."
                      : "You will leave this group and stop receiving new messages."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleConfirm()}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  Bell,
  BellOff,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  PanelRight,
  Pin,
  Search,
  ShieldAlert,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useCommunity } from "@/features/community/CommunityContext";
import { formatDateDivider, formatLastSeen } from "@/features/community/formatters";
import { AvatarBadge } from "./AvatarBadge";
import { MessageBubble } from "./MessageBubble";
import { MessageComposer } from "./MessageComposer";

export function ChatThreadPane() {
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
    setForwardingMessage,
    togglePinMessage,
    toggleMuteConversation,
    toggleBlockUser,
    infoPanelOpen,
    setInfoPanelOpen,
    setProfileUserId,
    getPeerUser,
  } = useCommunity();

  const [inChatSearchOpen, setInChatSearchOpen] = useState(false);
  const [inChatQuery, setInChatQuery] = useState("");
  const [searchMatchIdx, setSearchMatchIdx] = useState(0);
  const [pinnedIdx, setPinnedIdx] = useState(0);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; caption?: string } | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);

  // Reset search when switching chats
  useEffect(() => {
    setInChatSearchOpen(false);
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
            Choose a direct chat or campus group from the left panel to read messages, share resources, or start a discussion.
          </p>
        </div>
      </section>
    );
  }

  const peer = getPeerUser(activeConversation);
  const typingIds = typingMap[activeConversation.id] ?? [];
  const isGroup = activeConversation.type === "group";

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
  } else if (isGroup) {
    subtitle = `${activeConversation.participantIds.length} members · ${onlineGroupCount} online`;
  } else if (peer) {
    subtitle = formatLastSeen(
      peer,
      snapshot.privacySettings.lastSeenVisibility === "nobody"
    );
  }

  const currentMember = isGroup
    ? activeConversation.members?.find((m) => m.userId === snapshot.currentUserId)
    : undefined;
  const composerDisabled =
    (peer?.isBlocked ?? false) ||
    (isGroup && currentMember && !currentMember.permissions.canSendMessages);
  const composerDisabledReason = peer?.isBlocked
    ? `You blocked ${peer.fullName}. Unblock to send messages.`
    : "Sending messages is restricted for your role in this group.";

  const activePinned = pinnedMessages[pinnedIdx % Math.max(1, pinnedMessages.length)];

  const stepSearchMatch = (delta: number) => {
    if (searchMatches.length === 0) return;
    const nextIdx = (searchMatchIdx + delta + searchMatches.length) % searchMatches.length;
    setSearchMatchIdx(nextIdx);
    jumpToMessage(searchMatches[nextIdx].id);
  };

  return (
    <section
      aria-label={activeConversation.title}
      className="relative flex-1 flex flex-col h-full min-w-0 bg-background"
    >
      {/* CHAT HEADER */}
      <header className="h-14 shrink-0 px-3 sm:px-4 border-b border-border bg-card flex items-center justify-between gap-2 z-20">
        <div className="flex items-center gap-2.5 min-w-0">
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
            onClick={() => setInfoPanelOpen(!infoPanelOpen)}
            className="flex items-center gap-2.5 min-w-0 text-left rounded-lg py-1 pr-2 hover:bg-secondary/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <AvatarBadge
              initials={activeConversation.avatarInitials}
              colorClass={activeConversation.avatarColor}
              name={activeConversation.title}
              status={peer?.status}
              showPresence={!isGroup && !peer?.isBlocked}
              size="sm"
            />
            <div className="min-w-0">
              <h2 className="font-body text-sm font-semibold truncate leading-tight">
                {activeConversation.title}
              </h2>
              <p
                className={
                  typingIds.length > 0
                    ? "font-body text-xs text-primary font-medium truncate"
                    : "font-body text-xs text-muted-foreground truncate"
                }
              >
                {subtitle}
              </p>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="button"
            variant={inChatSearchOpen ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setInChatSearchOpen((o) => !o)}
            aria-label="Search in conversation"
            title="Search in conversation"
            className="h-9 w-9 rounded-full"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => void toggleMuteConversation(activeConversation.id)}
            aria-label={activeConversation.isMuted ? "Unmute conversation" : "Mute conversation"}
            title={activeConversation.isMuted ? "Unmute" : "Mute"}
            className="h-9 w-9 rounded-full"
          >
            {activeConversation.isMuted ? (
              <BellOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Bell className="h-4 w-4" />
            )}
          </Button>
          <Button
            type="button"
            variant={infoPanelOpen ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setInfoPanelOpen(!infoPanelOpen)}
            aria-label="Toggle chat info panel"
            title="Chat Info"
            className="h-9 w-9 rounded-full"
          >
            <PanelRight className="h-4 w-4" />
          </Button>
        </div>
      </header>

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
            placeholder="Search messages in this chat…"
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
                Pinned message{pinnedMessages.length > 1 ? ` · ${(pinnedIdx % pinnedMessages.length) + 1} of ${pinnedMessages.length}` : ""}
              </p>
              <p className="text-xs font-body text-muted-foreground truncate">
                {activePinned.text || activePinned.attachments?.[0]?.name || "Media attachment"}
              </p>
            </div>
          </button>
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

      {/* SCROLLABLE MESSAGE FEED */}
      <div
        ref={scrollContainerRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
          setShowScrollBottom(distFromBottom > 240);
        }}
        className="flex-1 overflow-y-auto py-3 space-y-1.5"
      >
        {activeMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 py-12 space-y-2">
            <p className="font-body text-sm font-medium">No messages here yet</p>
            <p className="font-body text-xs text-muted-foreground max-w-xs">
              Send a greeting below to start the conversation.
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
                  mine={msg.senderId === snapshot.currentUserId}
                  isGroup={isGroup}
                  showSenderHeader={showSenderHeader}
                  sender={snapshot.users[msg.senderId]}
                  replyTarget={replyTarget}
                  replyTargetSender={
                    replyTarget ? snapshot.users[replyTarget.senderId] : undefined
                  }
                  currentUserId={snapshot.currentUserId}
                  readReceiptsEnabled={snapshot.privacySettings.readReceiptsEnabled}
                  highlighted={highlightedId === msg.id}
                  onReply={setReplyTo}
                  onEdit={setEditingMessage}
                  onDelete={(id, forAll) => void deleteMessage(id, forAll)}
                  onForward={setForwardingMessage}
                  onToggleReaction={(id, emoji) => void toggleReaction(id, emoji)}
                  onTogglePin={(id) => void togglePinMessage(id)}
                  onJumpToMessage={jumpToMessage}
                  onOpenImage={(url, caption) => setLightboxImage({ url, caption })}
                  onSelectSender={(uid) => setProfileUserId(uid)}
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

      {/* MESSAGE COMPOSER */}
      <MessageComposer
        disabled={composerDisabled}
        disabledReason={composerDisabledReason}
      />

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
    </section>
  );
}

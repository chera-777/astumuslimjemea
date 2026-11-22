import { useEffect, useRef, useState } from "react";
import {
  Check,
  CheckCheck,
  CheckSquare,
  Copy,
  Download,
  Eye,
  FileText,
  Forward,
  Pencil,
  Pin,
  PinOff,
  Reply,
  SmilePlus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatBytes,
  formatCountCompact,
  formatMessageTime,
} from "@/features/community/formatters";
import type { ChatMessage, CommunityUser } from "@/features/community/types";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { VoiceMessageBubble } from "./VoiceMessageBubble";
import { AvatarBadge } from "./AvatarBadge";
import { toast } from "sonner";

const QUICK_REACTIONS = ["👍", "❤️", "🤲", "🎉", "😂", "🔥"];
const EXTRA_REACTIONS = ["🌙", "📖", "👏", "✨", "✅", "💚"];

interface MessageBubbleProps {
  message: ChatMessage;
  mine: boolean;
  isGroup: boolean;
  isChannel?: boolean;
  showSenderHeader: boolean;
  sender?: CommunityUser;
  replyTarget?: ChatMessage;
  replyTargetSender?: CommunityUser;
  currentUserId: string;
  readReceiptsEnabled: boolean;
  sharingDisabled?: boolean;
  allowReactions?: boolean;
  canEdit?: boolean;
  canPin?: boolean;
  highlighted?: boolean;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect: (messageId: string) => void;
  onReply: (message: ChatMessage) => void;
  onEdit: (message: ChatMessage) => void;
  onRequestDelete: (message: ChatMessage) => void;
  onForward: (message: ChatMessage) => void;
  onToggleReaction: (messageId: string, emoji: string) => void;
  onVotePoll?: (messageId: string, optionId: string) => void;
  onTogglePin: (messageId: string) => void;
  onJumpToMessage: (messageId: string) => void;
  onOpenImage: (url: string, caption?: string) => void;
  onSelectSender?: (userId: string) => void;
  textSize?: "small" | "default" | "large";
  compactMode?: boolean;
  highContrastBubbles?: boolean;
  reducedMotion?: boolean;
}

export function MessageBubble({
  message,
  mine,
  isGroup,
  isChannel = false,
  showSenderHeader,
  sender,
  replyTarget,
  replyTargetSender,
  currentUserId,
  readReceiptsEnabled,
  sharingDisabled = false,
  allowReactions = true,
  canEdit = mine && Boolean(message.text),
  canPin = true,
  highlighted = false,
  selectionMode = false,
  isSelected = false,
  onToggleSelect,
  onReply,
  onEdit,
  onRequestDelete,
  onForward,
  onToggleReaction,
  onVotePoll,
  onTogglePin,
  onJumpToMessage,
  onOpenImage,
  onSelectSender,
  textSize = "default",
  compactMode = false,
  highContrastBubbles = false,
  reducedMotion = false,
}: MessageBubbleProps) {
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showMoreReactions, setShowMoreReactions] = useState(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressedRef = useRef(false);
  const desktopMenuWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen || isMobile) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (
        desktopMenuWrapperRef.current &&
        !desktopMenuWrapperRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen, isMobile]);

  const handleCopy = async () => {
    if (sharingDisabled) {
      toast.error("Copying is disabled in this conversation");
      setMenuOpen(false);
      return;
    }
    if (!message.text) return;
    try {
      await navigator.clipboard.writeText(message.text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Could not copy message");
    }
    setMenuOpen(false);
  };

  if (message.deletedForAll) {
    return (
      <div
        id={`msg-${message.id}`}
        className={cn("flex w-full px-2 sm:px-4", mine && !isChannel ? "justify-end" : "justify-start")}
      >
        <div className="rounded-xl px-3.5 py-2 text-xs italic text-muted-foreground border border-border/60 bg-card/50">
          This message was deleted
        </div>
      </div>
    );
  }

  const clearLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleTouchStart = () => {
    longPressedRef.current = false;
    clearLongPress();
    longPressTimerRef.current = setTimeout(() => {
      longPressedRef.current = true;
      if (selectionMode) {
        onToggleSelect(message.id);
      } else {
        setMenuOpen(true);
      }
    }, 450);
  };

  const handleBubbleClick = () => {
    if (longPressedRef.current) {
      longPressedRef.current = false;
      return;
    }
    if (selectionMode) {
      onToggleSelect(message.id);
    } else {
      setShowMoreReactions(false);
      setMenuOpen((prev) => !prev);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (selectionMode) {
      onToggleSelect(message.id);
    } else {
      setShowMoreReactions(false);
      setMenuOpen(true);
    }
  };

  const alignRight = mine && !isChannel;

  const actionMenuContent = (
    <div className="space-y-1">
      {/* Quick Reaction Bar */}
      {allowReactions && (
        <div className="pb-1.5 mb-1 border-b border-border space-y-1.5">
          <div className="flex items-center justify-between gap-1 px-0.5">
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onToggleReaction(message.id, emoji);
                }}
                aria-label={`React with ${emoji}`}
                className="h-8 w-8 rounded-md hover:bg-secondary flex items-center justify-center text-base transition-transform hover:scale-110"
              >
                {emoji}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowMoreReactions((v) => !v)}
              aria-label="More reactions"
              className="h-8 w-8 rounded-md hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <SmilePlus className="h-4 w-4" />
            </button>
          </div>
          {showMoreReactions && (
            <div className="flex items-center justify-between gap-1 px-0.5">
              {EXTRA_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onToggleReaction(message.id, emoji);
                  }}
                  aria-label={`React with ${emoji}`}
                  className="h-8 w-8 rounded-md hover:bg-secondary flex items-center justify-center text-base transition-transform hover:scale-110"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          setMenuOpen(false);
          onReply(message);
        }}
        className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-body rounded-md hover:bg-secondary text-left"
      >
        <Reply className="h-3.5 w-3.5 text-muted-foreground" /> Reply
      </button>

      {allowReactions && (
        <button
          type="button"
          onClick={() => setShowMoreReactions((v) => !v)}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-body rounded-md hover:bg-secondary text-left"
        >
          <SmilePlus className="h-3.5 w-3.5 text-muted-foreground" /> React
        </button>
      )}

      {!sharingDisabled && (
        <button
          type="button"
          onClick={() => {
            setMenuOpen(false);
            onForward(message);
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-body rounded-md hover:bg-secondary text-left"
        >
          <Forward className="h-3.5 w-3.5 text-muted-foreground" /> Forward
        </button>
      )}

      {message.text && !sharingDisabled && (
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-body rounded-md hover:bg-secondary text-left"
        >
          <Copy className="h-3.5 w-3.5 text-muted-foreground" /> Copy
        </button>
      )}

      {canPin && (
        <button
          type="button"
          onClick={() => {
            setMenuOpen(false);
            onTogglePin(message.id);
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-body rounded-md hover:bg-secondary text-left"
        >
          {message.isPinned ? (
            <PinOff className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <Pin className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          {message.isPinned ? "Unpin" : "Pin"}
        </button>
      )}

      {canEdit && (
        <button
          type="button"
          onClick={() => {
            setMenuOpen(false);
            onEdit(message);
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-body rounded-md hover:bg-secondary text-left"
        >
          <Pencil className="h-3.5 w-3.5 text-muted-foreground" /> Edit
        </button>
      )}

      <button
        type="button"
        onClick={() => {
          setMenuOpen(false);
          onToggleSelect(message.id);
        }}
        className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-body rounded-md hover:bg-secondary text-left"
      >
        <CheckSquare className="h-3.5 w-3.5 text-muted-foreground" /> Select
      </button>

      <button
        type="button"
        onClick={() => {
          setMenuOpen(false);
          onRequestDelete(message);
        }}
        className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-body rounded-md hover:bg-destructive/10 text-destructive text-left"
      >
        <Trash2 className="h-3.5 w-3.5" /> Delete
      </button>
    </div>
  );

  // Total poll votes
  const totalPollVotes = message.poll
    ? new Set(message.poll.options.flatMap((o) => o.voterIds)).size
    : 0;

  const bubbleElement = (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Message actions for ${message.text || "attachment"}`}
      onClick={handleBubbleClick}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={clearLongPress}
      onTouchMove={clearLongPress}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleBubbleClick();
        }
      }}
      className={cn(
        "relative max-w-[84%] sm:max-w-[72%] lg:max-w-[62%] rounded-2xl shadow-sm cursor-pointer select-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        reducedMotion ? "transition-none" : "transition-all",
        compactMode ? "px-3 py-1.5" : "px-3.5 py-2",
        textSize === "small" ? "text-xs" : textSize === "large" ? "text-[15px]" : "text-sm",
        alignRight
          ? highContrastBubbles
            ? "bg-primary text-primary-foreground ring-1 ring-primary-foreground/30 rounded-br-sm"
            : "bg-primary text-primary-foreground rounded-br-sm"
          : highContrastBubbles
            ? "bg-card text-card-foreground border-2 border-foreground/30 rounded-bl-sm"
            : "bg-card text-card-foreground border border-border/70 rounded-bl-sm",
        isSelected && "ring-2 ring-primary ring-offset-1 ring-offset-background"
      )}
    >
      {/* Group sender header */}
      {!mine && isGroup && !isChannel && showSenderHeader && sender && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectSender?.(sender.id);
          }}
          className="flex items-center gap-2 mb-1 text-left hover:underline focus-visible:outline-none"
        >
          <span className="font-body text-xs font-semibold text-primary">
            {sender.fullName}
          </span>
          {sender.communityRole && sender.communityRole !== "Member" && (
            <span className="font-body text-[11px] text-muted-foreground">
              · {sender.communityRole}
            </span>
          )}
        </button>
      )}

      {/* Channel post header */}
      {isChannel && showSenderHeader && sender && (
        <p className="font-body text-[11px] font-semibold text-primary mb-1">
          {sender.fullName}
        </p>
      )}

      {/* Forwarded header */}
      {message.forwardedFrom && (
        <div
          className={cn(
            "flex items-center gap-1.5 text-[11px] font-body mb-1",
            alignRight ? "text-primary-foreground/80" : "text-primary"
          )}
        >
          <Forward className="h-3 w-3 shrink-0" />
          <span className="truncate">
            Forwarded from {message.forwardedFrom.senderName}
          </span>
        </div>
      )}

      {/* Reply quote block */}
      {replyTarget && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onJumpToMessage(replyTarget.id);
          }}
          className={cn(
            "w-full text-left rounded-lg px-2.5 py-1.5 mb-1.5 transition-colors block",
            alignRight
              ? "bg-primary-foreground/15 hover:bg-primary-foreground/20"
              : "bg-secondary/80 hover:bg-secondary"
          )}
        >
          <p
            className={cn(
              "text-[11px] font-body font-semibold truncate",
              alignRight ? "text-primary-foreground" : "text-primary"
            )}
          >
            {replyTarget.senderId === currentUserId
              ? "You"
              : replyTargetSender?.fullName || "Member"}
          </p>
          <p
            className={cn(
              "text-xs font-body truncate",
              alignRight ? "text-primary-foreground/80" : "text-muted-foreground"
            )}
          >
            {replyTarget.deletedForAll
              ? "Deleted message"
              : replyTarget.text || (replyTarget.attachments?.[0]?.name ?? "Attachment")}
          </p>
        </button>
      )}

      {/* Attachments */}
      {message.attachments?.map((att) => {
        if (att.type === "image" && att.url) {
          return (
            <button
              key={att.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenImage(att.url!, message.text);
              }}
              className="block overflow-hidden rounded-xl mb-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <img
                src={att.url}
                alt={att.name}
                referrerPolicy="no-referrer"
                className="max-h-64 w-full object-cover rounded-xl hover:opacity-95 transition-opacity"
              />
            </button>
          );
        }
        if (att.type === "video" && att.url) {
          return (
            <div
              key={att.id}
              onClick={(e) => e.stopPropagation()}
              className="overflow-hidden rounded-xl mb-1.5 bg-black/80"
            >
              <video src={att.url} controls className="max-h-64 w-full rounded-xl" />
            </div>
          );
        }
        if (att.type === "voice") {
          return (
            <div key={att.id} onClick={(e) => e.stopPropagation()}>
              <VoiceMessageBubble attachment={att} mine={alignRight} />
            </div>
          );
        }
        return (
          <div
            key={att.id}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "flex items-center gap-2.5 rounded-xl p-2.5 mb-1.5",
              alignRight ? "bg-primary-foreground/15" : "bg-secondary/80"
            )}
          >
            <div
              className={cn(
                "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                alignRight
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-primary/15 text-primary"
              )}
            >
              <FileText className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-body font-medium truncate">{att.name}</p>
              <p
                className={cn(
                  "text-[11px] font-body tabular-nums",
                  alignRight ? "text-primary-foreground/75" : "text-muted-foreground"
                )}
              >
                {formatBytes(att.sizeBytes)}
              </p>
            </div>
            {att.url ? (
              <a
                href={att.url}
                download={att.name}
                aria-label={`Download ${att.name}`}
                className="p-1.5 rounded-lg hover:bg-black/10 transition-colors"
              >
                <Download className="h-4 w-4" />
              </a>
            ) : (
              <button
                type="button"
                onClick={() => toast.info(`${att.name} ready for offline preview`)}
                aria-label={`Download ${att.name}`}
                className="p-1.5 rounded-lg hover:bg-black/10 transition-colors"
              >
                <Download className="h-4 w-4" />
              </button>
            )}
          </div>
        );
      })}

      {/* Interactive Poll */}
      {message.poll && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="space-y-2 py-1 min-w-[220px] sm:min-w-[270px]"
        >
          <div>
            <p className="font-body text-sm font-semibold leading-snug">
              {message.poll.question}
            </p>
            <p
              className={cn(
                "text-[11px] font-body mt-0.5",
                alignRight ? "text-primary-foreground/75" : "text-muted-foreground"
              )}
            >
              {message.poll.anonymous ? "Anonymous poll" : "Public poll"}
              {message.poll.multipleChoice ? " · Multiple choice" : ""}
            </p>
          </div>
          <div className="space-y-1.5">
            {message.poll.options.map((opt) => {
              const voted = opt.voterIds.includes(currentUserId);
              const pct =
                totalPollVotes > 0
                  ? Math.round((opt.voterIds.length / totalPollVotes) * 100)
                  : 0;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onVotePoll?.(message.id, opt.id)}
                  className={cn(
                    "relative w-full overflow-hidden rounded-lg border px-2.5 py-2 text-left text-xs font-body transition-colors",
                    alignRight
                      ? voted
                        ? "border-primary-foreground bg-primary-foreground/20 font-semibold"
                        : "border-primary-foreground/30 hover:bg-primary-foreground/10"
                      : voted
                        ? "border-primary bg-primary/10 font-semibold"
                        : "border-border bg-secondary/50 hover:bg-secondary"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-y-0 left-0 transition-all duration-300",
                      alignRight ? "bg-primary-foreground/15" : "bg-primary/15"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                  <span className="relative flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 truncate">
                      {voted && <Check className="h-3.5 w-3.5 shrink-0" />}
                      <span className="truncate">{opt.text}</span>
                    </span>
                    <span className="tabular-nums text-[11px] shrink-0">
                      {pct}% ({opt.voterIds.length})
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <p
            className={cn(
              "text-[11px] font-body tabular-nums",
              alignRight ? "text-primary-foreground/75" : "text-muted-foreground"
            )}
          >
            {totalPollVotes} {totalPollVotes === 1 ? "vote" : "votes"}
          </p>
        </div>
      )}

      {/* Message text */}
      {message.text && (
        <p className="font-body text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.text}
        </p>
      )}

      {/* Reactions row */}
      {message.reactions.length > 0 && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex flex-wrap gap-1 mt-1.5"
        >
          {message.reactions.map((r) => {
            const reacted = r.userIds.includes(currentUserId);
            return (
              <button
                key={r.emoji}
                type="button"
                disabled={!allowReactions}
                onClick={() => onToggleReaction(message.id, r.emoji)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-body transition-colors tabular-nums",
                  alignRight
                    ? reacted
                      ? "bg-primary-foreground text-primary font-semibold"
                      : "bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30"
                    : reacted
                      ? "bg-primary/15 text-primary border border-primary/40 font-semibold"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                <span>{r.emoji}</span>
                <span>{r.userIds.length}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Footer metadata: Views (channel), Pin, Edited, Timestamp, Delivery/Read */}
      <div
        className={cn(
          "flex items-center justify-end gap-1.5 mt-1 text-[10px] font-body tabular-nums",
          alignRight ? "text-primary-foreground/75" : "text-muted-foreground"
        )}
      >
        {isChannel && message.viewsCount !== undefined && (
          <span className="inline-flex items-center gap-1 mr-1" aria-label={`${message.viewsCount} views`}>
            <Eye className="h-3 w-3" /> {formatCountCompact(message.viewsCount)}
          </span>
        )}
        {message.isPinned && <Pin className="h-2.5 w-2.5" aria-label="Pinned" />}
        {message.editedAt && <span>edited</span>}
        <span>{formatMessageTime(message.createdAt)}</span>
        {alignRight && (
          <span aria-label={`Status: ${message.deliveryStatus}`}>
            {message.deliveryStatus === "read" && readReceiptsEnabled ? (
              <CheckCheck className="h-3.5 w-3.5 text-primary-foreground" />
            ) : message.deliveryStatus === "delivered" || message.deliveryStatus === "read" ? (
              <CheckCheck className="h-3.5 w-3.5 opacity-75" />
            ) : (
              <Check className="h-3.5 w-3.5 opacity-75" />
            )}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div
      id={`msg-${message.id}`}
      onClick={() => {
        if (selectionMode) onToggleSelect(message.id);
      }}
      className={cn(
        "group flex items-end gap-2 px-2 sm:px-4 transition-colors duration-300 rounded-lg py-0.5",
        alignRight ? "justify-end" : "justify-start",
        highlighted && "bg-primary/10",
        isSelected && "bg-primary/12"
      )}
    >
      {selectionMode && (
        <button
          type="button"
          aria-label={isSelected ? "Deselect message" : "Select message"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(message.id);
          }}
          className={cn(
            "h-5 w-5 rounded-full border flex items-center justify-center shrink-0 mb-2 transition-colors",
            isSelected
              ? "bg-primary border-primary text-primary-foreground"
              : "border-muted-foreground/50 bg-card"
          )}
        >
          {isSelected && <Check className="h-3 w-3" />}
        </button>
      )}

      {!mine && isGroup && !isChannel && (
        <div className="w-8 shrink-0">
          {showSenderHeader && sender ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectSender?.(sender.id);
              }}
              aria-label={`View ${sender.fullName} profile`}
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <AvatarBadge
                initials={sender.avatarInitials}
                colorClass={sender.avatarColor}
                name={sender.fullName}
                size="sm"
              />
            </button>
          ) : null}
        </div>
      )}

      {isMobile ? (
        <>
          {bubbleElement}
          {menuOpen && (
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetContent side="bottom" className="rounded-t-2xl p-4 pb-6">
                <SheetTitle className="font-body text-sm font-semibold mb-1">
                  Message Actions
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Reply, react, forward, copy, edit, select, or delete this message
                </SheetDescription>
                {actionMenuContent}
              </SheetContent>
            </Sheet>
          )}
        </>
      ) : (
        <div
          ref={desktopMenuWrapperRef}
          className={cn(
            "relative flex flex-col flex-1 min-w-0",
            alignRight ? "items-end" : "items-start"
          )}
        >
          {bubbleElement}
          {menuOpen && (
            <div
              role="dialog"
              aria-label="Message contextual actions"
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "z-40 mt-1.5 w-56 rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-lg",
                alignRight ? "self-end" : "self-start"
              )}
            >
              {actionMenuContent}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

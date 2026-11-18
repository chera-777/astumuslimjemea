import { useState } from "react";
import {
  Check,
  CheckCheck,
  Copy,
  Download,
  FileText,
  Forward,
  MoreHorizontal,
  Pencil,
  Pin,
  PinOff,
  Reply,
  SmilePlus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBytes, formatMessageTime } from "@/features/community/formatters";
import type { ChatMessage, CommunityUser } from "@/features/community/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { VoiceMessageBubble } from "./VoiceMessageBubble";
import { AvatarBadge } from "./AvatarBadge";
import { toast } from "sonner";

const QUICK_REACTIONS = ["👍", "❤️", "🤲", "🎉", "😂", "🔥"];

interface MessageBubbleProps {
  message: ChatMessage;
  mine: boolean;
  isGroup: boolean;
  showSenderHeader: boolean;
  sender?: CommunityUser;
  replyTarget?: ChatMessage;
  replyTargetSender?: CommunityUser;
  currentUserId: string;
  readReceiptsEnabled: boolean;
  highlighted?: boolean;
  onReply: (message: ChatMessage) => void;
  onEdit: (message: ChatMessage) => void;
  onDelete: (messageId: string, forEveryone: boolean) => void;
  onForward: (message: ChatMessage) => void;
  onToggleReaction: (messageId: string, emoji: string) => void;
  onTogglePin: (messageId: string) => void;
  onJumpToMessage: (messageId: string) => void;
  onOpenImage: (url: string, caption?: string) => void;
  onSelectSender?: (userId: string) => void;
}

export function MessageBubble({
  message,
  mine,
  isGroup,
  showSenderHeader,
  sender,
  replyTarget,
  replyTargetSender,
  currentUserId,
  readReceiptsEnabled,
  highlighted = false,
  onReply,
  onEdit,
  onDelete,
  onForward,
  onToggleReaction,
  onTogglePin,
  onJumpToMessage,
  onOpenImage,
  onSelectSender,
}: MessageBubbleProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleCopy = async () => {
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
        className={cn("flex w-full px-2 sm:px-4", mine ? "justify-end" : "justify-start")}
      >
        <div className="rounded-xl px-3.5 py-2 text-xs italic text-muted-foreground border border-border/60 bg-card/50">
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div
      id={`msg-${message.id}`}
      className={cn(
        "group flex items-end gap-2 px-2 sm:px-4 transition-colors duration-300 rounded-lg py-0.5",
        mine ? "justify-end" : "justify-start",
        highlighted && "bg-primary/10"
      )}
    >
      {!mine && isGroup && (
        <div className="w-8 shrink-0">
          {showSenderHeader && sender ? (
            <button
              type="button"
              onClick={() => onSelectSender?.(sender.id)}
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

      {mine && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0 mb-1">
          <MessageActionsPopover
            open={menuOpen}
            onOpenChange={setMenuOpen}
            message={message}
            mine={mine}
            onReply={() => { setMenuOpen(false); onReply(message); }}
            onEdit={() => { setMenuOpen(false); onEdit(message); }}
            onForward={() => { setMenuOpen(false); onForward(message); }}
            onTogglePin={() => { setMenuOpen(false); onTogglePin(message.id); }}
            onCopy={handleCopy}
            onDeleteForMe={() => { setMenuOpen(false); onDelete(message.id, false); }}
            onDeleteForAll={() => { setMenuOpen(false); onDelete(message.id, true); }}
            onReact={(emoji) => { setMenuOpen(false); onToggleReaction(message.id, emoji); }}
          />
        </div>
      )}

      <div
        className={cn(
          "relative max-w-[82%] sm:max-w-[70%] lg:max-w-[60%] rounded-2xl px-3.5 py-2 shadow-sm transition-colors",
          mine
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-card text-card-foreground border border-border/70 rounded-bl-sm"
        )}
      >
        {/* Group sender name */}
        {!mine && isGroup && showSenderHeader && sender && (
          <button
            type="button"
            onClick={() => onSelectSender?.(sender.id)}
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

        {/* Forwarded header */}
        {message.forwardedFrom && (
          <div
            className={cn(
              "flex items-center gap-1.5 text-[11px] font-body mb-1",
              mine ? "text-primary-foreground/80" : "text-primary"
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
            onClick={() => onJumpToMessage(replyTarget.id)}
            className={cn(
              "w-full text-left rounded-lg px-2.5 py-1.5 mb-1.5 transition-colors block",
              mine
                ? "bg-primary-foreground/15 hover:bg-primary-foreground/20"
                : "bg-secondary/80 hover:bg-secondary"
            )}
          >
            <p
              className={cn(
                "text-[11px] font-body font-semibold truncate",
                mine ? "text-primary-foreground" : "text-primary"
              )}
            >
              {replyTarget.senderId === currentUserId
                ? "You"
                : replyTargetSender?.fullName || "Member"}
            </p>
            <p
              className={cn(
                "text-xs font-body truncate",
                mine ? "text-primary-foreground/80" : "text-muted-foreground"
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
                onClick={() => onOpenImage(att.url!, message.text)}
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
              <div key={att.id} className="overflow-hidden rounded-xl mb-1.5 bg-black/80">
                <video
                  src={att.url}
                  controls
                  className="max-h-64 w-full rounded-xl"
                />
              </div>
            );
          }
          if (att.type === "voice") {
            return <VoiceMessageBubble key={att.id} attachment={att} mine={mine} />;
          }
          return (
            <div
              key={att.id}
              className={cn(
                "flex items-center gap-2.5 rounded-xl p-2.5 mb-1.5",
                mine ? "bg-primary-foreground/15" : "bg-secondary/80"
              )}
            >
              <div
                className={cn(
                  "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                  mine ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/15 text-primary"
                )}
              >
                <FileText className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-body font-medium truncate">{att.name}</p>
                <p
                  className={cn(
                    "text-[11px] font-body tabular-nums",
                    mine ? "text-primary-foreground/75" : "text-muted-foreground"
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

        {/* Message text */}
        {message.text && (
          <p className="font-body text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.text}
          </p>
        )}

        {/* Reactions row */}
        {message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {message.reactions.map((r) => {
              const reacted = r.userIds.includes(currentUserId);
              return (
                <button
                  key={r.emoji}
                  type="button"
                  onClick={() => onToggleReaction(message.id, r.emoji)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-body transition-colors tabular-nums",
                    mine
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

        {/* Footer metadata: Pin, Edited, Timestamp, Delivery/Read */}
        <div
          className={cn(
            "flex items-center justify-end gap-1.5 mt-1 text-[10px] font-body tabular-nums",
            mine ? "text-primary-foreground/75" : "text-muted-foreground"
          )}
        >
          {message.isPinned && <Pin className="h-2.5 w-2.5" aria-label="Pinned" />}
          {message.editedAt && <span>edited</span>}
          <span>{formatMessageTime(message.createdAt)}</span>
          {mine && (
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

      {!mine && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0 mb-1">
          <MessageActionsPopover
            open={menuOpen}
            onOpenChange={setMenuOpen}
            message={message}
            mine={mine}
            onReply={() => { setMenuOpen(false); onReply(message); }}
            onEdit={() => { setMenuOpen(false); onEdit(message); }}
            onForward={() => { setMenuOpen(false); onForward(message); }}
            onTogglePin={() => { setMenuOpen(false); onTogglePin(message.id); }}
            onCopy={handleCopy}
            onDeleteForMe={() => { setMenuOpen(false); onDelete(message.id, false); }}
            onDeleteForAll={() => { setMenuOpen(false); onDelete(message.id, true); }}
            onReact={(emoji) => { setMenuOpen(false); onToggleReaction(message.id, emoji); }}
          />
        </div>
      )}
    </div>
  );
}

interface MessageActionsPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: ChatMessage;
  mine: boolean;
  onReply: () => void;
  onEdit: () => void;
  onForward: () => void;
  onTogglePin: () => void;
  onCopy: () => void;
  onDeleteForMe: () => void;
  onDeleteForAll: () => void;
  onReact: (emoji: string) => void;
}

function MessageActionsPopover({
  open,
  onOpenChange,
  message,
  mine,
  onReply,
  onEdit,
  onForward,
  onTogglePin,
  onCopy,
  onDeleteForMe,
  onDeleteForAll,
  onReact,
}: MessageActionsPopoverProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Message actions"
          className="h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent side={mine ? "left" : "right"} align="center" className="w-52 p-1.5">
        <div className="flex items-center justify-between px-1 py-1 mb-1 border-b border-border">
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onReact(emoji)}
              aria-label={`React with ${emoji}`}
              className="h-7 w-7 rounded-md hover:bg-secondary flex items-center justify-center text-sm transition-transform hover:scale-110"
            >
              {emoji}
            </button>
          ))}
          <SmilePlus className="h-3.5 w-3.5 text-muted-foreground mr-1" aria-hidden="true" />
        </div>
        <button
          type="button"
          onClick={onReply}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-body rounded-md hover:bg-secondary text-left"
        >
          <Reply className="h-3.5 w-3.5" /> Reply
        </button>
        {mine && message.text && (
          <button
            type="button"
            onClick={onEdit}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-body rounded-md hover:bg-secondary text-left"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
        )}
        <button
          type="button"
          onClick={onForward}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-body rounded-md hover:bg-secondary text-left"
        >
          <Forward className="h-3.5 w-3.5" /> Forward
        </button>
        <button
          type="button"
          onClick={onTogglePin}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-body rounded-md hover:bg-secondary text-left"
        >
          {message.isPinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
          {message.isPinned ? "Unpin" : "Pin"}
        </button>
        {message.text && (
          <button
            type="button"
            onClick={onCopy}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-body rounded-md hover:bg-secondary text-left"
          >
            <Copy className="h-3.5 w-3.5" /> Copy text
          </button>
        )}
        <button
          type="button"
          onClick={onDeleteForMe}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-body rounded-md hover:bg-secondary text-destructive text-left"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete for me
        </button>
        {mine && (
          <button
            type="button"
            onClick={onDeleteForAll}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-body rounded-md hover:bg-secondary text-destructive text-left"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete for everyone
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}

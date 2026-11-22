import type { ChatMessage, CommunityUser, Conversation } from "./types";

export function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatConversationTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffDays === 0 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays <= 1) return "Yesterday";
  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function formatDateDivider(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - msgDay.getTime()) / 86_400_000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

export function formatLastSeen(user: CommunityUser, hideLastSeen = false): string {
  if (user.isBlocked) return "blocked";
  if (hideLastSeen) return "last seen recently";
  if (user.status === "online") return "online";
  if (user.status === "recently") {
    const mins = Math.max(1, Math.round((Date.now() - new Date(user.lastSeenAt).getTime()) / 60_000));
    return mins < 60 ? `last seen ${mins}m ago` : "last seen recently";
  }
  const date = new Date(user.lastSeenAt);
  return `last seen ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatBytes(bytes?: number): string {
  if (!bytes) return "File";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatCountCompact(count = 0): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return String(count);
}

export function getLastMessagePreview(
  conv: Conversation,
  messages: ChatMessage[],
  users: Record<string, CommunityUser>,
  currentUserId: string
): string {
  if (conv.draftText && conv.draftText.trim().length > 0) {
    return `Draft: ${conv.draftText.trim()}`;
  }
  const last = messages[messages.length - 1];
  if (!last) {
    if (conv.type === "channel") return "Channel created";
    if (conv.type === "group") return "Group created";
    return "Start a conversation";
  }
  if (last.deletedForAll) {
    return "Message deleted";
  }

  if (last.poll) {
    return `Poll: ${last.poll.question}`;
  }

  let body = last.text.trim();
  if (!body && last.attachments?.length) {
    const att = last.attachments[0];
    if (att.type === "voice") body = `Voice message (${formatDuration(att.durationSec ?? 0)})`;
    else if (att.type === "image") body = "Photo";
    else if (att.type === "video") body = "Video";
    else body = att.name;
  } else if (last.attachments?.length) {
    const att = last.attachments[0];
    if (att.type === "image") body = `Photo · ${body}`;
    else if (att.type === "video") body = `Video · ${body}`;
    else if (att.type === "file") body = `${att.name} · ${body}`;
  }

  if (conv.type === "channel") {
    return body;
  }

  if (conv.type === "group") {
    const senderName =
      last.senderId === currentUserId
        ? "You"
        : users[last.senderId]?.fullName.split(" ")[0] || "Member";
    return `${senderName}: ${body}`;
  }

  return last.senderId === currentUserId ? `You: ${body}` : body;
}

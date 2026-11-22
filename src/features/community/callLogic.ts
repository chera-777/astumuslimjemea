import type { ConversationType } from "./types";

export type CallMediaKind = "voice" | "video";
export type CallScope = "direct" | "group" | "channel";
export type CallStatus =
  | "ringing"
  | "connecting"
  | "active"
  | "reconnecting"
  | "ended"
  | "declined"
  | "missed"
  | "cancelled";

export type CallDirection = "outgoing" | "incoming";

export interface CallParticipantState {
  userId: string;
  fullName: string;
  avatarInitials: string;
  avatarColor: string;
  status: "invited" | "ringing" | "joined" | "left" | "declined";
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  isHost: boolean;
  joinedAt?: string;
}

export interface CallRecord {
  id: string;
  conversationId: string;
  title: string;
  avatarInitials: string;
  avatarColor: string;
  conversationType: ConversationType;
  callScope: CallScope;
  mediaKind: CallMediaKind;
  status: CallStatus;
  direction: CallDirection;
  callerId: string;
  calleeIds: string[];
  participants: CallParticipantState[];
  startedAt: string;
  answeredAt?: string;
  endedAt?: string;
  durationSec: number;
}

export interface IceServerConfigInput {
  turnUrl?: string;
  turnUsername?: string;
  turnCredential?: string;
}

export const TERMINAL_CALL_STATUSES: ReadonlySet<CallStatus> = new Set([
  "ended",
  "declined",
  "missed",
  "cancelled",
]);

export function resolveCallScope(conversationType: ConversationType): CallScope {
  if (conversationType === "group") return "group";
  if (conversationType === "channel") return "channel";
  return "direct";
}

export function buildCallRoute(params: {
  id: string;
  mediaKind: CallMediaKind;
  scope?: CallScope;
  conversationType?: ConversationType;
}): string {
  const scope =
    params.scope ?? (params.conversationType ? resolveCallScope(params.conversationType) : "direct");
  if (scope === "group") {
    return `/calls/group/${params.id}`;
  }
  return `/calls/${params.mediaKind}/${params.id}`;
}

export function isTerminalCallStatus(status: CallStatus): boolean {
  return TERMINAL_CALL_STATUSES.has(status);
}

export function resolveTerminateStatus(params: {
  currentStatus: CallStatus;
  actor: "caller" | "callee" | "system";
  reason?: "hangup" | "decline" | "timeout";
}): CallStatus {
  const { currentStatus, actor, reason = "hangup" } = params;
  if (isTerminalCallStatus(currentStatus)) return currentStatus;

  if (currentStatus === "active" || currentStatus === "reconnecting" || currentStatus === "connecting") {
    return "ended";
  }

  // Still ringing
  if (reason === "decline" || actor === "callee") return "declined";
  if (reason === "timeout" || actor === "system") return "missed";
  return "cancelled";
}

export function applyCallStatusTransition(
  record: CallRecord,
  nextStatus: CallStatus,
  nowIso = new Date().toISOString()
): CallRecord {
  if (record.status === nextStatus) return record;
  if (isTerminalCallStatus(record.status)) return record;

  const next: CallRecord = { ...record, status: nextStatus };

  if (nextStatus === "active" && !next.answeredAt) {
    next.answeredAt = nowIso;
  }

  if (isTerminalCallStatus(nextStatus)) {
    next.endedAt = nowIso;
    if (next.answeredAt) {
      const startMs = new Date(next.answeredAt).getTime();
      const endMs = new Date(nowIso).getTime();
      next.durationSec = Math.max(0, Math.round((endMs - startMs) / 1000));
    } else {
      next.durationSec = 0;
    }
  }

  return next;
}

export function formatCallDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  const mm = hrs > 0 && mins < 10 ? `0${mins}` : `${mins}`;
  const ss = secs < 10 ? `0${secs}` : `${secs}`;
  return hrs > 0 ? `${hrs}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function buildIceServers(config?: IceServerConfigInput): RTCIceServer[] {
  const servers: RTCIceServer[] = [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
      ],
    },
  ];

  const turnUrl = config?.turnUrl?.trim();
  if (turnUrl) {
    servers.push({
      urls: turnUrl,
      ...(config?.turnUsername ? { username: config.turnUsername } : {}),
      ...(config?.turnCredential ? { credential: config.turnCredential } : {}),
    });
  }

  return servers;
}

export function getVideoGridLayoutClass(participantCount: number): string {
  if (participantCount <= 1) return "grid-cols-1 max-w-3xl";
  if (participantCount === 2) return "grid-cols-1 md:grid-cols-2 max-w-5xl";
  if (participantCount <= 4) return "grid-cols-1 sm:grid-cols-2 max-w-5xl";
  return "grid-cols-2 lg:grid-cols-3 max-w-6xl";
}

export function detectActiveSpeakerId(
  audioLevels: Record<string, number>,
  mutedIds: ReadonlySet<string>,
  currentSpeakerId: string | null,
  threshold = 0.06
): string | null {
  let loudestId: string | null = null;
  let loudestLevel = threshold;

  for (const [userId, level] of Object.entries(audioLevels)) {
    if (mutedIds.has(userId)) continue;
    if (level > loudestLevel) {
      loudestLevel = level;
      loudestId = userId;
    }
  }

  if (loudestId) return loudestId;

  // Hysteresis: keep current speaker if still slightly audible and unmuted
  if (
    currentSpeakerId &&
    !mutedIds.has(currentSpeakerId) &&
    (audioLevels[currentSpeakerId] ?? 0) >= threshold * 0.65
  ) {
    return currentSpeakerId;
  }

  return null;
}

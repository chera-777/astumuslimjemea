import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import {
  applyCallStatusTransition,
  resolveCallScope,
  type CallMediaKind,
  type CallParticipantState,
  type CallRecord,
  type CallScope,
  type CallStatus,
} from "./callLogic";
import type { CommunityUser, Conversation, ConversationType } from "./types";

const LOCAL_CALLS_STORAGE_KEY = "astu-jemea-calls-v1";

function createSeededCallHistory(): CallRecord[] {
  const now = Date.now();
  return [
    {
      id: "call-seed-1",
      conversationId: "conv-dm-yusuf",
      title: "Yusuf Kedir",
      avatarInitials: "YK",
      avatarColor: "from-teal-600 to-cyan-700",
      conversationType: "direct",
      callScope: "direct",
      mediaKind: "voice",
      status: "ended",
      direction: "outgoing",
      callerId: "user-me",
      calleeIds: ["user-yusuf"],
      participants: [
        {
          userId: "user-me",
          fullName: "Chera Kemal",
          avatarInitials: "CK",
          avatarColor: "from-emerald-600 to-teal-700",
          status: "joined",
          isMuted: false,
          isVideoOn: false,
          isScreenSharing: false,
          isHost: true,
        },
        {
          userId: "user-yusuf",
          fullName: "Yusuf Kedir",
          avatarInitials: "YK",
          avatarColor: "from-teal-600 to-cyan-700",
          status: "left",
          isMuted: false,
          isVideoOn: false,
          isScreenSharing: false,
          isHost: false,
        },
      ],
      startedAt: new Date(now - 3 * 3600_000).toISOString(),
      answeredAt: new Date(now - 3 * 3600_000 + 4000).toISOString(),
      endedAt: new Date(now - 3 * 3600_000 + 258_000).toISOString(),
      durationSec: 254,
    },
    {
      id: "call-seed-2",
      conversationId: "conv-grp-general",
      title: "ASTU Jemea General",
      avatarInitials: "AJ",
      avatarColor: "from-emerald-600 to-teal-700",
      conversationType: "group",
      callScope: "group",
      mediaKind: "video",
      status: "ended",
      direction: "incoming",
      callerId: "user-yusuf",
      calleeIds: ["user-me", "user-ibrahim", "user-hassan"],
      participants: [
        {
          userId: "user-yusuf",
          fullName: "Yusuf Kedir",
          avatarInitials: "YK",
          avatarColor: "from-teal-600 to-cyan-700",
          status: "joined",
          isMuted: false,
          isVideoOn: true,
          isScreenSharing: false,
          isHost: true,
        },
        {
          userId: "user-me",
          fullName: "Chera Kemal",
          avatarInitials: "CK",
          avatarColor: "from-emerald-600 to-teal-700",
          status: "joined",
          isMuted: false,
          isVideoOn: true,
          isScreenSharing: false,
          isHost: false,
        },
        {
          userId: "user-ibrahim",
          fullName: "Ibrahim Ahmed",
          avatarInitials: "IA",
          avatarColor: "from-blue-600 to-indigo-700",
          status: "joined",
          isMuted: true,
          isVideoOn: false,
          isScreenSharing: false,
          isHost: false,
        },
      ],
      startedAt: new Date(now - 26 * 3600_000).toISOString(),
      answeredAt: new Date(now - 26 * 3600_000 + 6000).toISOString(),
      endedAt: new Date(now - 26 * 3600_000 + 1846_000).toISOString(),
      durationSec: 1840,
    },
    {
      id: "call-seed-3",
      conversationId: "conv-dm-ibrahim",
      title: "Ibrahim Ahmed",
      avatarInitials: "IA",
      avatarColor: "from-blue-600 to-indigo-700",
      conversationType: "direct",
      callScope: "direct",
      mediaKind: "voice",
      status: "missed",
      direction: "incoming",
      callerId: "user-ibrahim",
      calleeIds: ["user-me"],
      participants: [
        {
          userId: "user-ibrahim",
          fullName: "Ibrahim Ahmed",
          avatarInitials: "IA",
          avatarColor: "from-blue-600 to-indigo-700",
          status: "left",
          isMuted: false,
          isVideoOn: false,
          isScreenSharing: false,
          isHost: true,
        },
        {
          userId: "user-me",
          fullName: "Chera Kemal",
          avatarInitials: "CK",
          avatarColor: "from-emerald-600 to-teal-700",
          status: "ringing",
          isMuted: false,
          isVideoOn: false,
          isScreenSharing: false,
          isHost: false,
        },
      ],
      startedAt: new Date(now - 48 * 3600_000).toISOString(),
      endedAt: new Date(now - 48 * 3600_000 + 35_000).toISOString(),
      durationSec: 0,
    },
  ];
}

function readLocalCalls(): CallRecord[] {
  if (typeof window === "undefined") return createSeededCallHistory();
  try {
    const raw = window.localStorage.getItem(LOCAL_CALLS_STORAGE_KEY);
    if (!raw) {
      const seed = createSeededCallHistory();
      window.localStorage.setItem(LOCAL_CALLS_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CallRecord[]) : createSeededCallHistory();
  } catch {
    return createSeededCallHistory();
  }
}

function writeLocalCalls(calls: CallRecord[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_CALLS_STORAGE_KEY, JSON.stringify(calls.slice(0, 60)));
  } catch {
    // Ignore storage quota issues
  }
}

function makeInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase() || "MJ";
}

export const callingService = {
  async createCall(params: {
    conversation: Conversation;
    mediaKind: CallMediaKind;
    callerId: string;
    users: Record<string, CommunityUser>;
    useBackend: boolean;
  }): Promise<CallRecord> {
    const { conversation, mediaKind, callerId, users, useBackend } = params;
    const callScope: CallScope = resolveCallScope(conversation.type);
    const calleeIds = conversation.participantIds.filter(
      (id) => id !== callerId && id !== "user-me"
    );

    const buildParticipantList = (ids: string[]): CallParticipantState[] => {
      const list: CallParticipantState[] = [
        {
          userId: callerId,
          fullName: users[callerId]?.fullName ?? "You",
          avatarInitials: users[callerId]?.avatarInitials ?? "ME",
          avatarColor: users[callerId]?.avatarColor ?? "from-emerald-600 to-teal-700",
          status: "joined",
          isMuted: false,
          isVideoOn: mediaKind === "video",
          isScreenSharing: false,
          isHost: true,
          joinedAt: new Date().toISOString(),
        },
      ];
      for (const uid of ids) {
        const u = users[uid];
        list.push({
          userId: uid,
          fullName: u?.fullName ?? "ASTU Member",
          avatarInitials: u?.avatarInitials ?? "AM",
          avatarColor: u?.avatarColor ?? "from-teal-600 to-cyan-700",
          status: "ringing",
          isMuted: false,
          isVideoOn: mediaKind === "video",
          isScreenSharing: false,
          isHost: false,
        });
      }
      return list;
    };

    if (useBackend && isSupabaseConfigured) {
      const { data: callId, error } = await (supabase as unknown as {
        rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: string | null; error: Error | null }>;
      }).rpc("create_community_call", {
        _conversation_id: conversation.id,
        _media_kind: mediaKind,
        _call_scope: callScope,
        _callee_ids: calleeIds.length > 0 ? calleeIds : null,
      });

      if (!error && callId) {
        return {
          id: callId,
          conversationId: conversation.id,
          title: conversation.title,
          avatarInitials: conversation.avatarInitials,
          avatarColor: conversation.avatarColor,
          conversationType: conversation.type,
          callScope,
          mediaKind,
          status: "ringing",
          direction: "outgoing",
          callerId,
          calleeIds,
          participants: buildParticipantList(calleeIds),
          startedAt: new Date().toISOString(),
          durationSec: 0,
        };
      }
    }

    const record: CallRecord = {
      id: `call-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      conversationId: conversation.id,
      title: conversation.title,
      avatarInitials: conversation.avatarInitials,
      avatarColor: conversation.avatarColor,
      conversationType: conversation.type,
      callScope,
      mediaKind,
      status: "ringing",
      direction: "outgoing",
      callerId,
      calleeIds,
      participants: buildParticipantList(calleeIds),
      startedAt: new Date().toISOString(),
      durationSec: 0,
    };

    const existing = readLocalCalls();
    writeLocalCalls([record, ...existing]);
    return record;
  },

  async getCallById(params: {
    callId: string;
    currentUserId: string;
    useBackend: boolean;
  }): Promise<CallRecord | null> {
    const { callId, currentUserId, useBackend } = params;

    if (useBackend && isSupabaseConfigured) {
      const client = supabase as unknown as {
        from: (t: string) => {
          select: (q: string) => {
            eq: (col: string, val: string) => {
              maybeSingle: () => Promise<{ data: Record<string, unknown> | null; error: unknown }>;
            };
          };
        };
      };

      const { data: row } = await client
        .from("community_calls")
        .select("*")
        .eq("id", callId)
        .maybeSingle();

      if (row) {
        const partsRes = await (supabase as unknown as {
          from: (t: string) => {
            select: (q: string) => {
              eq: (col: string, val: string) => Promise<{ data: Record<string, unknown>[] | null }>;
            };
          };
        })
          .from("community_call_participants")
          .select("*")
          .eq("call_id", callId);

        const { data: directory } = await supabase.rpc("get_community_directory");
        const dirMap = new Map<string, { full_name: string }>();
        for (const d of directory ?? []) {
          dirMap.set(d.id, { full_name: d.full_name });
        }

        const callerId = String(row.caller_id);
        const participants: CallParticipantState[] = (partsRes.data ?? []).map((p) => {
          const uid = String(p.user_id);
          const name = dirMap.get(uid)?.full_name || "ASTU Member";
          return {
            userId: uid,
            fullName: name,
            avatarInitials: makeInitials(name),
            avatarColor: "from-emerald-600 to-teal-700",
            status: (p.status as CallParticipantState["status"]) || "ringing",
            isMuted: Boolean(p.is_muted),
            isVideoOn: Boolean(p.is_video_on),
            isScreenSharing: Boolean(p.is_screen_sharing),
            isHost: Boolean(p.is_host),
            joinedAt: p.joined_at ? String(p.joined_at) : undefined,
          };
        });

        const scope = (row.call_scope as CallScope) || "direct";
        const conversationType: ConversationType =
          scope === "group" ? "group" : scope === "channel" ? "channel" : "direct";

        return {
          id: String(row.id),
          conversationId: String(row.conversation_id),
          title: String(row.title || "Call Session"),
          avatarInitials: String(row.avatar_initials || makeInitials(String(row.title || "MJ"))),
          avatarColor: String(row.avatar_color || "from-emerald-600 to-teal-700"),
          conversationType,
          callScope: scope,
          mediaKind: (row.media_kind as CallMediaKind) || "voice",
          status: (row.status as CallStatus) || "ringing",
          direction: callerId === currentUserId ? "outgoing" : "incoming",
          callerId,
          calleeIds: participants.filter((p) => p.userId !== callerId).map((p) => p.userId),
          participants,
          startedAt: String(row.started_at),
          answeredAt: row.answered_at ? String(row.answered_at) : undefined,
          endedAt: row.ended_at ? String(row.ended_at) : undefined,
          durationSec: Number(row.duration_sec ?? 0),
        };
      }
    }

    const local = readLocalCalls().find((c) => c.id === callId);
    return local ?? null;
  },

  async listCallHistory(params: {
    currentUserId: string;
    useBackend: boolean;
  }): Promise<CallRecord[]> {
    const { currentUserId, useBackend } = params;

    if (useBackend && isSupabaseConfigured) {
      const { data: rows, error } = await (supabase as unknown as {
        from: (t: string) => {
          select: (q: string) => {
            order: (c: string, o: { ascending: boolean }) => {
              limit: (n: number) => Promise<{ data: Record<string, unknown>[] | null; error: unknown }>;
            };
          };
        };
      })
        .from("community_calls")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(50);

      if (!error && Array.isArray(rows) && rows.length > 0) {
        return rows.map((row) => {
          const callerId = String(row.caller_id);
          const scope = (row.call_scope as CallScope) || "direct";
          return {
            id: String(row.id),
            conversationId: String(row.conversation_id),
            title: String(row.title || "Community Call"),
            avatarInitials: String(row.avatar_initials || makeInitials(String(row.title || "MJ"))),
            avatarColor: String(row.avatar_color || "from-emerald-600 to-teal-700"),
            conversationType: scope === "group" ? "group" : scope === "channel" ? "channel" : "direct",
            callScope: scope,
            mediaKind: (row.media_kind as CallMediaKind) || "voice",
            status: (row.status as CallStatus) || "ended",
            direction: callerId === currentUserId ? "outgoing" : "incoming",
            callerId,
            calleeIds: [],
            participants: [],
            startedAt: String(row.started_at),
            answeredAt: row.answered_at ? String(row.answered_at) : undefined,
            endedAt: row.ended_at ? String(row.ended_at) : undefined,
            durationSec: Number(row.duration_sec ?? 0),
          };
        });
      }
    }

    return readLocalCalls();
  },

  async updateCallStatus(params: {
    callId: string;
    status: CallStatus;
    durationSec?: number;
    useBackend: boolean;
  }): Promise<CallRecord | null> {
    const { callId, status, durationSec, useBackend } = params;

    if (useBackend && isSupabaseConfigured) {
      const rpcStatus = status === "connecting" || status === "reconnecting" ? "active" : status;
      await (supabase as unknown as {
        rpc: (fn: string, args: Record<string, unknown>) => Promise<{ error: unknown }>;
      }).rpc("update_community_call_status", {
        _call_id: callId,
        _status: rpcStatus,
        _duration_sec: durationSec ?? null,
      });
    }

    const calls = readLocalCalls();
    let updated: CallRecord | null = null;
    const nextCalls = calls.map((c) => {
      if (c.id !== callId) return c;
      updated = applyCallStatusTransition(c, status);
      if (durationSec !== undefined) updated.durationSec = durationSec;
      return updated;
    });
    if (updated) writeLocalCalls(nextCalls);
    return updated;
  },

  async inviteParticipants(params: {
    callId: string;
    newParticipants: CallParticipantState[];
    useBackend: boolean;
  }): Promise<void> {
    const { callId, newParticipants, useBackend } = params;

    if (useBackend && isSupabaseConfigured && newParticipants.length > 0) {
      await (supabase as unknown as {
        rpc: (fn: string, args: Record<string, unknown>) => Promise<{ error: unknown }>;
      }).rpc("invite_call_participants", {
        _call_id: callId,
        _user_ids: newParticipants.map((p) => p.userId),
      });
    }

    const calls = readLocalCalls();
    const nextCalls = calls.map((c) => {
      if (c.id !== callId) return c;
      const existingIds = new Set(c.participants.map((p) => p.userId));
      const toAdd = newParticipants.filter((p) => !existingIds.has(p.userId));
      return {
        ...c,
        calleeIds: Array.from(new Set([...c.calleeIds, ...toAdd.map((p) => p.userId)])),
        participants: [...c.participants, ...toAdd],
      };
    });
    writeLocalCalls(nextCalls);
  },

  getInfrastructureStatus(): {
    iceServersConfigured: boolean;
    turnConfigured: boolean;
    notice: string;
  } {
    const turnConfigured = Boolean(
      typeof import.meta !== "undefined" && import.meta.env?.VITE_TURN_URL
    );
    return {
      iceServersConfigured: true,
      turnConfigured,
      notice: turnConfigured
        ? "WebRTC peer media connected via STUN/TURN relay & Supabase Realtime signaling."
        : isSupabaseConfigured
          ? "WebRTC STUN & Supabase Realtime signaling active (configure VITE_TURN_URL for symmetric NAT relay)."
          : "Offline preview call workspace active (configure Supabase & VITE_TURN_URL for live peer relay).",
    };
  },
};

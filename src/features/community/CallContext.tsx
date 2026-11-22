import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import {
  applyCallStatusTransition,
  buildCallRoute,
  formatCallDuration,
  isTerminalCallStatus,
  resolveTerminateStatus,
  type CallMediaKind,
  type CallParticipantState,
  type CallRecord,
  type CallStatus,
} from "./callLogic";
import { callingService } from "./callingService";
import { WebRTCManager, type FacingMode, type PeerConnectionStatus } from "./webrtcClient";
import type { CommunityUser, Conversation } from "./types";

interface CallContextValue {
  activeCall: CallRecord | null;
  callHistory: CallRecord[];
  historyLoading: boolean;
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
  isMicMuted: boolean;
  isCameraOn: boolean;
  isSpeakerOn: boolean;
  isScreenSharing: boolean;
  facingMode: FacingMode;
  connectionState: PeerConnectionStatus;
  activeSpeakerId: string | null;
  elapsedSeconds: number;
  mediaError: string | null;
  initiateCall: (params: {
    conversation: Conversation;
    mediaKind: CallMediaKind;
    users?: Record<string, CommunityUser>;
  }) => Promise<CallRecord>;
  loadCallSession: (callId: string) => Promise<void>;
  acceptCall: (callId?: string) => Promise<void>;
  declineCall: (callId?: string) => Promise<void>;
  endOrCancelCall: () => Promise<void>;
  toggleMic: () => void;
  toggleCamera: () => Promise<void>;
  toggleSpeaker: () => void;
  toggleScreenShare: () => Promise<void>;
  switchCamera: () => Promise<void>;
  reconnectCall: () => Promise<void>;
  inviteParticipants: (participants: CommunityUser[]) => Promise<void>;
  refreshHistory: () => Promise<void>;
}

const CallContext = createContext<CallContextValue | null>(null);

export function CallProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const useBackend = Boolean(isSupabaseConfigured && user && profile);
  const currentUserId = user?.id ?? "user-me";

  const [activeCall, setActiveCall] = useState<CallRecord | null>(null);
  const [callHistory, setCallHistory] = useState<CallRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [facingMode, setFacingMode] = useState<FacingMode>("user");
  const [connectionState, setConnectionState] = useState<PeerConnectionStatus>("idle");
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const rtcRef = useRef<WebRTCManager | null>(null);
  const signalingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const activeCallRef = useRef<CallRecord | null>(null);
  const elapsedRef = useRef(0);
  const ringTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewAnswerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  activeCallRef.current = activeCall;
  elapsedRef.current = elapsedSeconds;

  const ensureRtc = useCallback(() => {
    if (!rtcRef.current) {
      rtcRef.current = new WebRTCManager();
    }
    rtcRef.current.setSelfUserId(currentUserId);
    rtcRef.current.setCallbacks({
      onLocalStream: (stream) => setLocalStream(stream),
      onRemoteStream: (peerId, stream) =>
        setRemoteStreams((prev) => ({ ...prev, [peerId]: stream })),
      onRemoteStreamRemoved: (peerId) =>
        setRemoteStreams((prev) => {
          const copy = { ...prev };
          delete copy[peerId];
          return copy;
        }),
      onConnectionStatus: (st) => setConnectionState(st),
      onActiveSpeaker: (speakerId) => setActiveSpeakerId(speakerId),
      onError: (msg) => setMediaError(msg),
    });
    return rtcRef.current;
  }, [currentUserId]);

  const clearCallTimers = useCallback(() => {
    if (ringTimeoutRef.current) {
      clearTimeout(ringTimeoutRef.current);
      ringTimeoutRef.current = null;
    }
    if (previewAnswerTimerRef.current) {
      clearTimeout(previewAnswerTimerRef.current);
      previewAnswerTimerRef.current = null;
    }
  }, []);

  const teardownMediaAndChannel = useCallback(() => {
    clearCallTimers();
    if (rtcRef.current) {
      rtcRef.current.destroy();
    }
    if (signalingChannelRef.current) {
      void supabase.removeChannel(signalingChannelRef.current);
      signalingChannelRef.current = null;
    }
    setLocalStream(null);
    setRemoteStreams({});
    setIsScreenSharing(false);
    setConnectionState("idle");
    setActiveSpeakerId(null);
    setElapsedSeconds(0);
    setMediaError(null);
  }, [clearCallTimers]);

  const refreshHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const list = await callingService.listCallHistory({
        currentUserId,
        useBackend,
      });
      setCallHistory(list);
    } finally {
      setHistoryLoading(false);
    }
  }, [currentUserId, useBackend]);

  useEffect(() => {
    void refreshHistory();
  }, [refreshHistory]);

  // Elapsed active timer
  useEffect(() => {
    if (!activeCall || (activeCall.status !== "active" && activeCall.status !== "reconnecting")) {
      return;
    }
    const id = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [activeCall?.id, activeCall?.status]);

  const navigateRef = useRef(navigate);
  const pathnameRef = useRef(location.pathname);
  navigateRef.current = navigate;
  pathnameRef.current = location.pathname;

  // Listen for incoming calls via Supabase Realtime
  useEffect(() => {
    if (!useBackend || !user?.id) return;

    const inboxChannel = supabase
      .channel(`incoming-calls:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "community_call_participants",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const row = payload.new as { call_id?: string; status?: string };
          if (!row.call_id || row.status !== "ringing") return;
          if (activeCallRef.current && !isTerminalCallStatus(activeCallRef.current.status)) {
            return;
          }
          const call = await callingService.getCallById({
            callId: row.call_id,
            currentUserId: user.id,
            useBackend: true,
          });
          if (!call || call.status !== "ringing") return;
          setActiveCall(call);
          const targetRoute = buildCallRoute({
            id: call.id,
            mediaKind: call.mediaKind,
            scope: call.callScope,
          });
          if (pathnameRef.current !== targetRoute) {
            navigateRef.current(targetRoute);
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(inboxChannel);
    };
  }, [useBackend, user?.id]);

  // Connect WebRTC Realtime broadcast signaling for active callId
  const attachSignalingChannel = useCallback(
    (callId: string) => {
      const rtc = ensureRtc();
      if (!useBackend) {
        rtc.setSignalSender(null);
        return;
      }

      if (signalingChannelRef.current) {
        void supabase.removeChannel(signalingChannelRef.current);
      }

      const channel = supabase.channel(`rtc-call:${callId}`, {
        config: { broadcast: { self: false } },
      });

      rtc.setSignalSender({
        sendOffer: (targetUserId, sdp) => {
          void channel.send({
            type: "broadcast",
            event: "rtc:offer",
            payload: { fromUserId: currentUserId, targetUserId, sdp },
          });
        },
        sendAnswer: (targetUserId, sdp) => {
          void channel.send({
            type: "broadcast",
            event: "rtc:answer",
            payload: { fromUserId: currentUserId, targetUserId, sdp },
          });
        },
        sendIceCandidate: (targetUserId, candidate) => {
          void channel.send({
            type: "broadcast",
            event: "rtc:ice",
            payload: { fromUserId: currentUserId, targetUserId, candidate },
          });
        },
      });

      channel
        .on("broadcast", { event: "call:accept" }, ({ payload }) => {
          const data = payload as { userId?: string } | undefined;
          if (!data?.userId || data.userId === currentUserId) return;
          clearCallTimers();
          setActiveCall((prev) => {
            if (!prev) return null;
            const next = applyCallStatusTransition(prev, "active");
            return {
              ...next,
              participants: next.participants.map((p) =>
                p.userId === data.userId
                  ? { ...p, status: "joined", joinedAt: new Date().toISOString() }
                  : p
              ),
            };
          });
          setConnectionState("connected");
          void rtc.createOfferForPeer(data.userId);
        })
        .on("broadcast", { event: "call:decline" }, ({ payload }) => {
          const data = payload as { userId?: string } | undefined;
          if (!data?.userId || data.userId === currentUserId) return;
          const curr = activeCallRef.current;
          if (curr && curr.callScope === "direct") {
            toast.info("Call declined");
            void callingService.updateCallStatus({
              callId: curr.id,
              status: "declined",
              useBackend,
            });
            teardownMediaAndChannel();
            setActiveCall(null);
            void refreshHistory();
            navigate("/community");
          }
        })
        .on("broadcast", { event: "call:end" }, () => {
          const curr = activeCallRef.current;
          if (!curr) return;
          toast.info("Call ended");
          teardownMediaAndChannel();
          setActiveCall(null);
          void refreshHistory();
          navigate("/community");
        })
        .on("broadcast", { event: "rtc:offer" }, async ({ payload }) => {
          const data = payload as {
            fromUserId?: string;
            targetUserId?: string;
            sdp?: RTCSessionDescriptionInit;
          };
          if (!data.fromUserId || !data.sdp) return;
          if (data.targetUserId && data.targetUserId !== currentUserId) return;
          await rtc.handleRemoteOffer(data.fromUserId, data.sdp);
        })
        .on("broadcast", { event: "rtc:answer" }, async ({ payload }) => {
          const data = payload as {
            fromUserId?: string;
            targetUserId?: string;
            sdp?: RTCSessionDescriptionInit;
          };
          if (!data.fromUserId || !data.sdp) return;
          if (data.targetUserId && data.targetUserId !== currentUserId) return;
          await rtc.handleRemoteAnswer(data.fromUserId, data.sdp);
        })
        .on("broadcast", { event: "rtc:ice" }, async ({ payload }) => {
          const data = payload as {
            fromUserId?: string;
            targetUserId?: string;
            candidate?: RTCIceCandidateInit;
          };
          if (!data.fromUserId || !data.candidate) return;
          if (data.targetUserId && data.targetUserId !== currentUserId) return;
          await rtc.handleRemoteIceCandidate(data.fromUserId, data.candidate);
        })
        .subscribe();

      signalingChannelRef.current = channel;
    },
    [clearCallTimers, currentUserId, ensureRtc, navigate, refreshHistory, teardownMediaAndChannel, useBackend]
  );

  const initiateCall = useCallback(
    async ({
      conversation,
      mediaKind,
      users = {},
    }: {
      conversation: Conversation;
      mediaKind: CallMediaKind;
      users?: Record<string, CommunityUser>;
    }) => {
      teardownMediaAndChannel();

      const record = await callingService.createCall({
        conversation,
        mediaKind,
        callerId: currentUserId,
        users,
        useBackend,
      });

      setActiveCall(record);
      setIsMicMuted(false);
      setIsCameraOn(mediaKind === "video");
      setIsSpeakerOn(true);
      setConnectionState("connecting");

      const rtc = ensureRtc();
      void rtc.acquireLocalMedia({ audio: true, video: mediaKind === "video" });
      attachSignalingChannel(record.id);

      // Ring timeout -> missed call if unanswered
      ringTimeoutRef.current = setTimeout(() => {
        const curr = activeCallRef.current;
        if (!curr || curr.id !== record.id || curr.status !== "ringing") return;
        void callingService.updateCallStatus({
          callId: curr.id,
          status: "missed",
          useBackend,
        });
        toast.info("No answer — marked as missed call");
        teardownMediaAndChannel();
        setActiveCall(null);
        void refreshHistory();
        navigate("/calls/history");
      }, 35_000);

      // In local preview mode (no backend peer), transition cleanly to active session after brief ringing
      if (!useBackend) {
        previewAnswerTimerRef.current = setTimeout(() => {
          setActiveCall((prev) => {
            if (!prev || prev.id !== record.id || prev.status !== "ringing") return prev;
            const active = applyCallStatusTransition(prev, "active");
            return {
              ...active,
              participants: active.participants.map((p) => ({
                ...p,
                status: "joined",
                joinedAt: p.joinedAt ?? new Date().toISOString(),
              })),
            };
          });
          setConnectionState("connected");
          void callingService.updateCallStatus({
            callId: record.id,
            status: "active",
            useBackend: false,
          });
        }, 1200);
      }

      const route = buildCallRoute({
        id: record.id,
        mediaKind,
        scope: record.callScope,
      });
      navigate(route);
      void refreshHistory();
      return record;
    },
    [
      attachSignalingChannel,
      currentUserId,
      ensureRtc,
      navigate,
      refreshHistory,
      teardownMediaAndChannel,
      useBackend,
    ]
  );

  const loadCallSession = useCallback(
    async (callId: string) => {
      if (activeCallRef.current?.id === callId) return;
      const found = await callingService.getCallById({
        callId,
        currentUserId,
        useBackend,
      });
      if (!found) return;
      setActiveCall(found);
      setIsMicMuted(false);
      setIsCameraOn(found.mediaKind === "video");
      attachSignalingChannel(found.id);
      if (found.status === "active") {
        setConnectionState("connected");
        const rtc = ensureRtc();
        void rtc.acquireLocalMedia({ audio: true, video: found.mediaKind === "video" });
      }
    },
    [attachSignalingChannel, currentUserId, ensureRtc, useBackend]
  );

  const acceptCall = useCallback(
    async (callId?: string) => {
      const targetId = callId ?? activeCallRef.current?.id;
      if (!targetId) return;
      clearCallTimers();

      const curr = activeCallRef.current;
      const mediaKind = curr?.mediaKind ?? "voice";

      const rtc = ensureRtc();
      await rtc.acquireLocalMedia({ audio: true, video: mediaKind === "video" });
      attachSignalingChannel(targetId);

      setIsCameraOn(mediaKind === "video");
      setIsMicMuted(false);
      setConnectionState("connected");

      setActiveCall((prev) => {
        if (!prev || prev.id !== targetId) return prev;
        const active = applyCallStatusTransition(prev, "active");
        return {
          ...active,
          participants: active.participants.map((p) =>
            p.userId === currentUserId
              ? { ...p, status: "joined", joinedAt: new Date().toISOString() }
              : p
          ),
        };
      });

      await callingService.updateCallStatus({
        callId: targetId,
        status: "active",
        useBackend,
      });

      if (signalingChannelRef.current) {
        await signalingChannelRef.current.send({
          type: "broadcast",
          event: "call:accept",
          payload: { userId: currentUserId },
        });
      }
      void refreshHistory();
    },
    [attachSignalingChannel, clearCallTimers, currentUserId, ensureRtc, refreshHistory, useBackend]
  );

  const declineCall = useCallback(
    async (callId?: string) => {
      const targetId = callId ?? activeCallRef.current?.id;
      if (!targetId) {
        navigate("/community");
        return;
      }

      if (signalingChannelRef.current) {
        await signalingChannelRef.current.send({
          type: "broadcast",
          event: "call:decline",
          payload: { userId: currentUserId },
        });
      }

      await callingService.updateCallStatus({
        callId: targetId,
        status: "declined",
        useBackend,
      });

      teardownMediaAndChannel();
      setActiveCall(null);
      void refreshHistory();
      navigate("/community");
    },
    [currentUserId, navigate, refreshHistory, teardownMediaAndChannel, useBackend]
  );

  const endOrCancelCall = useCallback(async () => {
    const curr = activeCallRef.current;
    if (!curr) {
      teardownMediaAndChannel();
      navigate("/community");
      return;
    }

    const duration = elapsedRef.current;
    const nextStatus: CallStatus = resolveTerminateStatus({
      currentStatus: curr.status,
      actor: curr.callerId === currentUserId ? "caller" : "callee",
      reason: "hangup",
    });

    if (signalingChannelRef.current) {
      await signalingChannelRef.current.send({
        type: "broadcast",
        event: "call:end",
        payload: { userId: currentUserId },
      });
    }

    await callingService.updateCallStatus({
      callId: curr.id,
      status: nextStatus,
      durationSec: nextStatus === "ended" ? duration : 0,
      useBackend,
    });

    teardownMediaAndChannel();
    setActiveCall(null);
    void refreshHistory();
    if (nextStatus === "ended" && duration > 0) {
      toast.success(`Call ended · ${formatCallDuration(duration)}`);
    }
    navigate("/community");
  }, [currentUserId, navigate, refreshHistory, teardownMediaAndChannel, useBackend]);

  const toggleMic = useCallback(() => {
    setIsMicMuted((prev) => {
      const next = !prev;
      rtcRef.current?.setMicMuted(next);
      return next;
    });
  }, []);

  const toggleCamera = useCallback(async () => {
    const rtc = ensureRtc();
    const nextTarget = !isCameraOn;
    const ok = await rtc.setCameraEnabled(nextTarget);
    setIsCameraOn(nextTarget ? ok : false);
  }, [ensureRtc, isCameraOn]);

  const toggleSpeaker = useCallback(() => {
    setIsSpeakerOn((prev) => !prev);
  }, []);

  const toggleScreenShare = useCallback(async () => {
    const rtc = ensureRtc();
    if (isScreenSharing) {
      await rtc.stopScreenShare();
      setIsScreenSharing(false);
    } else {
      const started = await rtc.startScreenShare();
      if (started) setIsScreenSharing(true);
    }
  }, [ensureRtc, isScreenSharing]);

  const switchCamera = useCallback(async () => {
    const rtc = ensureRtc();
    const next = await rtc.switchCamera();
    setFacingMode(next);
  }, [ensureRtc]);

  const reconnectCall = useCallback(async () => {
    const rtc = ensureRtc();
    await rtc.restartIce();
  }, [ensureRtc]);

  const inviteParticipants = useCallback(
    async (usersList: CommunityUser[]) => {
      const curr = activeCallRef.current;
      if (!curr || usersList.length === 0) return;

      const newParts: CallParticipantState[] = usersList.map((u) => ({
        userId: u.id,
        fullName: u.fullName,
        avatarInitials: u.avatarInitials,
        avatarColor: u.avatarColor,
        status: "invited",
        isMuted: false,
        isVideoOn: curr.mediaKind === "video",
        isScreenSharing: false,
        isHost: false,
      }));

      await callingService.inviteParticipants({
        callId: curr.id,
        newParticipants: newParts,
        useBackend,
      });

      setActiveCall((prev) => {
        if (!prev) return prev;
        const existingIds = new Set(prev.participants.map((p) => p.userId));
        const filtered = newParts.filter((p) => !existingIds.has(p.userId));
        return {
          ...prev,
          participants: [...prev.participants, ...filtered],
        };
      });
      toast.success(`Invited ${usersList.length} participant(s)`);
    },
    [useBackend]
  );

  return (
    <CallContext.Provider
      value={{
        activeCall,
        callHistory,
        historyLoading,
        localStream,
        remoteStreams,
        isMicMuted,
        isCameraOn,
        isSpeakerOn,
        isScreenSharing,
        facingMode,
        connectionState,
        activeSpeakerId,
        elapsedSeconds,
        mediaError,
        initiateCall,
        loadCallSession,
        acceptCall,
        declineCall,
        endOrCancelCall,
        toggleMic,
        toggleCamera,
        toggleSpeaker,
        toggleScreenShare,
        switchCamera,
        reconnectCall,
        inviteParticipants,
        refreshHistory,
      }}
    >
      {children}
    </CallContext.Provider>
  );
}

export function useOptionalCall() {
  return useContext(CallContext);
}

export function useCall() {
  const ctx = useContext(CallContext);
  if (!ctx) {
    throw new Error("useCall must be used inside CallProvider");
  }
  return ctx;
}

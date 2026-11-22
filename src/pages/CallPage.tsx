import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  History,
  Mic,
  MicOff,
  PhoneIncoming,
  PhoneOff,
  Radio,
  RefreshCw,
  ScreenShare,
  ScreenShareOff,
  SwitchCamera,
  UserPlus,
  Users,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  WifiOff,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { AvatarBadge } from "@/components/community/AvatarBadge";
import { useAuth } from "@/contexts/AuthContext";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { useCall } from "@/features/community/CallContext";
import {
  formatCallDuration,
  getVideoGridLayoutClass,
  type CallParticipantState,
} from "@/features/community/callLogic";
import { communityRepository } from "@/features/community/mockRepository";
import { supabaseCommunityRepository } from "@/features/community/supabaseRepository";
import type { CommunityUser } from "@/features/community/types";
import { cn } from "@/lib/utils";

function VideoStreamElement({
  stream,
  muted = false,
  mirrored = false,
  className,
}: {
  stream: MediaStream | null | undefined;
  muted?: boolean;
  mirrored?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (stream && el.srcObject !== stream) {
      el.srcObject = stream;
    } else if (!stream) {
      el.srcObject = null;
    }
  }, [stream]);

  if (!stream) return null;

  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted={muted}
      className={cn(
        "h-full w-full object-cover",
        mirrored && "-scale-x-100",
        className
      )}
    />
  );
}

function AudioStreamSink({
  stream,
  speakerOn,
}: {
  stream: MediaStream;
  speakerOn: boolean;
}) {
  const ref = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.srcObject = stream;
    el.muted = !speakerOn;
  }, [stream, speakerOn]);

  return <audio ref={ref} autoPlay playsInline className="hidden" />;
}

export function CallPage({
  routeKind,
}: {
  routeKind?: "voice" | "video" | "group";
}) {
  const { mediaType, callId } = useParams<{ mediaType?: string; callId: string }>();
  const { user, profile } = useAuth();
  const useBackend = Boolean(isSupabaseConfigured && user && profile);
  const currentUserId = user?.id ?? "user-me";

  const {
    activeCall,
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
  } = useCall();

  const [participantsDrawerOpen, setParticipantsDrawerOpen] = useState(false);
  const [directoryUsers, setDirectoryUsers] = useState<CommunityUser[]>([]);
  const [selectedInviteIds, setSelectedInviteIds] = useState<string[]>([]);

  const effectiveRouteKind =
    routeKind ?? (mediaType === "video" ? "video" : mediaType === "group" ? "group" : "voice");

  useEffect(() => {
    if (callId) {
      void loadCallSession(callId);
    }
  }, [callId, loadCallSession]);

  useEffect(() => {
    if (!participantsDrawerOpen) return;
    let active = true;
    const loadDir = async () => {
      try {
        const repo = useBackend ? supabaseCommunityRepository : communityRepository;
        const snap = await repo.getSnapshot();
        if (!active) return;
        setDirectoryUsers(Object.values(snap.users).filter((u) => u.id !== snap.currentUserId));
      } catch {
        const snap = await communityRepository.getSnapshot();
        if (active) {
          setDirectoryUsers(Object.values(snap.users).filter((u) => u.id !== snap.currentUserId));
        }
      }
    };
    void loadDir();
    return () => {
      active = false;
    };
  }, [participantsDrawerOpen, useBackend]);

  const call = activeCall ?? {
    id: callId ?? "call-session",
    conversationId: callId ?? "conv-general",
    title:
      effectiveRouteKind === "group"
        ? "Group Call"
        : effectiveRouteKind === "video"
          ? "Video Call"
          : "Voice Call",
    avatarInitials: "MJ",
    avatarColor: "from-emerald-600 to-teal-700",
    conversationType: effectiveRouteKind === "group" ? ("group" as const) : ("direct" as const),
    callScope: effectiveRouteKind === "group" ? ("group" as const) : ("direct" as const),
    mediaKind: effectiveRouteKind === "video" ? ("video" as const) : ("voice" as const),
    status: "active" as const,
    direction: "outgoing" as const,
    callerId: currentUserId,
    calleeIds: [],
    participants: [
      {
        userId: currentUserId,
        fullName: profile?.full_name ?? "You",
        avatarInitials: "ME",
        avatarColor: "from-emerald-600 to-teal-700",
        status: "joined" as const,
        isMuted: isMicMuted,
        isVideoOn: isCameraOn,
        isScreenSharing,
        isHost: true,
      },
    ],
    startedAt: new Date().toISOString(),
    durationSec: 0,
  };

  const isIncomingRinging = call.status === "ringing" && call.direction === "incoming";
  const isOutgoingRinging = call.status === "ringing" && call.direction === "outgoing";
  const isVideoLayout =
    call.mediaKind === "video" ||
    effectiveRouteKind === "video" ||
    isCameraOn ||
    isScreenSharing ||
    Object.values(remoteStreams).some((s) => s.getVideoTracks().length > 0);
  const isGroupOrChannel =
    call.callScope === "group" || call.callScope === "channel" || call.participants.length > 2;

  const participantList: CallParticipantState[] = useMemo(() => {
    if (call.participants.length > 0) return call.participants;
    return [
      {
        userId: currentUserId,
        fullName: profile?.full_name ?? "You",
        avatarInitials: "ME",
        avatarColor: "from-emerald-600 to-teal-700",
        status: "joined",
        isMuted: isMicMuted,
        isVideoOn: isCameraOn,
        isScreenSharing,
        isHost: true,
      },
    ];
  }, [call.participants, currentUserId, profile?.full_name, isMicMuted, isCameraOn, isScreenSharing]);

  const existingParticipantIds = useMemo(
    () => new Set(participantList.map((p) => p.userId)),
    [participantList]
  );

  const invitableUsers = useMemo(
    () => directoryUsers.filter((u) => !existingParticipantIds.has(u.id)),
    [directoryUsers, existingParticipantIds]
  );

  const statusHeadline = isIncomingRinging
    ? `Incoming ${call.callScope === "group" ? "group " : ""}${call.mediaKind} call`
    : isOutgoingRinging
      ? "Calling… Waiting for answer"
      : connectionState === "reconnecting"
        ? "Reconnecting media stream…"
        : call.status === "connecting" || connectionState === "connecting"
          ? "Connecting WebRTC…"
          : formatCallDuration(elapsedSeconds);

  const handleInviteSelected = async () => {
    const selected = invitableUsers.filter((u) => selectedInviteIds.includes(u.id));
    if (selected.length === 0) return;
    await inviteParticipants(selected);
    setSelectedInviteIds([]);
  };

  return (
    <main
      aria-label="Dedicated Call Environment"
      className="relative flex flex-col h-[100dvh] w-full overflow-hidden bg-slate-950 text-slate-100 select-none"
    >
      <SEO
        title={`${call.title} · ${call.mediaKind === "video" ? "Video" : "Voice"} Call — ASTU Muslim Jemea`}
        description="Dedicated full-screen voice and video calling workspace."
        path={`/calls/${effectiveRouteKind}/${callId ?? ""}`}
      />

      {/* Hidden audio sinks for all remote media streams */}
      {Object.entries(remoteStreams).map(([peerId, stream]) => (
        <AudioStreamSink key={peerId} stream={stream} speakerOn={isSpeakerOn} />
      ))}

      {/* Top Bar */}
      <header className="relative z-20 h-16 shrink-0 px-4 md:px-6 flex items-center justify-between gap-3 border-b border-slate-800/70 bg-slate-950/90 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => void endOrCancelCall()}
            aria-label="Leave call and return to community"
            className="h-10 w-10 rounded-full bg-slate-800/70 hover:bg-slate-800 text-slate-100 shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              {call.callScope === "channel" && (
                <Radio className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              )}
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full shrink-0",
                  connectionState === "reconnecting"
                    ? "bg-amber-400 animate-ping"
                    : call.status === "active"
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-sky-400 animate-pulse"
                )}
              />
              <h1 className="font-display text-sm md:text-base font-bold tracking-wide truncate">
                {call.title}
              </h1>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded bg-slate-800 text-[10px] font-body uppercase tracking-wider text-slate-300">
                {call.callScope === "group"
                  ? "Group Call"
                  : call.callScope === "channel"
                    ? "Live Broadcast"
                    : call.mediaKind === "video"
                      ? "Video Call"
                      : "Voice Call"}
              </span>
            </div>
            <p className="font-body text-xs text-slate-400 tabular-nums truncate">
              {statusHeadline}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setParticipantsDrawerOpen((v) => !v)}
            aria-label="Manage call participants"
            className="h-9 px-3 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-100 text-xs font-body gap-1.5"
          >
            <Users className="h-3.5 w-3.5 text-emerald-400" />
            <span className="tabular-nums">{participantList.length}</span>
            <span className="hidden sm:inline">Participants</span>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="Open call history"
            title="Call History"
            className="h-9 w-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200"
          >
            <Link to="/calls/history">
              <History className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Connection / Media Warnings */}
      {(connectionState === "reconnecting" || mediaError) && (
        <div className="relative z-20 px-4 py-2 bg-amber-500/15 border-b border-amber-500/30 flex items-center justify-between gap-3 text-xs font-body text-amber-200">
          <span className="flex items-center gap-2">
            <WifiOff className="h-4 w-4 shrink-0 text-amber-400" />
            {connectionState === "reconnecting"
              ? "Connection interrupted — attempting automatic ICE reconnection…"
              : mediaError}
          </span>
          {connectionState === "reconnecting" && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void reconnectCall()}
              className="h-7 text-xs border-amber-400/40 bg-amber-500/10 text-amber-100 hover:bg-amber-500/20"
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Reconnect
            </Button>
          )}
        </div>
      )}

      {/* Main Content Workspace */}
      <div className="relative flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 overflow-y-auto">
          {isIncomingRinging ? (
            /* DEDICATED INCOMING CALL SCREEN */
            <div className="flex flex-col items-center text-center space-y-8 max-w-sm">
              <div className="relative">
                <div className="absolute -inset-6 rounded-full bg-emerald-500/20 animate-ping" />
                <div className="relative h-32 w-32 rounded-full border-2 border-emerald-400/60 bg-slate-900 flex items-center justify-center shadow-2xl">
                  <AvatarBadge
                    initials={call.avatarInitials}
                    colorClass={call.avatarColor}
                    name={call.title}
                    size="xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-body uppercase tracking-widest text-emerald-400 font-semibold">
                  Incoming {call.callScope === "group" ? "Group " : ""}
                  {call.mediaKind === "video" ? "Video" : "Voice"} Call
                </p>
                <h2 className="font-display text-2xl font-bold">{call.title}</h2>
                <p className="text-xs font-body text-slate-400">
                  ASTU Muslim Jemea encrypted peer call
                </p>
              </div>
              <div className="flex items-center gap-6 pt-2">
                <div className="flex flex-col items-center gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    onClick={() => void declineCall(call.id)}
                    aria-label="Decline call"
                    className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700 shadow-xl"
                  >
                    <PhoneOff className="h-6 w-6" />
                  </Button>
                  <span className="text-xs font-body text-slate-300">Decline</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Button
                    type="button"
                    size="icon"
                    onClick={() => void acceptCall(call.id)}
                    aria-label="Accept call"
                    className="h-16 w-16 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl"
                  >
                    <PhoneIncoming className="h-6 w-6" />
                  </Button>
                  <span className="text-xs font-body text-emerald-300 font-medium">Accept</span>
                </div>
              </div>
            </div>
          ) : isVideoLayout ? (
            /* VIDEO GRID (1:1 / GROUP / CHANNEL VIDEO / SCREEN SHARE) */
            <div
              className={cn(
                "w-full h-full mx-auto grid gap-3.5 auto-rows-fr",
                getVideoGridLayoutClass(participantList.length)
              )}
            >
              {participantList.map((participant) => {
                const isSelf = participant.userId === currentUserId;
                const stream = isSelf ? localStream : remoteStreams[participant.userId];
                const hasLiveVideo = isSelf
                  ? Boolean(localStream && (isCameraOn || isScreenSharing) && localStream.getVideoTracks().length > 0)
                  : Boolean(stream && stream.getVideoTracks().length > 0);
                const isSpeaking = activeSpeakerId === participant.userId;
                const mutedFlag = isSelf ? isMicMuted : participant.isMuted;

                return (
                  <div
                    key={participant.userId}
                    className={cn(
                      "relative rounded-2xl bg-slate-900 border overflow-hidden flex flex-col items-center justify-center min-h-[210px] transition-all shadow-xl",
                      isSpeaking
                        ? "border-emerald-400 ring-2 ring-emerald-400/50"
                        : "border-slate-800"
                    )}
                  >
                    {hasLiveVideo ? (
                      <VideoStreamElement
                        stream={stream}
                        muted={isSelf}
                        mirrored={isSelf && !isScreenSharing && facingMode === "user"}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-3 p-6">
                        <AvatarBadge
                          initials={participant.avatarInitials}
                          colorClass={participant.avatarColor}
                          name={participant.fullName}
                          size="xl"
                        />
                        <p className="text-xs font-body text-slate-400">
                          {isSelf && isOutgoingRinging
                            ? "Ringing…"
                            : participant.status === "ringing" || participant.status === "invited"
                              ? "Ringing…"
                              : "Camera paused"}
                        </p>
                      </div>
                    )}

                    {/* Bottom Nameplate */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                      <div className="px-3 py-1 rounded-lg bg-slate-950/75 backdrop-blur-md flex items-center gap-2 text-xs font-body text-slate-100">
                        <span className="truncate max-w-[180px]">
                          {isSelf ? `${participant.fullName} (You)` : participant.fullName}
                          {participant.isHost ? " · Host" : ""}
                        </span>
                        {mutedFlag && <MicOff className="h-3.5 w-3.5 text-red-400 shrink-0" />}
                      </div>
                      {isSpeaking && !mutedFlag && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/90 text-[10px] font-body font-semibold text-slate-950">
                          Speaking
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : isGroupOrChannel ? (
            /* GROUP / CHANNEL VOICE STAGE */
            <div className="w-full max-w-4xl space-y-6">
              <div className="text-center space-y-1">
                <p className="text-xs font-body uppercase tracking-wider text-emerald-400 font-semibold">
                  {call.callScope === "channel" ? "Channel Live Audio Stream" : "Group Voice Room"}
                </p>
                <h2 className="font-display text-2xl font-bold">{call.title}</h2>
                <p className="text-xs font-body text-slate-400 tabular-nums">{statusHeadline}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                {participantList.map((participant) => {
                  const isSelf = participant.userId === currentUserId;
                  const mutedFlag = isSelf ? isMicMuted : participant.isMuted;
                  const isSpeaking = activeSpeakerId === participant.userId;
                  return (
                    <div
                      key={participant.userId}
                      className={cn(
                        "rounded-2xl bg-slate-900/90 border p-5 flex flex-col items-center text-center gap-3 transition-all",
                        isSpeaking
                          ? "border-emerald-400 ring-2 ring-emerald-400/40"
                          : "border-slate-800"
                      )}
                    >
                      <div className="relative">
                        <AvatarBadge
                          initials={participant.avatarInitials}
                          colorClass={participant.avatarColor}
                          name={participant.fullName}
                          size="lg"
                        />
                        {mutedFlag && (
                          <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-red-600 flex items-center justify-center border-2 border-slate-900">
                            <MicOff className="h-3 w-3 text-white" />
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 w-full">
                        <p className="text-sm font-body font-semibold truncate">
                          {isSelf ? "You" : participant.fullName}
                        </p>
                        <p className="text-[11px] font-body text-slate-400 capitalize">
                          {isSpeaking
                            ? "Speaking"
                            : participant.status === "joined"
                              ? "Connected"
                              : participant.status}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* 1:1 VOICE STAGE */
            <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-md">
              <div className="relative">
                {call.status === "active" && (
                  <div className="absolute -inset-4 rounded-full bg-emerald-500/20 animate-ping" />
                )}
                <div
                  className={cn(
                    "relative h-32 w-32 rounded-full bg-slate-900 border-2 flex items-center justify-center shadow-2xl transition-colors",
                    activeSpeakerId ? "border-emerald-400" : "border-slate-700"
                  )}
                >
                  <AvatarBadge
                    initials={call.avatarInitials}
                    colorClass={call.avatarColor}
                    name={call.title}
                    size="xl"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <h2 className="font-display text-2xl font-bold">{call.title}</h2>
                <p className="font-body text-sm text-slate-300 tabular-nums">{statusHeadline}</p>
                <p className="font-body text-xs text-slate-400">
                  {isOutgoingRinging
                    ? "End-to-end WebRTC audio channel open"
                    : "High-definition encrypted campus voice call"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Slide-in Participants Management Drawer (Inside Page, Never a Call Popup Overlay) */}
        {participantsDrawerOpen && (
          <aside
            aria-label="Call participants panel"
            className="w-80 shrink-0 border-l border-slate-800 bg-slate-900/95 backdrop-blur-xl flex flex-col z-20"
          >
            <div className="h-14 px-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="font-display text-sm font-bold">
                Participants ({participantList.length})
              </h2>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setParticipantsDrawerOpen(false)}
                aria-label="Close participants panel"
                className="h-8 w-8 rounded-full text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              <div className="space-y-1.5">
                {participantList.map((p) => (
                  <div
                    key={p.userId}
                    className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-slate-800/60"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <AvatarBadge
                        initials={p.avatarInitials}
                        colorClass={p.avatarColor}
                        name={p.fullName}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-body font-semibold truncate">
                          {p.userId === currentUserId ? `${p.fullName} (You)` : p.fullName}
                        </p>
                        <p className="text-[10px] font-body text-slate-400 capitalize">
                          {p.status}
                          {p.isHost ? " · Host" : ""}
                        </p>
                      </div>
                    </div>
                    {(p.userId === currentUserId ? isMicMuted : p.isMuted) && (
                      <MicOff className="h-3.5 w-3.5 text-red-400 shrink-0" />
                    )}
                  </div>
                ))}
              </div>

              {invitableUsers.length > 0 && (
                <div className="pt-3 border-t border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-body font-semibold text-slate-300 flex items-center gap-1.5">
                      <UserPlus className="h-3.5 w-3.5 text-emerald-400" /> Add Participants
                    </p>
                    {selectedInviteIds.length > 0 && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => void handleInviteSelected()}
                        className="h-7 px-2.5 text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white"
                      >
                        Invite ({selectedInviteIds.length})
                      </Button>
                    )}
                  </div>
                  <div className="space-y-1">
                    {invitableUsers.map((u) => {
                      const checked = selectedInviteIds.includes(u.id);
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() =>
                            setSelectedInviteIds((prev) =>
                              checked ? prev.filter((id) => id !== u.id) : [...prev, u.id]
                            )
                          }
                          className={cn(
                            "w-full flex items-center justify-between gap-2 p-2 rounded-xl text-left text-xs transition-colors",
                            checked
                              ? "bg-emerald-600/20 border border-emerald-500/50"
                              : "bg-slate-800/40 hover:bg-slate-800"
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <AvatarBadge
                              initials={u.avatarInitials}
                              colorClass={u.avatarColor}
                              name={u.fullName}
                              size="sm"
                            />
                            <span className="truncate font-body">{u.fullName}</span>
                          </div>
                          <span className="text-[10px] font-body text-slate-400">
                            {checked ? "Selected" : "Add"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Bottom Controls Dock (hidden on incoming ring screen which renders Accept/Decline directly) */}
      {!isIncomingRinging && (
        <footer className="relative z-20 h-24 shrink-0 px-4 flex items-center justify-center bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent">
          <div className="flex items-center gap-2.5 sm:gap-3.5 px-4 py-2.5 rounded-full bg-slate-900/95 border border-slate-800 backdrop-blur-xl shadow-2xl">
            <Button
              type="button"
              variant={isMicMuted ? "destructive" : "secondary"}
              size="icon"
              onClick={toggleMic}
              aria-label={isMicMuted ? "Unmute microphone" : "Mute microphone"}
              title={isMicMuted ? "Unmute microphone" : "Mute microphone"}
              className="h-12 w-12 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-100 data-[variant=destructive]:bg-red-600"
            >
              {isMicMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>

            <Button
              type="button"
              variant={isCameraOn ? "secondary" : "outline"}
              size="icon"
              onClick={() => void toggleCamera()}
              aria-label={isCameraOn ? "Turn camera off" : "Turn camera on"}
              title={isCameraOn ? "Turn camera off" : "Turn camera on"}
              className={cn(
                "h-12 w-12 rounded-full border-slate-700",
                isCameraOn
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-100"
                  : "bg-slate-900 text-slate-400 hover:text-white"
              )}
            >
              {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>

            {isCameraOn && (
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={() => void switchCamera()}
                aria-label="Switch front or rear camera"
                title={`Switch camera (${facingMode === "user" ? "Front" : "Rear"})`}
                className="h-12 w-12 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-100"
              >
                <SwitchCamera className="h-5 w-5" />
              </Button>
            )}

            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => void toggleScreenShare()}
              aria-label={isScreenSharing ? "Stop screen share" : "Share screen"}
              title={isScreenSharing ? "Stop sharing screen" : "Share screen"}
              className={cn(
                "h-12 w-12 rounded-full",
                isScreenSharing
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-100"
              )}
            >
              {isScreenSharing ? (
                <ScreenShareOff className="h-5 w-5" />
              ) : (
                <ScreenShare className="h-5 w-5" />
              )}
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={toggleSpeaker}
              aria-label={isSpeakerOn ? "Mute speaker" : "Enable speaker"}
              title={isSpeakerOn ? "Speaker on" : "Speaker muted"}
              className="h-12 w-12 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-100"
            >
              {isSpeakerOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>

            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => void endOrCancelCall()}
              aria-label={isOutgoingRinging ? "Cancel call" : "End call"}
              title={isOutgoingRinging ? "Cancel call" : "End call"}
              className="h-12 w-16 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>
        </footer>
      )}
    </main>
  );
}

export default CallPage;

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Bell,
  Calendar,
  Clock,
  Crown,
  Lock,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Plus,
  ShieldAlert,
  UserMinus,
  UserPlus,
  Users,
  Video,
  VideoOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useCommunity } from "@/features/community/CommunityContext";
import { canManageCommitteeMeeting } from "@/features/community/committeeAccess";
import { callingService } from "@/features/community/callingService";
import type { MeetingType } from "@/features/community/types";
import { AvatarBadge } from "./AvatarBadge";
import { cn } from "@/lib/utils";

export function CommitteeMeetingsView() {
  const {
    snapshot,
    effectiveRoles,
    setPreviewRoles,
    isMockRoleMode,
    isCommitteeMember,
    isAmir,
    meetings,
    meetingsError,
    activeMeeting,
    setMeetingsOpen,
    scheduleMeeting,
    startInstantMeeting,
    joinMeeting,
    leaveMeeting,
    endMeeting,
    inviteToMeeting,
    toggleParticipantMute,
    removeMeetingParticipant,
  } = useCommunity();

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [instantOpen, setInstantOpen] = useState(false);
  const [tab, setTab] = useState<"upcoming" | "history">("upcoming");
  const [endConfirmId, setEndConfirmId] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [localVideoOn, setLocalVideoOn] = useState(true);

  // Schedule form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [meetingType, setMeetingType] = useState<MeetingType>("video");
  const [scheduledDate, setScheduledDate] = useState(() =>
    new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)
  );
  const [scheduledTime, setScheduledTime] = useState("20:00");
  const [invitedIds, setInvitedIds] = useState<string[]>([]);

  // Instant meeting form state
  const [instantTitle, setInstantTitle] = useState("Ashura Emergency Shura Call");
  const [instantType, setInstantType] = useState<MeetingType>("video");

  const authorizedContacts = useMemo(() => {
    if (!snapshot) return [];
    return Object.values(snapshot.users).filter(
      (u) =>
        u.id !== snapshot.currentUserId &&
        (u.portalRoles?.some((r) => ["committee", "amir", "admin"].includes(r)) ?? false)
    );
  }, [snapshot]);

  const infraStatus = callingService.getInfrastructureStatus();

  const upcomingMeetings = meetings.filter((m) => m.status !== "ended");
  const pastMeetings = meetings.filter((m) => m.status === "ended");

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await scheduleMeeting({
      title,
      description,
      meetingType,
      scheduledDate,
      scheduledTime,
      invitedUserIds: invitedIds,
    });
    setTitle("");
    setDescription("");
    setInvitedIds([]);
    setScheduleOpen(false);
  };

  const handleInstantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await startInstantMeeting(
      instantTitle,
      instantType,
      authorizedContacts.map((c) => c.id)
    );
    setInstantOpen(false);
  };

  // ACTIVE CONFERENCE ROOM UI
  if (activeMeeting && snapshot && isCommitteeMember) {
    const canManage = canManageCommitteeMeeting(
      effectiveRoles,
      snapshot.currentUserId,
      activeMeeting
    );
    const myParticipant = activeMeeting.participants.find(
      (p) => p.userId === snapshot.currentUserId
    );
    const uninvitedAuthorized = authorizedContacts.filter(
      (c) => !activeMeeting.invitedUserIds.includes(c.id)
    );

    return (
      <div className="flex flex-col h-full w-full bg-background text-foreground">
        {/* Conference Header */}
        <header className="h-14 shrink-0 px-4 border-b border-border bg-card flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Lock className="h-4 w-4 text-primary shrink-0" />
            <div className="min-w-0">
              <h2 className="font-body text-sm font-semibold truncate">{activeMeeting.title}</h2>
              <p className="font-body text-xs text-muted-foreground truncate">
                {activeMeeting.meetingType === "video" ? "Video Conference" : "Voice Conference"} ·{" "}
                {activeMeeting.participants.length} joined
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {canManage && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setInviteOpen(true)}
                className="h-8 text-xs"
              >
                <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Invite
              </Button>
            )}
          </div>
        </header>

        {/* Honest WebRTC status bar */}
        <div className="px-4 py-2 bg-secondary/50 border-b border-border text-xs font-body text-muted-foreground flex items-center justify-between gap-2">
          <span>{infraStatus.notice}</span>
          <span className="text-[11px] font-medium text-foreground shrink-0">
            Committee Encrypted Room
          </span>
        </div>

        {/* Participant Grid + Side List */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 auto-rows-fr">
            {activeMeeting.participants.map((p) => {
              const user = snapshot.users[p.userId];
              if (!user) return null;
              const isMe = p.userId === snapshot.currentUserId;
              const videoActive = isMe ? localVideoOn && activeMeeting.meetingType === "video" : p.isVideoOn;
              return (
                <div
                  key={p.userId}
                  className="relative rounded-2xl border border-border bg-card p-4 flex flex-col items-center justify-center min-h-[180px]"
                >
                  <AvatarBadge
                    initials={user.avatarInitials}
                    colorClass={user.avatarColor}
                    name={user.fullName}
                    size="xl"
                  />
                  <div className="mt-3 text-center">
                    <p className="font-body text-sm font-semibold flex items-center justify-center gap-1.5">
                      {user.fullName}
                      {isMe && " (You)"}
                      {p.isHost && <Crown className="h-3.5 w-3.5 text-primary" aria-label="Host" />}
                    </p>
                    <p className="font-body text-xs text-muted-foreground">
                      {user.communityRole || "Committee Member"}
                    </p>
                  </div>

                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                    {p.isMuted ? (
                      <span className="h-7 w-7 rounded-full bg-destructive/15 text-destructive flex items-center justify-center">
                        <MicOff className="h-3.5 w-3.5" />
                      </span>
                    ) : (
                      <span className="h-7 w-7 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                        <Mic className="h-3.5 w-3.5" />
                      </span>
                    )}
                    {activeMeeting.meetingType === "video" && (
                      <span className="h-7 w-7 rounded-full bg-secondary text-muted-foreground flex items-center justify-center">
                        {videoActive ? <Video className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5" />}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Participant Management Panel */}
          <div className="rounded-2xl border border-border bg-card p-3 flex flex-col space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="font-body text-xs font-semibold flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-primary" /> Participants ({activeMeeting.participants.length})
              </h3>
              <span className="text-[11px] font-body text-muted-foreground">
                {activeMeeting.invitedUserIds.length} invited
              </span>
            </div>
            <div className="divide-y divide-border/50 flex-1 overflow-y-auto">
              {activeMeeting.participants.map((p) => {
                const u = snapshot.users[p.userId];
                if (!u) return null;
                const isMe = p.userId === snapshot.currentUserId;
                return (
                  <div key={p.userId} className="py-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-body font-medium truncate">
                        {u.fullName}
                        {isMe ? " (You)" : ""}
                      </p>
                      <p className="text-[11px] font-body text-muted-foreground">
                        {p.isHost ? "Host" : u.communityRole || "Committee"}
                      </p>
                    </div>
                    {canManage && !isMe && (
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => void toggleParticipantMute(activeMeeting.id, p.userId)}
                          aria-label={p.isMuted ? `Unmute ${u.fullName}` : `Mute ${u.fullName}`}
                          className="h-7 w-7"
                        >
                          {p.isMuted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => void removeMeetingParticipant(activeMeeting.id, p.userId)}
                          aria-label={`Remove ${u.fullName}`}
                          className="h-7 w-7 text-destructive hover:text-destructive"
                        >
                          <UserMinus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Conference Controls */}
        <footer className="shrink-0 border-t border-border bg-card px-4 py-3 flex items-center justify-center gap-3">
          <Button
            type="button"
            variant={myParticipant?.isMuted ? "destructive" : "secondary"}
            onClick={() => void toggleParticipantMute(activeMeeting.id, snapshot.currentUserId)}
            className="h-11 px-4 rounded-full text-xs font-body"
          >
            {myParticipant?.isMuted ? (
              <>
                <MicOff className="h-4 w-4 mr-1.5" /> Unmute
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-1.5" /> Mute
              </>
            )}
          </Button>

          {activeMeeting.meetingType === "video" && (
            <Button
              type="button"
              variant={localVideoOn ? "secondary" : "outline"}
              onClick={() => setLocalVideoOn((v) => !v)}
              className="h-11 px-4 rounded-full text-xs font-body"
            >
              {localVideoOn ? (
                <>
                  <Video className="h-4 w-4 mr-1.5" /> Camera On
                </>
              ) : (
                <>
                  <VideoOff className="h-4 w-4 mr-1.5" /> Camera Off
                </>
              )}
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={() => void leaveMeeting(activeMeeting.id)}
            className="h-11 px-4 rounded-full text-xs font-body"
          >
            <PhoneOff className="h-4 w-4 mr-1.5" /> Leave
          </Button>

          {canManage && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => setEndConfirmId(activeMeeting.id)}
              className="h-11 px-4 rounded-full text-xs font-body"
            >
              End Meeting
            </Button>
          )}
        </footer>

        {/* Invite Authorized Committee Members Dialog */}
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-display text-lg">Invite Committee Members</DialogTitle>
              <DialogDescription className="font-body text-xs">
                Only authorized Ashura Committee members and Amirs can be invited.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {uninvitedAuthorized.length === 0 ? (
                <p className="text-xs font-body text-muted-foreground py-4 text-center">
                  All authorized committee members are already invited.
                </p>
              ) : (
                uninvitedAuthorized.map((u) => (
                  <div key={u.id} className="flex items-center justify-between gap-2 py-1.5">
                    <div className="min-w-0">
                      <p className="text-xs font-body font-semibold truncate">{u.fullName}</p>
                      <p className="text-[11px] font-body text-muted-foreground">
                        {u.communityRole}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => void inviteToMeeting(activeMeeting.id, u.id)}
                      className="h-7 text-xs"
                    >
                      Invite
                    </Button>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog open={Boolean(endConfirmId)} onOpenChange={(o) => !o && setEndConfirmId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>End meeting for all participants?</AlertDialogTitle>
              <AlertDialogDescription>
                This will close the conference room and move the meeting to Meeting History.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (endConfirmId) void endMeeting(endConfirmId);
                  setEndConfirmId(null);
                }}
              >
                End Meeting
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-background text-foreground">
      {/* Header */}
      <header className="h-14 shrink-0 px-3 sm:px-5 border-b border-border bg-card flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setMeetingsOpen(false)}
            aria-label="Back to Community messages"
            className="h-9 w-9 rounded-full shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="font-display text-base sm:text-lg font-bold truncate">
              Ashura Committee Meetings
            </h1>
            <p className="font-body text-[11px] text-muted-foreground truncate">
              Private voice &amp; video conferences for Committee &amp; Amirs
            </p>
          </div>
        </div>

        {/* Mock-mode RBAC verification toggle (only visible when Supabase isn't configured) */}
        {isMockRoleMode && (
          <div className="hidden sm:flex items-center gap-1 rounded-lg bg-secondary p-1 text-[11px] font-body">
            <button
              type="button"
              onClick={() => setPreviewRoles(["student", "committee"])}
              className={cn(
                "px-2 py-1 rounded transition-colors",
                isCommitteeMember && !isAmir ? "bg-card text-foreground font-semibold shadow-sm" : "text-muted-foreground"
              )}
            >
              Committee
            </button>
            <button
              type="button"
              onClick={() => setPreviewRoles(["student", "amir", "committee"])}
              className={cn(
                "px-2 py-1 rounded transition-colors",
                isAmir ? "bg-card text-foreground font-semibold shadow-sm" : "text-muted-foreground"
              )}
            >
              Amir
            </button>
            <button
              type="button"
              onClick={() => setPreviewRoles(["student"])}
              className={cn(
                "px-2 py-1 rounded transition-colors",
                !isCommitteeMember ? "bg-card text-destructive font-semibold shadow-sm" : "text-muted-foreground"
              )}
            >
              Student (Blocked)
            </button>
          </div>
        )}
      </header>

      {/* Mobile mock-mode role tester */}
      {isMockRoleMode && (
        <div className="sm:hidden px-3 py-2 border-b border-border bg-secondary/40 flex items-center justify-between gap-2 text-[11px] font-body">
          <span className="text-muted-foreground">RBAC Preview:</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPreviewRoles(["student", "committee"])}
              className={cn("px-2 py-0.5 rounded", isCommitteeMember && !isAmir ? "bg-primary text-primary-foreground" : "bg-card")}
            >
              Committee
            </button>
            <button
              type="button"
              onClick={() => setPreviewRoles(["student", "amir", "committee"])}
              className={cn("px-2 py-0.5 rounded", isAmir ? "bg-primary text-primary-foreground" : "bg-card")}
            >
              Amir
            </button>
            <button
              type="button"
              onClick={() => setPreviewRoles(["student"])}
              className={cn("px-2 py-0.5 rounded", !isCommitteeMember ? "bg-destructive text-destructive-foreground" : "bg-card")}
            >
              Student
            </button>
          </div>
        </div>
      )}

      {/* STRICT RBAC GUARD FOR UNAUTHORIZED USERS */}
      {!isCommitteeMember || meetingsError ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div className="max-w-sm space-y-1.5">
            <h2 className="font-display text-xl font-bold">Access Restricted</h2>
            <p className="font-body text-sm text-muted-foreground">
              {meetingsError ||
                "Committee meetings are private to authorized Ashura Committee members and Amirs."}
            </p>
          </div>
          <Button type="button" variant="outline" onClick={() => setMeetingsOpen(false)}>
            Return to Community
          </Button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-4xl w-full mx-auto space-y-5 pb-24">
          {/* Action strip */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button type="button" onClick={() => setInstantOpen(true)} className="h-10 text-xs font-body">
                <Video className="h-4 w-4 mr-1.5" /> Start Instant Meeting
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setScheduleOpen(true)}
                className="h-10 text-xs font-body"
              >
                <Plus className="h-4 w-4 mr-1.5" /> Schedule Meeting
              </Button>
            </div>

            <div className="flex items-center gap-1 rounded-lg bg-secondary p-1 text-xs font-body">
              <button
                type="button"
                onClick={() => setTab("upcoming")}
                className={cn(
                  "px-3 py-1.5 rounded-md font-medium transition-colors",
                  tab === "upcoming" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                )}
              >
                Upcoming &amp; Live ({upcomingMeetings.length})
              </button>
              <button
                type="button"
                onClick={() => setTab("history")}
                className={cn(
                  "px-3 py-1.5 rounded-md font-medium transition-colors",
                  tab === "history" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                )}
              >
                History ({pastMeetings.length})
              </button>
            </div>
          </div>

          {/* Meeting list */}
          <div className="divide-y divide-border border border-border rounded-2xl bg-card overflow-hidden">
            {(tab === "upcoming" ? upcomingMeetings : pastMeetings).length === 0 ? (
              <div className="py-12 px-6 text-center space-y-2">
                <Calendar className="h-8 w-8 mx-auto text-muted-foreground/50" />
                <p className="font-body text-sm font-medium">
                  {tab === "upcoming" ? "No upcoming committee meetings" : "No past meetings yet"}
                </p>
                <p className="font-body text-xs text-muted-foreground">
                  Schedule a Shura session or launch an instant conference above.
                </p>
              </div>
            ) : (
              (tab === "upcoming" ? upcomingMeetings : pastMeetings).map((mtg) => {
                const host = snapshot?.users[mtg.hostId];
                const canManage =
                  snapshot &&
                  canManageCommitteeMeeting(effectiveRoles, snapshot.currentUserId, mtg);
                return (
                  <div
                    key={mtg.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {mtg.meetingType === "video" ? (
                          <Video className="h-4 w-4 text-primary shrink-0" />
                        ) : (
                          <Phone className="h-4 w-4 text-primary shrink-0" />
                        )}
                        <h3 className="font-body text-sm font-semibold">{mtg.title}</h3>
                        {mtg.status === "live" && (
                          <span className="text-[11px] font-body font-semibold text-emerald-600 dark:text-emerald-400">
                            · Live now
                          </span>
                        )}
                      </div>
                      <p className="font-body text-xs text-muted-foreground">
                        {mtg.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-body text-muted-foreground tabular-nums">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {mtg.scheduledDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {mtg.scheduledTime}
                        </span>
                        <span>Host: {host?.fullName || "Committee"}</span>
                        <span>{mtg.invitedUserIds.length} invited</span>
                        {mtg.notificationsSentAt && (
                          <span className="flex items-center gap-1">
                            <Bell className="h-3 w-3" /> Notified
                          </span>
                        )}
                      </div>
                    </div>

                    {tab === "upcoming" && (
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => void joinMeeting(mtg.id)}
                          className="h-9 text-xs font-body"
                        >
                          {mtg.status === "live" ? "Join Live" : "Join Meeting"}
                        </Button>
                        {canManage && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setEndConfirmId(mtg.id)}
                            className="h-9 text-xs font-body text-destructive hover:text-destructive"
                          >
                            End
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Schedule Meeting Modal */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">Schedule Committee Meeting</DialogTitle>
            <DialogDescription className="font-body text-xs">
              Restricted to authorized Ashura Committee members and Amirs.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => void handleScheduleSubmit(e)} className="space-y-3.5">
            <div className="space-y-1">
              <Label htmlFor="mtg-title" className="text-xs font-body">Meeting title</Label>
              <Input
                id="mtg-title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Monthly Ashura Planning"
                className="h-9 text-sm font-body"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="mtg-date" className="text-xs font-body">Date</Label>
                <Input
                  id="mtg-date"
                  type="date"
                  required
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="h-9 text-xs font-body"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="mtg-time" className="text-xs font-body">Time</Label>
                <Input
                  id="mtg-time"
                  type="time"
                  required
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="h-9 text-xs font-body"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-body">Conference type</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={meetingType === "video" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMeetingType("video")}
                  className="text-xs"
                >
                  <Video className="h-3.5 w-3.5 mr-1.5" /> Video Conference
                </Button>
                <Button
                  type="button"
                  variant={meetingType === "voice" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMeetingType("voice")}
                  className="text-xs"
                >
                  <Phone className="h-3.5 w-3.5 mr-1.5" /> Voice Conference
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="mtg-desc" className="text-xs font-body">Agenda / description</Label>
              <Textarea
                id="mtg-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Key agenda items for the committee…"
                className="text-xs font-body min-h-16"
              />
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-body font-medium">Invite authorized committee members</p>
              <div className="max-h-36 overflow-y-auto rounded-lg border border-border divide-y divide-border/50">
                {authorizedContacts.map((u) => {
                  const checked = invitedIds.includes(u.id);
                  return (
                    <label
                      key={u.id}
                      className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-secondary/40 text-xs font-body"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() =>
                          setInvitedIds((prev) =>
                            prev.includes(u.id) ? prev.filter((x) => x !== u.id) : [...prev, u.id]
                          )
                        }
                      />
                      <span className="font-medium flex-1 truncate">{u.fullName}</span>
                      <span className="text-[11px] text-muted-foreground">{u.communityRole}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" onClick={() => setScheduleOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Schedule &amp; Notify</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Instant Meeting Modal */}
      <Dialog open={instantOpen} onOpenChange={setInstantOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">Start Instant Meeting</DialogTitle>
            <DialogDescription className="font-body text-xs">
              Immediately notify and invite Ashura Committee members.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => void handleInstantSubmit(e)} className="space-y-3.5">
            <div className="space-y-1">
              <Label htmlFor="instant-mtg-title" className="text-xs font-body">Topic</Label>
              <Input
                id="instant-mtg-title"
                required
                value={instantTitle}
                onChange={(e) => setInstantTitle(e.target.value)}
                className="h-9 text-sm font-body"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={instantType === "video" ? "default" : "outline"}
                size="sm"
                onClick={() => setInstantType("video")}
                className="text-xs"
              >
                <Video className="h-3.5 w-3.5 mr-1.5" /> Video
              </Button>
              <Button
                type="button"
                variant={instantType === "voice" ? "default" : "outline"}
                size="sm"
                onClick={() => setInstantType("voice")}
                className="text-xs"
              >
                <Phone className="h-3.5 w-3.5 mr-1.5" /> Voice
              </Button>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setInstantOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Launch Conference</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(endConfirmId)} onOpenChange={(o) => !o && setEndConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End this committee meeting?</AlertDialogTitle>
            <AlertDialogDescription>
              All active participants will be disconnected and the meeting will move to History.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (endConfirmId) void endMeeting(endConfirmId);
                setEndConfirmId(null);
              }}
            >
              End Meeting
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

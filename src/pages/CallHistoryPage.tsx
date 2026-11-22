import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Phone,
  PhoneCall,
  PhoneMissed,
  RefreshCw,
  Users,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { AvatarBadge } from "@/components/community/AvatarBadge";
import { useAuth } from "@/contexts/AuthContext";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { useCall } from "@/features/community/CallContext";
import { formatCallDuration, type CallRecord } from "@/features/community/callLogic";
import { communityRepository } from "@/features/community/mockRepository";
import { supabaseCommunityRepository } from "@/features/community/supabaseRepository";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type HistoryFilter = "all" | "missed" | "voice" | "video";

export default function CallHistoryPage() {
  const { user, profile } = useAuth();
  const { callHistory, historyLoading, refreshHistory, initiateCall } = useCall();
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const [redialingId, setRedialingId] = useState<string | null>(null);

  const useBackend = Boolean(isSupabaseConfigured && user && profile);

  const filtered = useMemo(() => {
    return callHistory.filter((item) => {
      if (filter === "missed") return item.status === "missed" || item.status === "declined";
      if (filter === "voice") return item.mediaKind === "voice";
      if (filter === "video") return item.mediaKind === "video";
      return true;
    });
  }, [callHistory, filter]);

  const missedCount = useMemo(
    () => callHistory.filter((c) => c.status === "missed" || c.status === "declined").length,
    [callHistory]
  );

  const handleRedial = async (entry: CallRecord, mediaKind: "voice" | "video") => {
    setRedialingId(entry.id);
    try {
      const repo = useBackend ? supabaseCommunityRepository : communityRepository;
      let snap;
      try {
        snap = await repo.getSnapshot();
      } catch {
        snap = await communityRepository.getSnapshot();
      }
      const conversation = snap.conversations.find((c) => c.id === entry.conversationId) ?? {
        id: entry.conversationId,
        type: entry.conversationType,
        title: entry.title,
        participantIds: entry.participants.map((p) => p.userId),
        pinnedMessageIds: [],
        unreadCount: 0,
        isPinned: false,
        isMuted: false,
        typingUserIds: [],
        updatedAt: new Date().toISOString(),
        avatarInitials: entry.avatarInitials,
        avatarColor: entry.avatarColor,
      };
      await initiateCall({
        conversation,
        mediaKind,
        users: snap.users,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start call");
    } finally {
      setRedialingId(null);
    }
  };

  return (
    <main className="min-h-[100dvh] bg-background text-foreground flex flex-col">
      <SEO
        title="Call History — ASTU Muslim Jemea"
        description="View your ASTU Muslim Jemea voice calls, video calls, group sessions, and missed calls."
        path="/calls/history"
      />

      <header className="h-16 shrink-0 border-b border-border bg-card px-4 md:px-8 flex items-center justify-between gap-3 sticky top-0 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-full" aria-label="Back to community">
            <Link to="/community">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="font-display text-lg font-bold tracking-tight truncate">
              Calls &amp; Sessions
            </h1>
            <p className="font-body text-xs text-muted-foreground">
              {callHistory.length} recent · {missedCount} missed
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void refreshHistory()}
          disabled={historyLoading}
          className="h-9 text-xs font-body gap-1.5"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", historyLoading && "animate-spin")} />
          Refresh
        </Button>
      </header>

      <div className="flex-1 max-w-4xl w-full mx-auto px-4 md:px-6 py-6 space-y-5">
        {/* Filter tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(
            [
              { key: "all", label: `All (${callHistory.length})` },
              { key: "missed", label: `Missed (${missedCount})` },
              { key: "voice", label: "Voice" },
              { key: "video", label: "Video" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-body font-medium transition-colors whitespace-nowrap",
                filter === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/70 text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <PhoneCall className="h-6 w-6" />
            </div>
            <h2 className="font-display text-base font-bold">No call records found</h2>
            <p className="font-body text-xs text-muted-foreground max-w-xs mx-auto">
              Start a voice or video call from any direct chat, study group, or channel in Community.
            </p>
            <Button asChild size="sm">
              <Link to="/community">Open Community</Link>
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
            {filtered.map((item) => {
              const isMissed = item.status === "missed" || item.status === "declined";
              const isCancelled = item.status === "cancelled";

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <AvatarBadge
                      initials={item.avatarInitials}
                      colorClass={item.avatarColor}
                      name={item.title}
                      size="md"
                    />
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p
                          className={cn(
                            "font-body text-sm font-semibold truncate",
                            isMissed && "text-destructive"
                          )}
                        >
                          {item.title}
                        </p>
                        {item.callScope !== "direct" && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-secondary text-[10px] font-body text-muted-foreground capitalize">
                            <Users className="h-2.5 w-2.5" /> {item.callScope}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-body text-muted-foreground">
                        {isMissed ? (
                          <PhoneMissed className="h-3.5 w-3.5 text-destructive shrink-0" />
                        ) : item.direction === "outgoing" ? (
                          <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <ArrowDownLeft className="h-3.5 w-3.5 text-primary shrink-0" />
                        )}
                        <span className="capitalize">
                          {isMissed
                            ? item.status
                            : isCancelled
                              ? "Cancelled"
                              : item.direction}
                        </span>
                        <span>·</span>
                        <span>{item.mediaKind === "video" ? "Video" : "Voice"}</span>
                        {item.durationSec > 0 && (
                          <>
                            <span>·</span>
                            <span className="tabular-nums">{formatCallDuration(item.durationSec)}</span>
                          </>
                        )}
                        <span>·</span>
                        <span className="tabular-nums">
                          {new Date(item.startedAt).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={redialingId === item.id}
                      onClick={() => void handleRedial(item, "voice")}
                      aria-label={`Voice call ${item.title}`}
                      title="Voice Call"
                      className="h-9 w-9 rounded-full"
                    >
                      <Phone className="h-4 w-4 text-primary" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={redialingId === item.id}
                      onClick={() => void handleRedial(item, "video")}
                      aria-label={`Video call ${item.title}`}
                      title="Video Call"
                      className="h-9 w-9 rounded-full"
                    >
                      <Video className="h-4 w-4 text-primary" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

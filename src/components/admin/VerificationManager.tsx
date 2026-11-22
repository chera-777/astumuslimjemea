import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  ExternalLink,
  FileWarning,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  listVerificationQueue,
  resolveIdCardPreviewUrl,
  reviewVerificationRecord,
  type StudentVerificationRecord,
} from "@/features/verification/verificationService";
import { checkConsistency, type VerificationStatus } from "@/features/verification/verificationLogic";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type QueueFilter = "pending_admin_review" | "additional_identification_required" | "verified" | "rejected" | "all";

const STATUS_LABELS: Record<VerificationStatus, { label: string; tone: string }> = {
  unverified: { label: "Unverified", tone: "text-muted-foreground" },
  pending_automated: { label: "Automated Check", tone: "text-blue-600 dark:text-blue-400" },
  automatically_verified: { label: "Auto-Verified", tone: "text-emerald-600 dark:text-emerald-400" },
  additional_identification_required: { label: "ID Upload Needed", tone: "text-amber-600 dark:text-amber-400" },
  pending_admin_review: { label: "Pending Review", tone: "text-indigo-600 dark:text-indigo-400" },
  verified: { label: "Verified", tone: "text-emerald-600 dark:text-emerald-400" },
  rejected: { label: "Rejected", tone: "text-destructive dark:text-red-400" },
};

export function VerificationManager() {
  const { user, refreshProfile } = useAuth();
  const reviewerId = user?.id ?? "preview-admin";

  const [items, setItems] = useState<StudentVerificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<QueueFilter>("pending_admin_review");
  const [query, setQuery] = useState("");
  const [notesById, setNotesById] = useState<Record<string, string>>({});
  const [actingId, setActingId] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});

  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listVerificationQueue(reviewerId);
      setItems(list);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load verification queue");
    } finally {
      setLoading(false);
    }
  }, [reviewerId]);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  useEffect(() => {
    let active = true;
    const resolveAll = async () => {
      const entries = await Promise.all(
        items
          .filter((item) => Boolean(item.id_card_url))
          .map(async (item) => {
            const url = await resolveIdCardPreviewUrl(item.id_card_url);
            return url ? ([item.id, url] as const) : null;
          })
      );
      if (!active) return;
      const map: Record<string, string> = {};
      entries.forEach((pair) => {
        if (pair) map[pair[0]] = pair[1];
      });
      setPreviewUrls(map);
    };
    void resolveAll();
    return () => {
      active = false;
    };
  }, [items]);

  const counts = useMemo(() => {
    const c = {
      all: items.length,
      pending_admin_review: 0,
      additional_identification_required: 0,
      verified: 0,
      rejected: 0,
    };
    for (const item of items) {
      if (item.status === "pending_admin_review") c.pending_admin_review += 1;
      else if (item.status === "additional_identification_required") c.additional_identification_required += 1;
      else if (item.status === "verified" || item.status === "automatically_verified") c.verified += 1;
      else if (item.status === "rejected") c.rejected += 1;
    }
    return c;
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesStatus =
        filter === "all"
          ? true
          : filter === "verified"
            ? item.status === "verified" || item.status === "automatically_verified"
            : item.status === filter;

      const matchesQuery =
        !q ||
        item.full_name.toLowerCase().includes(q) ||
        (item.student_id ?? "").toLowerCase().includes(q) ||
        (item.department ?? "").toLowerCase().includes(q);

      return matchesStatus && matchesQuery;
    });
  }, [items, filter, query]);

  const handleDecision = async (item: StudentVerificationRecord, decision: "approved" | "rejected") => {
    const notes = notesById[item.id]?.trim();
    if (decision === "rejected" && !notes) {
      toast.error("Please add a brief note explaining why the submission was rejected.");
      return;
    }

    setActingId(item.id);
    try {
      await reviewVerificationRecord({
        reviewerId,
        verificationId: item.id,
        decision,
        notes,
      });
      toast.success(
        decision === "approved"
          ? `${item.full_name} verified and notified`
          : `Returned ${item.full_name}'s submission for resubmission`
      );
      await loadQueue();
      await refreshProfile().catch(() => {});
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update verification");
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { key: "pending_admin_review", label: `Pending Review (${counts.pending_admin_review})` },
              { key: "additional_identification_required", label: `ID Needed (${counts.additional_identification_required})` },
              { key: "verified", label: `Verified (${counts.verified})` },
              { key: "rejected", label: `Rejected (${counts.rejected})` },
              { key: "all", label: `All (${counts.all})` },
            ] as const
          ).map((tab) => (
            <Button
              key={tab.key}
              type="button"
              size="sm"
              variant={filter === tab.key ? "default" : "outline"}
              onClick={() => setFilter(tab.key)}
              className="h-8 text-xs font-body whitespace-nowrap"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, UGR ID, dept…"
              aria-label="Search student verifications"
              className="pl-8 h-9 text-xs"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void loadQueue()}
            disabled={loading}
            className="h-9 text-xs gap-1.5 shrink-0"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Queue Items */}
      {loading ? (
        <div className="space-y-3" aria-busy="true" aria-label="Loading verification queue">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Card key={idx} className="p-4 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-72" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center space-y-2">
          <ShieldCheck className="h-8 w-8 mx-auto text-muted-foreground/50" />
          <p className="font-display text-base font-semibold">No submissions in this queue</p>
          <p className="font-body text-xs text-muted-foreground">
            Submissions requiring ASTU Student ID review will appear here automatically.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const statusInfo = STATUS_LABELS[item.status] ?? STATUS_LABELS.unverified;
            const signedPreview = previewUrls[item.id];
            const consistency = checkConsistency(
              {
                fullName: item.full_name,
                studentId: item.student_id,
                department: item.department,
              },
              item.ocr_extracted || item.matched_record
                ? {
                    officialFullName: item.matched_record?.officialFullName,
                    studentId: item.ocr_extracted?.studentId,
                    department: item.ocr_extracted?.department ?? item.matched_record?.department,
                  }
                : null
            );

            return (
              <Card key={item.id} className="p-4 space-y-3 border border-border">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-body">
                      <span className="font-display text-base font-bold text-foreground">
                        {item.full_name || "Unnamed Student"}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className={cn("font-semibold", statusInfo.tone)}>{statusInfo.label}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-muted-foreground tabular-nums">
                        Attempt #{item.attempt_count || 1}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-body text-muted-foreground">
                      <span className="tabular-nums font-medium text-foreground">
                        ID: {item.student_id || "Not provided"}
                      </span>
                      <span>·</span>
                      <span>{item.department || "Department unset"}</span>
                      {item.batch_year && (
                        <>
                          <span>·</span>
                          <span>{item.batch_year}</span>
                        </>
                      )}
                      {item.admission_year && (
                        <>
                          <span>·</span>
                          <span className="tabular-nums">Admission {item.admission_year}</span>
                        </>
                      )}
                    </div>

                    {(consistency.matchedFields.length > 0 || consistency.mismatches.length > 0) && (
                      <div className="pt-1 text-xs font-body space-y-1">
                        {consistency.matchedFields.length > 0 && (
                          <p className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                            Consistent with extracted records: {consistency.matchedFields.join(", ")}
                          </p>
                        )}
                        {consistency.mismatches.map((msg) => (
                          <p key={msg} className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                            <FileWarning className="h-3.5 w-3.5 shrink-0" />
                            {msg}
                          </p>
                        ))}
                      </div>
                    )}

                    {item.rejection_reason && (
                      <p className="text-xs font-body text-destructive dark:text-red-400">
                        Last rejection note: {item.rejection_reason}
                      </p>
                    )}
                  </div>

                  {/* ID Card Preview */}
                  {item.id_card_url && (
                    <div className="w-full lg:w-56 shrink-0 space-y-1.5">
                      {signedPreview ? (
                        item.id_card_url.toLowerCase().includes(".pdf") ? (
                          <a
                            href={signedPreview}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 h-24 rounded-lg border border-border bg-secondary/40 text-xs font-medium text-primary hover:bg-secondary transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" /> Open Student ID PDF
                          </a>
                        ) : (
                          <a
                            href={signedPreview}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-lg overflow-hidden border border-border bg-secondary/30 group relative"
                          >
                            <img
                              src={signedPreview}
                              alt={`ASTU Student ID for ${item.full_name}`}
                              referrerPolicy="no-referrer"
                              className="w-full h-28 object-cover"
                            />
                            <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded bg-background/85 text-[10px] font-medium flex items-center gap-1">
                              Inspect <ExternalLink className="h-2.5 w-2.5" />
                            </span>
                          </a>
                        )
                      ) : (
                        <div className="h-24 rounded-lg border border-dashed border-border bg-secondary/30 flex items-center justify-center text-xs text-muted-foreground px-3 text-center">
                          ID card attached ({item.student_id || "Document"})
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Reviewer Controls */}
                <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <Textarea
                    value={notesById[item.id] ?? item.admin_notes ?? ""}
                    onChange={(e) =>
                      setNotesById((prev) => ({ ...prev, [item.id]: e.target.value }))
                    }
                    placeholder="Reviewer notes (required if rejecting, optional on approval)…"
                    rows={1}
                    className="min-h-[38px] text-xs flex-1 resize-none"
                  />
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      size="sm"
                      disabled={actingId === item.id}
                      onClick={() => void handleDecision(item, "approved")}
                      className="h-9 text-xs gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={actingId === item.id}
                      onClick={() => void handleDecision(item, "rejected")}
                      className="h-9 text-xs gap-1.5 text-destructive dark:text-red-400 border-destructive/40 hover:text-destructive dark:hover:text-red-300 hover:bg-destructive/10"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

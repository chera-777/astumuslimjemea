import { useState, useEffect, useCallback, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck,
  FileUp,
  HelpCircle,
  History,
  Loader2,
  LockKeyhole,
  RefreshCw,
  ScanText,
  SearchCheck,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  XCircle,
} from "lucide-react";
import { ASTU_DEPARTMENTS, CLASS_YEARS } from "@/lib/astuDepartments";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  VERIFICATION_WORKFLOW_STEPS,
  checkConsistency,
  extractIdMetadataFromText,
  getVerificationProgress,
  validateAstuStudentId,
  type VerificationStatus,
} from "@/features/verification/verificationLogic";
import {
  extractBrowserOcrText,
  loadMyVerification,
  resolveIdCardPreviewUrl,
  runAutomatedPortalLookup,
  submitIdCardVerification,
  uploadStudentIdCard,
  type StudentVerificationRecord,
  type VerificationAuditEntry,
} from "@/features/verification/verificationService";
import { VerificationManager } from "@/components/admin/VerificationManager";

const STATUS_CONFIG: Record<
  VerificationStatus,
  { label: string; colorClass: string; icon: typeof CheckCircle2; description: string }
> = {
  unverified: {
    label: "Unverified",
    colorClass: "bg-secondary/60 text-foreground border-border",
    icon: HelpCircle,
    description:
      "Enter your official ASTU full name to check enrollment records automatically, or upload your ASTU Student ID card.",
  },
  pending_automated: {
    label: "Pending Automated Verification",
    colorClass: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
    icon: Loader2,
    description: "Checking ASTU enrollment records via secure name lookup...",
  },
  automatically_verified: {
    label: "Automatically Verified",
    colorClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    icon: ShieldCheck,
    description:
      "Your official full name matched ASTU enrollment records. Your academic information is populated and verified.",
  },
  additional_identification_required: {
    label: "Additional Identification Required",
    colorClass: "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/35",
    icon: FileUp,
    description:
      "Automated lookup could not confirm a unique match (common names, new intake, or portal unreachable). Please upload your ASTU Student ID card below.",
  },
  pending_admin_review: {
    label: "Pending Administrator Review",
    colorClass: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
    icon: Clock,
    description:
      "Your credentials and ASTU Student ID card are securely stored and queued for administrator verification.",
  },
  verified: {
    label: "Verified ASTU Student",
    colorClass: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/40",
    icon: UserCheck,
    description:
      "Your ASTU enrollment is verified. All student community portals and campus features are active.",
  },
  rejected: {
    label: "Verification Rejected",
    colorClass: "bg-destructive/15 text-destructive dark:text-red-400 border-destructive/40",
    icon: XCircle,
    description:
      "Your previous submission could not be verified. Review the feedback below and resubmit with clearer details or ID photo.",
  },
};

export function StudentVerificationPage() {
  const { user, profile, roles, refreshProfile } = useAuth();
  const effectiveUserId = user?.id ?? "preview-student";
  const isAdmin = roles.includes("admin");
  const isAdminOrAmir = roles.includes("admin") || roles.includes("amir") || !isSupabaseConfigured;

  const [loading, setLoading] = useState(true);
  const [runningAuto, setRunningAuto] = useState(false);
  const [submittingId, setSubmittingId] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [record, setRecord] = useState<StudentVerificationRecord | null>(null);
  const [auditLogs, setAuditLogs] = useState<VerificationAuditEntry[]>([]);
  const [signedIdPreviewUrl, setSignedIdPreviewUrl] = useState<string | null>(null);

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [studentId, setStudentId] = useState(profile?.student_id ?? "");
  const [department, setDepartment] = useState(profile?.department ?? "");
  const [batchYear, setBatchYear] = useState(profile?.batch_year ?? "");
  const [idCardStoragePath, setIdCardStoragePath] = useState(profile?.id_card_url ?? "");
  const [ocrTextInput, setOcrTextInput] = useState("");
  const [extractedMeta, setExtractedMeta] = useState<StudentVerificationRecord["ocr_extracted"]>(null);

  const syncFormFromRecord = useCallback(
    (rec: StudentVerificationRecord | null) => {
      if (!rec) return;
      if (rec.full_name) setFullName(rec.full_name);
      if (rec.student_id) setStudentId(rec.student_id);
      if (rec.department) setDepartment(rec.department);
      if (rec.batch_year) setBatchYear(rec.batch_year);
      if (rec.id_card_url) setIdCardStoragePath(rec.id_card_url);
      if (rec.ocr_extracted) setExtractedMeta(rec.ocr_extracted);
    },
    []
  );

  const loadVerification = useCallback(async () => {
    setLoading(true);
    try {
      const { record: rec, auditLogs: logs } = await loadMyVerification(
        effectiveUserId,
        profile?.full_name
      );
      setRecord(rec);
      setAuditLogs(logs);
      syncFormFromRecord(rec);
      if (rec?.id_card_url) {
        const signed = await resolveIdCardPreviewUrl(rec.id_card_url);
        setSignedIdPreviewUrl(signed);
      } else {
        setSignedIdPreviewUrl(null);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load verification status");
    } finally {
      setLoading(false);
    }
  }, [effectiveUserId, profile?.full_name, syncFormFromRecord]);

  useEffect(() => {
    void loadVerification();
  }, [loadVerification]);

  const handleAutomatedLookup = async (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Enter your official full name as listed by ASTU.");
      return;
    }

    setRunningAuto(true);
    setRecord((prev) =>
      prev
        ? { ...prev, status: "pending_automated" }
        : {
            id: "pending",
            user_id: effectiveUserId,
            status: "pending_automated",
            full_name: fullName.trim(),
            student_id: studentId || null,
            department: department || null,
            batch_year: batchYear || null,
            id_card_url: idCardStoragePath || null,
            verification_method: "name_lookup",
            admission_year: null,
            enrollment_status: null,
            portal_photo_url: null,
            matched_record: null,
            ocr_extracted: null,
            rejection_reason: null,
            admin_notes: null,
            attempt_count: 1,
            verified_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
    );

    try {
      const result = await runAutomatedPortalLookup({
        userId: effectiveUserId,
        fullName,
        department: department || null,
        batchYear: batchYear || null,
        studentId: studentId || null,
      });

      if (result.record) {
        setRecord(result.record);
        syncFormFromRecord(result.record);
      }
      setAuditLogs(result.auditLogs);

      if (result.status === "automatically_verified") {
        toast.success(result.message);
        await refreshProfile().catch(() => {});
      } else {
        toast.info(result.message);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Automated lookup failed");
      await loadVerification();
    } finally {
      setRunningAuto(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      const { storagePath, previewUrl } = await uploadStudentIdCard(effectiveUserId, file);
      setIdCardStoragePath(storagePath);
      setSignedIdPreviewUrl(previewUrl);

      const ocr = await extractBrowserOcrText(file);
      if (ocr.studentId || ocr.department || ocr.rawText) {
        setExtractedMeta(ocr);
        if (ocr.rawText) setOcrTextInput(ocr.rawText);
        if (!studentId && ocr.studentId) setStudentId(ocr.studentId);
        if (!department && ocr.department) setDepartment(ocr.department);
        toast.success("ID card uploaded securely and scanned for ASTU details.");
      } else {
        toast.success("ID card uploaded to private storage.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not upload Student ID card");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleParseOcrText = () => {
    if (!ocrTextInput.trim()) {
      toast.error("Paste or enter printed text from your ID card first.");
      return;
    }
    const parsed = extractIdMetadataFromText(ocrTextInput, ASTU_DEPARTMENTS);
    setExtractedMeta({
      ...parsed,
      rawText: ocrTextInput.trim(),
    });
    if (!studentId && parsed.studentId) setStudentId(parsed.studentId);
    if (!department && parsed.department) setDepartment(parsed.department);
    toast.success(
      parsed.studentId
        ? `Extracted ${parsed.studentId}${parsed.department ? ` · ${parsed.department}` : ""}`
        : "Scanned text saved for consistency review."
    );
  };

  const handleSubmitIdVerification = async (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Please enter your official full name.");
      return;
    }

    const parsedId = validateAstuStudentId(studentId);
    if (!parsedId.valid) {
      toast.error(parsedId.error || "Please enter a valid ASTU Student ID (e.g. UGR/12345/15).");
      return;
    }

    if (!idCardStoragePath) {
      toast.error("Please upload an image or PDF of your physical ASTU Student ID card.");
      return;
    }

    setSubmittingId(true);
    try {
      const { record: updated, auditLogs: logs } = await submitIdCardVerification({
        userId: effectiveUserId,
        fullName,
        studentId: parsedId.normalized,
        department: department || null,
        batchYear: batchYear || null,
        idCardStoragePath,
        ocrExtracted: extractedMeta,
      });
      setRecord(updated);
      setAuditLogs(logs);
      toast.success("Student ID card submitted for ASTU Jemea administrator review.");
      await refreshProfile().catch(() => {});
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit ID card verification");
    } finally {
      setSubmittingId(false);
    }
  };

  const currentStatus: VerificationStatus = record?.status ?? "unverified";
  const cfg = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.unverified;
  const StatusIcon = cfg.icon;
  const progress = getVerificationProgress(currentStatus);
  const parsedId = studentId.trim() ? validateAstuStudentId(studentId) : null;
  const consistency = checkConsistency(
    {
      fullName: fullName.trim() || record?.full_name || "",
      studentId: studentId || null,
      department: department || null,
    },
    extractedMeta || record?.matched_record
      ? {
          officialFullName: record?.matched_record?.officialFullName,
          studentId: extractedMeta?.studentId,
          department: extractedMeta?.department ?? record?.matched_record?.department,
        }
      : null
  );

  const isFullyVerified = progress.isVerified;

  const studentContent = (
    <div className="space-y-6">
      {/* Status Banner + Progress Tracker */}
      <section className={cn("rounded-xl border p-5 sm:p-6 space-y-5", cfg.colorClass)}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-background/85 flex items-center justify-center shrink-0 border border-border/50">
              <StatusIcon className={cn("h-5 w-5", currentStatus === "pending_automated" && "animate-spin")} />
            </div>
            <div>
              <p className="text-xs font-body opacity-80">
                Verification Status · Attempt #{Math.max(1, record?.attempt_count ?? 1)}
              </p>
              <h2 className="font-display text-xl font-bold">{cfg.label}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-body font-medium tabular-nums">
            <span>{progress.percent}% complete</span>
            {record?.verified_at && (
              <>
                <span aria-hidden="true">·</span>
                <span>{new Date(record.verified_at).toLocaleDateString()}</span>
              </>
            )}
          </div>
        </div>

        <p className="font-body text-sm leading-relaxed">{cfg.description}</p>

        {/* 4-step workflow progress bar */}
        <div className="space-y-2.5 pt-1">
          <Progress value={progress.percent} className="h-2 bg-background/60" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-body">
            {VERIFICATION_WORKFLOW_STEPS.map((step, idx) => {
              const done = idx < progress.stepIndex || (progress.isVerified && idx <= 3);
              const active = idx === progress.stepIndex && !progress.isVerified;
              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 bg-background/55 border border-border/40",
                    done && "font-semibold",
                    active && "ring-1 ring-current"
                  )}
                >
                  {done ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <span className="h-4 w-4 rounded-full border border-current text-[10px] flex items-center justify-center shrink-0 tabular-nums">
                      {idx + 1}
                    </span>
                  )}
                  <span className="truncate">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Matched Portal Summary */}
        {record?.matched_record && (
          <div className="rounded-lg bg-background/75 border border-border p-4 flex flex-col sm:flex-row sm:items-center gap-4 text-xs font-body text-foreground">
            {record.portal_photo_url && (
              <img
                src={record.portal_photo_url}
                alt={`Official photo for ${record.matched_record.officialFullName}`}
                referrerPolicy="no-referrer"
                className="h-14 w-14 rounded-lg object-cover border border-border shrink-0"
              />
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 flex-1">
              <div>
                <span className="text-muted-foreground">Official Name: </span>
                <span className="font-semibold">{record.matched_record.officialFullName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Program: </span>
                <span className="font-semibold">{record.matched_record.department}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Admission Year: </span>
                <span className="font-semibold tabular-nums">{record.matched_record.admissionYear}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Enrollment: </span>
                <span className="font-semibold capitalize">{record.matched_record.enrollmentStatus}</span>
              </div>
            </div>
          </div>
        )}

        {(record?.rejection_reason || record?.admin_notes) && (
          <div className="rounded-lg bg-background/85 border border-border p-3.5 text-xs font-body text-foreground space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              Reviewer Feedback
            </p>
            <p>{record.rejection_reason || record.admin_notes}</p>
          </div>
        )}
      </section>

      {/* Approach 1: Smart Name Matching */}
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <p className="text-xs font-body text-primary font-semibold">Approach 1 · Primary Method</p>
            <h3 className="font-display text-lg font-bold">Smart Name Matching via ASTU Portal Lookup</h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-body text-muted-foreground">
            <LockKeyhole className="h-3.5 w-3.5 shrink-0" />
            <span>No portal password ever requested</span>
          </div>
        </div>

        <p className="font-body text-xs text-muted-foreground leading-relaxed">
          Enter your official full name as registered with ASTU. Our secure backend function checks{" "}
          <span className="font-medium text-foreground">portal.astu.edu.et</span> (where authorized) to match your department, admission year, and enrollment status. Providing your department helps disambiguate matching names.
        </p>

        <form onSubmit={handleAutomatedLookup} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ver-fullname" className="text-xs font-body">
                Official Full Name *
              </Label>
              <Input
                id="ver-fullname"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Yusuf Mohammed Kedir"
                required
                className="h-10 text-sm font-body"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-body">Academic Department / Program</Label>
              <Select value={department || undefined} onValueChange={setDepartment}>
                <SelectTrigger className="h-10 text-xs font-body" aria-label="Department">
                  <SelectValue placeholder="Choose department (recommended)" />
                </SelectTrigger>
                <SelectContent>
                  {ASTU_DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-body">Class Year / Batch</Label>
              <Select value={batchYear || undefined} onValueChange={setBatchYear}>
                <SelectTrigger className="h-10 text-xs font-body" aria-label="Class year">
                  <SelectValue placeholder="Choose class year" />
                </SelectTrigger>
                <SelectContent>
                  {CLASS_YEARS.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                type="submit"
                disabled={runningAuto || isFullyVerified}
                variant={progress.needsAdditionalId ? "outline" : "default"}
                className="w-full h-10 text-xs sm:text-sm font-body font-semibold gap-2"
              >
                {runningAuto ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Matching ASTU Portal…
                  </>
                ) : isFullyVerified ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Enrollment Confirmed
                  </>
                ) : (
                  <>
                    <SearchCheck className="h-4 w-4" /> Run Automated Name Lookup
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </section>

      {/* Approach 2: Combined Name Lookup + Physical ID Card Verification */}
      <section
        className={cn(
          "rounded-xl border bg-card p-5 sm:p-6 space-y-4 transition-colors",
          progress.needsAdditionalId ? "border-amber-500/60" : "border-border"
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <p className="text-xs font-body text-primary font-semibold">Approach 2 · Additional Identity Verification</p>
            <h3 className="font-display text-lg font-bold">Student ID Card Upload &amp; Administrator Review</h3>
          </div>
          {progress.isRejected && (
            <span className="text-xs font-body font-semibold text-destructive dark:text-red-400 flex items-center gap-1">
              <RefreshCw className="h-3.5 w-3.5" /> Resubmission Ready
            </span>
          )}
        </div>

        <p className="font-body text-xs text-muted-foreground leading-relaxed">
          If automated lookup found duplicate names, could not confirm your record, or you are resubmitting after feedback, provide your ASTU Student ID number and upload your ID card photo or PDF for administrator review.
        </p>

        <form onSubmit={handleSubmitIdVerification} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ver-studentid" className="text-xs font-body">
                ASTU Student ID Number *
              </Label>
              <Input
                id="ver-studentid"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="UGR/25412/14"
                className="h-10 text-sm font-body uppercase tabular-nums"
              />
              {parsedId && (
                <p
                  className={cn(
                    "text-[11px] font-body",
                    parsedId.valid ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                  )}
                >
                  {parsedId.valid
                    ? `Format valid · Admission cohort ${parsedId.admissionYearLabel}`
                    : parsedId.error}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ver-idfile" className="text-xs font-body">
                Physical ASTU Student ID Card (Photo or PDF) *
              </Label>
              <Input
                id="ver-idfile"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                disabled={uploadingFile}
                aria-label="Upload Student ID Card"
                className="h-10 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground"
              />
              {uploadingFile && (
                <p className="text-[11px] font-body text-muted-foreground">Uploading securely to private storage…</p>
              )}
              {idCardStoragePath && !uploadingFile && (
                <div className="flex items-center gap-3 text-[11px] font-body text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center gap-1">
                    <FileCheck className="h-3.5 w-3.5" /> Stored in private bucket
                  </span>
                  {signedIdPreviewUrl && (
                    <a
                      href={signedIdPreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 underline text-primary"
                    >
                      Preview <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Optional OCR / Printed ID Text Cross-Check */}
          <div className="rounded-lg border border-border bg-secondary/30 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="ver-ocr-text" className="text-xs font-body font-medium flex items-center gap-1.5">
                <ScanText className="h-3.5 w-3.5 text-primary" />
                Optional ID Card Text Cross-Check (OCR / Card Text)
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleParseOcrText}
                className="h-7 text-[11px] px-2.5"
              >
                Extract &amp; Compare
              </Button>
            </div>
            <Textarea
              id="ver-ocr-text"
              value={ocrTextInput}
              onChange={(e) => setOcrTextInput(e.target.value)}
              rows={2}
              placeholder="Paste text printed on your ID card (e.g. UGR/25412/14 Software Engineering) or let image upload auto-scan where supported."
              className="text-xs font-body resize-none"
            />
            {(extractedMeta?.studentId || extractedMeta?.department) && (
              <div className="text-[11px] font-body space-y-1">
                <p className="text-muted-foreground">
                  Extracted: {extractedMeta.studentId || "No ID detected"} ·{" "}
                  {extractedMeta.department || "No department detected"}
                </p>
                {consistency.mismatches.map((msg) => (
                  <p key={msg} className="text-amber-600 dark:text-amber-400">
                    {msg}
                  </p>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={submittingId || uploadingFile}
            className="w-full h-11 text-sm font-body font-semibold"
          >
            {submittingId ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting ID Verification…
              </>
            ) : progress.isRejected || currentStatus === "pending_admin_review" ? (
              "Resubmit ID Card for Administrator Review"
            ) : (
              "Submit ID Card for Administrator Review"
            )}
          </Button>
        </form>
      </section>

      {/* Verification History & Audit Timeline */}
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold flex items-center gap-2">
            <History className="h-4 w-4 text-primary" /> Verification History &amp; Audit Log
          </h3>
          <span className="text-xs font-body text-muted-foreground tabular-nums">
            {auditLogs.length} {auditLogs.length === 1 ? "event" : "events"}
          </span>
        </div>

        {auditLogs.length === 0 ? (
          <p className="text-xs font-body text-muted-foreground py-2">
            No verification events recorded yet. Status changes and reviewer actions will appear here.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {auditLogs.map((entry) => (
              <div key={entry.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-body">
                <div className="space-y-0.5">
                  <p className="font-medium text-foreground">
                    {(entry.previous_status || "initial").replace(/_/g, " ")} →{" "}
                    <span className="text-primary font-semibold">{entry.new_status.replace(/_/g, " ")}</span>
                  </p>
                  {entry.notes && <p className="text-muted-foreground">{entry.notes}</p>}
                </div>
                <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
                  {new Date(entry.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );

  return (
    <AppLayout>
      <SEO
        title="Student Verification — ASTU Muslim Jemea"
        description="Verify your enrollment as an ASTU student using smart portal name matching or ASTU Student ID card review."
        path="/verification"
      />

      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-body font-semibold text-primary">
              ASTU Student Identity · Two-Layer Verification
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              Enrollment &amp; ID Verification
            </h1>
            <p className="font-body text-sm text-muted-foreground max-w-2xl">
              Confirm your enrollment via ASTU portal name matching or physical Student ID card review without sharing university passwords.
            </p>
          </div>
          {isAdmin && (
            <Button asChild variant="outline" size="sm" className="h-9 text-xs shrink-0">
              <Link to="/admin">Open Full Admin Console</Link>
            </Button>
          )}
        </header>

        {loading ? (
          <div className="flex justify-center py-20" aria-busy="true">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isAdminOrAmir ? (
          <Tabs defaultValue="my-verification" className="w-full">
            <TabsList className="grid w-full sm:w-auto sm:inline-grid grid-cols-2 mb-4">
              <TabsTrigger value="my-verification" className="text-xs font-body">
                My Verification
              </TabsTrigger>
              <TabsTrigger value="admin-queue" className="text-xs font-body">
                Administrator Review Queue
              </TabsTrigger>
            </TabsList>
            <TabsContent value="my-verification">{studentContent}</TabsContent>
            <TabsContent value="admin-queue">
              <VerificationManager />
            </TabsContent>
          </Tabs>
        ) : (
          studentContent
        )}
      </div>
    </AppLayout>
  );
}

export default StudentVerificationPage;

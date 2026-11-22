import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { ASTU_DEPARTMENTS } from "@/lib/astuDepartments";
import {
  evaluatePortalCandidates,
  extractIdMetadataFromText,
  validateAstuStudentId,
  type PortalCandidateRecord,
  type VerificationMethod,
  type VerificationStatus,
} from "./verificationLogic";

export interface StudentVerificationRecord {
  id: string;
  user_id: string;
  status: VerificationStatus;
  full_name: string;
  student_id: string | null;
  department: string | null;
  batch_year: string | null;
  id_card_url: string | null;
  verification_method: VerificationMethod;
  admission_year: string | null;
  enrollment_status: string | null;
  portal_photo_url: string | null;
  matched_record: PortalCandidateRecord | null;
  ocr_extracted: {
    studentId?: string | null;
    department?: string | null;
    admissionYear?: string | null;
    rawText?: string | null;
  } | null;
  rejection_reason: string | null;
  admin_notes: string | null;
  attempt_count: number;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VerificationAuditEntry {
  id: string;
  verification_id: string;
  actor_id: string | null;
  previous_status: string | null;
  new_status: string;
  notes: string | null;
  created_at: string;
}

export interface AutomatedLookupResult {
  status: VerificationStatus;
  outcomeKind: "unique_match" | "ambiguous" | "no_match" | "unavailable";
  message: string;
  record: StudentVerificationRecord | null;
  auditLogs: VerificationAuditEntry[];
}

const PREVIEW_RECORDS_KEY = "astu-jemea-verifications-v1";
const PREVIEW_LOGS_KEY = "astu-jemea-verification-logs-v1";

// Deterministic sample ASTU records for offline preview mode only (when Supabase is not configured).
const PREVIEW_ASTU_ROSTER: PortalCandidateRecord[] = [
  {
    officialFullName: "Yusuf Mohammed Kedir",
    department: "Software Engineering",
    admissionYear: "2022/23 (2015 E.C.)",
    enrollmentStatus: "active",
    portalPhotoUrl: null,
  },
  {
    officialFullName: "Bilal Ahmed Adem",
    department: "Computer Science & Engineering",
    admissionYear: "2023/24 (2016 E.C.)",
    enrollmentStatus: "active",
    portalPhotoUrl: null,
  },
  {
    officialFullName: "Amina Abdusemed Tadesse",
    department: "Electrical Power & Control Engineering",
    admissionYear: "2021/22 (2014 E.C.)",
    enrollmentStatus: "active",
    portalPhotoUrl: null,
  },
  // Intentional duplicate full name across two departments to exercise ambiguous/disambiguation flow
  {
    officialFullName: "Mohammed Ali Hassan",
    department: "Civil Engineering",
    admissionYear: "2022/23 (2015 E.C.)",
    enrollmentStatus: "active",
    portalPhotoUrl: null,
  },
  {
    officialFullName: "Mohammed Ali Hassan",
    department: "Mechanical Engineering",
    admissionYear: "2023/24 (2016 E.C.)",
    enrollmentStatus: "active",
    portalPhotoUrl: null,
  },
];

function seedPreviewRecords(currentUserId: string, fullName?: string): StudentVerificationRecord[] {
  const now = new Date().toISOString();
  const seeded: StudentVerificationRecord[] = [
    {
      id: "ver-preview-self",
      user_id: currentUserId,
      status: "unverified",
      full_name: fullName || "",
      student_id: null,
      department: null,
      batch_year: null,
      id_card_url: null,
      verification_method: "name_lookup",
      admission_year: null,
      enrollment_status: null,
      portal_photo_url: null,
      matched_record: null,
      ocr_extracted: null,
      rejection_reason: null,
      admin_notes: null,
      attempt_count: 0,
      verified_at: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: "ver-preview-pending-1",
      user_id: "student-demo-1",
      status: "pending_admin_review",
      full_name: "Abdurahman Kemal Hussien",
      student_id: "UGR/28419/15",
      department: "Computer Science & Engineering",
      batch_year: "3rd Year",
      id_card_url: "preview://astu-id-ugr-28419-15",
      verification_method: "combined_id_card",
      admission_year: "2022/23 (2015 E.C.)",
      enrollment_status: null,
      portal_photo_url: null,
      matched_record: null,
      ocr_extracted: {
        studentId: "UGR/28419/15",
        department: "Computer Science & Engineering",
        admissionYear: "2022/23 (2015 E.C.)",
      },
      rejection_reason: null,
      admin_notes: null,
      attempt_count: 1,
      verified_at: null,
      created_at: new Date(Date.now() - 3600_000).toISOString(),
      updated_at: new Date(Date.now() - 1800_000).toISOString(),
    },
    {
      id: "ver-preview-pending-2",
      user_id: "student-demo-2",
      status: "additional_identification_required",
      full_name: "Mohammed Ali Hassan",
      student_id: "UGR/30112/16",
      department: "Mechanical Engineering",
      batch_year: "2nd Year",
      id_card_url: null,
      verification_method: "name_lookup",
      admission_year: null,
      enrollment_status: null,
      portal_photo_url: null,
      matched_record: null,
      ocr_extracted: null,
      rejection_reason: null,
      admin_notes: "Duplicate full name on ASTU portal; awaiting ID upload.",
      attempt_count: 1,
      verified_at: null,
      created_at: new Date(Date.now() - 7200_000).toISOString(),
      updated_at: new Date(Date.now() - 5400_000).toISOString(),
    },
  ];
  return seeded;
}

function readPreviewRecords(currentUserId: string, fullName?: string): StudentVerificationRecord[] {
  try {
    const raw = localStorage.getItem(PREVIEW_RECORDS_KEY);
    if (!raw) {
      const seeded = seedPreviewRecords(currentUserId, fullName);
      localStorage.setItem(PREVIEW_RECORDS_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as StudentVerificationRecord[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const seeded = seedPreviewRecords(currentUserId, fullName);
      localStorage.setItem(PREVIEW_RECORDS_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return parsed;
  } catch {
    return seedPreviewRecords(currentUserId, fullName);
  }
}

function writePreviewRecords(records: StudentVerificationRecord[]): void {
  try {
    localStorage.setItem(PREVIEW_RECORDS_KEY, JSON.stringify(records));
  } catch {
    // ignore storage quota errors
  }
}

function readPreviewLogs(): VerificationAuditEntry[] {
  try {
    const raw = localStorage.getItem(PREVIEW_LOGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as VerificationAuditEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function appendPreviewLog(entry: Omit<VerificationAuditEntry, "id" | "created_at">): VerificationAuditEntry {
  const logs = readPreviewLogs();
  const next: VerificationAuditEntry = {
    ...entry,
    id: `vlog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    created_at: new Date().toISOString(),
  };
  const updated = [next, ...logs].slice(0, 100);
  try {
    localStorage.setItem(PREVIEW_LOGS_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }
  return next;
}

export function extractStorageObjectPath(rawUrlOrPath: string | null | undefined): string | null {
  if (!rawUrlOrPath) return null;
  if (rawUrlOrPath.startsWith("blob:") || rawUrlOrPath.startsWith("data:") || rawUrlOrPath.startsWith("preview://")) {
    return null;
  }
  if (!rawUrlOrPath.startsWith("http://") && !rawUrlOrPath.startsWith("https://")) {
    return rawUrlOrPath.replace(/^\/+/, "");
  }
  const markers = [
    "/storage/v1/object/public/id_cards/",
    "/storage/v1/object/sign/id_cards/",
    "/storage/v1/object/authenticated/id_cards/",
    "/id_cards/",
  ];
  for (const marker of markers) {
    const idx = rawUrlOrPath.indexOf(marker);
    if (idx !== -1) {
      return rawUrlOrPath.slice(idx + marker.length).split("?")[0];
    }
  }
  return null;
}

export async function resolveIdCardPreviewUrl(idCardPathOrUrl: string | null | undefined): Promise<string | null> {
  if (!idCardPathOrUrl) return null;
  if (idCardPathOrUrl.startsWith("blob:") || idCardPathOrUrl.startsWith("data:")) {
    return idCardPathOrUrl;
  }
  if (idCardPathOrUrl.startsWith("preview://")) {
    return null;
  }

  const objectPath = extractStorageObjectPath(idCardPathOrUrl);
  if (!isSupabaseConfigured || !objectPath) {
    return idCardPathOrUrl;
  }

  const { data, error } = await supabase.storage.from("id_cards").createSignedUrl(objectPath, 3600);
  if (error || !data?.signedUrl) {
    return null;
  }
  return data.signedUrl;
}

export async function uploadStudentIdCard(
  userId: string,
  file: File
): Promise<{ storagePath: string; previewUrl: string | null }> {
  if (!isSupabaseConfigured) {
    const objectUrl = URL.createObjectURL(file);
    return {
      storagePath: objectUrl,
      previewUrl: objectUrl,
    };
  }

  const ext = (file.name.split(".").pop() || "jpg").replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "jpg";
  const filePath = `${userId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("id_cards")
    .upload(filePath, file, { upsert: true, contentType: file.type || undefined });

  if (uploadError) {
    throw uploadError;
  }

  const previewUrl = await resolveIdCardPreviewUrl(filePath);
  return {
    storagePath: filePath,
    previewUrl,
  };
}

export async function extractBrowserOcrText(file: File): Promise<{
  rawText: string | null;
  studentId: string | null;
  department: string | null;
  admissionYear: string | null;
}> {
  const filenameMeta = extractIdMetadataFromText(file.name.replace(/[_-]+/g, " "), ASTU_DEPARTMENTS);

  if (typeof window === "undefined" || !("TextDetector" in window)) {
    return {
      rawText: null,
      studentId: filenameMeta.studentId,
      department: filenameMeta.department,
      admissionYear: filenameMeta.admissionYear,
    };
  }

  if (!file.type.startsWith("image/")) {
    return {
      rawText: null,
      studentId: filenameMeta.studentId,
      department: filenameMeta.department,
      admissionYear: filenameMeta.admissionYear,
    };
  }

  try {
    const bitmap = await createImageBitmap(file);
    const DetectorCtor = (window as unknown as {
      TextDetector: new () => { detect: (source: ImageBitmap) => Promise<Array<{ rawValue?: string }>> };
    }).TextDetector;
    const detector = new DetectorCtor();
    const blocks = await detector.detect(bitmap);
    bitmap.close?.();
    const rawText = blocks
      .map((b) => b.rawValue ?? "")
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (!rawText) {
      return {
        rawText: null,
        studentId: filenameMeta.studentId,
        department: filenameMeta.department,
        admissionYear: filenameMeta.admissionYear,
      };
    }

    const parsed = extractIdMetadataFromText(rawText, ASTU_DEPARTMENTS);
    return {
      rawText,
      studentId: parsed.studentId ?? filenameMeta.studentId,
      department: parsed.department ?? filenameMeta.department,
      admissionYear: parsed.admissionYear ?? filenameMeta.admissionYear,
    };
  } catch {
    return {
      rawText: null,
      studentId: filenameMeta.studentId,
      department: filenameMeta.department,
      admissionYear: filenameMeta.admissionYear,
    };
  }
}

export async function loadMyVerification(
  userId: string,
  fallbackFullName?: string
): Promise<{ record: StudentVerificationRecord | null; auditLogs: VerificationAuditEntry[] }> {
  if (!isSupabaseConfigured) {
    const records = readPreviewRecords(userId, fallbackFullName);
    const mine = records.find((r) => r.user_id === userId) ?? records[0] ?? null;
    const logs = mine ? readPreviewLogs().filter((l) => l.verification_id === mine.id) : [];
    return { record: mine, auditLogs: logs };
  }

  const { data: recData, error: recError } = await supabase
    .from("student_verifications")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (recError && recError.code !== "PGRST116") {
    throw recError;
  }

  const record = (recData as unknown as StudentVerificationRecord | null) ?? null;
  if (!record) {
    return { record: null, auditLogs: [] };
  }

  const { data: logsData } = await supabase
    .from("verification_audit_logs")
    .select("*")
    .eq("verification_id", record.id)
    .order("created_at", { ascending: false })
    .limit(30);

  return {
    record,
    auditLogs: (logsData as unknown as VerificationAuditEntry[]) ?? [],
  };
}

export async function runAutomatedPortalLookup(params: {
  userId: string;
  fullName: string;
  department?: string | null;
  batchYear?: string | null;
  studentId?: string | null;
}): Promise<AutomatedLookupResult> {
  if (!isSupabaseConfigured) {
    const records = readPreviewRecords(params.userId, params.fullName);
    const existingIdx = records.findIndex((r) => r.user_id === params.userId);
    const existing = existingIdx >= 0 ? records[existingIdx] : null;
    const outcome = evaluatePortalCandidates(params.fullName, params.department, PREVIEW_ASTU_ROSTER);
    const now = new Date().toISOString();

    let nextStatus: VerificationStatus = "additional_identification_required";
    let matchedRecord: PortalCandidateRecord | null = null;
    let department = params.department || existing?.department || null;
    let admissionYear = existing?.admission_year || null;
    let enrollmentStatus: string | null = null;
    let portalPhotoUrl: string | null = null;
    let message = outcome.reason;

    if (outcome.kind === "unique_match") {
      nextStatus = "automatically_verified";
      matchedRecord = outcome.record;
      department = outcome.record.department;
      admissionYear = outcome.record.admissionYear;
      enrollmentStatus = outcome.record.enrollmentStatus;
      portalPhotoUrl = outcome.record.portalPhotoUrl ?? null;
      message = outcome.reason;
    } else if (outcome.kind === "no_match") {
      nextStatus = "additional_identification_required";
      message =
        "No unique match found in automated ASTU lookup. Please upload your ASTU Student ID card below so an administrator can verify your enrollment.";
    }

    const updatedRecord: StudentVerificationRecord = {
      id: existing?.id ?? "ver-preview-self",
      user_id: params.userId,
      status: nextStatus,
      full_name: params.fullName.trim(),
      student_id: params.studentId?.trim().toUpperCase() || existing?.student_id || null,
      department,
      batch_year: params.batchYear || existing?.batch_year || null,
      id_card_url: existing?.id_card_url ?? null,
      verification_method: "name_lookup",
      admission_year: admissionYear,
      enrollment_status: enrollmentStatus,
      portal_photo_url: portalPhotoUrl,
      matched_record: matchedRecord,
      ocr_extracted: existing?.ocr_extracted ?? null,
      rejection_reason: null,
      admin_notes: null,
      attempt_count: (existing?.attempt_count ?? 0) + 1,
      verified_at: nextStatus === "automatically_verified" ? now : null,
      created_at: existing?.created_at ?? now,
      updated_at: now,
    };

    const nextList = [...records];
    if (existingIdx >= 0) nextList[existingIdx] = updatedRecord;
    else nextList.unshift(updatedRecord);
    writePreviewRecords(nextList);

    appendPreviewLog({
      verification_id: updatedRecord.id,
      actor_id: params.userId,
      previous_status: existing?.status ?? "unverified",
      new_status: nextStatus,
      notes: message,
    });

    const auditLogs = readPreviewLogs().filter((l) => l.verification_id === updatedRecord.id);
    return {
      status: nextStatus,
      outcomeKind: outcome.kind,
      message,
      record: updatedRecord,
      auditLogs,
    };
  }

  const { data, error } = await supabase.functions.invoke("verify-astu-student", {
    body: {
      fullName: params.fullName.trim(),
      department: params.department || null,
      batchYear: params.batchYear || null,
      studentId: params.studentId?.trim().toUpperCase() || null,
    },
  });

  if (error) {
    // Graceful fallback: Edge Function may not be deployed in every sandbox; create additional_id state via RPC
    await (supabase.rpc as unknown as (fn: string, args: Record<string, unknown>) => Promise<{ error: unknown }>)(
      "submit_student_verification",
      {
        _full_name: params.fullName.trim(),
        _student_id: params.studentId?.trim().toUpperCase() || null,
        _department: params.department || null,
        _batch_year: params.batchYear || null,
        _id_card_url: null,
        _verification_method: "name_lookup",
        _ocr_extracted: null,
      }
    );
    const reloaded = await loadMyVerification(params.userId, params.fullName);
    return {
      status: reloaded.record?.status ?? "additional_identification_required",
      outcomeKind: "unavailable",
      message:
        "ASTU portal lookup could not be reached automatically. Proceed with Approach 2 by uploading your ASTU Student ID card.",
      record: reloaded.record,
      auditLogs: reloaded.auditLogs,
    };
  }

  const payload = (data ?? {}) as {
    status?: VerificationStatus;
    outcomeKind?: AutomatedLookupResult["outcomeKind"];
    message?: string;
  };
  const reloaded = await loadMyVerification(params.userId, params.fullName);
  return {
    status: payload.status ?? reloaded.record?.status ?? "additional_identification_required",
    outcomeKind: payload.outcomeKind ?? "no_match",
    message:
      payload.message ??
      "Automated lookup completed. Check your status below.",
    record: reloaded.record,
    auditLogs: reloaded.auditLogs,
  };
}

export async function submitIdCardVerification(params: {
  userId: string;
  fullName: string;
  studentId: string;
  department: string | null;
  batchYear: string | null;
  idCardStoragePath: string;
  ocrExtracted?: StudentVerificationRecord["ocr_extracted"];
}): Promise<{ record: StudentVerificationRecord | null; auditLogs: VerificationAuditEntry[] }> {
  const parsedId = validateAstuStudentId(params.studentId);
  const normalizedId = parsedId.valid ? parsedId.normalized : params.studentId.trim().toUpperCase();

  if (!isSupabaseConfigured) {
    const records = readPreviewRecords(params.userId, params.fullName);
    const existingIdx = records.findIndex((r) => r.user_id === params.userId);
    const existing = existingIdx >= 0 ? records[existingIdx] : null;
    const now = new Date().toISOString();

    const updated: StudentVerificationRecord = {
      id: existing?.id ?? "ver-preview-self",
      user_id: params.userId,
      status: "pending_admin_review",
      full_name: params.fullName.trim(),
      student_id: normalizedId,
      department: params.department,
      batch_year: params.batchYear,
      id_card_url: params.idCardStoragePath,
      verification_method: "combined_id_card",
      admission_year: parsedId.admissionYearLabel ?? existing?.admission_year ?? null,
      enrollment_status: existing?.enrollment_status ?? null,
      portal_photo_url: existing?.portal_photo_url ?? null,
      matched_record: existing?.matched_record ?? null,
      ocr_extracted: params.ocrExtracted ?? existing?.ocr_extracted ?? null,
      rejection_reason: null,
      admin_notes: existing?.admin_notes ?? null,
      attempt_count: (existing?.attempt_count ?? 0) + 1,
      verified_at: null,
      created_at: existing?.created_at ?? now,
      updated_at: now,
    };

    const nextList = [...records];
    if (existingIdx >= 0) nextList[existingIdx] = updated;
    else nextList.unshift(updated);
    writePreviewRecords(nextList);

    appendPreviewLog({
      verification_id: updated.id,
      actor_id: params.userId,
      previous_status: existing?.status ?? "unverified",
      new_status: "pending_admin_review",
      notes: `Submitted physical ASTU Student ID (${normalizedId}) for administrator review.`,
    });

    return loadMyVerification(params.userId, params.fullName);
  }

  const { error } = await (
    supabase.rpc as unknown as (
      fn: string,
      args: Record<string, unknown>
    ) => Promise<{ error: { message: string } | null }>
  )("submit_student_verification", {
    _full_name: params.fullName.trim(),
    _student_id: normalizedId || null,
    _department: params.department || null,
    _batch_year: params.batchYear || null,
    _id_card_url: params.idCardStoragePath,
    _verification_method: "combined_id_card",
    _ocr_extracted: params.ocrExtracted ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }

  return loadMyVerification(params.userId, params.fullName);
}

export async function listVerificationQueue(currentUserId: string): Promise<StudentVerificationRecord[]> {
  if (!isSupabaseConfigured) {
    return readPreviewRecords(currentUserId);
  }

  const { data, error } = await (
    supabase.rpc as unknown as (
      fn: string
    ) => Promise<{ data: StudentVerificationRecord[] | null; error: { message: string } | null }>
  )("admin_student_verifications");

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function reviewVerificationRecord(params: {
  reviewerId: string;
  verificationId: string;
  decision: "approved" | "rejected";
  notes?: string;
}): Promise<void> {
  if (!isSupabaseConfigured) {
    const records = readPreviewRecords(params.reviewerId);
    const idx = records.findIndex((r) => r.id === params.verificationId);
    if (idx === -1) return;
    const prev = records[idx];
    const nextStatus: VerificationStatus = params.decision === "approved" ? "verified" : "rejected";
    const now = new Date().toISOString();
    records[idx] = {
      ...prev,
      status: nextStatus,
      admin_notes: params.notes?.trim() || null,
      rejection_reason:
        nextStatus === "rejected"
          ? params.notes?.trim() || "ID card image or details could not be confirmed."
          : null,
      verified_at: nextStatus === "verified" ? now : null,
      updated_at: now,
    };
    writePreviewRecords(records);

    appendPreviewLog({
      verification_id: params.verificationId,
      actor_id: params.reviewerId,
      previous_status: prev.status,
      new_status: nextStatus,
      notes:
        params.notes?.trim() ||
        (nextStatus === "verified" ? "Approved by administrator" : "Rejected by administrator"),
    });
    return;
  }

  const { error } = await (
    supabase.rpc as unknown as (
      fn: string,
      args: Record<string, unknown>
    ) => Promise<{ error: { message: string } | null }>
  )("review_student_verification", {
    _verification_id: params.verificationId,
    _decision: params.decision,
    _notes: params.notes?.trim() || null,
  });

  if (error) {
    throw new Error(error.message);
  }
}

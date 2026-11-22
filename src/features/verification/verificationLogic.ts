export type VerificationStatus =
  | "unverified"
  | "pending_automated"
  | "automatically_verified"
  | "additional_identification_required"
  | "pending_admin_review"
  | "verified"
  | "rejected";

export type VerificationMethod = "name_lookup" | "combined_id_card" | "admin_review";

export interface PortalCandidateRecord {
  officialFullName: string;
  department: string;
  admissionYear: string;
  enrollmentStatus: "active" | "graduated" | "withdrawn";
  portalPhotoUrl?: string | null;
}

export type PortalMatchOutcome =
  | {
      kind: "unique_match";
      confidence: number;
      record: PortalCandidateRecord;
      reason: string;
    }
  | {
      kind: "ambiguous";
      candidateCount: number;
      reason: string;
    }
  | {
      kind: "no_match";
      reason: string;
    }
  | {
      kind: "unavailable";
      reason: string;
    };

export interface VerificationProgress {
  stepIndex: number; // 0..3
  percent: number;
  isVerified: boolean;
  needsAdditionalId: boolean;
  isPendingReview: boolean;
  isRejected: boolean;
}

export interface ParsedStudentId {
  valid: boolean;
  normalized: string;
  prefix?: "UGR" | "ETS" | "PGR";
  serial?: string;
  ethiopianYear?: string;
  admissionYearLabel?: string;
  error?: string;
}

export interface ConsistencyReport {
  consistent: boolean;
  matchedFields: string[];
  mismatches: string[];
}

export const VERIFICATION_WORKFLOW_STEPS = [
  { id: "details", label: "Student Name" },
  { id: "lookup", label: "Portal Lookup" },
  { id: "id_card", label: "ID Card Check" },
  { id: "verified", label: "Verified" },
] as const;

const HONORIFIC_TOKENS = new Set(["mr", "ms", "mrs", "dr", "eng", "ustaz", "brother", "sister"]);

export function normalizeFullName(raw: string): { normalized: string; tokens: string[] } {
  const cleaned = raw
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const tokens = cleaned
    .split(" ")
    .filter((t) => t.length > 0 && !HONORIFIC_TOKENS.has(t));

  return {
    normalized: tokens.join(" "),
    tokens,
  };
}

export function scoreNameSimilarity(submittedName: string, candidateName: string): number {
  const a = normalizeFullName(submittedName);
  const b = normalizeFullName(candidateName);
  if (!a.normalized || !b.normalized) return 0;
  if (a.normalized === b.normalized) return 1;
  if (a.tokens.length < 2 || b.tokens.length < 2) return 0;

  let matched = 0;
  for (const token of a.tokens) {
    if (b.tokens.includes(token)) {
      matched += 1;
    } else if (
      token.length >= 3 &&
      b.tokens.some((bt) => bt.startsWith(token) || token.startsWith(bt))
    ) {
      matched += 0.6;
    }
  }

  const denominator = Math.max(a.tokens.length, b.tokens.length);
  return Math.min(1, Number((matched / denominator).toFixed(3)));
}

export function evaluatePortalCandidates(
  submittedName: string,
  submittedDepartment: string | null | undefined,
  candidates: PortalCandidateRecord[]
): PortalMatchOutcome {
  const { tokens } = normalizeFullName(submittedName);
  if (tokens.length < 2) {
    return {
      kind: "no_match",
      reason: "Please provide at least your first and father's full name as registered with ASTU.",
    };
  }

  const scored = candidates
    .map((candidate) => ({
      candidate,
      score: scoreNameSimilarity(submittedName, candidate.officialFullName),
    }))
    .filter((entry) => entry.score >= 0.8)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return {
      kind: "no_match",
      reason: "No single active ASTU enrollment record matched that name.",
    };
  }

  if (scored.length === 1 && scored[0].candidate.enrollmentStatus === "active") {
    return {
      kind: "unique_match",
      confidence: scored[0].score,
      record: scored[0].candidate,
      reason: "Unique active ASTU student enrollment match confirmed.",
    };
  }

  // Disambiguate duplicate names using department when available
  const deptNorm = submittedDepartment?.trim().toLowerCase();
  if (deptNorm) {
    const deptNarrowed = scored.filter(
      (entry) =>
        entry.candidate.enrollmentStatus === "active" &&
        entry.candidate.department.toLowerCase() === deptNorm
    );
    if (deptNarrowed.length === 1) {
      return {
        kind: "unique_match",
        confidence: deptNarrowed[0].score,
        record: deptNarrowed[0].candidate,
        reason: "Unique match confirmed using name and academic department.",
      };
    }
  }

  return {
    kind: "ambiguous",
    candidateCount: scored.length,
    reason: `Found ${scored.length} matching records for this name. Upload your ASTU Student ID card to confirm identity.`,
  };
}

export function validateAstuStudentId(rawId: string): ParsedStudentId {
  const normalized = rawId.trim().toUpperCase().replace(/\s+/g, "");
  if (!normalized) {
    return {
      valid: false,
      normalized: "",
      error: "Enter your ASTU Student ID (e.g. UGR/25412/14).",
    };
  }

  const match = /^(UGR|ETS|PGR)\/(\d{4,6})\/(\d{2})$/.exec(normalized);
  if (!match) {
    return {
      valid: false,
      normalized,
      error: "Use the official ASTU format like UGR/12345/14 or ETS/1234/13.",
    };
  }

  const [, prefix, serial, ethYear] = match;
  const numericYear = Number(ethYear);
  const gregorianStart = 2007 + numericYear; // Ethiopian academic year mapping

  return {
    valid: true,
    normalized,
    prefix: prefix as "UGR" | "ETS" | "PGR",
    serial,
    ethiopianYear: ethYear,
    admissionYearLabel: `${gregorianStart}/${String(gregorianStart + 1).slice(-2)} (20${ethYear} E.C.)`,
  };
}

export function getVerificationProgress(status: VerificationStatus): VerificationProgress {
  switch (status) {
    case "automatically_verified":
    case "verified":
      return {
        stepIndex: 3,
        percent: 100,
        isVerified: true,
        needsAdditionalId: false,
        isPendingReview: false,
        isRejected: false,
      };
    case "pending_admin_review":
      return {
        stepIndex: 2,
        percent: 75,
        isVerified: false,
        needsAdditionalId: false,
        isPendingReview: true,
        isRejected: false,
      };
    case "additional_identification_required":
      return {
        stepIndex: 2,
        percent: 50,
        isVerified: false,
        needsAdditionalId: true,
        isPendingReview: false,
        isRejected: false,
      };
    case "pending_automated":
      return {
        stepIndex: 1,
        percent: 35,
        isVerified: false,
        needsAdditionalId: false,
        isPendingReview: false,
        isRejected: false,
      };
    case "rejected":
      return {
        stepIndex: 2,
        percent: 40,
        isVerified: false,
        needsAdditionalId: true,
        isPendingReview: false,
        isRejected: true,
      };
    case "unverified":
    default:
      return {
        stepIndex: 0,
        percent: 15,
        isVerified: false,
        needsAdditionalId: false,
        isPendingReview: false,
        isRejected: false,
      };
  }
}

export function checkConsistency(
  submitted: {
    fullName: string;
    studentId?: string | null;
    department?: string | null;
  },
  reference?: {
    officialFullName?: string | null;
    studentId?: string | null;
    department?: string | null;
  } | null
): ConsistencyReport {
  if (!reference) {
    return {
      consistent: true,
      matchedFields: [],
      mismatches: [],
    };
  }

  const matchedFields: string[] = [];
  const mismatches: string[] = [];

  if (reference.officialFullName) {
    const score = scoreNameSimilarity(submitted.fullName, reference.officialFullName);
    if (score >= 0.8) {
      matchedFields.push("Full name");
    } else {
      mismatches.push(
        `Submitted name "${submitted.fullName}" differs from reference "${reference.officialFullName}".`
      );
    }
  }

  if (reference.studentId && submitted.studentId) {
    const a = submitted.studentId.trim().toUpperCase();
    const b = reference.studentId.trim().toUpperCase();
    if (a === b) {
      matchedFields.push("Student ID");
    } else {
      mismatches.push(`Submitted ID "${a}" differs from extracted ID "${b}".`);
    }
  }

  if (reference.department && submitted.department) {
    if (reference.department.trim().toLowerCase() === submitted.department.trim().toLowerCase()) {
      matchedFields.push("Department");
    } else {
      mismatches.push(
        `Submitted department "${submitted.department}" differs from "${reference.department}".`
      );
    }
  }

  return {
    consistent: mismatches.length === 0,
    matchedFields,
    mismatches,
  };
}

export function extractIdMetadataFromText(
  rawText: string,
  knownDepartments: readonly string[]
): {
  studentId: string | null;
  department: string | null;
  admissionYear: string | null;
} {
  const idMatch = /(UGR|ETS|PGR)\s*\/\s*(\d{4,6})\s*\/\s*(\d{2})/i.exec(rawText);
  const normalizedId = idMatch
    ? `${idMatch[1].toUpperCase()}/${idMatch[2]}/${idMatch[3]}`
    : null;
  const parsedId = normalizedId ? validateAstuStudentId(normalizedId) : null;

  const lower = rawText.toLowerCase();
  const matchedDept =
    knownDepartments.find((dept) => lower.includes(dept.toLowerCase())) ?? null;

  return {
    studentId: normalizedId,
    department: matchedDept,
    admissionYear: parsedId?.admissionYearLabel ?? null,
  };
}

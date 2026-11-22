import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";

const RequestSchema = z.object({
  fullName: z.string().trim().min(3).max(160),
  department: z.string().trim().max(120).optional().nullable(),
  batchYear: z.string().trim().max(60).optional().nullable(),
  studentId: z.string().trim().max(40).optional().nullable(),
});

interface PortalCandidate {
  officialFullName: string;
  department: string;
  admissionYear: string;
  enrollmentStatus: "active" | "graduated" | "withdrawn";
  portalPhotoUrl?: string | null;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function normalizeName(raw: string): { normalized: string; tokens: string[] } {
  const cleaned = raw
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const skip = new Set(["mr", "ms", "mrs", "dr", "eng", "ustaz", "brother", "sister"]);
  const tokens = cleaned.split(" ").filter((t) => t.length > 0 && !skip.has(t));
  return { normalized: tokens.join(" "), tokens };
}

function scoreMatch(submitted: string, candidate: string): number {
  const a = normalizeName(submitted);
  const b = normalizeName(candidate);
  if (!a.normalized || !b.normalized) return 0;
  if (a.normalized === b.normalized) return 1;
  if (a.tokens.length < 2 || b.tokens.length < 2) return 0;

  let hits = 0;
  for (const token of a.tokens) {
    if (b.tokens.includes(token)) hits += 1;
    else if (token.length >= 3 && b.tokens.some((bt) => bt.startsWith(token) || token.startsWith(bt))) {
      hits += 0.6;
    }
  }
  return Math.min(1, hits / Math.max(a.tokens.length, b.tokens.length));
}

async function queryAstuPortal(fullName: string): Promise<{
  reachable: boolean;
  candidates: PortalCandidate[];
  reason: string;
}> {
  const endpoint = Deno.env.get("ASTU_PORTAL_LOOKUP_URL") || "https://portal.astu.edu.et";
  const bearerToken = Deno.env.get("ASTU_PORTAL_API_TOKEN");

  // Note: NEVER request or transmit student portal passwords.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4500);

  try {
    const targetUrl = new URL(endpoint);
    if (!targetUrl.pathname || targetUrl.pathname === "/") {
      targetUrl.pathname = "/api/public/student-directory";
    }
    targetUrl.searchParams.set("q", fullName);

    const headers: Record<string, string> = {
      Accept: "application/json",
      "User-Agent": "ASTU-Jemea-Verification/1.0",
    };
    if (bearerToken) {
      headers["Authorization"] = `Bearer ${bearerToken}`;
    }

    const res = await fetch(targetUrl.toString(), {
      method: "GET",
      headers,
      signal: controller.signal,
    });

    if (!res.ok) {
      return {
        reachable: false,
        candidates: [],
        reason: `ASTU portal lookup endpoint returned HTTP ${res.status}. Switching to ID card verification.`,
      };
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return {
        reachable: false,
        candidates: [],
        reason:
          "ASTU public directory API is not directly exposed on portal.astu.edu.et. Upload your Student ID card to verify.",
      };
    }

    const payload = await res.json();
    const rows = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.students)
        ? payload.students
        : Array.isArray(payload?.data)
          ? payload.data
          : [];

    const candidates: PortalCandidate[] = rows
      .filter((r: Record<string, unknown>) => typeof r?.fullName === "string" || typeof r?.full_name === "string")
      .map((r: Record<string, unknown>) => ({
        officialFullName: String(r.fullName ?? r.full_name ?? "").trim(),
        department: String(r.department ?? r.program ?? "").trim(),
        admissionYear: String(r.admissionYear ?? r.admission_year ?? "").trim(),
        enrollmentStatus:
          String(r.enrollmentStatus ?? r.status ?? "active").toLowerCase() === "graduated"
            ? "graduated"
            : String(r.enrollmentStatus ?? r.status ?? "active").toLowerCase() === "withdrawn"
              ? "withdrawn"
              : "active",
        portalPhotoUrl: typeof r.photoUrl === "string" ? r.photoUrl : null,
      }));

    return {
      reachable: true,
      candidates,
      reason: candidates.length ? "ASTU portal directory queried." : "No matching name found in ASTU portal directory.",
    };
  } catch (err) {
    return {
      reachable: false,
      candidates: [],
      reason:
        err instanceof Error && err.name === "AbortError"
          ? "ASTU portal lookup timed out. Continue with Student ID card verification."
          : "Could not reach ASTU portal directory right now. Continue with Student ID card verification.",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Please sign in first." }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(token);
    const userId = claims?.claims?.sub;
    if (claimsErr || !userId) {
      return json({ error: "Please sign in first." }, 401);
    }

    const parsed = RequestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return json({ error: "Please enter a valid official full name (3–160 characters)." }, 400);
    }

    const { fullName, department, batchYear, studentId } = parsed.data;
    const { tokens } = normalizeName(fullName);
    if (tokens.length < 2) {
      return json(
        {
          status: "additional_identification_required",
          outcome: "no_match",
          message: "Provide at least your first and father's official full name or upload your Student ID card.",
        },
        200
      );
    }

    const portalResult = await queryAstuPortal(fullName);

    const scored = portalResult.candidates
      .map((c) => ({ c, score: scoreMatch(fullName, c.officialFullName) }))
      .filter((item) => item.score >= 0.8)
      .sort((a, b) => b.score - a.score);

    const deptNormalized = department?.trim().toLowerCase();
    const disambiguated =
      scored.length > 1 && deptNormalized
        ? scored.filter((item) => item.c.department.toLowerCase() === deptNormalized)
        : scored;

    const dbClient = serviceRoleKey
      ? createClient(supabaseUrl, serviceRoleKey)
      : userClient;

    let nextStatus: "automatically_verified" | "additional_identification_required" =
      "additional_identification_required";
    let matchedRecord: PortalCandidate | null = null;
    let outcome: "unique_match" | "ambiguous" | "no_match" | "unavailable" = "unavailable";
    let auditNote = portalResult.reason;

    if (disambiguated.length === 1 && disambiguated[0].c.enrollmentStatus === "active") {
      matchedRecord = disambiguated[0].c;
      nextStatus = "automatically_verified";
      outcome = "unique_match";
      auditNote = `Approach 1 automated portal match confirmed (${matchedRecord.department}, ${matchedRecord.admissionYear}).`;
    } else if (scored.length > 1) {
      outcome = "ambiguous";
      auditNote = `Multiple records (${scored.length}) matched "${fullName}". Additional Student ID card required.`;
    } else if (portalResult.reachable) {
      outcome = "no_match";
      auditNote = `No unique active match on portal for "${fullName}". Routed to ID card verification.`;
    }

    const { data: existing } = await dbClient
      .from("student_verifications")
      .select("id, status, attempt_count")
      .eq("user_id", userId)
      .maybeSingle();

    let verificationId = existing?.id;
    const prevStatus = existing?.status ?? "unverified";

    const upsertFields = {
      user_id: userId,
      status: nextStatus,
      full_name: matchedRecord?.officialFullName || fullName,
      student_id: studentId || null,
      department: matchedRecord?.department || department || null,
      batch_year: batchYear || null,
      verification_method: "name_lookup",
      admission_year: matchedRecord?.admissionYear || null,
      enrollment_status: matchedRecord?.enrollmentStatus || null,
      portal_photo_url: matchedRecord?.portalPhotoUrl || null,
      matched_record: matchedRecord,
      verified_at: nextStatus === "automatically_verified" ? new Date().toISOString() : null,
      attempt_count: (existing?.attempt_count ?? 0) + 1,
    };

    if (verificationId) {
      await dbClient
        .from("student_verifications")
        .update(upsertFields)
        .eq("id", verificationId);
    } else {
      const { data: inserted } = await dbClient
        .from("student_verifications")
        .insert(upsertFields)
        .select("id")
        .single();
      verificationId = inserted?.id;
    }

    if (verificationId) {
      await dbClient.from("verification_audit_logs").insert({
        verification_id: verificationId,
        actor_id: userId,
        previous_status: prevStatus,
        new_status: nextStatus,
        notes: auditNote,
      });
    }

    if (nextStatus === "automatically_verified" && matchedRecord && serviceRoleKey) {
      await dbClient
        .from("profiles")
        .update({
          is_verified: true,
          full_name: matchedRecord.officialFullName,
          department: matchedRecord.department || department || null,
          batch_year: batchYear || null,
          ...(studentId ? { student_id: studentId } : {}),
        })
        .eq("id", userId);

      await dbClient.from("notifications").insert({
        user_id: userId,
        title: "Student status automatically verified",
        body: `Confirmed enrollment in ${matchedRecord.department} (${matchedRecord.admissionYear}).`,
        deep_link: "/verification",
        category: "verification",
      });
    }

    return json({
      verificationId,
      status: nextStatus,
      outcome,
      message: auditNote,
      matchedRecord,
    });
  } catch (err) {
    console.error("verify-astu-student error:", err);
    return json({ error: "Verification service encountered an error." }, 500);
  }
});

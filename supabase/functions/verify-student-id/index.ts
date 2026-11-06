import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["is_student_id_card", "card_university", "university_matches", "card_holder_name", "name_matches", "card_student_id", "student_id_matches", "appears_current", "confidence", "reason"],
  properties: {
    is_student_id_card: { type: "boolean" },
    card_university: { type: ["string", "null"] },
    university_matches: { type: "boolean" },
    card_holder_name: { type: ["string", "null"] },
    name_matches: { type: "boolean" },
    card_student_id: { type: ["string", "null"] },
    student_id_matches: { type: "boolean" },
    appears_current: { type: "boolean" },
    confidence: { type: "number" },
    reason: { type: "string" },
  },
} as const;

type Verdict = {
  is_student_id_card: boolean;
  university_matches: boolean;
  name_matches: boolean;
  student_id_matches: boolean;
  appears_current: boolean;
  confidence: number;
  reason: string;
};

const toBase64 = (bytes: Uint8Array) => {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(binary);
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return json({ error: "Please sign in first." }, 401);
    const url = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: claims, error: authErr } = await userClient.auth.getClaims(auth.replace("Bearer ", ""));
    const userId = claims?.claims?.sub as string | undefined;
    if (authErr || !userId) return json({ error: "Please sign in first." }, 401);

    const { data: profile, error: profileErr } = await userClient
      .from("profiles")
      .select("id, full_name, student_id, id_card_url, university_id, universities(name, short_name)")
      .eq("id", userId)
      .single();
    if (profileErr || !profile) return json({ error: "Profile not found." }, 404);
    if (!profile.id_card_url || /^https?:\/\//i.test(profile.id_card_url)) {
      return json({ error: "Upload your student ID card from your device first (Profile → Edit → Photo & documents)." }, 400);
    }

    const service = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: file, error: downloadErr } = await service.storage.from("id-cards").download(profile.id_card_url);
    if (downloadErr || !file) return json({ error: "Could not read your uploaded ID card. Please upload it again." }, 400);

    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return json({ error: "AI is not configured." }, 500);

    const uni = (profile.universities as { name?: string; short_name?: string } | null) ?? {};
    const expectedUniversity = [uni.name, uni.short_name].filter(Boolean).join(" / ") || "the selected university";
    const mime = file.type || "image/jpeg";
    const base64 = toBase64(new Uint8Array(await file.arrayBuffer()));

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        store: false,
        reasoning: { effort: "low" },
        instructions:
          "You verify university student ID cards. Inspect the image and decide whether it is a genuine-looking student ID card, " +
          "whether it belongs to the expected university, whether the holder name and student ID number match the profile values, " +
          "and whether it appears currently valid (valid-through/expiry date not in the past, or a current academic year). " +
          "Be strict: a screenshot of a website, a document that is not an ID card, an expired card, or mismatched details must fail. " +
          "Give a short student-facing reason.",
        input: [{
          role: "user",
          content: [
            { type: "input_text", text: `Expected university: ${expectedUniversity}\nProfile full name: ${profile.full_name}\nProfile student ID: ${profile.student_id ?? "(not set)"}\nToday's date: ${new Date().toISOString().slice(0, 10)}` },
            { type: "input_image", image_url: `data:${mime};base64,${base64}` },
          ],
        }],
        text: { format: { type: "json_schema", name: "id_verification", strict: true, schema } },
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      console.error("gateway", res.status, t);
      const msg = res.status === 429 ? "Too many checks right now — please try again in a minute."
        : res.status === 402 ? "AI credits have run out for this workspace."
        : "The verification service is unavailable right now.";
      return json({ error: msg }, res.status);
    }

    const payload = await res.json();
    const text: string = payload.output_text
      ?? (payload.output ?? []).flatMap((o: { content?: { type: string; text?: string }[] }) => o.content ?? [])
        .filter((c: { type: string }) => c.type === "output_text").map((c: { text?: string }) => c.text ?? "").join("");
    let verdict: Verdict;
    try { verdict = JSON.parse(text); } catch { return json({ error: "Could not read the verification result." }, 502); }

    const approved = verdict.is_student_id_card && verdict.university_matches && verdict.name_matches
      && verdict.student_id_matches && verdict.appears_current && verdict.confidence >= 0.8;

    const update = approved
      ? { is_verified: true, id_verification_status: "verified", id_verification_note: verdict.reason, id_verified_at: new Date().toISOString() }
      : { is_verified: false, id_verification_status: "rejected", id_verification_note: verdict.reason, id_verified_at: null };
    const { error: updateErr } = await service.from("profiles").update(update).eq("id", userId);
    if (updateErr) { console.error("profile update", updateErr); return json({ error: "Could not save the verification result." }, 500); }

    return json({ status: update.id_verification_status, reason: verdict.reason });
  } catch (e) {
    console.error("verify-student-id", e);
    return json({ error: "Something went wrong." }, 500);
  }
});

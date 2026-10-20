import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";

const Body = z.object({ interests: z.string().trim().min(3).max(1000) });
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["recommendations"],
  properties: {
    recommendations: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["group_id", "match_score", "reason"],
        properties: {
          group_id: { type: "string" },
          match_score: { type: "integer" },
          reason: { type: "string" },
        },
      },
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return json({ error: "Please sign in first." }, 401);
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: claims, error: authErr } = await supabase.auth.getClaims(auth.replace("Bearer ", ""));
    if (authErr || !claims?.claims) return json({ error: "Please sign in first." }, 401);

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Tell us a bit more about your interests (3–1000 characters)." }, 400);

    // RLS limits this to groups in the student's own university and gender.
    const { data: groups, error } = await supabase
      .from("student_groups")
      .select("id, name, description, focus_tags, activities");
    if (error) throw error;
    if (!groups?.length) return json({ recommendations: [] });

    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return json({ error: "AI is not configured." }, 500);

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        store: false,
        reasoning: { effort: "low" },
        instructions:
          "You match university students to study/community groups. Only recommend groups from the provided list, using their exact id. Return up to 3 best matches, match_score 0-100, and a one-sentence friendly reason addressed to the student. If none fit, return an empty list.",
        input: `Student interests:\n${parsed.data.interests}\n\nAvailable groups (JSON):\n${JSON.stringify(groups)}`,
        text: { format: { type: "json_schema", name: "group_recommendations", strict: true, schema } },
      }),
    });

    if (!res.ok || !res.body) {
      const t = await res.text();
      console.error("gateway", res.status, t);
      const msg =
        res.status === 429 ? "Too many requests right now — please try again in a minute."
        : res.status === 402 ? "AI credits have run out for this workspace."
        : "Could not get recommendations right now.";
      return json({ error: msg }, res.status);
    }

    // Consume SSE stream and collect output text.
    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
    let buf = "", text = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += value;
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const d = line.slice(5).trim();
        if (!d || d === "[DONE]") continue;
        try {
          const ev = JSON.parse(d);
          if (ev.type === "response.output_text.delta") text += ev.delta ?? "";
          if (ev.type === "response.refusal.delta" || ev.type === "error" || ev.type === "response.failed") {
            return json({ error: "Could not get recommendations for that request." }, 422);
          }
        } catch { /* partial */ }
      }
    }

    let out: { recommendations: { group_id: string; match_score: number; reason: string }[] };
    try { out = JSON.parse(text); } catch { return json({ error: "Could not read recommendations." }, 502); }
    const ids = new Set(groups.map((g) => g.id));
    const recommendations = (out.recommendations ?? [])
      .filter((r) => ids.has(r.group_id))
      .slice(0, 3)
      .map((r) => ({ ...r, match_score: Math.max(0, Math.min(100, Math.round(r.match_score))) }));
    return json({ recommendations });
  } catch (e) {
    console.error("recommend-groups", e);
    return json({ error: "Something went wrong." }, 500);
  }
});

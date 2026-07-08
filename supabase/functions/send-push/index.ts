import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";

const BodySchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  url: z.string().url().optional(),
  external_user_ids: z.array(z.string()).optional(),
  included_segments: z.array(z.string()).optional(),
}).refine((v) => v.external_user_ids?.length || v.included_segments?.length, {
  message: "Provide external_user_ids or included_segments",
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authErr } = await supabase.auth.getClaims(token);
    if (authErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Admin-only
    const userId = claims.claims.sub as string;
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: role } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { title, message, url, external_user_ids, included_segments } = parsed.data;

    const APP_ID = Deno.env.get("ONESIGNAL_APP_ID");
    const REST = Deno.env.get("ONESIGNAL_REST_API_KEY");
    if (!APP_ID || !REST) {
      return new Response(JSON.stringify({ error: "Push service not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload: Record<string, unknown> = {
      app_id: APP_ID,
      headings: { en: title },
      contents: { en: message },
    };
    if (url) payload.url = url;
    if (external_user_ids?.length) payload.include_external_user_ids = external_user_ids;
    if (included_segments?.length) payload.included_segments = included_segments;

    const response = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${REST}`,
      },
      body: JSON.stringify(payload),
    });
    const body = await response.text();
    if (!response.ok) {
      console.error(`OneSignal error [${response.status}]: ${body}`);
      return new Response(
        JSON.stringify({ error: "Provider request failed", status: response.status, details: body }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    return new Response(body, { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("send-push error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

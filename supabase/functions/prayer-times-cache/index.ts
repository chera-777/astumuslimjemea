import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";

const BodySchema = z.object({
  city: z.string().min(1).max(120),
  country: z.string().min(1).max(120),
  method: z.number().int().min(0).max(23).optional(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { city, country } = parsed.data;
    const method = parsed.data.method ?? 3;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const today = new Date().toISOString().slice(0, 10);

    // Cache lookup
    const { data: cached } = await admin
      .from("prayer_times_cache")
      .select("city,country,method,date,timings,hijri_date")
      .eq("city", city)
      .eq("country", country)
      .eq("method", method)
      .eq("date", today)
      .maybeSingle();

    if (cached) {
      return new Response(JSON.stringify({ cached: true, ...cached }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`;
    const res = await fetch(url);
    const body = await res.text();
    if (!res.ok) {
      console.error(`Aladhan error [${res.status}]: ${body}`);
      return new Response(
        JSON.stringify({ error: "Provider request failed", status: res.status, details: body }),
        { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const json = JSON.parse(body);
    const timings = json?.data?.timings;
    const hijri = json?.data?.date?.hijri
      ? `${json.data.date.hijri.day} ${json.data.date.hijri.month?.en} ${json.data.date.hijri.year}`
      : null;

    if (timings) {
      await admin.from("prayer_times_cache").upsert(
        { city, country, method, date: today, timings, hijri_date: hijri },
        { onConflict: "city,country,method,date" },
      );
    }

    return new Response(
      JSON.stringify({ cached: false, city, country, method, date: today, timings, hijri_date: hijri }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("prayer-times-cache error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

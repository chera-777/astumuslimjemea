import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Live RSVP count + current user's RSVP status for an event.
 * Only activates when `eventId` is a UUID.
 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function useEventRsvps(eventId?: string | null) {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [myStatus, setMyStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!eventId || !UUID_RE.test(eventId)) return;
    let cancelled = false;
    setLoading(true);

    const load = async () => {
      const { count: c } = await supabase
        .from("event_rsvps")
        .select("id", { count: "exact", head: true })
        .eq("event_id", eventId)
        .eq("status", "going");

      if (!cancelled) setCount(c || 0);

      if (user?.id) {
        const { data } = await supabase
          .from("event_rsvps")
          .select("status")
          .eq("event_id", eventId)
          .eq("user_id", user.id)
          .maybeSingle();
        if (!cancelled) setMyStatus((data as any)?.status ?? null);
      }
      if (!cancelled) setLoading(false);
    };
    load();

    const channel = supabase
      .channel(`event_rsvps:${eventId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "event_rsvps", filter: `event_id=eq.${eventId}` },
        () => load()
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [eventId, user?.id]);

  const rsvp = async (status: "going" | "maybe" | "declined") => {
    if (!eventId || !user?.id || !UUID_RE.test(eventId)) return;
    await supabase
      .from("event_rsvps")
      .upsert({ event_id: eventId, user_id: user.id, status }, { onConflict: "event_id,user_id" });
  };

  return { count, myStatus, loading, rsvp };
}

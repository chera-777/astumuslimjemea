import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type XpSource =
  | "event_rsvp"
  | "donation"
  | "azan_daily"
  | "tasbih_100"
  | "quran_surah";

export const XP_REWARDS: Record<XpSource, number> = {
  event_rsvp: 5,
  donation: 10,
  azan_daily: 2,
  tasbih_100: 3,
  quran_surah: 15,
};

export interface XpEvent {
  id: string;
  source: string;
  delta: number;
  meta: any;
  created_at: string;
}

const todayKey = (source: string) => `xp:${source}:${new Date().toDateString()}`;

/**
 * Awards XP and exposes the current user's XP state.
 * `oncePerDay` sources are locally throttled so repeat visits don't farm points.
 */
export function useXp() {
  const { user } = useAuth();
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [recent, setRecent] = useState<XpEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    const [{ data: prof }, { data: events }] = await Promise.all([
      supabase.from("profiles").select("xp,level").eq("id", user.id).maybeSingle(),
      supabase
        .from("xp_events")
        .select("id,source,delta,meta,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);
    setXp(prof?.xp ?? 0);
    setLevel(prof?.level ?? 1);
    setRecent((events as XpEvent[]) || []);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const award = useCallback(
    async (source: XpSource, opts?: { meta?: Record<string, unknown>; oncePerDay?: boolean }) => {
      if (!user?.id) return false;
      if (opts?.oncePerDay) {
        if (localStorage.getItem(todayKey(source))) return false;
      }
      const { error } = await supabase.from("xp_events").insert({
        user_id: user.id,
        source,
        delta: XP_REWARDS[source],
        meta: (opts?.meta ?? {}) as any,
      });
      if (error) return false;
      if (opts?.oncePerDay) localStorage.setItem(todayKey(source), "1");
      await refresh();
      return true;
    },
    [user?.id, refresh]
  );

  const nextLevelAt = level * 100;
  const progress = Math.min(100, Math.round(((xp % 100) / 100) * 100));

  return { xp, level, recent, loading, award, refresh, nextLevelAt, progress };
}

import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { scheduleAzanNotifications, registerNotificationTapHandler, requestNotificationPermission, isNativePlatform } from "@/lib/azanNotifications";

/**
 * Parse "5:12 AM" into minutes since midnight. Exported for unit tests.
 */
export function parse12hToMinutes(t: string): number | null {
  const m = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ampm = m[3].toUpperCase();
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h * 60 + min;
}

/**
 * Returns the next prayer that has just started (within `toleranceMin` minutes
 * of "now"), or null. Pure & deterministic — used by tests and the live hook.
 */
export function detectFiringPrayer(
  prayers: { name: string; time: string }[],
  now: Date,
  toleranceMin = 0,
): { name: string; time: string } | null {
  const cur = now.getHours() * 60 + now.getMinutes();
  for (const p of prayers) {
    const t = parse12hToMinutes(p.time);
    if (t == null) continue;
    if (Math.abs(cur - t) <= toleranceMin) return p;
  }
  return null;
}

function toTodayDate(time12h: string): Date | null {
  const mins = parse12hToMinutes(time12h);
  if (mins == null) return null;
  const d = new Date();
  d.setHours(Math.floor(mins / 60), mins % 60, 0, 0);
  return d;
}

/**
 * Watches prayer times. On web, navigates to /azan/now when a prayer hits.
 * On native (Capacitor), additionally schedules OS-level local notifications
 * so the user gets alerted even when the app is closed or the screen is off.
 */
export function useAzanAutoPlay() {
  const pt = usePrayerTimes();
  const navigate = useNavigate();
  const firedRef = useRef<Set<string>>(new Set());
  const scheduledRef = useRef<string>("");

  // Web: poll & navigate fullscreen at prayer time.
  useEffect(() => {
    if (pt.loading) return;
    const id = window.setInterval(() => {
      const now = new Date();
      const key = now.toDateString();
      const hit = detectFiringPrayer(pt.prayers, now, 0);
      if (!hit) return;
      const tag = `${key}-${hit.name}`;
      if (firedRef.current.has(tag)) return;
      firedRef.current.add(tag);
      navigate(`/azan/now?prayer=${encodeURIComponent(hit.name)}&auto=1`);
    }, 20000);
    return () => window.clearInterval(id);
  }, [pt.loading, pt.prayers, navigate]);

  // Native: schedule local notifications for the day's remaining prayers + tap handler.
  useEffect(() => {
    if (pt.loading || !isNativePlatform()) return;
    const dayKey = new Date().toDateString() + pt.prayers.map(p => p.time).join("|");
    if (scheduledRef.current === dayKey) return;
    scheduledRef.current = dayKey;

    let cleanup: (() => void) | undefined;
    (async () => {
      await requestNotificationPermission();
      const items = pt.prayers
        .map(p => ({ name: p.name, at: toTodayDate(p.time) }))
        .filter((x): x is { name: string; at: Date } => x.at != null);
      await scheduleAzanNotifications(items);
      cleanup = await registerNotificationTapHandler((path) => navigate(path));
    })();
    return () => { cleanup?.(); };
  }, [pt.loading, pt.prayers, navigate]);
}

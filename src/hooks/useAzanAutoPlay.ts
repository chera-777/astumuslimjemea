import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";

function parse12hToMinutes(t: string): number | null {
  // "5:12 AM" -> minutes since midnight
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
 * Watches prayer times and, when one is reached, navigates the user to the
 * fullscreen Adhan page (which auto-plays the chosen reciter).
 *
 * Limitation: browsers cannot play audio when the tab/app is fully closed or
 * the device is off — that requires a native mobile build or push notifications.
 */
export function useAzanAutoPlay() {
  const pt = usePrayerTimes();
  const navigate = useNavigate();
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (pt.loading) return;
    const id = window.setInterval(() => {
      const now = new Date();
      const cur = now.getHours() * 60 + now.getMinutes();
      const key = `${now.toDateString()}`;
      for (const p of pt.prayers) {
        const target = parse12hToMinutes(p.time);
        if (target == null) continue;
        const tag = `${key}-${p.name}`;
        if (cur === target && !firedRef.current.has(tag)) {
          firedRef.current.add(tag);
          navigate(`/azan/now?prayer=${encodeURIComponent(p.name)}&auto=1`);
          break;
        }
      }
    }, 20000);
    return () => window.clearInterval(id);
  }, [pt.loading, pt.prayers, navigate]);
}

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerNotificationTapHandler } from "@/lib/azanNotifications";

/**
 * Registers the notification tap handler once on app mount. Handles both
 * live taps and cold-start (killed app) launches — opens /azan/now with the
 * correct reciter and auto=1 so playback begins automatically.
 */
export function AzanNotificationBridge() {
  const navigate = useNavigate();
  useEffect(() => {
    let unsub: (() => void) | undefined;
    registerNotificationTapHandler((path) => navigate(path)).then((fn) => {
      unsub = fn;
    });
    return () => { unsub?.(); };
  }, [navigate]);
  return null;
}

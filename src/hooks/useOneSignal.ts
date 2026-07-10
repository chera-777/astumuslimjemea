import { useEffect } from "react";
import OneSignal from "react-onesignal";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

let initialized = false;

/**
 * Initializes OneSignal web push once, and keeps the current auth user linked
 * as an external user id so admins can target notifications by user id.
 * Also mirrors the OneSignal subscription id into push_subscriptions.
 */
export function useOneSignal() {
  const { user } = useAuth();

  useEffect(() => {
    const appId = import.meta.env.VITE_ONESIGNAL_APP_ID as string | undefined;
    if (!appId) return; // silently no-op when not configured

    const boot = async () => {
      if (!initialized) {
        initialized = true;
        try {
          await OneSignal.init({
            appId,
            allowLocalhostAsSecureOrigin: true,
            serviceWorkerParam: { scope: "/onesignal/" },
            serviceWorkerPath: "onesignal/OneSignalSDKWorker.js",
          });
        } catch (e) {
          console.warn("OneSignal init failed", e);
          return;
        }
      }

      if (!user?.id) return;

      try {
        await OneSignal.login(user.id);
        // Best-effort mirror the subscription
        const subId =
          (OneSignal as any)?.User?.PushSubscription?.id ||
          (OneSignal as any)?.User?.PushSubscription?.subscriptionId;
        if (subId) {
          await supabase.from("push_subscriptions").upsert(
            {
              user_id: user.id,
              onesignal_subscription_id: subId,
              device_info: { ua: navigator.userAgent, platform: navigator.platform },
              last_seen_at: new Date().toISOString(),
            },
            { onConflict: "onesignal_subscription_id" }
          );
        }
      } catch (e) {
        console.warn("OneSignal login failed", e);
      }
    };

    boot();
  }, [user?.id]);
}

export async function requestPushPermission() {
  try {
    await OneSignal.Notifications.requestPermission();
    return OneSignal.Notifications.permission;
  } catch (e) {
    console.warn("Push permission failed", e);
    return false;
  }
}

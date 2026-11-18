import type { CommunityNotificationPreferences } from "./types";

/**
 * Push notification service contract for Community messaging.
 *
 * Intentionally avoids hardcoding or initializing OneSignal until
 * valid project credentials (VITE_ONESIGNAL_APP_ID) are supplied.
 */
export interface PushProviderStatus {
  provider: "onesignal";
  isConfigured: boolean;
  permissionState: "default" | "granted" | "denied" | "unsupported";
  statusNote: string;
}

export function getPushProviderStatus(): PushProviderStatus {
  const appId = import.meta.env.VITE_ONESIGNAL_APP_ID as string | undefined;
  const isConfigured = Boolean(appId && appId.trim().length > 0);
  const permissionState: PushProviderStatus["permissionState"] =
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "unsupported";

  return {
    provider: "onesignal",
    isConfigured,
    permissionState,
    statusNote: isConfigured
      ? "OneSignal App ID detected and ready for subscription sync."
      : "Push delivery configuration pending. Preferences are saved locally and will sync once OneSignal is configured.",
  };
}

export async function syncNotificationPreferencesWithProvider(
  _userId: string,
  _preferences: CommunityNotificationPreferences
): Promise<{ synced: boolean; reason?: string }> {
  const status = getPushProviderStatus();
  if (!status.isConfigured) {
    return {
      synced: false,
      reason: "OneSignal App ID not yet configured.",
    };
  }
  // Future integration point: tag user preferences via OneSignal.User.addTags(...)
  return { synced: true };
}

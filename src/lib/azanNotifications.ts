import { Capacitor } from "@capacitor/core";
import { LocalNotifications, type ScheduleOptions } from "@capacitor/local-notifications";

export const isNativePlatform = () => Capacitor.isNativePlatform();

/**
 * Request permission for local notifications. Web: no-op (returns false).
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNativePlatform()) return false;
  try {
    const res = await LocalNotifications.requestPermissions();
    return res.display === "granted";
  } catch {
    return false;
  }
}

export type PrayerSchedule = { name: string; at: Date };

/**
 * Schedule today's remaining prayers as local notifications. Each notification
 * has a "Play Adhan" action that deep-links to /azan/now?prayer=...&auto=1.
 * Web: no-op (returns 0).
 */
export async function scheduleAzanNotifications(prayers: PrayerSchedule[]): Promise<number> {
  if (!isNativePlatform()) return 0;
  try {
    // Register custom action group once
    await LocalNotifications.registerActionTypes({
      types: [
        {
          id: "AZAN_ACTIONS",
          actions: [{ id: "play", title: "Play Adhan" }, { id: "dismiss", title: "Dismiss", destructive: true }],
        },
      ],
    });

    // Cancel previously scheduled azan notifications to avoid duplicates
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length) {
      await LocalNotifications.cancel({ notifications: pending.notifications.map(n => ({ id: n.id })) });
    }

    const now = Date.now();
    const upcoming = prayers.filter(p => p.at.getTime() > now);
    if (!upcoming.length) return 0;

    const schedule: ScheduleOptions = {
      notifications: upcoming.map((p, i) => ({
        id: 1000 + i,
        title: `${p.name} — Time for Salah`,
        body: "Tap to listen to the adhan.",
        schedule: { at: p.at, allowWhileIdle: true },
        actionTypeId: "AZAN_ACTIONS",
        smallIcon: "ic_stat_icon_config_sample",
        sound: "azan.wav",
        extra: { prayer: p.name, deepLink: `/azan/now?prayer=${encodeURIComponent(p.name)}&auto=1` },
      })),
    };
    await LocalNotifications.schedule(schedule);
    return upcoming.length;
  } catch (err) {
    console.warn("[azan] schedule failed", err);
    return 0;
  }
}

/**
 * Wire notification taps to open the fullscreen adhan player.
 * Pass a navigate function (react-router). Returns an unsubscribe function.
 */
export async function registerNotificationTapHandler(navigate: (path: string) => void): Promise<() => void> {
  if (!isNativePlatform()) return () => {};
  const handle = await LocalNotifications.addListener("localNotificationActionPerformed", (action) => {
    const extra = action.notification.extra as { deepLink?: string } | undefined;
    if (action.actionId === "dismiss") return;
    if (extra?.deepLink) navigate(extra.deepLink);
  });
  return () => handle.remove();
}

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

function buildDeepLink(prayer: string, reciterId?: string) {
  const q = new URLSearchParams({ prayer, auto: "1" });
  if (reciterId) q.set("reciter", reciterId);
  return `/azan/now?${q.toString()}`;
}

/**
 * Schedule today's remaining prayers as local notifications. Each notification
 * has a "Play Adhan" action that deep-links to /azan/now?prayer=...&auto=1
 * (with the saved reciter id) so a tap resumes on the user's chosen voice.
 * Web: no-op (returns 0).
 */
export async function scheduleAzanNotifications(prayers: PrayerSchedule[], reciterId?: string): Promise<number> {
  if (!isNativePlatform()) return 0;
  try {
    await LocalNotifications.registerActionTypes({
      types: [
        {
          id: "AZAN_ACTIONS",
          actions: [{ id: "play", title: "Play Adhan" }, { id: "dismiss", title: "Dismiss", destructive: true }],
        },
      ],
    });

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
        extra: {
          prayer: p.name,
          reciter: reciterId,
          deepLink: buildDeepLink(p.name, reciterId),
        },
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
 * Wire notification taps (including cold-start / killed-app) to open the
 * fullscreen adhan player at the correct reciter with auto=1.
 * Returns an unsubscribe function.
 */
export async function registerNotificationTapHandler(navigate: (path: string) => void): Promise<() => void> {
  if (!isNativePlatform()) return () => {};

  const openFromExtra = (extra: unknown) => {
    const e = (extra || {}) as { deepLink?: string; prayer?: string; reciter?: string };
    const path = e.deepLink || (e.prayer ? buildDeepLink(e.prayer, e.reciter) : null);
    if (path) navigate(path);
  };

  // 1. Live taps while app is running or backgrounded
  const handle = await LocalNotifications.addListener("localNotificationActionPerformed", (action) => {
    if (action.actionId === "dismiss") return;
    openFromExtra(action.notification.extra);
  });

  // 2. Cold-start: if the app was killed and launched by tapping a notification,
  // Capacitor stores the delivered notification. Replay it once on boot.
  try {
    const delivered = await LocalNotifications.getDeliveredNotifications();
    const launch = delivered.notifications
      .filter(n => (n.extra as { deepLink?: string })?.deepLink)
      .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))[0];
    if (launch) {
      openFromExtra(launch.extra);
      await LocalNotifications.removeDeliveredNotifications({ notifications: [launch] });
    }
  } catch { /* ignore */ }

  return () => handle.remove();
}

import { useState, useEffect } from "react";

interface PrayerTimesData {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  sunrise: string;
  sunset: string;
  hijriDate: string;
  city: string;
  loading: boolean;
  error: string | null;
}

const fallbackTimes = {
  fajr: "5:12 AM", dhuhr: "12:27 PM", asr: "3:37 PM",
  maghrib: "6:33 PM", isha: "7:39 PM", sunrise: "6:23 AM", sunset: "6:33 PM",
};

function to12h(time24: string): string {
  const [h, m] = time24.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 || 12;
  return `${hr}:${m.toString().padStart(2, "0")} ${ampm}`;
}

type CachedPrayerPayload = Omit<PrayerTimesData, "loading" | "error">;

const cachedByDay = new Map<string, CachedPrayerPayload>();
const inFlightByDay = new Map<string, Promise<CachedPrayerPayload>>();

function readStoredPrayerCache(dayKey: string): CachedPrayerPayload | null {
  if (cachedByDay.has(dayKey)) return cachedByDay.get(dayKey)!;
  try {
    const raw = sessionStorage.getItem(`prayer-times:${dayKey}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedPrayerPayload;
    if (parsed?.fajr && parsed?.isha) {
      cachedByDay.set(dayKey, parsed);
      return parsed;
    }
  } catch {
    // ignore storage errors
  }
  return null;
}

function writeStoredPrayerCache(dayKey: string, payload: CachedPrayerPayload): void {
  cachedByDay.set(dayKey, payload);
  try {
    sessionStorage.setItem(`prayer-times:${dayKey}`, JSON.stringify(payload));
  } catch {
    // ignore storage errors
  }
}

async function fetchCachedTimes(lat: number, lng: number): Promise<CachedPrayerPayload> {
  const today = new Date();
  const dd = today.getDate();
  const mm = today.getMonth() + 1;
  const yyyy = today.getFullYear();
  const dayKey = `${yyyy}-${mm}-${dd}:${lat.toFixed(1)},${lng.toFixed(1)}`;

  const hit = readStoredPrayerCache(dayKey);
  if (hit) return hit;

  const existing = inFlightByDay.get(dayKey);
  if (existing) return existing;

  const promise = fetch(
    `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lng}&method=3`
  )
    .then(async (res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const t = json.data.timings;
      const hijri = json.data.date.hijri;
      const payload: CachedPrayerPayload = {
        fajr: to12h(t.Fajr),
        dhuhr: to12h(t.Dhuhr),
        asr: to12h(t.Asr),
        maghrib: to12h(t.Maghrib),
        isha: to12h(t.Isha),
        sunrise: to12h(t.Sunrise),
        sunset: to12h(t.Sunset),
        hijriDate: `${hijri.day} ${hijri.month.en} ${hijri.year} AH`,
        city: json.data.meta?.timezone?.split("/").pop()?.replace("_", " ") || "Adama",
      };
      writeStoredPrayerCache(dayKey, payload);
      return payload;
    })
    .finally(() => {
      inFlightByDay.delete(dayKey);
    });

  inFlightByDay.set(dayKey, promise);
  return promise;
}

export function usePrayerTimes() {
  const [data, setData] = useState<PrayerTimesData>(() => {
    const today = new Date();
    const defaultDayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}:8.5,39.3`;
    const cached = typeof window !== "undefined" ? readStoredPrayerCache(defaultDayKey) : null;
    if (cached) {
      return { ...cached, loading: false, error: null };
    }
    return {
      ...fallbackTimes,
      hijriDate: "11 Shawwal 1447 AH",
      city: "Adama",
      loading: true,
      error: null,
    };
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchTimes(lat: number, lng: number) {
      try {
        const payload = await fetchCachedTimes(lat, lng);
        if (cancelled) return;
        setData({ ...payload, loading: false, error: null });
      } catch {
        if (!cancelled) setData(prev => ({ ...prev, loading: false, error: "Failed to fetch" }));
      }
    }

    // Adama, Ethiopia default coords
    const defaultLat = 8.54;
    const defaultLng = 39.27;

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => void fetchTimes(pos.coords.latitude, pos.coords.longitude),
        () => void fetchTimes(defaultLat, defaultLng),
        { timeout: 5000 }
      );
    } else {
      void fetchTimes(defaultLat, defaultLng);
    }

    return () => { cancelled = true; };
  }, []);

  const prayers = [
    { name: "Fajr", time: data.fajr },
    { name: "Dhuhr", time: data.dhuhr },
    { name: "Asr", time: data.asr },
    { name: "Maghrib", time: data.maghrib },
    { name: "Isha", time: data.isha },
  ];

  const currentHour = new Date().getHours();
  const nextPrayer = currentHour < 5 ? "Fajr" : currentHour < 12 ? "Dhuhr" : currentHour < 15 ? "Asr" : currentHour < 18 ? "Maghrib" : "Isha";
  const nextTime = prayers.find(p => p.name === nextPrayer)?.time || "";

  return { ...data, prayers, nextPrayer, nextTime };
}

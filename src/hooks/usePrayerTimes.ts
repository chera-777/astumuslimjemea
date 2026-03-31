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

export function usePrayerTimes() {
  const [data, setData] = useState<PrayerTimesData>({
    ...fallbackTimes, hijriDate: "11 Shawwal 1447 AH", city: "Adama",
    loading: true, error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchTimes(lat: number, lng: number) {
      try {
        const today = new Date();
        const dd = today.getDate();
        const mm = today.getMonth() + 1;
        const yyyy = today.getFullYear();
        const res = await fetch(
          `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lng}&method=3`
        );
        const json = await res.json();
        if (cancelled) return;
        const t = json.data.timings;
        const hijri = json.data.date.hijri;
        setData({
          fajr: to12h(t.Fajr), dhuhr: to12h(t.Dhuhr), asr: to12h(t.Asr),
          maghrib: to12h(t.Maghrib), isha: to12h(t.Isha),
          sunrise: to12h(t.Sunrise), sunset: to12h(t.Sunset),
          hijriDate: `${hijri.day} ${hijri.month.en} ${hijri.year} AH`,
          city: json.data.meta?.timezone?.split("/").pop()?.replace("_", " ") || "Adama",
          loading: false, error: null,
        });
      } catch {
        if (!cancelled) setData(prev => ({ ...prev, loading: false, error: "Failed to fetch" }));
      }
    }

    // Adama, Ethiopia default coords
    const defaultLat = 8.54;
    const defaultLng = 39.27;

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchTimes(pos.coords.latitude, pos.coords.longitude),
        () => fetchTimes(defaultLat, defaultLng),
        { timeout: 5000 }
      );
    } else {
      fetchTimes(defaultLat, defaultLng);
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

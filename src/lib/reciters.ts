export type Reciter = {
  id: string;
  name: string;
  country: string;
  style: string;
  popular?: boolean;
  url: string;
};

// Public adhan recordings hosted on islamcan.com (long-standing free Islamic audio CDN)
export const RECITERS: Reciter[] = [
  { id: "mishary",      name: "Mishary Rashid",    country: "🇰🇼 Kuwait",        style: "Modern Clear",       popular: true,  url: "https://www.islamcan.com/audio/adhan/azan2.mp3" },
  { id: "abdulbasit",   name: "Abdul Basit",       country: "🇪🇬 Egypt",         style: "Classical Maqam",    popular: true,  url: "https://www.islamcan.com/audio/adhan/azan1.mp3" },
  { id: "madinah",      name: "Madinah Haram",     country: "🇸🇦 Saudi Arabia",  style: "Madinah Style",                       url: "https://www.islamcan.com/audio/adhan/azan3.mp3" },
  { id: "makkah",       name: "Makkah Haram",      country: "🇸🇦 Saudi Arabia",  style: "Masjid al-Haram",    popular: true,  url: "https://www.islamcan.com/audio/adhan/azan4.mp3" },
  { id: "fajr",         name: "Fajr Adhan",        country: "🇸🇦 Saudi Arabia",  style: "Fajr (As-salatu khayrun min an-nawm)", url: "https://www.islamcan.com/audio/adhan/azan5.mp3" },
  { id: "alqatami",     name: "Nasser Al Qatami",  country: "🇸🇦 Saudi Arabia",  style: "Emotional",          popular: true,  url: "https://www.islamcan.com/audio/adhan/azan6.mp3" },
  { id: "turkish",      name: "Hafiz Mustafa",     country: "🇹🇷 Turkey",        style: "Ottoman Maqam",                       url: "https://www.islamcan.com/audio/adhan/azan7.mp3" },
  { id: "alimulla",     name: "Ali Ahmed Mulla",   country: "🇸🇦 Saudi Arabia",  style: "Masjid al-Haram",                     url: "https://www.islamcan.com/audio/adhan/azan8.mp3" },
];

const KEY = "amj.reciterId";
export function getSavedReciterId(): string {
  if (typeof localStorage === "undefined") return RECITERS[0].id;
  return localStorage.getItem(KEY) || RECITERS[0].id;
}
export function saveReciterId(id: string) {
  try { localStorage.setItem(KEY, id); } catch { /* ignore */ }
}
export function getReciter(id?: string): Reciter {
  return RECITERS.find(r => r.id === (id || getSavedReciterId())) || RECITERS[0];
}

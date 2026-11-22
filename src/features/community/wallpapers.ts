export interface ChatWallpaper {
  id: string;
  name: string;
  previewClass: string;
  canvasClass: string;
}

export const CHAT_WALLPAPERS: ChatWallpaper[] = [
  {
    id: "default",
    name: "Default Clean",
    previewClass: "bg-background border border-border",
    canvasClass: "bg-background",
  },
  {
    id: "sage",
    name: "Leaf & Sage",
    previewClass: "bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-background",
    canvasClass: "bg-gradient-to-b from-emerald-500/[0.07] via-teal-500/[0.04] to-background",
  },
  {
    id: "pattern",
    name: "Geometric Pattern",
    previewClass: "islamic-pattern bg-secondary/40",
    canvasClass: "islamic-pattern bg-background",
  },
  {
    id: "twilight",
    name: "Deep Twilight",
    previewClass: "bg-gradient-to-br from-indigo-500/20 via-slate-500/15 to-background",
    canvasClass: "bg-gradient-to-b from-indigo-500/[0.08] via-sky-500/[0.04] to-background",
  },
  {
    id: "sand",
    name: "Warm Parchment",
    previewClass: "bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-background",
    canvasClass: "bg-gradient-to-b from-amber-500/[0.07] via-yellow-500/[0.03] to-background",
  },
];

export function getWallpaperById(id?: string): ChatWallpaper {
  return CHAT_WALLPAPERS.find((w) => w.id === id) ?? CHAT_WALLPAPERS[0];
}

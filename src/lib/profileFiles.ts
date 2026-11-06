import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export const AVATAR_BUCKET = "avatars";
export const ID_BUCKET = "id-cards";
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const FILE_TYPE_MESSAGE = "Please choose a JPG, PNG or WebP image under 5 MB.";

const SUPPORTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function isSupportedImage(file: File): boolean {
  return SUPPORTED_TYPES.has(file.type) && file.size <= MAX_FILE_BYTES;
}

/** Files live under "<userId>/<kind>-<random>.<ext>" so RLS can scope them to the owner. */
export function buildProfilePath(userId: string, kind: "photo" | "id", file: File): string {
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const random = Math.random().toString(36).slice(2, 10);
  return `${userId}/${kind}-${random}.${ext}`;
}

const urlCache = new Map<string, { url: string; expires: number }>();

/**
 * Turns a stored value into a displayable URL. Private storage paths get a
 * short-lived signed URL; legacy external links (https://…) are returned as-is.
 */
export async function resolveProfileFileUrl(value: string | null | undefined, bucket: string): Promise<string | null> {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const cached = urlCache.get(`${bucket}:${value}`);
  if (cached && cached.expires > Date.now()) return cached.url;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(value, 600);
  if (error || !data?.signedUrl) return null;
  urlCache.set(`${bucket}:${value}`, { url: data.signedUrl, expires: Date.now() + 9 * 60 * 1000 });
  return data.signedUrl;
}

/** React hook: resolves a stored profile file (path or legacy link) to a displayable URL. */
export function useProfileFileUrl(value: string | null | undefined, bucket: string): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    setUrl(null);
    void resolveProfileFileUrl(value, bucket).then(resolved => { if (active) setUrl(resolved); });
    return () => { active = false; };
  }, [value, bucket]);
  return url;
}

import type { Tables, TablesUpdate } from "@/integrations/supabase/types";

export const editableProfileFields = ["full_name", "username", "bio", "phone", "gender", "department", "batch_year", "student_id", "profile_photo_url", "id_card_url"] as const;
export type ProfileDraft = Record<(typeof editableProfileFields)[number], string>;

export function profileDraft(profile: Partial<Tables<"profiles">>): ProfileDraft {
  return Object.fromEntries(editableProfileFields.map(key => [key, profile[key] ?? ""])) as ProfileDraft;
}

export function profileCompletion(profile: Partial<Tables<"profiles">> | null): number {
  if (!profile) return 0;
  const fields = [profile.full_name, profile.phone, profile.gender, profile.department, profile.batch_year, profile.student_id, profile.profile_photo_url];
  return Math.round(fields.filter(value => Boolean(value?.trim())).length / fields.length * 100);
}

export function profileUpdate(draft: ProfileDraft): TablesUpdate<"profiles"> {
  if (!draft.full_name.trim()) throw new Error("Enter your full name.");
  if (!["male", "female"].includes(draft.gender)) throw new Error("Choose your gender.");
  const rawUsername = draft.username.trim().replace(/^@+/, "");
  if (rawUsername && !/^[a-zA-Z0-9_]{3,24}$/.test(rawUsername)) {
    throw new Error("Username must be 3–24 letters, numbers, or underscores.");
  }
  for (const key of ["profile_photo_url", "id_card_url"] as const) {
    if (!draft[key].trim()) continue;
    let url: URL;
    try { url = new URL(draft[key].trim()); } catch { throw new Error("Use a valid HTTPS link for your photo or ID card."); }
    if (url.protocol !== "https:" || url.username || url.password) throw new Error("Use a valid HTTPS link for your photo or ID card.");
  }
  // Explicit allowlist keeps roles, verification, meal entitlement and university protected.
  const entries = editableProfileFields.map(key => {
    if (key === "username") return [key, rawUsername ? `@${rawUsername.toLowerCase()}` : null];
    return [key, draft[key].trim() || null];
  });
  return Object.fromEntries(entries) as TablesUpdate<"profiles">;
}
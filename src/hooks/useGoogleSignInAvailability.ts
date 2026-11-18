import { useEffect, useState } from "react";

/** Reads Supabase's public provider settings; never assumes a provider is enabled. */
export function useGoogleSignInAvailability() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      setEnabled(false);
      return;
    }
    const controller = new AbortController();
    fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: { apikey: supabaseKey },
      signal: controller.signal,
    }).then(async response => {
      if (!response.ok) throw new Error("Could not check sign-in availability");
      const settings = await response.json();
      setEnabled(settings.external?.google === true);
    }).catch(() => { if (!controller.signal.aborted) setEnabled(false); });
    return () => controller.abort();
  }, []);
  return enabled;
}
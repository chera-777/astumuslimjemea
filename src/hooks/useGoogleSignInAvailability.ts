import { useEffect, useState } from "react";

let cachedGoogleEnabled: boolean | null = null;
let inFlightCheck: Promise<boolean> | null = null;

async function fetchGoogleAvailability(supabaseUrl: string, supabaseKey: string): Promise<boolean> {
  if (cachedGoogleEnabled !== null) return cachedGoogleEnabled;
  if (inFlightCheck) return inFlightCheck;

  inFlightCheck = fetch(`${supabaseUrl}/auth/v1/settings`, {
    headers: { apikey: supabaseKey },
  })
    .then(async (response) => {
      if (!response.ok) throw new Error("Could not check sign-in availability");
      const settings = await response.json();
      const val = settings.external?.google === true;
      cachedGoogleEnabled = val;
      return val;
    })
    .catch(() => false)
    .finally(() => {
      inFlightCheck = null;
    });

  return inFlightCheck;
}

/** Reads Supabase's public provider settings; never assumes a provider is enabled. */
export function useGoogleSignInAvailability() {
  const [enabled, setEnabled] = useState<boolean | null>(() => cachedGoogleEnabled);
  useEffect(() => {
    if (cachedGoogleEnabled !== null) {
      setEnabled(cachedGoogleEnabled);
      return;
    }
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      cachedGoogleEnabled = false;
      setEnabled(false);
      return;
    }
    let active = true;
    void fetchGoogleAvailability(supabaseUrl, supabaseKey).then((val) => {
      if (active) setEnabled(val);
    });
    return () => {
      active = false;
    };
  }, []);
  return enabled;
}
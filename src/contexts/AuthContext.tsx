import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  full_name: string;
  username?: string | null;
  bio?: string | null;
  phone: string | null;
  gender: string;
  university_id: string;
  department: string | null;
  batch_year: string | null;
  student_id: string | null;
  is_cafe_student: boolean;
  profile_photo_url: string | null;
  id_card_url: string | null;
  is_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: string[];
  loading: boolean;
  authError: string | null;
  oauthError: string | null;
  clearOAuthError: () => void;
  retryAuth: () => Promise<void>;
  signOut: () => Promise<void>;
  signOutOtherDevices: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  roles: [],
  loading: true,
  authError: null,
  oauthError: null,
  clearOAuthError: () => {},
  retryAuth: async () => {},
  signOut: async () => {},
  signOutOtherDevices: async () => {},
  refreshProfile: async () => {},
});

function extractOAuthErrorFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const searchParams = new URLSearchParams(window.location.search);
  const hashRaw = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
  const hashParams = new URLSearchParams(hashRaw);

  const errCode = searchParams.get("error") ?? hashParams.get("error");
  const errDesc = searchParams.get("error_description") ?? hashParams.get("error_description");
  if (!errCode && !errDesc) return null;

  // Clean OAuth error parameters from browser history without triggering reload
  const cleanUrl = window.location.pathname;
  window.history.replaceState({}, document.title, cleanUrl);

  if (errCode === "access_denied") {
    return "Google sign-in was cancelled. You can try again anytime.";
  }
  const readable = (errDesc ?? errCode ?? "Google sign-in failed.").replace(/\+/g, " ");
  return readable;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [oauthError, setOauthError] = useState<string | null>(() => extractOAuthErrorFromUrl());

  const clearOAuthError = useCallback(() => setOauthError(null), []);

  const currentUserId = useRef<string | null>(null);
  const inFlightLoadRef = useRef<{ userId: string; promise: Promise<boolean | undefined> } | null>(null);
  const loadUserRecords = useCallback(async (userId: string) => {
    if (inFlightLoadRef.current?.userId === userId) {
      return inFlightLoadRef.current.promise;
    }
    const promise = (async () => {
      try {
        const [profileResult, roleResult] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
          supabase.from("user_roles").select("role").eq("user_id", userId),
        ]);
        if (currentUserId.current !== userId) return;
        if (profileResult.error || roleResult.error) throw new Error("Could not load your profile and portal access. Please try again.");
        setProfile(profileResult.data as Profile | null);
        setRoles(roleResult.data?.map(r => r.role) ?? []);
        setAuthError(null);
        return true;
      } catch {
        if (currentUserId.current === userId) setAuthError("Could not load your profile and portal access. Please try again.");
        return false;
      } finally {
        if (inFlightLoadRef.current?.userId === userId) {
          inFlightLoadRef.current = null;
        }
        if (currentUserId.current === userId) setLoading(false);
      }
    })();
    inFlightLoadRef.current = { userId, promise };
    return promise;
  }, []);
  const refreshProfile = useCallback(async () => {
    if (user && !(await loadUserRecords(user.id))) throw new Error("Your changes were saved, but your profile could not be refreshed. Please try again.");
  }, [user, loadUserRecords]);
  const retryAuth = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    await loadUserRecords(user.id);
  }, [user, loadUserRecords]);

  useEffect(() => {
    let active = true;
    let sessionRevision = 0;
    const applySession = (session: Session | null) => {
      if (!active) return;
      const nextId = session?.user.id ?? null;
      if (nextId !== currentUserId.current) { setProfile(null); setRoles([]); }
      currentUserId.current = nextId;
      setSession(session); setUser(session?.user ?? null);
      if (nextId) { setOauthError(null); setLoading(true); setTimeout(() => { if (active) void loadUserRecords(nextId); }, 0); }
      else { setAuthError(null); setLoading(false); }
    };
    if (!isSupabaseConfigured) {
      setAuthError(null);
      setLoading(false);
      return () => { active = false; currentUserId.current = null; };
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => { sessionRevision += 1; applySession(session); }
    );
    // Validate any stored session with Supabase before trusting it for access.
    const initialRevision = sessionRevision;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active || sessionRevision !== initialRevision) return;
      if (!session) { applySession(null); return; }
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!active || sessionRevision !== initialRevision) return;
      if (error || !user) { applySession(null); return; }
      applySession(session);
    }).catch(() => {
      if (active && sessionRevision === initialRevision) applySession(null);
    });
    return () => { active = false; currentUserId.current = null; subscription.unsubscribe(); };
  }, [loadUserRecords]);

  const signOut = async () => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
    currentUserId.current = null;
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
    setAuthError(null);
    setLoading(false);
  };

  const signOutOtherDevices = async () => {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.signOut({ scope: "others" });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, roles, loading, authError, oauthError, clearOAuthError, retryAuth, signOut, signOutOtherDevices, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

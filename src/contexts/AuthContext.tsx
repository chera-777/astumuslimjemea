import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  full_name: string;
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
  retryAuth: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  roles: [],
  loading: true,
  authError: null,
  retryAuth: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const currentUserId = useRef<string | null>(null);
  const loadUserRecords = useCallback(async (userId: string) => {
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
    } finally { if (currentUserId.current === userId) setLoading(false); }
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
      if (nextId) { setLoading(true); setTimeout(() => { if (active) void loadUserRecords(nextId); }, 0); }
      else { setAuthError(null); setLoading(false); }
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => { sessionRevision += 1; applySession(session); }
    );
    // Validate the stored identity with Supabase before trusting it for access.
    const initialRevision = sessionRevision;
    supabase.auth.getUser().then(async ({ data: { user }, error }) => {
      if (!active || sessionRevision !== initialRevision) return;
      if (error || !user) { applySession(null); return; }
      const { data: { session } } = await supabase.auth.getSession();
      if (!active || sessionRevision !== initialRevision) return;
      applySession(session);
    });
    return () => { active = false; currentUserId.current = null; subscription.unsubscribe(); };
  }, [loadUserRecords]);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    currentUserId.current = null;
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
    setAuthError(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, roles, loading, authError, retryAuth, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface Profile {
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
  is_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: string[];
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  roles: [],
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUserId = useRef<string | null>(null);
  const loadUserRecords = useCallback(async (userId: string) => {
    const [profileResult, roleResult] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    if (currentUserId.current !== userId) return;
    setProfile(profileResult.data as Profile | null);
    setRoles(roleResult.data?.map(r => r.role) ?? []);
    setLoading(false);
  }, []);
  const refreshProfile = useCallback(async () => {
    if (user) await loadUserRecords(user.id);
  }, [user, loadUserRecords]);

  useEffect(() => {
    let active = true;
    const applySession = (session: Session | null) => {
      if (!active) return;
      const nextId = session?.user.id ?? null;
      if (nextId !== currentUserId.current) { setProfile(null); setRoles([]); }
      currentUserId.current = nextId;
      setSession(session); setUser(session?.user ?? null);
      if (nextId) { setLoading(true); setTimeout(() => { if (active) void loadUserRecords(nextId); }, 0); }
      else setLoading(false);
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => applySession(session)
    );
    // Validate the stored identity with Supabase before trusting it for access.
    supabase.auth.getUser().then(async ({ data: { user }, error }) => {
      if (!active) return;
      if (error || !user) { applySession(null); return; }
      const { data: { session } } = await supabase.auth.getSession();
      applySession(session);
    });
    return () => { active = false; currentUserId.current = null; subscription.unsubscribe(); };
  }, [loadUserRecords]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, roles, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

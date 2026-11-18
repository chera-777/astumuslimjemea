import { LoadingScreen } from "@/components/auth/NatureShell";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { portalHome } from "@/lib/portalAccess";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, roles, loading, authError, retryAuth, signOut } = useAuth();

  if (loading) {
    return (
      <LoadingScreen />
    );
  }

  if (!isSupabaseConfigured && (!allowedRoles || allowedRoles.length === 0)) {
    return <>{children}</>;
  }

  if (!user) return <Navigate to="/" replace />;
  if (authError) return <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center"><p role="alert">{authError}</p><Button onClick={() => void retryAuth()}>Try again</Button><Button variant="outline" onClick={() => void signOut()}>Sign out</Button></div>;

  if (allowedRoles && allowedRoles.length > 0) {
    const hasAccess = roles.some(r => allowedRoles.includes(r));
    if (!hasAccess) return <Navigate to={portalHome(roles)} replace />;
  }

  return <>{children}</>;
}

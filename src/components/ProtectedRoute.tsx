import { LoadingScreen } from "@/components/auth/NatureShell";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, roles, loading } = useAuth();

  if (loading) {
    return (
      <LoadingScreen />
    );
  }

  if (!user) return <Navigate to="/" replace />;

  if (allowedRoles && allowedRoles.length > 0) {
    const hasAccess = roles.some(r => allowedRoles.includes(r));
    if (!hasAccess) return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

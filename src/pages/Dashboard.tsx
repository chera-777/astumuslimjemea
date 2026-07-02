import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { roles, loading } = useAuth();

  if (loading) return null;

  if (roles.includes("admin") || roles.includes("amir")) {
    return <Navigate to="/portal/amirs" replace />;
  }
  if (roles.includes("committee")) {
    return <Navigate to="/portal/committee" replace />;
  }
  if (roles.includes("guest")) {
    return <Navigate to="/portal/guest" replace />;
  }
  return <Navigate to="/portal/student" replace />;
};

export default Dashboard;

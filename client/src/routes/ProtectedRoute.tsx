import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const ProtectedRoute = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.mustChangePassword && location.pathname !== "/reset-password") {
    return <Navigate to="/reset-password" replace />;
  }

  if (!user?.mustChangePassword && location.pathname === "/reset-password") {
    return <Navigate to={`/${user?.role.toLowerCase()}/dashboard`} replace />;
  }

  return <Outlet />;
};

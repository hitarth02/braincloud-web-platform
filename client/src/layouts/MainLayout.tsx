import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useAuth } from "../hooks/useAuth";
import { useAppDispatch } from "../hooks/redux";
import { logout as logoutAction } from "../store/authSlice";
import { authService } from "../services/authService";
import toast from "react-hot-toast";

export const MainLayout = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  if (!user) return null;

  const profilePath = `/${user.role.toLowerCase()}/profile`;

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authService.logout();
    } catch {
      // ignore network errors on logout; clear local session regardless
    }
    dispatch(logoutAction());
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role={user.role} onLogout={() => setLogoutConfirmOpen(true)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar user={user} profilePath={profilePath} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      <ConfirmDialog
        isOpen={logoutConfirmOpen}
        title="Logout"
        message="Are you sure you want to log out?"
        confirmLabel="Logout"
        confirmVariant="primary"
        loading={loggingOut}
        onConfirm={handleLogout}
        onCancel={() => setLogoutConfirmOpen(false)}
      />
    </div>
  );
};

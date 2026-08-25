import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  ShieldCheck,
  UserCircle,
  LogOut,
  Megaphone,
} from "lucide-react";
import { UserRole } from "../types";

interface SidebarProps {
  role: UserRole;
  onLogout: () => void;
}

const navByRole: Record<UserRole, { to: string; label: string; icon: typeof LayoutDashboard }[]> = {
  ADMIN: [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/staff", label: "Staff", icon: ShieldCheck },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/tasks", label: "Tasks", icon: ClipboardList },
    { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
    { to: "/admin/profile", label: "Profile", icon: UserCircle },
  ],
  STAFF: [
    { to: "/staff/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/staff/users", label: "Users", icon: Users },
    { to: "/staff/tasks", label: "Tasks", icon: ClipboardList },
    { to: "/staff/announcements", label: "Announcements", icon: Megaphone },
    { to: "/staff/profile", label: "Profile", icon: UserCircle },
  ],
  USER: [
    { to: "/user/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/user/tasks", label: "My Tasks", icon: ClipboardList },
    { to: "/user/announcements", label: "Announcements", icon: Megaphone },
    { to: "/user/profile", label: "Profile", icon: UserCircle },
  ],
};

export const Sidebar = ({ role, onLogout }: SidebarProps) => {
  const items = navByRole[role];

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <span className="text-lg font-bold text-primary-600">TaskFlow</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};

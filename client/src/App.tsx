import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./hooks/useAuth";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { RoleRoute } from "./routes/RoleRoute";
import { MainLayout } from "./layouts/MainLayout";

import { LoginPage } from "./pages/auth/LoginPage";
import { ForcePasswordResetPage } from "./pages/auth/ForcePasswordResetPage";
import { AdminDashboardPage } from "./pages/dashboard/AdminDashboardPage";
import { StaffDashboardPage } from "./pages/dashboard/StaffDashboardPage";
import { UserDashboardPage } from "./pages/dashboard/UserDashboardPage";
import { UserManagementPage } from "./pages/users/UserManagementPage";
import { UserFormPage } from "./pages/users/UserFormPage";
import { TaskManagementPage } from "./pages/tasks/TaskManagementPage";
import { TaskFormPage } from "./pages/tasks/TaskFormPage";
import { TaskDetailPage } from "./pages/tasks/TaskDetailPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AnnouncementsPage } from "./pages/announcements/AnnouncementsPage";
import { userService, staffService } from "./services/userService";

const RootRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/reset-password" element={<ForcePasswordResetPage />} />

          <Route element={<MainLayout />}>
            {/* ADMIN */}
            <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route
                path="/admin/staff"
                element={
                  <UserManagementPage
                    service={staffService}
                    basePath="/admin/staff"
                    title="Staff"
                    description="Manage staff accounts and their access."
                    entityLabel="Staff"
                  />
                }
              />
              <Route
                path="/admin/staff/create"
                element={
                  <UserFormPage service={staffService} basePath="/admin/staff" entityLabel="Staff" />
                }
              />
              <Route
                path="/admin/staff/:id"
                element={
                  <UserFormPage service={staffService} basePath="/admin/staff" entityLabel="Staff" />
                }
              />
              <Route
                path="/admin/users"
                element={
                  <UserManagementPage
                    service={userService}
                    basePath="/admin/users"
                    title="Users"
                    description="Manage user accounts across the organization."
                    entityLabel="User"
                  />
                }
              />
              <Route
                path="/admin/users/create"
                element={
                  <UserFormPage service={userService} basePath="/admin/users" entityLabel="User" />
                }
              />
              <Route
                path="/admin/users/:id"
                element={
                  <UserFormPage service={userService} basePath="/admin/users" entityLabel="User" />
                }
              />
              <Route
                path="/admin/tasks"
                element={
                  <TaskManagementPage
                    basePath="/admin/tasks"
                    canCreate={true}
                    title="Tasks"
                    description="View and manage all tasks in the system."
                  />
                }
              />
              <Route
                path="/admin/tasks/create"
                element={<TaskFormPage basePath="/admin/tasks" />}
              />
              <Route
                path="/admin/tasks/:id"
                element={<TaskDetailPage basePath="/admin/tasks" canManage={true} />}
              />
              <Route path="/admin/announcements" element={<AnnouncementsPage />} />
              <Route path="/admin/profile" element={<ProfilePage />} />
            </Route>

            {/* STAFF */}
            <Route element={<RoleRoute allowedRoles={["STAFF"]} />}>
              <Route path="/staff/dashboard" element={<StaffDashboardPage />} />
              <Route
                path="/staff/users"
                element={
                  <UserManagementPage
                    service={userService}
                    basePath="/staff/users"
                    title="Users"
                    description="Manage user accounts."
                    entityLabel="User"
                  />
                }
              />
              <Route
                path="/staff/users/create"
                element={
                  <UserFormPage service={userService} basePath="/staff/users" entityLabel="User" />
                }
              />
              <Route
                path="/staff/users/:id"
                element={
                  <UserFormPage service={userService} basePath="/staff/users" entityLabel="User" />
                }
              />
              <Route
                path="/staff/tasks"
                element={
                  <TaskManagementPage
                    basePath="/staff/tasks"
                    canCreate={true}
                    title="Tasks"
                    description="Create, assign, and track tasks."
                  />
                }
              />
              <Route path="/staff/tasks/create" element={<TaskFormPage basePath="/staff/tasks" />} />
              <Route
                path="/staff/tasks/:id"
                element={<TaskDetailPage basePath="/staff/tasks" canManage={true} />}
              />
              <Route path="/staff/announcements" element={<AnnouncementsPage />} />
              <Route path="/staff/profile" element={<ProfilePage />} />
            </Route>

            {/* USER */}
            <Route element={<RoleRoute allowedRoles={["USER"]} />}>
              <Route path="/user/dashboard" element={<UserDashboardPage />} />
              <Route
                path="/user/tasks"
                element={
                  <TaskManagementPage
                    basePath="/user/tasks"
                    canCreate={false}
                    title="My Tasks"
                    description="Tasks assigned to you."
                  />
                }
              />
              <Route
                path="/user/tasks/:id"
                element={<TaskDetailPage basePath="/user/tasks" canManage={false} />}
              />
              <Route path="/user/announcements" element={<AnnouncementsPage />} />
              <Route path="/user/profile" element={<ProfilePage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

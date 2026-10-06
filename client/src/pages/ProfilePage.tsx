import { FormEvent, useEffect, useState } from "react";
import { z } from "zod";
import toast from "react-hot-toast";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { FormInput } from "../components/FormInput";
import { EmptyState } from "../components/EmptyState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Badge, roleBadgeColor } from "../components/Badge";
import { ProgressNoteCard } from "../components/ProgressNoteCard";
import { useAuth } from "../hooks/useAuth";
import { useAppDispatch } from "../hooks/redux";
import { updateUser } from "../store/authSlice";
import { profileService } from "../services/profileService";
import { progressService } from "../services/progressService";
import { TaskProgressNote } from "../types";
import { initials } from "../utils/format";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const ProfilePage = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();

  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [savingPassword, setSavingPassword] = useState(false);

  const [progressNotes, setProgressNotes] = useState<TaskProgressNote[]>([]);
  const [progressLoading, setProgressLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "USER") {
      setProgressLoading(false);
      return;
    }
    progressService
      .getMyFeed({ limit: 10 })
      .then((res) => setProgressNotes(res.items))
      .finally(() => setProgressLoading(false));
  }, [user?.role]);

  if (!user) return null;

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = profileSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => (fieldErrors[err.path[0] as string] = err.message));
      setProfileErrors(fieldErrors);
      return;
    }
    setProfileErrors({});
    setSavingProfile(true);
    try {
      const updated = await profileService.update(form);
      dispatch(updateUser(updated));
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = passwordSchema.safeParse(pwForm);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => (fieldErrors[err.path[0] as string] = err.message));
      setPwErrors(fieldErrors);
      return;
    }
    setPwErrors({});
    setSavingPassword(true);
    try {
      await profileService.changePassword(pwForm.currentPassword, pwForm.newPassword);
      toast.success("Password changed successfully");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-lg font-semibold">
            {initials(user.firstName, user.lastName)}
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="mt-1">
              <Badge label={user.role} color={roleBadgeColor(user.role)} />
            </div>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="First Name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              error={profileErrors.firstName}
            />
            <FormInput
              label="Last Name"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              error={profileErrors.lastName}
            />
          </div>
          <FormInput
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            error={profileErrors.phone}
          />
          <div className="flex justify-end">
            <Button type="submit" loading={savingProfile}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <FormInput
            label="Current Password"
            type="password"
            value={pwForm.currentPassword}
            onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
            error={pwErrors.currentPassword}
          />
          <FormInput
            label="New Password"
            type="password"
            value={pwForm.newPassword}
            onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
            error={pwErrors.newPassword}
          />
          <FormInput
            label="Confirm New Password"
            type="password"
            value={pwForm.confirmPassword}
            onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
            error={pwErrors.confirmPassword}
          />
          <div className="flex justify-end">
            <Button type="submit" loading={savingPassword}>
              Change Password
            </Button>
          </div>
        </form>
      </Card>

      {user.role === "USER" && (
        <Card className="p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            My Progress Updates
          </h2>
          {progressLoading ? (
            <LoadingSpinner label="Loading progress updates..." />
          ) : progressNotes.length === 0 ? (
            <EmptyState
              title="No progress updates yet"
              description="Post an update from any of your tasks and it will show up here."
            />
          ) : (
            <ul className="divide-y divide-gray-100 -mx-4">
              {progressNotes.map((n) => (
                <ProgressNoteCard
                  key={n._id}
                  note={n}
                  taskHref={(id) => `/user/tasks/${id}`}
                />
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
};

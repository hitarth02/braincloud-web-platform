import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, KeyRound, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Badge, roleBadgeColor } from "../../components/Badge";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { EmptyState } from "../../components/EmptyState";
import { Pagination } from "../../components/Pagination";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { Modal } from "../../components/Modal";
import { FormInput } from "../../components/FormInput";
import { createUserService } from "../../services/userService";
import { Pagination as PaginationType, User } from "../../types";
import { formatDate, initials } from "../../utils/format";

interface UserManagementPageProps {
  service: ReturnType<typeof createUserService>;
  basePath: string;
  title: string;
  description: string;
  entityLabel: string;
}

export const UserManagementPage = ({
  service,
  basePath,
  title,
  description,
  entityLabel,
}: UserManagementPageProps) => {
  const navigate = useNavigate();
  const [items, setItems] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "">("");
  const [page, setPage] = useState(1);

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);

  const load = () => {
    setLoading(true);
    service
      .getAll({ page, limit: 8, search, status })
      .then((data) => {
        setItems(data.items);
        setPagination(data.pagination);
      })
      .catch(() => toast.error(`Failed to load ${entityLabel.toLowerCase()}s`))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await service.remove(deleteTarget.id || deleteTarget._id!);
      toast.success(`${entityLabel} deleted`);
      setDeleteTarget(null);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setResetting(true);
    try {
      await service.resetPassword(resetTarget.id || resetTarget._id!, newPassword);
      toast.success("Password reset successfully");
      setResetTarget(null);
      setNewPassword("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reset password");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        <Link to={`${basePath}/create`}>
          <Button>
            <Plus className="w-4 h-4" />
            Add {entityLabel}
          </Button>
        </Link>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${entityLabel.toLowerCase()}s...`}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as "active" | "inactive" | "");
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : items.length === 0 ? (
          <EmptyState
            title={`No ${entityLabel.toLowerCase()}s found`}
            description="Try adjusting your search or filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Joined</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((user) => (
                  <tr key={user.id || user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <button
                        onClick={() => navigate(`${basePath}/${user.id || user._id}`)}
                        className="flex items-center gap-3 text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-semibold shrink-0">
                          {initials(user.firstName, user.lastName)}
                        </div>
                        <span className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-3 text-gray-600">{user.email}</td>
                    <td className="px-6 py-3">
                      <Badge label={user.role} color={roleBadgeColor(user.role)} />
                    </td>
                    <td className="px-6 py-3">
                      <Badge
                        label={user.isActive ? "Active" : "Inactive"}
                        color={user.isActive ? "green" : "red"}
                      />
                    </td>
                    <td className="px-6 py-3 text-gray-500">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => navigate(`${basePath}/${user.id || user._id}`)}
                          className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setResetTarget(user)}
                          className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
                          title="Reset password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(user)}
                          className="p-1.5 rounded-md text-red-500 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
      </Card>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title={`Delete ${entityLabel}`}
        message={`Are you sure you want to permanently delete ${deleteTarget?.firstName} ${deleteTarget?.lastName}? This cannot be undone — their tasks and announcements will be deleted as well.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <Modal
        isOpen={!!resetTarget}
        onClose={() => setResetTarget(null)}
        title={`Reset Password — ${resetTarget?.firstName} ${resetTarget?.lastName}`}
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <FormInput
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setResetTarget(null)}>
              Cancel
            </Button>
            <Button type="submit" loading={resetting}>
              Reset Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

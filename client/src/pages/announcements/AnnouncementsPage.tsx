import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Megaphone, Plus, Pencil, Trash2 } from "lucide-react";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Badge, roleBadgeColor } from "../../components/Badge";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { EmptyState } from "../../components/EmptyState";
import { Pagination } from "../../components/Pagination";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { Modal } from "../../components/Modal";
import { useAuth } from "../../hooks/useAuth";
import {
  announcementService,
  Announcement,
  AnnouncementFormData,
} from "../../services/announcementService";
import { Pagination as PaginationType } from "../../types";
import { formatDate, initials } from "../../utils/format";

export const AnnouncementsPage = () => {
  const { user } = useAuth();
  const canCreate = user?.role === "ADMIN" || user?.role === "STAFF";

  const [items, setItems] = useState<Announcement[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [form, setForm] = useState<AnnouncementFormData>({ title: "", content: "" });
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    announcementService
      .getAll({ page, limit: 8 })
      .then((data) => {
        setItems(data.items);
        setPagination(data.pagination);
      })
      .catch(() => toast.error("Failed to load announcements"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);

  const canModify = (a: Announcement) =>
    user?.role === "ADMIN" || a.createdBy.id === user?.id || a.createdBy._id === user?.id;

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", content: "" });
    setFormOpen(true);
  };

  const openEdit = (a: Announcement) => {
    setEditing(a);
    setForm({ title: a.title, content: a.content });
    setFormOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await announcementService.update(editing._id, form);
        toast.success("Announcement updated");
      } else {
        await announcementService.create(form);
        toast.success("Announcement posted");
      }
      setFormOpen(false);
      setPage(1);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await announcementService.remove(deleteTarget._id);
      toast.success("Announcement deleted");
      setDeleteTarget(null);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-sm text-gray-500 mt-1">
            {canCreate
              ? "Post updates for everyone in the organization to see."
              : "Updates from Admin and Staff."}
          </p>
        </div>
        {canCreate && (
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" />
            New Announcement
          </Button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            title="No announcements yet"
            description={canCreate ? "Post the first announcement to get started." : "Check back later for updates."}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((a) => (
            <Card key={a._id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-gray-900">{a.title}</h2>
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                      {a.content}
                    </p>
                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                      <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-semibold text-gray-500">
                        {initials(a.createdBy.firstName, a.createdBy.lastName)}
                      </span>
                      <span>
                        {a.createdBy.firstName} {a.createdBy.lastName}
                      </span>
                      <Badge label={a.createdBy.role} color={roleBadgeColor(a.createdBy.role)} />
                      <span>&middot;</span>
                      <span>{formatDate(a.createdAt)}</span>
                    </div>
                  </div>
                </div>
                {canModify(a) && (
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(a)}
                      className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(a)}
                      className="p-1.5 rounded-md text-red-500 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))}
          {pagination && (
            <Card>
              <Pagination pagination={pagination} onPageChange={setPage} />
            </Card>
          )}
        </div>
      )}

      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit Announcement" : "New Announcement"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Content</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editing ? "Save Changes" : "Post Announcement"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Announcement"
        message="Are you sure you want to delete this announcement? This action cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

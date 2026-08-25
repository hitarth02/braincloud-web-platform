import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Badge, priorityBadgeColor, statusBadgeColor } from "../../components/Badge";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { taskService } from "../../services/taskService";
import { Task, TaskStatus } from "../../types";
import { formatDate } from "../../utils/format";

interface TaskDetailPageProps {
  basePath: string;
  canManage: boolean;
}

const STATUS_OPTIONS: TaskStatus[] = ["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

export const TaskDetailPage = ({ basePath, canManage }: TaskDetailPageProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    taskService
      .getById(id!)
      .then(setTask)
      .catch(() => toast.error("Failed to load task"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleStatusChange = async (status: TaskStatus) => {
    if (!task) return;
    setUpdating(true);
    try {
      const updated = await taskService.updateStatus(task._id, status);
      setTask(updated);
      toast.success("Task status updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    setDeleting(true);
    try {
      await taskService.remove(task._id);
      toast.success("Task deleted");
      navigate(basePath);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete task");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!task) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <button
        onClick={() => navigate(basePath)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Tasks
      </button>

      <Card className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{task.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Created by {task.createdBy.firstName} {task.createdBy.lastName} on{" "}
              {formatDate(task.createdAt)}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge label={task.priority} color={priorityBadgeColor(task.priority)} />
            <Badge label={task.status.replace("_", " ")} color={statusBadgeColor(task.status)} />
          </div>
        </div>

        <div>
          <h2 className="text-sm font-medium text-gray-700 mb-1.5">Description</h2>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{task.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Assigned To</p>
            <p className="text-gray-800 font-medium mt-0.5">
              {task.assignedTo.firstName} {task.assignedTo.lastName}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Due Date</p>
            <p className="text-gray-800 font-medium mt-0.5">{formatDate(task.dueDate)}</p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Update Status
          </label>
          <div className="flex items-center gap-3">
            <select
              value={task.status}
              disabled={updating}
              onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
            {canManage && (
              <Button
                variant="danger"
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="ml-auto"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </Card>

      <ConfirmDialog
        isOpen={confirmDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
};

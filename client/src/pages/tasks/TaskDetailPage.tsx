import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Trash2, Send } from "lucide-react";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Badge, priorityBadgeColor, statusBadgeColor } from "../../components/Badge";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { EmptyState } from "../../components/EmptyState";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { ProgressNoteCard } from "../../components/ProgressNoteCard";
import { taskService } from "../../services/taskService";
import { progressService } from "../../services/progressService";
import { useAuth } from "../../hooks/useAuth";
import { Task, TaskProgressNote, TaskStatus } from "../../types";
import { formatDate } from "../../utils/format";

interface TaskDetailPageProps {
  basePath: string;
  canManage: boolean;
}

const STATUS_OPTIONS: TaskStatus[] = ["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

export const TaskDetailPage = ({ basePath, canManage }: TaskDetailPageProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [notes, setNotes] = useState<TaskProgressNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [noteText, setNoteText] = useState("");
  const [postingNote, setPostingNote] = useState(false);

  const load = () => {
    taskService
      .getById(id!)
      .then(setTask)
      .catch(() => toast.error("Failed to load task"))
      .finally(() => setLoading(false));
  };

  const loadNotes = () => {
    progressService
      .listForTask(id!)
      .then(setNotes)
      .catch(() => {
        /* USER viewing a task not their own gets a 403 — nothing to show */
      })
      .finally(() => setNotesLoading(false));
  };

  useEffect(load, [id]);
  useEffect(loadNotes, [id]);

  const isOwner =
    !!task && !!user && user.role === "USER" && task.assignedTo?.id === user.id;

  const handleAddNote = async () => {
    if (!task || !noteText.trim()) return;
    setPostingNote(true);
    try {
      await progressService.addForTask(task._id, noteText.trim());
      setNoteText("");
      toast.success("Progress update posted");
      loadNotes();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to post update");
    } finally {
      setPostingNote(false);
    }
  };

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
              Created by{" "}
              {task.createdBy ? `${task.createdBy.firstName} ${task.createdBy.lastName}` : "an unknown user"}{" "}
              on {formatDate(task.createdAt)}
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
              {task.assignedTo
                ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
                : <span className="italic text-gray-400">Unknown user</span>}
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

        <div className="border-t border-gray-100 pt-5">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Progress Updates</h2>

          {isOwner && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value.slice(0, 1000))}
                placeholder="What did you work on today?"
                rows={2}
                disabled={postingNote}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400">{noteText.length}/1000</span>
                <Button
                  type="button"
                  onClick={handleAddNote}
                  disabled={postingNote || !noteText.trim()}
                  loading={postingNote}
                >
                  <Send className="w-4 h-4" />
                  Post Update
                </Button>
              </div>
            </div>
          )}

          {notesLoading ? (
            <LoadingSpinner label="Loading progress updates..." />
          ) : notes.length === 0 ? (
            <EmptyState
              title="No progress updates yet"
              description="Updates posted by the assignee will show up here."
            />
          ) : (
            <ul className="divide-y divide-gray-100 -mx-4">
              {notes.map((n) => (
                <ProgressNoteCard key={n._id} note={n} showTask={false} />
              ))}
            </ul>
          )}
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

import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { FormInput } from "../../components/FormInput";
import { taskService } from "../../services/taskService";
import { userService } from "../../services/userService";
import { useAuth } from "../../hooks/useAuth";
import { User, TaskPriority } from "../../types";

interface TaskFormPageProps {
  basePath: string;
}

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  assignedTo: z.string().min(1, "Please select a user"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  dueDate: z.string().min(1, "Due date is required"),
});

type FormErrors = Partial<Record<keyof typeof taskSchema.shape, string>>;

export const TaskFormPage = ({ basePath }: TaskFormPageProps) => {
  const navigate = useNavigate();
  const { user: viewer } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "MEDIUM" as TaskPriority,
    dueDate: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    userService
      .getAll({ page: 1, limit: 100, status: "active" })
      .then((data) => setUsers(data.items))
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setUsersLoaded(true));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const result = taskSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as keyof FormErrors] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    setSaving(true);
    try {
      await taskService.create(form);
      toast.success("Task created and assigned successfully");
      navigate(basePath);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create task");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <button
        onClick={() => navigate(basePath)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Tasks
      </button>

      <h1 className="text-2xl font-bold text-gray-900">Create Task</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            error={errors.title}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.description ? "border-red-400" : "border-gray-300"
              }`}
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Assign To
            </label>
            <select
              value={form.assignedTo}
              onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.assignedTo ? "border-red-400" : "border-gray-300"
              }`}
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user.id || user._id} value={user.id || user._id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
            {errors.assignedTo && (
              <p className="text-xs text-red-500 mt-1">{errors.assignedTo}</p>
            )}
            {usersLoaded && users.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {viewer?.role === "STAFF"
                  ? "No users available — you can only assign tasks to users you've created. Create a user first."
                  : "No active users exist yet — create one first."}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) =>
                  setForm({ ...form, priority: e.target.value as TaskPriority })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <FormInput
              label="Due Date"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              error={errors.dueDate}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => navigate(basePath)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Create Task
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import toast from "react-hot-toast";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Badge, priorityBadgeColor, statusBadgeColor } from "../../components/Badge";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { EmptyState } from "../../components/EmptyState";
import { Pagination } from "../../components/Pagination";
import { taskService } from "../../services/taskService";
import { Pagination as PaginationType, Task, TaskStatus } from "../../types";
import { formatDate, isOverdue } from "../../utils/format";

interface TaskManagementPageProps {
  basePath: string;
  canCreate: boolean;
  title: string;
  description: string;
}

export const TaskManagementPage = ({
  basePath,
  canCreate,
  title,
  description,
}: TaskManagementPageProps) => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TaskStatus | "">("");
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    taskService
      .getAll({ page, limit: 8, search, status })
      .then((data) => {
        setItems(data.items);
        setPagination(data.pagination);
      })
      .catch(() => toast.error("Failed to load tasks"))
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        {canCreate && (
          <Link to={`${basePath}/create`}>
            <Button>
              <Plus className="w-4 h-4" />
              New Task
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks..."
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
              setStatus(e.target.value as TaskStatus | "");
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : items.length === 0 ? (
          <EmptyState
            title="No tasks found"
            description={canCreate ? "Create a task to get started." : "You have no assigned tasks yet."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="px-6 py-3 font-medium">Title</th>
                  <th className="px-6 py-3 font-medium">Assigned To</th>
                  <th className="px-6 py-3 font-medium">Priority</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((task) => (
                  <tr
                    key={task._id}
                    onClick={() => navigate(`${basePath}/${task._id}`)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-3 font-medium text-gray-900">{task.title}</td>
                    <td className="px-6 py-3 text-gray-600">
                      {task.assignedTo
                        ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
                        : <span className="italic text-gray-400">Unknown user</span>}
                    </td>
                    <td className="px-6 py-3">
                      <Badge label={task.priority} color={priorityBadgeColor(task.priority)} />
                    </td>
                    <td className="px-6 py-3">
                      <Badge label={task.status.replace("_", " ")} color={statusBadgeColor(task.status)} />
                    </td>
                    <td className={`px-6 py-3 ${isOverdue(task.dueDate, task.status) ? "text-red-500 font-medium" : "text-gray-500"}`}>
                      {formatDate(task.dueDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
      </Card>
    </div>
  );
};

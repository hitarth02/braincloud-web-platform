import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, ClipboardList, Clock, Loader, CheckCircle2 } from "lucide-react";
import { StatCard } from "../../components/StatCard";
import { Card } from "../../components/Card";
import { StatusPieChart } from "../../components/charts/StatusPieChart";
import { PriorityBarChart } from "../../components/charts/PriorityBarChart";
import { TASK_STATUS_COLORS } from "../../components/charts/chartColors";
import { UpcomingDeadlines } from "../../components/UpcomingDeadlines";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { EmptyState } from "../../components/EmptyState";
import { Badge, priorityBadgeColor, statusBadgeColor } from "../../components/Badge";
import { ProgressNoteCard } from "../../components/ProgressNoteCard";
import { RecentActivityFeed } from "../../components/RecentActivityFeed";
import { useAuth } from "../../hooks/useAuth";
import { dashboardService } from "../../services/dashboardService";
import { StaffDashboardStats } from "../../types";
import { formatDate } from "../../utils/format";

export const StaffDashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StaffDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService
      .getStaff()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner label="Loading dashboard..." />;
  if (!stats) return null;

  const taskChartData = [
    { name: "Pending", value: stats.pendingTasks },
    { name: "In Progress", value: stats.inProgressTasks },
    { name: "Completed", value: stats.completedTasks },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview of users and tasks you manage.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Users" value={stats.totalUsers} icon={Users} color="blue" />
        <StatCard label="Tasks Created" value={stats.tasksCreated} icon={ClipboardList} color="gray" />
        <StatCard label="Pending" value={stats.pendingTasks} icon={Clock} color="gray" />
        <StatCard label="In Progress" value={stats.inProgressTasks} icon={Loader} color="yellow" />
        <StatCard label="Completed" value={stats.completedTasks} icon={CheckCircle2} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StatusPieChart
          title="Task Status Breakdown"
          data={taskChartData}
          colors={TASK_STATUS_COLORS}
          emptyMessage="You haven't created any tasks yet."
        />
        <PriorityBarChart
          title="Task Priority Breakdown"
          data={stats.priorityBreakdown}
          emptyMessage="You haven't created any tasks yet."
        />
      </div>

      <UpcomingDeadlines tasks={stats.upcomingDeadlines} showAssignee />

      <Card>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Recently Created Tasks</h2>
          <Link to="/staff/tasks" className="text-sm text-primary-600 hover:underline">
            View all
          </Link>
        </div>
        {stats.recentTasks.length === 0 ? (
          <EmptyState title="No tasks yet" description="Tasks you create will show up here." />
        ) : (
          <ul className="divide-y divide-gray-100">
            {stats.recentTasks.map((task) => (
              <li key={task._id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{task.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Assigned to{" "}
                    {task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : "unknown user"}
                    {" "}&middot; Due {formatDate(task.dueDate)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge label={task.priority} color={priorityBadgeColor(task.priority)} />
                  <Badge label={task.status.replace("_", " ")} color={statusBadgeColor(task.status)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Team Progress Updates</h2>
          <Link to="/staff/progress" className="text-sm text-primary-600 hover:underline">
            View all
          </Link>
        </div>
        {stats.recentProgress.length === 0 ? (
          <EmptyState
            title="No progress updates yet"
            description="Daily updates posted by your users will show up here."
          />
        ) : (
          <ul className="divide-y divide-gray-100">
            {stats.recentProgress.map((n) => (
              <ProgressNoteCard
                key={n._id}
                note={n}
                // Staff only has access to tasks they personally created —
                // only link when this note's task is one of those.
                taskHref={
                  n.task?.createdBy === user?.id
                    ? (id) => `/staff/tasks/${id}`
                    : undefined
                }
              />
            ))}
          </ul>
        )}
      </Card>

      <RecentActivityFeed items={stats.recentActivity} />
    </div>
  );
};

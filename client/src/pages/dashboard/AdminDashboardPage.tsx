import { useEffect, useState } from "react";
import { Users, ShieldCheck, UserCheck, UserX, ClipboardList, Clock, Loader, CheckCircle2 } from "lucide-react";
import { StatCard } from "../../components/StatCard";
import { StatusPieChart } from "../../components/charts/StatusPieChart";
import { PriorityBarChart } from "../../components/charts/PriorityBarChart";
import { TASK_STATUS_COLORS, USER_STATUS_COLORS } from "../../components/charts/chartColors";
import { RecentActivityFeed } from "../../components/RecentActivityFeed";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { dashboardService } from "../../services/dashboardService";
import { AdminDashboardStats } from "../../types";
import { MAX_USERS, MAX_STAFF } from "../../utils/constants";

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService
      .getAdmin()
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

  const userChartData = [
    { name: "Active", value: stats.activeUsers },
    { name: "Inactive", value: stats.inactiveUsers },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview of all users, staff, and tasks in the system.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={`${stats.totalUsers} / ${MAX_USERS}`}
          icon={Users}
          color="blue"
        />
        <StatCard
          label="Total Staff"
          value={`${stats.totalStaff} / ${MAX_STAFF}`}
          icon={ShieldCheck}
          color="purple"
        />
        <StatCard label="Active Users" value={stats.activeUsers} icon={UserCheck} color="green" />
        <StatCard label="Inactive Users" value={stats.inactiveUsers} icon={UserX} color="red" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tasks" value={stats.totalTasks} icon={ClipboardList} color="gray" />
        <StatCard label="Pending" value={stats.pendingTasks} icon={Clock} color="gray" />
        <StatCard label="In Progress" value={stats.inProgressTasks} icon={Loader} color="yellow" />
        <StatCard label="Completed" value={stats.completedTasks} icon={CheckCircle2} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StatusPieChart
          title="Task Status Breakdown"
          data={taskChartData}
          colors={TASK_STATUS_COLORS}
          emptyMessage="No tasks have been created yet."
        />
        <StatusPieChart
          title="User Status Breakdown"
          data={userChartData}
          colors={USER_STATUS_COLORS}
          emptyMessage="No users have been created yet."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PriorityBarChart
          title="Task Priority Breakdown"
          data={stats.priorityBreakdown}
          emptyMessage="No tasks have been created yet."
        />
        <RecentActivityFeed items={stats.recentActivity} />
      </div>
    </div>
  );
};

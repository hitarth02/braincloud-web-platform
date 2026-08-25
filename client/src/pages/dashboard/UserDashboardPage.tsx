import { useEffect, useState } from "react";
import { ClipboardList, Clock, Loader, CheckCircle2, AlertTriangle } from "lucide-react";
import { StatCard } from "../../components/StatCard";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { dashboardService } from "../../services/dashboardService";
import { UserDashboardStats } from "../../types";

export const UserDashboardPage = () => {
  const [stats, setStats] = useState<UserDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService
      .getUser()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner label="Loading dashboard..." />;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          A quick overview of tasks assigned to you.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="My Tasks" value={stats.myTasks} icon={ClipboardList} color="blue" />
        <StatCard label="Pending" value={stats.pendingTasks} icon={Clock} color="gray" />
        <StatCard label="In Progress" value={stats.inProgressTasks} icon={Loader} color="yellow" />
        <StatCard label="Completed" value={stats.completedTasks} icon={CheckCircle2} color="green" />
        <StatCard label="Overdue" value={stats.overdueTasks} icon={AlertTriangle} color="red" />
      </div>
    </div>
  );
};

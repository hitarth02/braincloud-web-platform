import { useEffect, useState } from "react";
import { Users, ShieldCheck, UserCheck, UserX, ClipboardList, Clock, Loader, CheckCircle2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { StatCard } from "../../components/StatCard";
import { Card } from "../../components/Card";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { dashboardService } from "../../services/dashboardService";
import { AdminDashboardStats } from "../../types";
import { MAX_USERS, MAX_STAFF } from "../../utils/constants";

const COLORS = ["#9ca3af", "#f59e0b", "#22c55e"];

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

  const chartData = [
    { name: "Pending", value: stats.pendingTasks },
    { name: "In Progress", value: stats.inProgressTasks },
    { name: "Completed", value: stats.completedTasks },
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

      <Card className="p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Task Status Breakdown</h2>
        {stats.totalTasks === 0 ? (
          <p className="text-sm text-gray-400">No tasks have been created yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
              >
                {chartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
};

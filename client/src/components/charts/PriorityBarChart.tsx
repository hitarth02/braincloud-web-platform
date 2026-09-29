import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "../Card";
import { PriorityBreakdown } from "../../types";
import { PRIORITY_COLORS } from "./chartColors";

interface PriorityBarChartProps {
  title: string;
  data: PriorityBreakdown;
  emptyMessage: string;
}

export const PriorityBarChart = ({ title, data, emptyMessage }: PriorityBarChartProps) => {
  const chartData = [
    { name: "Low", value: data.low },
    { name: "Medium", value: data.medium },
    { name: "High", value: data.high },
    { name: "Urgent", value: data.urgent },
  ];
  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4">{title}</h2>
      {total === 0 ? (
        <p className="text-sm text-gray-400">{emptyMessage}</p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ left: -20 }}>
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: "#f9fafb" }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {chartData.map((_, index) => (
                <Cell key={index} fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

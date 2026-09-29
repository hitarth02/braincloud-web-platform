import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card } from "../Card";

interface StatusPieChartProps {
  title: string;
  data: { name: string; value: number }[];
  colors: string[];
  emptyMessage: string;
}

export const StatusPieChart = ({ title, data, colors, emptyMessage }: StatusPieChartProps) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4">{title}</h2>
      {total === 0 ? (
        <p className="text-sm text-gray-400">{emptyMessage}</p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
              {data.map((_, index) => (
                <Cell key={index} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

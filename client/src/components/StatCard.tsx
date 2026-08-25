import { LucideIcon } from "lucide-react";
import { Card } from "./Card";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color?: "blue" | "green" | "yellow" | "red" | "purple" | "gray";
}

const colorClasses: Record<string, string> = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  yellow: "bg-yellow-50 text-yellow-600",
  red: "bg-red-50 text-red-600",
  purple: "bg-purple-50 text-purple-600",
  gray: "bg-gray-50 text-gray-600",
};

export const StatCard = ({ label, value, icon: Icon, color = "blue" }: StatCardProps) => (
  <Card className="p-5 flex items-center gap-4">
    <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </Card>
);

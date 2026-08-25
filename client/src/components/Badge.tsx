interface BadgeProps {
  label: string;
  color?: "gray" | "blue" | "green" | "yellow" | "red" | "purple";
}

const colorMap: Record<string, string> = {
  gray: "bg-gray-100 text-gray-700",
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
  yellow: "bg-yellow-100 text-yellow-700",
  red: "bg-red-100 text-red-700",
  purple: "bg-purple-100 text-purple-700",
};

export const Badge = ({ label, color = "gray" }: BadgeProps) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[color]}`}
  >
    {label}
  </span>
);

export const roleBadgeColor = (role: string) =>
  role === "ADMIN" ? "purple" : role === "STAFF" ? "blue" : "gray";

export const statusBadgeColor = (status: string) =>
  ({
    TODO: "gray",
    IN_PROGRESS: "yellow",
    COMPLETED: "green",
    CANCELLED: "red",
  } as const)[status] || "gray";

export const priorityBadgeColor = (priority: string) =>
  ({
    LOW: "gray",
    MEDIUM: "blue",
    HIGH: "yellow",
    URGENT: "red",
  } as const)[priority] || "gray";

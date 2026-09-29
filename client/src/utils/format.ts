export const formatDate = (value: string | Date) => {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const initials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

export const timeAgo = (value: string | Date) => {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  const units: [string, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];

  for (const [label, secondsInUnit] of units) {
    const count = Math.floor(seconds / secondsInUnit);
    if (count >= 1) return `${count} ${label}${count > 1 ? "s" : ""} ago`;
  }
  return "just now";
};

export const daysUntil = (dueDate: string) => {
  const ms = new Date(dueDate).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(ms / 86400000);
};

export const isOverdue = (dueDate: string, status: string) => {
  return (
    new Date(dueDate) < new Date() &&
    status !== "COMPLETED" &&
    status !== "CANCELLED"
  );
};

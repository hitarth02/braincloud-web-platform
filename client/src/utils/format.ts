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

export const isOverdue = (dueDate: string, status: string) => {
  return (
    new Date(dueDate) < new Date() &&
    status !== "COMPLETED" &&
    status !== "CANCELLED"
  );
};

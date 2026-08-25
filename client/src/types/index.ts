export type UserRole = "ADMIN" | "STAFF" | "USER";

export interface User {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface Task {
  _id: string;
  title: string;
  description: string;
  assignedTo: User;
  createdBy: User;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: Pagination;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalStaff: number;
  activeUsers: number;
  inactiveUsers: number;
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
}

export interface StaffDashboardStats {
  totalUsers: number;
  tasksCreated: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  recentTasks: Task[];
}

export interface UserDashboardStats {
  myTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
}

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
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface Task {
  _id: string;
  title: string;
  description: string;
  // Nullable: a task can outlive the user it references (e.g. orphaned by a
  // database reseed), in which case populate() resolves the field to null.
  assignedTo: User | null;
  createdBy: User | null;
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

export interface PriorityBreakdown {
  low: number;
  medium: number;
  high: number;
  urgent: number;
}

export type ActivityType =
  | "user_created"
  | "task_created"
  | "task_completed"
  | "announcement_created";

export interface ActivityItem {
  type: ActivityType;
  message: string;
  timestamp: string;
}

export interface UpcomingTask {
  _id: string;
  title: string;
  dueDate: string;
  priority: TaskPriority;
  assignedTo?: { firstName: string; lastName: string } | null;
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
  priorityBreakdown: PriorityBreakdown;
  recentActivity: ActivityItem[];
}

export interface StaffDashboardStats {
  totalUsers: number;
  tasksCreated: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  recentTasks: Task[];
  priorityBreakdown: PriorityBreakdown;
  upcomingDeadlines: UpcomingTask[];
}

export interface UserDashboardStats {
  myTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
  priorityBreakdown: PriorityBreakdown;
  upcomingDeadlines: UpcomingTask[];
}

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
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskProgressNote {
  _id: string;
  // Nullable: the referenced task/user can be deleted after the note is
  // created (see userController.remove / taskController.deleteTask cascade),
  // in which case populate() resolves the field to null.
  task: { _id: string; title: string; status: TaskStatus; createdBy?: string } | null;
  user: { _id: string; firstName: string; lastName: string } | null;
  note: string;
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
  | "LOGIN"
  | "LOGOUT"
  | "USER_CREATED"
  | "USER_UPDATED"
  | "USER_DELETED"
  | "USER_PASSWORD_RESET"
  | "STAFF_CREATED"
  | "STAFF_UPDATED"
  | "STAFF_DELETED"
  | "STAFF_PASSWORD_RESET"
  | "TASK_CREATED"
  | "TASK_UPDATED"
  | "TASK_DELETED"
  | "TASK_STATUS_CHANGED"
  | "TASK_PROGRESS_ADDED"
  | "ANNOUNCEMENT_CREATED"
  | "ANNOUNCEMENT_UPDATED"
  | "ANNOUNCEMENT_DELETED"
  | "PASSWORD_CHANGED";

export interface ActivityItem {
  type: ActivityType;
  message: string;
  timestamp: string;
}

// Raw log row as returned by GET /api/activity-logs (actor populated, or
// null if that account has since been hard-deleted).
export interface ActivityLogEntry {
  _id: string;
  actor: { firstName: string; lastName: string; role: UserRole } | null;
  actorRole: UserRole;
  action: ActivityType;
  message: string;
  createdAt: string;
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
  recentProgress: TaskProgressNote[];
  recentActivity: ActivityItem[];
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

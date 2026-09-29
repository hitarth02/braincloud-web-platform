import { Response } from "express";
import { User } from "../models/User";
import { Task } from "../models/Task";
import { Announcement } from "../models/Announcement";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middleware/auth";

const getPriorityBreakdown = async (filter: Record<string, unknown>) => {
  const [low, medium, high, urgent] = await Promise.all([
    Task.countDocuments({ ...filter, priority: "LOW" }),
    Task.countDocuments({ ...filter, priority: "MEDIUM" }),
    Task.countDocuments({ ...filter, priority: "HIGH" }),
    Task.countDocuments({ ...filter, priority: "URGENT" }),
  ]);
  return { low, medium, high, urgent };
};

const getUpcomingDeadlines = async (filter: Record<string, unknown>) => {
  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return Task.find({
    ...filter,
    dueDate: { $gte: now, $lte: in7Days },
    status: { $nin: ["COMPLETED", "CANCELLED"] },
  })
    .sort({ dueDate: 1 })
    .limit(5)
    .populate("assignedTo", "firstName lastName");
};

const getRecentActivity = async () => {
  const [recentPeople, recentTasks, recentCompletedTasks, recentAnnouncements] =
    await Promise.all([
      User.find({ role: { $in: ["USER", "STAFF"] } })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("firstName lastName role createdAt"),
      Task.find({}).sort({ createdAt: -1 }).limit(5).select("title createdAt"),
      Task.find({ status: "COMPLETED" })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select("title updatedAt"),
      Announcement.find({}).sort({ createdAt: -1 }).limit(5).select("title createdAt"),
    ]);

  const items = [
    ...recentPeople.map((u) => ({
      type: "user_created" as const,
      message: `${u.firstName} ${u.lastName} joined as ${u.role === "STAFF" ? "staff" : "a user"}`,
      timestamp: u.createdAt,
    })),
    ...recentTasks.map((t) => ({
      type: "task_created" as const,
      message: `Task "${t.title}" was created`,
      timestamp: t.createdAt,
    })),
    ...recentCompletedTasks.map((t) => ({
      type: "task_completed" as const,
      message: `Task "${t.title}" was completed`,
      timestamp: t.updatedAt,
    })),
    ...recentAnnouncements.map((a) => ({
      type: "announcement_created" as const,
      message: `Announcement "${a.title}" was posted`,
      timestamp: a.createdAt,
    })),
  ];

  return items
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);
};

export const getAdminDashboard = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const [
      totalUsers,
      totalStaff,
      activeUsers,
      inactiveUsers,
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      priorityBreakdown,
      recentActivity,
    ] = await Promise.all([
      User.countDocuments({ role: "USER" }),
      User.countDocuments({ role: "STAFF" }),
      User.countDocuments({ role: "USER", isActive: true }),
      User.countDocuments({ role: "USER", isActive: false }),
      Task.countDocuments({}),
      Task.countDocuments({ status: "TODO" }),
      Task.countDocuments({ status: "IN_PROGRESS" }),
      Task.countDocuments({ status: "COMPLETED" }),
      getPriorityBreakdown({}),
      getRecentActivity(),
    ]);

    sendSuccess(res, "Dashboard fetched successfully", {
      totalUsers,
      totalStaff,
      activeUsers,
      inactiveUsers,
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      priorityBreakdown,
      recentActivity,
    });
  }
);

export const getStaffDashboard = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const staffId = req.user!.userId;

    const [
      totalUsers,
      tasksCreated,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      recentTasks,
      priorityBreakdown,
      upcomingDeadlines,
    ] = await Promise.all([
      User.countDocuments({ role: "USER" }),
      Task.countDocuments({ createdBy: staffId }),
      Task.countDocuments({ createdBy: staffId, status: "TODO" }),
      Task.countDocuments({ createdBy: staffId, status: "IN_PROGRESS" }),
      Task.countDocuments({ createdBy: staffId, status: "COMPLETED" }),
      Task.find({ createdBy: staffId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("assignedTo", "firstName lastName email"),
      getPriorityBreakdown({ createdBy: staffId }),
      getUpcomingDeadlines({ createdBy: staffId }),
    ]);

    sendSuccess(res, "Dashboard fetched successfully", {
      totalUsers,
      tasksCreated,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      recentTasks,
      priorityBreakdown,
      upcomingDeadlines,
    });
  }
);

export const getUserDashboard = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const now = new Date();

    const [
      myTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      priorityBreakdown,
      upcomingDeadlines,
    ] = await Promise.all([
      Task.countDocuments({ assignedTo: userId }),
      Task.countDocuments({ assignedTo: userId, status: "TODO" }),
      Task.countDocuments({ assignedTo: userId, status: "IN_PROGRESS" }),
      Task.countDocuments({ assignedTo: userId, status: "COMPLETED" }),
      Task.countDocuments({
        assignedTo: userId,
        dueDate: { $lt: now },
        status: { $nin: ["COMPLETED", "CANCELLED"] },
      }),
      getPriorityBreakdown({ assignedTo: userId }),
      getUpcomingDeadlines({ assignedTo: userId }),
    ]);

    sendSuccess(res, "Dashboard fetched successfully", {
      myTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      priorityBreakdown,
      upcomingDeadlines,
    });
  }
);

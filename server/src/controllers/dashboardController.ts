import { Response } from "express";
import { User } from "../models/User";
import { Task } from "../models/Task";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middleware/auth";

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
    ] = await Promise.all([
      User.countDocuments({ role: "USER" }),
      User.countDocuments({ role: "STAFF" }),
      User.countDocuments({ role: "USER", isActive: true }),
      User.countDocuments({ role: "USER", isActive: false }),
      Task.countDocuments({}),
      Task.countDocuments({ status: "TODO" }),
      Task.countDocuments({ status: "IN_PROGRESS" }),
      Task.countDocuments({ status: "COMPLETED" }),
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
    ]);

    sendSuccess(res, "Dashboard fetched successfully", {
      totalUsers,
      tasksCreated,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      recentTasks,
    });
  }
);

export const getUserDashboard = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const now = new Date();

    const [myTasks, pendingTasks, inProgressTasks, completedTasks, overdueTasks] =
      await Promise.all([
        Task.countDocuments({ assignedTo: userId }),
        Task.countDocuments({ assignedTo: userId, status: "TODO" }),
        Task.countDocuments({ assignedTo: userId, status: "IN_PROGRESS" }),
        Task.countDocuments({ assignedTo: userId, status: "COMPLETED" }),
        Task.countDocuments({
          assignedTo: userId,
          dueDate: { $lt: now },
          status: { $nin: ["COMPLETED", "CANCELLED"] },
        }),
      ]);

    sendSuccess(res, "Dashboard fetched successfully", {
      myTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
    });
  }
);

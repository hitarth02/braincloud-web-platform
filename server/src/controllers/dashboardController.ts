import { Response } from "express";
import { User } from "../models/User";
import { Task } from "../models/Task";
import { ActivityLog, AUTH_ACTIONS, IActivityLog } from "../models/ActivityLog";
import { TaskProgress } from "../models/TaskProgress";
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

const formatActivityLogs = (logs: IActivityLog[]) =>
  logs.map((log) => {
    const actor = log.actor as unknown as
      | { firstName: string; lastName: string }
      | null;
    const actorLabel = actor
      ? `${actor.firstName} ${actor.lastName}`
      : `A deleted ${log.actorRole.toLowerCase()} account`;

    return {
      type: log.action,
      message: `${actorLabel} ${log.message.charAt(0).toLowerCase()}${log.message.slice(1)}`,
      timestamp: log.createdAt,
    };
  });

// Reads from the persisted ActivityLog rather than reconstructing activity
// from current collection state — that live-synthesis approach couldn't show
// deletions (a deleted task just vanishes) or logins. See ActivityLog model.
const getRecentActivity = async () => {
  const logs = await ActivityLog.find({})
    .populate("actor", "firstName lastName role")
    .sort({ createdAt: -1 })
    .limit(8);

  return formatActivityLogs(logs);
};

// A Staff member's activity feed is scoped to their own actions plus actions
// by Users they are connected to — Users they personally created, or Users
// who have been assigned a task this Staff member created. Login/logout
// noise is excluded (that's what the Admin-only Activity Log page is for).
const getStaffRecentActivity = async (staffId: string) => {
  const [createdUserIds, assignedUserIds] = await Promise.all([
    User.find({ createdBy: staffId }).distinct("_id"),
    Task.find({ createdBy: staffId }).distinct("assignedTo"),
  ]);

  const scopedActorIds = [
    staffId,
    ...createdUserIds.map((id) => String(id)),
    ...assignedUserIds.map((id) => String(id)),
  ];

  const logs = await ActivityLog.find({
    actor: { $in: scopedActorIds },
    action: { $nin: AUTH_ACTIONS },
  })
    .populate("actor", "firstName lastName role")
    .sort({ createdAt: -1 })
    .limit(8);

  return formatActivityLogs(logs);
};

// A Staff member's dashboard progress feed only spans Users they personally
// created — no system-wide visibility for Staff (matches getTeamProgressFeed
// in taskProgressController, which powers the full "Team Progress" page).
const getStaffRecentProgress = async (staffId: string) => {
  const createdUserIds = await User.find({ createdBy: staffId }).distinct("_id");

  return TaskProgress.find({ user: { $in: createdUserIds } })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("user", "firstName lastName")
    .populate("task", "title createdBy");
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
      recentProgress,
      recentActivity,
    ] = await Promise.all([
      User.countDocuments({ role: "USER", createdBy: staffId }),
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
      getStaffRecentProgress(staffId),
      getStaffRecentActivity(staffId),
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
      recentProgress,
      recentActivity,
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

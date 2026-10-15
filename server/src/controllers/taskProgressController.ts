import { Response } from "express";
import { Task } from "../models/Task";
import { TaskProgress } from "../models/TaskProgress";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middleware/auth";
import { logActivity } from "../utils/activityLogger";

// Mirrors taskController's assertCanAccessTask: a USER may only view
// progress on their own tasks, a STAFF member only on tasks they created
// (the per-task thread follows the task's own visibility — see
// getTeamProgressFeed for the equivalent scoping on the team-wide feed).
const assertCanViewTaskProgress = (
  task: { assignedTo: { toString(): string }; createdBy: { toString(): string } },
  req: AuthRequest
) => {
  const { role, userId } = req.user!;
  if (role === "USER" && task.assignedTo.toString() !== userId) {
    throw new ApiError(403, "You may only view progress on tasks assigned to you");
  }
  if (role === "STAFF" && task.createdBy.toString() !== userId) {
    throw new ApiError(403, "You may only view progress on tasks you created");
  }
};

export const addProgress = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const task = await Task.findById(req.params.id);
    if (!task) throw new ApiError(404, "Task not found");

    if (task.assignedTo.toString() !== req.user!.userId) {
      throw new ApiError(403, "You may only post progress on tasks assigned to you");
    }

    const progress = await TaskProgress.create({
      task: task._id,
      user: req.user!.userId,
      note: req.body.note,
    });

    logActivity(
      req.user!,
      "TASK_PROGRESS_ADDED",
      `Added a progress update on task "${task.title}"`
    );

    sendSuccess(res, "Progress note added successfully", progress, 201);
  }
);

export const getTaskProgress = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const task = await Task.findById(req.params.id);
    if (!task) throw new ApiError(404, "Task not found");

    assertCanViewTaskProgress(task, req);

    const notes = await TaskProgress.find({ task: task._id })
      .populate("user", "firstName lastName")
      .sort({ createdAt: -1 });

    sendSuccess(res, "Fetched successfully", notes);
  }
);

export const getMyProgressFeed = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "10", 10);

    const filter = { user: req.user!.userId };

    const total = await TaskProgress.countDocuments(filter);
    const items = await TaskProgress.find(filter)
      .populate("user", "firstName lastName")
      .populate("task", "title status")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    sendSuccess(res, "Fetched successfully", {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  }
);

export const getTeamProgressFeed = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "10", 10);

    // ADMIN sees every User's progress; STAFF only sees progress from Users
    // they personally created — no system-wide visibility for Staff.
    let filter: Record<string, unknown> = {};
    if (req.user!.role === "STAFF") {
      const createdUserIds = await User.find({
        createdBy: req.user!.userId,
      }).distinct("_id");
      filter = { user: { $in: createdUserIds } };
    }

    const total = await TaskProgress.countDocuments(filter);
    const items = await TaskProgress.find(filter)
      .populate("user", "firstName lastName")
      .populate("task", "title status createdBy")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    sendSuccess(res, "Fetched successfully", {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  }
);

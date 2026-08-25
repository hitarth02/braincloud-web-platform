import { Response } from "express";
import { Task } from "../models/Task";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middleware/auth";

// Tasks may only ever be assigned to plain USER accounts — never to
// Staff or Admin — regardless of what the client sends.
const assertAssignableUser = async (userId: string) => {
  const assignee = await User.findOne({ _id: userId, role: "USER" });
  if (!assignee) {
    throw new ApiError(400, "Tasks can only be assigned to users");
  }
};

export const getTasks = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt((req.query.page as string) || "1", 10);
  const limit = parseInt((req.query.limit as string) || "10", 10);
  const status = (req.query.status as string) || "";
  const priority = (req.query.priority as string) || "";
  const search = (req.query.search as string) || "";

  const filter: Record<string, unknown> = {};

  // A plain USER may only ever see tasks assigned to them.
  if (req.user!.role === "USER") {
    filter.assignedTo = req.user!.userId;
  }

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (search) filter.title = { $regex: search, $options: "i" };

  const total = await Task.countDocuments(filter);
  const tasks = await Task.find(filter)
    .populate("assignedTo", "firstName lastName email")
    .populate("createdBy", "firstName lastName email")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  sendSuccess(res, "Fetched successfully", {
    items: tasks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
});

export const getTaskById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const task = await Task.findById(req.params.id)
    .populate("assignedTo", "firstName lastName email")
    .populate("createdBy", "firstName lastName email");

  if (!task) throw new ApiError(404, "Task not found");

  if (
    req.user!.role === "USER" &&
    task.assignedTo._id.toString() !== req.user!.userId
  ) {
    throw new ApiError(403, "You may only view tasks assigned to you");
  }

  sendSuccess(res, "Fetched successfully", task);
});

export const createTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, description, assignedTo, priority, dueDate } = req.body;

  await assertAssignableUser(assignedTo);

  const task = await Task.create({
    title,
    description,
    assignedTo,
    priority,
    dueDate,
    createdBy: req.user!.userId,
  });

  sendSuccess(res, "Task created successfully", task, 201);
});

export const updateTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, "Task not found");

  const { title, description, assignedTo, priority, dueDate } = req.body;
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (assignedTo !== undefined) {
    await assertAssignableUser(assignedTo);
    task.assignedTo = assignedTo;
  }
  if (priority !== undefined) task.priority = priority;
  if (dueDate !== undefined) task.dueDate = dueDate;

  await task.save();
  sendSuccess(res, "Task updated successfully", task);
});

export const deleteTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) throw new ApiError(404, "Task not found");
  sendSuccess(res, "Task deleted successfully");
});

export const updateTaskStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const task = await Task.findById(req.params.id);
    if (!task) throw new ApiError(404, "Task not found");

    if (
      req.user!.role === "USER" &&
      task.assignedTo.toString() !== req.user!.userId
    ) {
      throw new ApiError(403, "You may only update tasks assigned to you");
    }

    task.status = req.body.status;
    await task.save();

    sendSuccess(res, "Task status updated successfully", task);
  }
);

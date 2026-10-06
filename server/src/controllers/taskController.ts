import { Response } from "express";
import { Task } from "../models/Task";
import { User } from "../models/User";
import { TaskProgress } from "../models/TaskProgress";
import { ApiError } from "../utils/ApiError";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middleware/auth";
import { logActivity } from "../utils/activityLogger";

// Tasks may only ever be assigned to plain USER accounts — never to
// Staff or Admin — regardless of what the client sends.
const assertAssignableUser = async (userId: string) => {
  const assignee = await User.findOne({ _id: userId, role: "USER" });
  if (!assignee) {
    throw new ApiError(400, "Tasks can only be assigned to users");
  }
};

// A USER may only touch tasks assigned to them; a STAFF member may only
// touch tasks they personally created (no system-wide visibility for
// Staff — only ADMIN sees every task). Checked on every read/write so this
// holds even if a client calls the API directly, bypassing the UI.
const assertCanAccessTask = (
  assignedToId: string | null,
  createdById: string,
  req: AuthRequest,
  verb: string
) => {
  const { role, userId } = req.user!;
  if (role === "USER" && assignedToId !== userId) {
    throw new ApiError(403, `You may only ${verb} tasks assigned to you`);
  }
  if (role === "STAFF" && createdById !== userId) {
    throw new ApiError(403, `You may only ${verb} tasks you created`);
  }
};

export const getTasks = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt((req.query.page as string) || "1", 10);
  const limit = parseInt((req.query.limit as string) || "10", 10);
  const status = (req.query.status as string) || "";
  const priority = (req.query.priority as string) || "";
  const search = (req.query.search as string) || "";

  const filter: Record<string, unknown> = {};

  // A plain USER may only ever see tasks assigned to them; a STAFF member
  // only sees tasks they personally created — no system-wide visibility for
  // Staff, only ADMIN sees every task.
  if (req.user!.role === "USER") {
    filter.assignedTo = req.user!.userId;
  } else if (req.user!.role === "STAFF") {
    filter.createdBy = req.user!.userId;
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

  assertCanAccessTask(
    task.assignedTo ? (task.assignedTo as any)._id.toString() : null,
    (task.createdBy as any)._id.toString(),
    req,
    "view"
  );

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

  logActivity(req.user!, "TASK_CREATED", `Created task "${task.title}"`);

  sendSuccess(res, "Task created successfully", task, 201);
});

export const updateTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, "Task not found");

  assertCanAccessTask(task.assignedTo.toString(), task.createdBy.toString(), req, "update");

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
  await task.populate([
    { path: "assignedTo", select: "firstName lastName email" },
    { path: "createdBy", select: "firstName lastName email" },
  ]);

  logActivity(req.user!, "TASK_UPDATED", `Updated task "${task.title}"`);

  sendSuccess(res, "Task updated successfully", task);
});

export const deleteTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, "Task not found");

  assertCanAccessTask(task.assignedTo.toString(), task.createdBy.toString(), req, "delete");

  // A task's progress notes have no meaning once the task is gone.
  await TaskProgress.deleteMany({ task: task._id });
  await task.deleteOne();

  logActivity(req.user!, "TASK_DELETED", `Deleted task "${task.title}"`);

  sendSuccess(res, "Task deleted successfully");
});

export const updateTaskStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const task = await Task.findById(req.params.id);
    if (!task) throw new ApiError(404, "Task not found");

    assertCanAccessTask(task.assignedTo.toString(), task.createdBy.toString(), req, "update");

    const previousStatus = task.status;
    task.status = req.body.status;

    if (task.status === "COMPLETED") {
      task.completedAt = new Date();
    } else if (previousStatus === "COMPLETED") {
      // Re-opened after being completed — the old completion date no longer applies.
      task.completedAt = undefined;
    }

    await task.save();
    await task.populate([
      { path: "assignedTo", select: "firstName lastName email" },
      { path: "createdBy", select: "firstName lastName email" },
    ]);

    logActivity(
      req.user!,
      "TASK_STATUS_CHANGED",
      `Changed task "${task.title}" status from ${previousStatus} to ${task.status}`
    );

    sendSuccess(res, "Task status updated successfully", task);
  }
);

import { Response } from "express";
import { Task, TaskStatus } from "../models/Task";
import { TaskProgress } from "../models/TaskProgress";
import { User, UserRole } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middleware/auth";
import { toCsv } from "../utils/csv";

const DAY_MS = 24 * 60 * 60 * 1000;

const fmtDate = (d?: Date | null) => (d ? new Date(d).toISOString().slice(0, 10) : "");

const onTimeLabel = (status: TaskStatus, dueDate: Date, completedAt?: Date) => {
  if (status !== "COMPLETED") return "Pending";
  if (!completedAt) return "Pending";
  return new Date(completedAt) <= new Date(dueDate) ? "Yes" : "No";
};

/**
 * Resolves which (role, targetId) this caller is actually allowed to export:
 * - USER  -> only their own report, regardless of what's requested.
 * - STAFF -> any USER's report, or only their own STAFF report.
 * - ADMIN -> any USER or STAFF report.
 */
const resolveScope = (
  req: AuthRequest,
  requestedRole: string,
  requestedTargetId: string
): { role: UserRole; targetId: string } => {
  const callerRole = req.user!.role;
  const callerId = req.user!.userId;

  if (callerRole === "USER") {
    return { role: "USER", targetId: callerId };
  }

  if (requestedRole !== "USER" && requestedRole !== "STAFF") {
    throw new ApiError(400, "role must be USER or STAFF");
  }
  if (!requestedTargetId) {
    throw new ApiError(400, "targetId is required");
  }

  if (callerRole === "STAFF") {
    if (requestedRole === "STAFF" && requestedTargetId !== callerId) {
      throw new ApiError(403, "Staff may only export their own staff report");
    }
    return { role: requestedRole, targetId: requestedTargetId };
  }

  // ADMIN
  return { role: requestedRole, targetId: requestedTargetId };
};

export const exportReport = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const requestedRole = (req.query.role as string) || "USER";
    const requestedTargetId = (req.query.targetId as string) || "";
    const { role, targetId } = resolveScope(req, requestedRole, requestedTargetId);

    const now = new Date();
    const to = req.query.to ? new Date(req.query.to as string) : now;
    const from = req.query.from
      ? new Date(req.query.from as string)
      : new Date(to.getTime() - 7 * DAY_MS);

    const target = await User.findOne({ _id: targetId, role });
    if (!target) throw new ApiError(404, "Report target not found");

    const windowFilter = {
      $or: [
        { createdAt: { $gte: from, $lte: to } },
        { updatedAt: { $gte: from, $lte: to } },
        { completedAt: { $gte: from, $lte: to } },
      ],
    };

    const taskFilter =
      role === "USER"
        ? { assignedTo: target._id, ...windowFilter }
        : { createdBy: target._id, ...windowFilter };

    const tasks = await Task.find(taskFilter)
      .populate("assignedTo", "firstName lastName")
      .sort({ dueDate: 1 });

    const taskIds = tasks.map((t) => t._id);
    const progressCounts = await TaskProgress.aggregate([
      { $match: { task: { $in: taskIds } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$task",
          count: { $sum: 1 },
          latestNote: { $first: "$note" },
        },
      },
    ]);
    const progressByTask = new Map(
      progressCounts.map((p) => [p._id.toString(), p])
    );

    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "COMPLETED").length;
    const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
    const todo = tasks.filter((t) => t.status === "TODO").length;
    const cancelled = tasks.filter((t) => t.status === "CANCELLED").length;
    const overdue = tasks.filter(
      (t) =>
        new Date(t.dueDate) < now &&
        t.status !== "COMPLETED" &&
        t.status !== "CANCELLED"
    ).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const summaryLines: string[] = [
      `Report for,${target.firstName} ${target.lastName} (${role})`,
      `Period,${fmtDate(from)} to ${fmtDate(to)}`,
      `Total tasks,${total}`,
      `Completed,${completed}`,
      `In progress,${inProgress}`,
      `To do,${todo}`,
      `Cancelled,${cancelled}`,
      `Overdue,${overdue}`,
      `Completion rate,${completionRate}%`,
      "",
    ];

    const headers =
      role === "STAFF"
        ? [
            "Task Title",
            "Assigned To",
            "Priority",
            "Status",
            "Due Date",
            "Completed Date",
            "On Time",
            "Created At",
            "Progress Notes",
            "Latest Progress Note",
          ]
        : [
            "Task Title",
            "Priority",
            "Status",
            "Due Date",
            "Completed Date",
            "On Time",
            "Created At",
            "Progress Notes",
            "Latest Progress Note",
          ];

    const rows = tasks.map((t) => {
      const progress = progressByTask.get(String(t._id));
      const assignee = t.assignedTo as unknown as
        | { firstName: string; lastName: string }
        | null;

      const base = [
        t.title,
        t.priority,
        t.status,
        fmtDate(t.dueDate),
        fmtDate(t.completedAt),
        onTimeLabel(t.status, t.dueDate, t.completedAt),
        fmtDate(t.createdAt),
        progress?.count ?? 0,
        progress?.latestNote ?? "",
      ];

      return role === "STAFF"
        ? [
            t.title,
            assignee ? `${assignee.firstName} ${assignee.lastName}` : "",
            ...base.slice(1),
          ]
        : base;
    });

    const csv = summaryLines.join("\n") + "\n" + toCsv(headers, rows);
    const filename = `report-${role.toLowerCase()}-${fmtDate(from)}_to_${fmtDate(to)}.csv`;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csv);
  }
);

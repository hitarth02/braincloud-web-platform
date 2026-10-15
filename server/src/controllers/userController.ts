import { Response } from "express";
import { User, UserRole } from "../models/User";
import { Task } from "../models/Task";
import { Announcement } from "../models/Announcement";
import { TaskProgress } from "../models/TaskProgress";
import { ApiError } from "../utils/ApiError";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middleware/auth";
import { MAX_USERS, MAX_STAFF } from "../config/limits";
import { logActivity } from "../utils/activityLogger";
import { ActivityAction } from "../models/ActivityLog";

const roleLabel = (targetRole: UserRole) =>
  targetRole === "STAFF" ? "staff member" : "user";

/**
 * A Staff member only sees/manages Users they personally created — no
 * system-wide visibility for Staff, only ADMIN sees every account. A User
 * created directly by an Admin (or with no recorded creator, e.g. seeded
 * accounts) is visible to Admin only, not to any Staff member. This only
 * ever bites on /api/users (targetRole="USER") since /api/staff is already
 * ADMIN-only at the route level.
 */
const ownerFilter = (req: AuthRequest): Record<string, unknown> =>
  req.user!.role === "STAFF" ? { createdBy: req.user!.userId } : {};

/**
 * Users and Staff are both stored in the same User collection, differentiated
 * by `role`. This factory produces a set of CRUD handlers scoped to a single
 * target role, so /api/users (role=USER) and /api/staff (role=STAFF) can
 * share identical logic without duplicating controller code.
 */
export const makeUserController = (targetRole: UserRole) => {
  const getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "10", 10);
    const search = (req.query.search as string) || "";
    const status = (req.query.status as string) || "";

    const filter: Record<string, unknown> = { role: targetRole, ...ownerFilter(req) };

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (status === "active") filter.isActive = true;
    if (status === "inactive") filter.isActive = false;

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .populate("createdBy", "firstName lastName")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    sendSuccess(res, "Fetched successfully", {
      items: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  });

  const getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await User.findOne({
      _id: req.params.id,
      role: targetRole,
      ...ownerFilter(req),
    }).populate("createdBy", "firstName lastName");
    if (!user) throw new ApiError(404, "Not found");
    sendSuccess(res, "Fetched successfully", user);
  });

  const create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { firstName, lastName, email, password, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) throw new ApiError(409, "Email already in use");

    const limit = targetRole === "STAFF" ? MAX_STAFF : MAX_USERS;
    const currentCount = await User.countDocuments({ role: targetRole });
    if (currentCount >= limit) {
      const label = targetRole === "STAFF" ? "staff" : "users";
      throw new ApiError(
        400,
        `Cannot create more ${label}: the maximum of ${limit} has been reached`
      );
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      role: targetRole,
      mustChangePassword: true,
      createdBy: req.user!.userId,
    });

    logActivity(
      req.user!,
      `${targetRole}_CREATED` as ActivityAction,
      `Created ${roleLabel(targetRole)} ${user.firstName} ${user.lastName}`
    );

    sendSuccess(res, "Created successfully", user, 201);
  });

  const update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await User.findOne({
      _id: req.params.id,
      role: targetRole,
      ...ownerFilter(req),
    });
    if (!user) throw new ApiError(404, "Not found");

    const { firstName, lastName, phone, isActive } = req.body;
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    logActivity(
      req.user!,
      `${targetRole}_UPDATED` as ActivityAction,
      `Updated ${roleLabel(targetRole)} ${user.firstName} ${user.lastName}`
    );

    sendSuccess(res, "Updated successfully", user);
  });

  const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await User.findOne({
      _id: req.params.id,
      role: targetRole,
      ...ownerFilter(req),
    });
    if (!user) throw new ApiError(404, "Not found");

    // Cascade: a user's tasks/announcements/progress notes have no meaning
    // once the user is gone. Progress notes are deleted first, keyed off
    // both the affected tasks (so notes authored by a *different* user on a
    // task this user created are also cleaned up) and this user's own
    // authored notes, before the tasks themselves are removed.
    const affectedTasks = await Task.find({
      $or: [{ assignedTo: user._id }, { createdBy: user._id }],
    }).select("_id");
    const affectedTaskIds = affectedTasks.map((t) => t._id);

    await TaskProgress.deleteMany({
      $or: [{ task: { $in: affectedTaskIds } }, { user: user._id }],
    });
    const [{ deletedCount: taskCount }, { deletedCount: announcementCount }] =
      await Promise.all([
        Task.deleteMany({ _id: { $in: affectedTaskIds } }),
        Announcement.deleteMany({ createdBy: user._id }),
      ]);
    await user.deleteOne();

    logActivity(
      req.user!,
      `${targetRole}_DELETED` as ActivityAction,
      `Deleted ${roleLabel(targetRole)} ${user.firstName} ${user.lastName} ` +
        `(${taskCount} task(s), ${announcementCount} announcement(s) removed)`
    );

    sendSuccess(res, "Deleted successfully", user);
  });

  const resetPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await User.findOne({
      _id: req.params.id,
      role: targetRole,
      ...ownerFilter(req),
    }).select("+password");
    if (!user) throw new ApiError(404, "Not found");

    user.password = req.body.newPassword;
    user.mustChangePassword = true;
    await user.save();

    logActivity(
      req.user!,
      `${targetRole}_PASSWORD_RESET` as ActivityAction,
      `Reset password for ${roleLabel(targetRole)} ${user.firstName} ${user.lastName}`
    );

    sendSuccess(res, "Password reset successfully");
  });

  return { getAll, getById, create, update, remove, resetPassword };
};

/**
 * Admin-only: transfers a User's ownership to a different Staff member,
 * fixing the one gap the "Staff only sees Users they created" model leaves
 * open — there was previously no way to hand a User off to another Staff
 * member (e.g. when the original creator leaves). Only ever meaningful for
 * USER-role accounts — Staff ownership isn't used for any scoping today.
 */
export const reassignUserOwner = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { newOwnerId } = req.body;

    const user = await User.findOne({ _id: req.params.id, role: "USER" });
    if (!user) throw new ApiError(404, "Not found");

    const newOwner = await User.findOne({
      _id: newOwnerId,
      role: "STAFF",
      isActive: true,
    });
    if (!newOwner) {
      throw new ApiError(400, "New owner must be an active staff member");
    }

    const previousOwner = user.createdBy
      ? await User.findById(user.createdBy)
      : null;

    user.createdBy = newOwner.id;
    await user.save();
    await user.populate("createdBy", "firstName lastName");

    logActivity(
      req.user!,
      "USER_REASSIGNED",
      previousOwner
        ? `Reassigned user ${user.firstName} ${user.lastName} from ` +
          `${previousOwner.firstName} ${previousOwner.lastName} to ` +
          `${newOwner.firstName} ${newOwner.lastName}`
        : `Assigned previously unowned user ${user.firstName} ${user.lastName} ` +
          `to ${newOwner.firstName} ${newOwner.lastName}`
    );

    sendSuccess(res, "User reassigned successfully", user);
  }
);

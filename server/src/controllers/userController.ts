import { Response } from "express";
import { User, UserRole } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middleware/auth";

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

    const filter: Record<string, unknown> = { role: targetRole };

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
    const user = await User.findOne({ _id: req.params.id, role: targetRole });
    if (!user) throw new ApiError(404, "Not found");
    sendSuccess(res, "Fetched successfully", user);
  });

  const create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { firstName, lastName, email, password, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) throw new ApiError(409, "Email already in use");

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      role: targetRole,
    });

    sendSuccess(res, "Created successfully", user, 201);
  });

  const update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await User.findOne({ _id: req.params.id, role: targetRole });
    if (!user) throw new ApiError(404, "Not found");

    const { firstName, lastName, phone, isActive } = req.body;
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();
    sendSuccess(res, "Updated successfully", user);
  });

  const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await User.findOne({ _id: req.params.id, role: targetRole });
    if (!user) throw new ApiError(404, "Not found");

    user.isActive = false;
    await user.save();

    sendSuccess(res, "Deactivated successfully", user);
  });

  const resetPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await User.findOne({ _id: req.params.id, role: targetRole }).select(
      "+password"
    );
    if (!user) throw new ApiError(404, "Not found");

    user.password = req.body.newPassword;
    await user.save();

    sendSuccess(res, "Password reset successfully");
  });

  return { getAll, getById, create, update, remove, resetPassword };
};

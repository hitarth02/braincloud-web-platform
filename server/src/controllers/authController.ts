import { Response } from "express";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { signToken } from "../utils/jwt";
import { AuthRequest } from "../middleware/auth";
import { logActivity } from "../utils/activityLogger";

export const login = asyncHandler(async (req, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Your account has been deactivated");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = signToken({ userId: user.id, role: user.role });

  logActivity({ userId: user.id, role: user.role }, "LOGIN", "Logged in");

  sendSuccess(res, "Login successful", {
    token,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      isActive: user.isActive,
      mustChangePassword: user.mustChangePassword,
    },
  });
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  logActivity(req.user!, "LOGOUT", "Logged out");
  sendSuccess(res, "Logout successful");
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.userId);
  if (!user) throw new ApiError(404, "User not found");
  sendSuccess(res, "Current user fetched", user);
});

export const changePassword = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user!.userId).select("+password");
    if (!user) throw new ApiError(404, "User not found");

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw new ApiError(400, "Current password is incorrect");

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    logActivity(req.user!, "PASSWORD_CHANGED", "Changed their own password");

    sendSuccess(res, "Password changed successfully");
  }
);

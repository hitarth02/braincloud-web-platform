import { Response } from "express";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middleware/auth";

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.userId);
  if (!user) throw new ApiError(404, "User not found");
  sendSuccess(res, "Profile fetched successfully", user);
});

export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.user!.userId);
    if (!user) throw new ApiError(404, "User not found");

    const { firstName, lastName, phone, avatar } = req.body;
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();
    sendSuccess(res, "Profile updated successfully", user);
  }
);

export const changeOwnPassword = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user!.userId).select("+password");
    if (!user) throw new ApiError(404, "User not found");

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw new ApiError(400, "Current password is incorrect");

    user.password = newPassword;
    await user.save();

    sendSuccess(res, "Password changed successfully");
  }
);

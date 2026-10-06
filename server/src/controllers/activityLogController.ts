import { Response } from "express";
import { ActivityLog, AUTH_ACTIONS } from "../models/ActivityLog";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middleware/auth";

export const getActivityLogs = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "20", 10);
    const scope = (req.query.scope as string) || "all";

    const filter = scope === "auth" ? { action: { $in: AUTH_ACTIONS } } : {};

    const total = await ActivityLog.countDocuments(filter);
    const items = await ActivityLog.find(filter)
      .populate("actor", "firstName lastName role")
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

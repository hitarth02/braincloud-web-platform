import { Response } from "express";
import { Announcement } from "../models/Announcement";
import { ApiError } from "../utils/ApiError";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middleware/auth";

export const getAnnouncements = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "10", 10);

    const total = await Announcement.countDocuments({});
    const items = await Announcement.find({})
      .populate("createdBy", "firstName lastName email role")
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

export const createAnnouncement = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { title, content } = req.body;

    const announcement = await Announcement.create({
      title,
      content,
      createdBy: req.user!.userId,
    });
    await announcement.populate("createdBy", "firstName lastName email role");

    sendSuccess(res, "Announcement posted successfully", announcement, 201);
  }
);

const assertCanModify = (announcement: { createdBy: { toString(): string } }, req: AuthRequest) => {
  const isOwner = announcement.createdBy.toString() === req.user!.userId;
  if (req.user!.role !== "ADMIN" && !isOwner) {
    throw new ApiError(403, "You can only modify your own announcements");
  }
};

export const updateAnnouncement = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) throw new ApiError(404, "Announcement not found");

    assertCanModify(announcement, req);

    const { title, content } = req.body;
    if (title !== undefined) announcement.title = title;
    if (content !== undefined) announcement.content = content;

    await announcement.save();
    await announcement.populate("createdBy", "firstName lastName email role");

    sendSuccess(res, "Announcement updated successfully", announcement);
  }
);

export const deleteAnnouncement = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) throw new ApiError(404, "Announcement not found");

    assertCanModify(announcement, req);

    await announcement.deleteOne();
    sendSuccess(res, "Announcement deleted successfully");
  }
);

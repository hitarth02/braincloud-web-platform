import mongoose, { Document, Schema, Types } from "mongoose";
import { UserRole } from "./User";

export type ActivityAction =
  | "LOGIN"
  | "LOGOUT"
  | "USER_CREATED"
  | "USER_UPDATED"
  | "USER_DELETED"
  | "USER_PASSWORD_RESET"
  | "USER_REASSIGNED"
  | "STAFF_CREATED"
  | "STAFF_UPDATED"
  | "STAFF_DELETED"
  | "STAFF_PASSWORD_RESET"
  | "TASK_CREATED"
  | "TASK_UPDATED"
  | "TASK_DELETED"
  | "TASK_STATUS_CHANGED"
  | "TASK_PROGRESS_ADDED"
  | "ANNOUNCEMENT_CREATED"
  | "ANNOUNCEMENT_UPDATED"
  | "ANNOUNCEMENT_DELETED"
  | "PASSWORD_CHANGED";

export const AUTH_ACTIONS: ActivityAction[] = ["LOGIN", "LOGOUT"];

export interface IActivityLog extends Document {
  actor?: Types.ObjectId;
  actorRole: UserRole;
  action: ActivityAction;
  message: string;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    // Best-effort link only — the referenced User can later be hard-deleted
    // (see userController.remove), so `message` below is always rendered in
    // full at write time and never depends on this ref still resolving.
    actor: { type: Schema.Types.ObjectId, ref: "User" },
    actorRole: {
      type: String,
      enum: ["ADMIN", "STAFF", "USER"],
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    message: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });

export const ActivityLog = mongoose.model<IActivityLog>(
  "ActivityLog",
  activityLogSchema
);

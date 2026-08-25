import mongoose, { Document, Schema, Types } from "mongoose";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface ITask extends Document {
  title: string;
  description: string;
  assignedTo: Types.ObjectId;
  createdBy: Types.ObjectId;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM",
    },
    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "TODO",
    },
    dueDate: { type: Date, required: true },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

taskSchema.index({ assignedTo: 1, status: 1 });

export const Task = mongoose.model<ITask>("Task", taskSchema);

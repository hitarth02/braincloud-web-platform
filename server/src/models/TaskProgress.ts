import mongoose, { Document, Schema, Types } from "mongoose";

export interface ITaskProgress extends Document {
  task: Types.ObjectId;
  user: Types.ObjectId;
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

const taskProgressSchema = new Schema<ITaskProgress>(
  {
    task: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    note: { type: String, required: true, trim: true },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

taskProgressSchema.index({ task: 1, createdAt: -1 });
taskProgressSchema.index({ user: 1, createdAt: -1 });

export const TaskProgress = mongoose.model<ITaskProgress>(
  "TaskProgress",
  taskProgressSchema
);

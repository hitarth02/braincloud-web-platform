import mongoose, { Document, Schema, Types } from "mongoose";

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

export const Announcement = mongoose.model<IAnnouncement>(
  "Announcement",
  announcementSchema
);

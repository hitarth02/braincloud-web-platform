import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { env } from "./config/env";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler";

import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import staffRoutes from "./routes/staffRoutes";
import taskRoutes from "./routes/taskRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import profileRoutes from "./routes/profileRoutes";
import announcementRoutes from "./routes/announcementRoutes";
import progressRoutes from "./routes/progressRoutes";
import activityLogRoutes from "./routes/activityLogRoutes";
import reportRoutes from "./routes/reportRoutes";

const app = express();

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "Server is healthy" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/activity-logs", activityLogRoutes);
app.use("/api/reports", reportRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

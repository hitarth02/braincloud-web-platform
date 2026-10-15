import mongoose from "mongoose";
import { env } from "../config/env";
import { User } from "../models/User";
import { Task } from "../models/Task";
import { Announcement } from "../models/Announcement";
import { TaskProgress } from "../models/TaskProgress";
import { ActivityLog } from "../models/ActivityLog";

const DEV_PASSWORD = "Admin@123";

const staffData = [
  { firstName: "Sarah", lastName: "Miller", email: "staff@example.com" },
  { firstName: "James", lastName: "Wilson", email: "staff2@example.com" },
];

const userData = [
  { firstName: "Emma", lastName: "Brown", email: "user@example.com" },
  { firstName: "Liam", lastName: "Davis", email: "user2@example.com" },
];

const seed = async () => {
  await mongoose.connect(env.MONGODB_URI);
  console.log("Connected to MongoDB for seeding...");

  // Tasks, Announcements, TaskProgress, and ActivityLog all reference User
  // (and Task) documents by ID — clear them alongside Users so a re-seed
  // never leaves orphaned references behind.
  await Promise.all([
    User.deleteMany({}),
    Task.deleteMany({}),
    Announcement.deleteMany({}),
    TaskProgress.deleteMany({}),
    ActivityLog.deleteMany({}),
  ]);
  console.log("Cleared existing users, tasks, announcements, progress notes, and activity logs.");

  await User.create({
    firstName: "Admin",
    lastName: "Account",
    email: "admin@example.com",
    password: DEV_PASSWORD,
    role: "ADMIN",
  });

  const staffDocs = [];
  for (const staff of staffData) {
    staffDocs.push(await User.create({ ...staff, password: DEV_PASSWORD, role: "STAFF" }));
  }

  // Each demo User is created by a different demo Staff member, so the
  // Staff-scoped visibility rules (a Staff member only sees/assigns Users
  // they created) have something real to demonstrate out of the box.
  for (let i = 0; i < userData.length; i++) {
    const creator = staffDocs[i % staffDocs.length];
    await User.create({
      ...userData[i],
      password: DEV_PASSWORD,
      role: "USER",
      createdBy: creator._id,
    });
  }

  console.log("Seed complete: 1 admin, 2 staff, 2 users created.");
  console.log("Emma Brown -> created by Sarah Miller; Liam Davis -> created by James Wilson.");
  console.log(`Development password for all accounts: ${DEV_PASSWORD}`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});

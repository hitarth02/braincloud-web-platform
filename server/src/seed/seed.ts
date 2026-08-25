import mongoose from "mongoose";
import { env } from "../config/env";
import { User } from "../models/User";

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

  await User.deleteMany({});
  console.log("Cleared existing users.");

  await User.create({
    firstName: "Admin",
    lastName: "Account",
    email: "admin@example.com",
    password: DEV_PASSWORD,
    role: "ADMIN",
  });

  for (const staff of staffData) {
    await User.create({ ...staff, password: DEV_PASSWORD, role: "STAFF" });
  }

  for (const user of userData) {
    await User.create({ ...user, password: DEV_PASSWORD, role: "USER" });
  }

  console.log("Seed complete: 1 admin, 2 staff, 2 users created.");
  console.log(`Development password for all accounts: ${DEV_PASSWORD}`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});

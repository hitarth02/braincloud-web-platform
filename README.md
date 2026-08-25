# TaskFlow — Role-Based Task Management System

A college-level MERN stack project: a role-based user and task management system with three access levels (Admin, Staff, User), JWT authentication, and a polished SaaS-style UI.

## Description

TaskFlow lets an organization manage staff and user accounts and assign/track tasks between them, with every permission enforced on the backend API — not just hidden in the UI. See [docs/project-overview.md](./docs/project-overview.md) for the full problem statement and workflows.

## Features

- JWT authentication with bcrypt password hashing
- Three-tier role-based access control (ADMIN / STAFF / USER), enforced on the backend
- Admin: manage staff, manage users, view all tasks, view system-wide stats
- Staff: manage users, create/assign/track tasks
- User: view assigned tasks, update task status, manage own profile
- Tasks can only ever be assigned to User accounts — never to Staff or Admin
- Announcements: Admin and Staff can post updates; every role can view the feed
- Role-specific dashboards with stats and a task breakdown chart
- Searchable, paginated user/staff/task tables
- Profile management and self-service password change
- Toasts, loading states, empty states, and confirmation dialogs throughout

## Tech Stack

**Frontend:** React, TypeScript, Tailwind CSS, React Router, Axios, Redux Toolkit, Zod, Recharts
**Backend:** Node.js, Express, TypeScript, MongoDB, Mongoose, JWT, bcrypt, Zod

See [docs/tech-stack.md](./docs/tech-stack.md) for details on why each technology was chosen.

## Screenshots

_Add screenshots of the Login page, Admin Dashboard, and Task list here._

## Project Structure

```text
announcement/
├── client/     # React + TypeScript frontend
├── server/     # Node + Express + TypeScript backend
├── docs/       # Full project documentation
├── .env.example
└── README.md
```

See [docs/project-structure.md](./docs/project-structure.md) for the full breakdown.

## Installation

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

## Environment Variables

Copy `.env.example` to `server/.env` and adjust as needed:

```text
MONGODB_URI=mongodb://127.0.0.1:27017/task_management
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:5173
```

Full setup instructions (including MongoDB setup): [docs/setup.md](./docs/setup.md).

## Running the Project

```bash
# Terminal 1 — backend (http://localhost:5000)
cd server
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd client
npm run dev
```

## Seed Data

```bash
cd server
npm run seed
```

Creates 1 Admin, 2 Staff, and 2 User accounts.

## Development Credentials

All seeded accounts share the same development password: **`Password@123`**

| Role | Email |
|---|---|
| Admin | `admin@example.com` |
| Staff | `staff@example.com` / `staff2@example.com` |
| User | `user@example.com` / `user2@example.com` / `user3@example.com` / `user4@example.com` / `user5@example.com` |

## API Documentation

Full endpoint reference (method, auth, roles, request/response examples): [docs/api-documentation.md](./docs/api-documentation.md)

## Documentation

Full documentation index: [docs/README.md](./docs/README.md)

## Future Improvements

See [docs/future-improvements.md](./docs/future-improvements.md) for features intentionally left out of scope (notifications, email, comments, attachments, teams, activity logs, real-time updates, and more).

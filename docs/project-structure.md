# Project Structure

```text
announcement/
│
├── client/                      # React + TypeScript frontend
│   ├── src/
│   │   ├── components/          # Reusable UI building blocks (Button, Card, Modal, Badge, ...)
│   │   ├── pages/                # Route-level pages, grouped by domain
│   │   │   ├── auth/             # LoginPage
│   │   │   ├── dashboard/        # AdminDashboardPage, StaffDashboardPage, UserDashboardPage
│   │   │   ├── users/            # UserManagementPage, UserFormPage (shared by Users & Staff)
│   │   │   ├── tasks/            # TaskManagementPage, TaskFormPage, TaskDetailPage
│   │   │   └── ProfilePage.tsx
│   │   ├── layouts/              # MainLayout, Sidebar, Navbar
│   │   ├── routes/               # ProtectedRoute, RoleRoute
│   │   ├── services/             # Axios instance + one service module per API resource
│   │   ├── store/                # Redux store + authSlice
│   │   ├── hooks/                # useAuth, typed Redux hooks
│   │   ├── types/                # Shared TypeScript interfaces (User, Task, ...)
│   │   ├── utils/                # Formatting helpers
│   │   └── App.tsx               # Route definitions
│   └── package.json
│
├── server/                      # Node + Express + TypeScript backend
│   ├── src/
│   │   ├── config/               # env.ts, db.ts
│   │   ├── controllers/          # authController, userController, taskController, dashboardController, profileController
│   │   ├── middleware/           # auth (authenticate/authorize), errorHandler, validate
│   │   ├── models/                # User.ts, Task.ts
│   │   ├── routes/                # authRoutes, userRoutes, staffRoutes, taskRoutes, dashboardRoutes, profileRoutes
│   │   ├── validators/            # Zod schemas per resource
│   │   ├── utils/                 # ApiError, apiResponse, asyncHandler, jwt
│   │   ├── seed/                  # seed.ts
│   │   ├── app.ts                 # Express app + middleware wiring
│   │   └── server.ts              # Entry point — connects DB, starts server
│   └── package.json
│
├── docs/                         # Project documentation (this folder)
├── .gitignore
├── .env.example
└── README.md
```

## Design Notes

- **Users and Staff share one Mongoose model.** Both are `User` documents distinguished by their `role` field. The `/api/staff` and `/api/users` routes are thin, role-scoped wrappers around the same controller logic (see [backend.md](./backend.md)), avoiding duplicate schemas for what is fundamentally the same entity.
- **User/Staff management pages are shared components.** `UserManagementPage` and `UserFormPage` accept a `service` and `basePath` prop, so the same component renders `/admin/users`, `/admin/staff`, and `/staff/users` without duplicating list/form logic.
- **Task pages are shared across roles.** `TaskManagementPage` and `TaskDetailPage` accept `canCreate`/`canManage` flags to adapt their UI per role, instead of maintaining three near-identical copies.

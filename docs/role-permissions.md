# Role Permissions

TaskFlow has three roles: **ADMIN**, **STAFF**, and **USER**. Every permission below is enforced on the backend via the `authenticate` + `authorize(...)` middleware chain — the frontend UI additionally hides controls a role can't use, but that is a convenience layer, not the source of truth.

## Permission Matrix

| Feature | Admin | Staff | User |
|---|---|---|---|
| Login | ✅ | ✅ | ✅ |
| View own dashboard | ✅ | ✅ | ✅ |
| View system-wide dashboard stats | ✅ | ❌ | ❌ |
| Manage Staff (create/edit/deactivate/reset password) | ✅ | ❌ | ❌ |
| Manage Users (create/edit/deactivate/reset password) | ✅ | ✅ | ❌ |
| View all Users | ✅ | ✅ | ❌ |
| Create Task | ✅ | ✅ | ❌ |
| Assign Task (to a User only — never to Staff/Admin) | ✅ | ✅ | ❌ |
| View all Tasks | ✅ | own-created only | own-assigned only |
| Update Task details / delete Task | ✅ | ✅ | ❌ |
| Update Task status | ✅ | ✅ | own tasks only |
| View Announcements | ✅ | ✅ | ✅ |
| Post Announcement | ✅ | ✅ | ❌ |
| Edit / Delete Announcement | any | own only | ❌ |
| View own profile | ✅ | ✅ | ✅ |
| Edit own profile | ✅ | ✅ | ✅ |
| Change own password | ✅ | ✅ | ✅ |

## Enforcement Details

- **Admin-only routes** (`/api/staff/*`, `/api/dashboard/admin`) use `authorize("ADMIN")`.
- **Admin + Staff routes** (`/api/users/*`) use `authorize("ADMIN", "STAFF")`.
- **Task mutation routes** (create/update/delete) use `authorize("ADMIN", "STAFF")` — a plain USER receives `403 Forbidden`.
- **Task read/status-update routes** are open to all authenticated roles, but the controller additionally filters by `req.user.role`:
  - `GET /api/tasks` — if `role === "USER"`, the query is forced to `{ assignedTo: req.user.userId }`, so a user can never see another user's tasks, regardless of query parameters they send.
  - `GET /api/tasks/:id` and `PATCH /api/tasks/:id/status` — if `role === "USER"` and the task isn't assigned to them, the request is rejected with `403`.

This means the restriction "a User should only be able to access tasks assigned to them" holds even if a malicious client tries to request another user's task ID directly.

- **Task assignment is restricted to USER accounts.** `POST /api/tasks` and `PUT /api/tasks/:id` verify that `assignedTo` references an account with `role: USER` — a Staff or Admin account can never be the assignee of a task, even if an ADMIN or STAFF client attempts it directly via the API. Only plain Users receive tasks; Staff and Admin only create/manage them.
- **Announcement editing/deletion is owner-scoped for Staff.** A STAFF user can only edit or delete announcements they authored; ADMIN can edit or delete any announcement. All authenticated roles (including USER) can view the announcement feed.

## Example Rejections (Verified)

| Request | Role | Result |
|---|---|---|
| `POST /api/users` | USER | `403 Forbidden` |
| `GET /api/staff` | USER | `403 Forbidden` |
| `POST /api/tasks` | USER | `403 Forbidden` |
| `GET /api/staff` | STAFF | `403 Forbidden` |
| `GET /api/dashboard/admin` | STAFF | `403 Forbidden` |
| `GET /api/tasks/:id` (not their task) | USER | `403 Forbidden` |

These were verified directly against the running API — see [testing.md](./testing.md) for the full checklist.

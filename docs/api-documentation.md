# API Documentation

Base URL: `http://localhost:5000/api`

All responses follow a consistent envelope:

```json
// Success
{ "success": true, "message": "...", "data": { } }

// Error
{ "success": false, "message": "..." }
```

Protected endpoints require an `Authorization: Bearer <token>` header, obtained from `POST /api/auth/login`.

---

## Auth

### `POST /api/auth/login`
- **Auth:** None
- **Body:** `{ "email": string, "password": string }`
- **Response 200:**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOi...",
      "user": { "id": "...", "firstName": "Admin", "lastName": "Account", "email": "admin@example.com", "role": "ADMIN", "isActive": true }
    }
  }
  ```
- **Errors:** `401` invalid credentials, `403` account deactivated, `400` validation error.

### `POST /api/auth/logout`
- **Auth:** Required (any role)
- **Body:** none
- **Response 200:** `{ "success": true, "message": "Logout successful" }`

### `GET /api/auth/me`
- **Auth:** Required (any role)
- **Response 200:** the current user's profile.

### `POST /api/auth/change-password`
- **Auth:** Required (any role)
- **Body:** `{ "currentPassword": string, "newPassword": string }`
- **Errors:** `400` current password incorrect or validation error.

---

## Users (`/api/users`) — role = USER accounts

**Required role:** ADMIN or STAFF for all endpoints below.

### `GET /api/users`
- **Query params:** `page` (default 1), `limit` (default 10), `search` (matches name/email), `status` (`active` | `inactive`)
- **Response 200:**
  ```json
  {
    "success": true,
    "message": "Fetched successfully",
    "data": {
      "items": [ { "id": "...", "firstName": "Emma", "lastName": "Brown", "email": "user@example.com", "role": "USER", "isActive": true } ],
      "pagination": { "page": 1, "limit": 10, "total": 5, "totalPages": 1 }
    }
  }
  ```

### `POST /api/users`
- **Body:** `{ "firstName": string, "lastName": string, "email": string, "password": string, "phone"?: string }`
- **Response 201:** the created user.
- **Errors:** `409` email already in use, `400` validation error.

### `GET /api/users/:id`
- **Response 200:** the user, or `404` if not found (or not a USER role account).

### `PUT /api/users/:id`
- **Body:** any of `{ "firstName", "lastName", "phone", "isActive" }`
- **Response 200:** the updated user.

### `DELETE /api/users/:id`
- Deactivates the user (`isActive: false`) rather than permanently deleting the record.
- **Response 200:** the deactivated user.

### `POST /api/users/:id/reset-password`
- **Body:** `{ "newPassword": string }`
- **Response 200:** `{ "success": true, "message": "Password reset successfully" }`

---

## Staff (`/api/staff`) — role = STAFF accounts

Identical endpoint shapes to `/api/users` above (`GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id`, `POST /:id/reset-password`), but scoped to accounts with `role: STAFF`.

**Required role:** ADMIN only. A STAFF or USER token receives `403 Forbidden` on every `/api/staff/*` route.

---

## Tasks (`/api/tasks`)

**Required role:** authenticated (any role) for reads; ADMIN or STAFF for create/update/delete.

### `GET /api/tasks`
- **Query params:** `page`, `limit`, `search` (title), `status`, `priority`
- **Behavior:** if the caller is a USER, results are always filtered to `assignedTo = <their own id>`, regardless of query params sent.
- **Response 200:** paginated list of tasks, each populated with `assignedTo` and `createdBy` (`firstName`, `lastName`, `email`).

### `POST /api/tasks`
- **Required role:** ADMIN, STAFF
- **Body:** `{ "title": string, "description": string, "assignedTo": string (user id), "priority"?: "LOW"|"MEDIUM"|"HIGH"|"URGENT", "dueDate": string (ISO date) }`
- **Response 201:** the created task.
- **Errors:** `400` if `assignedTo` does not reference an existing account with `role: USER` — tasks can never be assigned to a Staff or Admin account, even by a client that bypasses the UI.

### `GET /api/tasks/:id`
- **Behavior:** a USER requesting a task not assigned to them receives `403 Forbidden`.
- **Response 200:** the task.

### `PUT /api/tasks/:id`
- **Required role:** ADMIN, STAFF
- **Body:** any of `{ "title", "description", "assignedTo", "priority", "dueDate" }`
- **Errors:** `400` if a new `assignedTo` does not reference a `role: USER` account.

### `DELETE /api/tasks/:id`
- **Required role:** ADMIN, STAFF

### `PATCH /api/tasks/:id/status`
- **Body:** `{ "status": "TODO"|"IN_PROGRESS"|"COMPLETED"|"CANCELLED" }`
- **Behavior:** a USER may only update the status of a task assigned to them (`403` otherwise). ADMIN/STAFF may update any task's status.

---

## Dashboard (`/api/dashboard`)

### `GET /api/dashboard/admin`
- **Required role:** ADMIN
- **Response 200 data:** `{ totalUsers, totalStaff, activeUsers, inactiveUsers, totalTasks, pendingTasks, inProgressTasks, completedTasks }`

### `GET /api/dashboard/staff`
- **Required role:** STAFF
- **Response 200 data:** `{ totalUsers, tasksCreated, pendingTasks, inProgressTasks, completedTasks, recentTasks: Task[] }`

### `GET /api/dashboard/user`
- **Required role:** USER
- **Response 200 data:** `{ myTasks, pendingTasks, inProgressTasks, completedTasks, overdueTasks }`

---

## Profile (`/api/profile`)

**Required role:** authenticated (any role) — always operates on the currently logged-in user.

### `GET /api/profile`
- **Response 200:** the current user's full profile.

### `PUT /api/profile`
- **Body:** any of `{ "firstName", "lastName", "phone", "avatar" }`

### `POST /api/profile/change-password`
- **Body:** `{ "currentPassword": string, "newPassword": string }`
- **Errors:** `400` if current password is incorrect.

---

## Announcements (`/api/announcements`)

**Required role:** authenticated (any role) to view; ADMIN or STAFF to post, edit, or delete.

### `GET /api/announcements`
- **Auth:** any authenticated role (Admin, Staff, User all see the same feed)
- **Query params:** `page`, `limit`
- **Response 200:** paginated list, newest first, each populated with `createdBy` (`firstName`, `lastName`, `email`, `role`).

### `POST /api/announcements`
- **Required role:** ADMIN, STAFF
- **Body:** `{ "title": string, "content": string }`
- **Response 201:** the created announcement.

### `PUT /api/announcements/:id`
- **Required role:** ADMIN, STAFF, and must be the original author **unless** the caller is ADMIN (Admin can edit any announcement; Staff can only edit their own).
- **Body:** any of `{ "title", "content" }`
- **Errors:** `403` if a STAFF user tries to edit another author's announcement.

### `DELETE /api/announcements/:id`
- Same ownership rule as `PUT` above.

---

## Health Check

### `GET /api/health`
- **Auth:** None
- **Response 200:** `{ "success": true, "message": "Server is healthy" }`
- Used to verify the server is running; not part of the application's functional API.

# Database

TaskFlow uses MongoDB with three collections, managed via Mongoose schemas.

## User Model (`server/src/models/User.ts`)

| Field | Type | Notes |
|---|---|---|
| `firstName` | String | Required |
| `lastName` | String | Required |
| `email` | String | Required, unique, lowercased |
| `password` | String | Required, bcrypt-hashed, `select: false` (excluded from queries by default) |
| `role` | String enum | `ADMIN` \| `STAFF` \| `USER`, default `USER` |
| `phone` | String | Optional |
| `avatar` | String | Optional (URL) |
| `isActive` | Boolean | Default `true`; `false` = deactivated, cannot log in |
| `createdAt` / `updatedAt` | Date | Added automatically via `{ timestamps: true }` |

**Behavior:**
- A `pre("save")` hook hashes `password` with bcrypt whenever it's set or changed.
- An instance method `comparePassword(candidate)` wraps `bcrypt.compare` for login and password-change flows.
- `email` has a unique index, enforced at the database level — duplicate signups return `409 Conflict`.

Admin, Staff, and User accounts are all stored in this **single collection**, differentiated only by the `role` field. This avoids duplicating near-identical schemas for what is conceptually the same entity (a person who can log in).

## Task Model (`server/src/models/Task.ts`)

| Field | Type | Notes |
|---|---|---|
| `title` | String | Required |
| `description` | String | Required |
| `assignedTo` | ObjectId → User | Required; the user responsible for the task |
| `createdBy` | ObjectId → User | Required; the Admin/Staff who created it |
| `priority` | String enum | `LOW` \| `MEDIUM` \| `HIGH` \| `URGENT`, default `MEDIUM` |
| `status` | String enum | `TODO` \| `IN_PROGRESS` \| `COMPLETED` \| `CANCELLED`, default `TODO` |
| `dueDate` | Date | Required |
| `createdAt` / `updatedAt` | Date | Added automatically via `{ timestamps: true }` |

**Relationships:**
- `Task.assignedTo` and `Task.createdBy` are both references to `User._id`, populated with `firstName`, `lastName`, and `email` when tasks are fetched, so the frontend never needs a separate lookup.

**Constraint enforced at the controller level:** `assignedTo` must reference a `User` document with `role: "USER"`. This isn't expressible as a plain Mongoose schema-level constraint (Mongoose refs don't support conditional population targets), so it's checked explicitly in `taskController.createTask`/`updateTask` before the write — see [role-permissions.md](./role-permissions.md).

## Announcement Model (`server/src/models/Announcement.ts`)

| Field | Type | Notes |
|---|---|---|
| `title` | String | Required |
| `content` | String | Required |
| `createdBy` | ObjectId → User | Required; the Admin/Staff who posted it |
| `createdAt` / `updatedAt` | Date | Added automatically via `{ timestamps: true }` |

Announcements are visible to every authenticated role, but only ADMIN and STAFF can create them; editing/deleting is further restricted to the original author unless the caller is ADMIN (see [role-permissions.md](./role-permissions.md)).

## Indexes

- `User.email` — unique index (declared via `unique: true` in the schema), used on every login and for enforcing no duplicate accounts.
- `Task.{ assignedTo, status }` — compound index, since the most common query pattern is "show me this user's tasks filtered by status" (used by the User dashboard and task list).

## Why No More Collections?

A separate `Staff` or `Admin` collection was deliberately avoided — it would require duplicating the User schema and complicate authentication (which collection do I check on login?). A single `User` collection with a `role` enum keeps the data model — and the authentication logic — simple, while still supporting role-scoped API endpoints (see [database.md](./database.md) → [api-documentation.md](./api-documentation.md)).

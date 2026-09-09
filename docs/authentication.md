# Authentication

## Overview

TaskFlow uses stateless JWT-based authentication. There are no server-side sessions — every protected request carries a signed JSON Web Token in its `Authorization` header, which the server verifies on each call.

## Login

`POST /api/auth/login` accepts an email and password.

1. The server looks up the user by email.
2. If the account is deactivated (`isActive: false`), the login is rejected with `403`.
3. The submitted password is compared against the stored bcrypt hash using `bcrypt.compare`.
4. On success, a JWT is signed containing `{ userId, role }` and returned alongside the user's public profile, including a `mustChangePassword` flag.

The frontend stores the token in `localStorage` and in Redux (`authSlice`), then redirects to the dashboard matching the user's role.

## Password Hashing

Passwords are never stored or compared in plain text.

- A Mongoose `pre("save")` hook on the `User` model (`server/src/models/User.ts`) automatically hashes the password with `bcrypt` (salt rounds: 10) whenever it is created or changed.
- The `password` field has `select: false` in the schema, so it is excluded from every query by default and must be explicitly requested with `.select("+password")` — which only the login and password-change code paths do.
- API responses never include the password field.

## Protected Routes

### Backend

Every route except `/api/auth/login` and `/api/health` is protected by the `authenticate` middleware (`server/src/middleware/auth.ts`), which:

1. Reads the `Authorization: Bearer <token>` header.
2. Verifies the token's signature and expiry with `jsonwebtoken`.
3. Loads the corresponding user from the database and checks `isActive`.
4. Attaches `{ userId, role }` to `req.user` for downstream middleware/controllers to use.

Role-specific routes additionally use `authorize("ADMIN", "STAFF", ...)`, which checks `req.user.role` against an allow-list and returns `403 Forbidden` otherwise.

### Frontend

- `ProtectedRoute` (`client/src/routes/ProtectedRoute.tsx`) redirects to `/login` if there is no authenticated user in Redux.
- `RoleRoute` (`client/src/routes/RoleRoute.tsx`) redirects to the user's own dashboard if they try to access a route reserved for another role.
- An Axios response interceptor (`client/src/services/api.ts`) automatically logs the user out and redirects to `/login` if any request returns `401 Unauthorized` (e.g. an expired token).

**Note:** the frontend route guards are a UX convenience only. The backend independently enforces every permission check, so a request that bypasses the UI (e.g. via curl or Postman) is rejected the same way — see [role-permissions.md](./role-permissions.md) and [testing.md](./testing.md).

## Logout

`POST /api/auth/logout` is a stateless no-op on the server (there is no session to invalidate). The frontend simply clears the token from `localStorage` and Redux and redirects to `/login`.

## Change Password

Two equivalent endpoints exist for changing your own password:

- `POST /api/auth/change-password`
- `POST /api/profile/change-password`

Both require the current password to be verified via `bcrypt.compare` before the new password is hashed and saved.

## Admin/Staff Password Reset

Admins can reset any staff or user's password; Staff can reset any user's password. These endpoints (`POST /api/users/:id/reset-password`, `POST /api/staff/:id/reset-password`) do **not** require the current password — they are privileged actions gated entirely by the `authorize` middleware, matching typical admin-panel behavior.

## Forced Password Change on First Login

Every account created by an Admin or Staff member (`POST /api/users`, `POST /api/staff`) is flagged with `mustChangePassword: true`. An admin-triggered password reset (above) sets the same flag, since it hands the user a new temporary password.

- **Backend enforcement:** the `requirePasswordFresh` middleware (`server/src/middleware/auth.ts`) sits behind `authenticate` on every resource route group (`/api/users`, `/api/staff`, `/api/tasks`, `/api/dashboard`, `/api/announcements`) — but not `/api/auth` or `/api/profile`. While the flag is set, any request to those routes is rejected with `403` and `code: "PASSWORD_RESET_REQUIRED"`, so a user cannot use the app until they change their password, even by calling the API directly.
- **Clearing the flag:** both `POST /api/auth/change-password` and `POST /api/profile/change-password` clear `mustChangePassword` after a successful change.
- **Frontend enforcement:** `ProtectedRoute` (`client/src/routes/ProtectedRoute.tsx`) redirects any user with `mustChangePassword: true` to `/reset-password` (`ForcePasswordResetPage`) regardless of the URL they try to visit, and redirects away from `/reset-password` once the flag is cleared. The Axios interceptor also catches `PASSWORD_RESET_REQUIRED` responses as a defense-in-depth fallback.
- Seeded development accounts (`server/src/seed/seed.ts`) do **not** have this flag set, so the documented dev credentials work immediately.

## User & Staff Limits

To keep the system within its intended scale, account creation is capped:

- Up to **100** accounts with role `USER`.
- Up to **15** accounts with role `STAFF`.

The limits are defined in `server/src/config/limits.ts` and checked against the total count of accounts for that role (active and inactive) in `userController.create`. Exceeding the cap returns `400` with a descriptive message; the Admin Dashboard shows current usage against each cap (e.g. `78 / 100`).

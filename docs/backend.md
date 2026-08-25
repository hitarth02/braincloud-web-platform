# Backend

The backend is a Node.js + Express + TypeScript REST API, following the layered flow described in [architecture.md](./architecture.md):

```text
routes → middleware → controllers → models → MongoDB
```

## App Setup (`server/src/app.ts`)

The Express app wires up, in order:

1. `cors` — restricted to the frontend's origin (`CLIENT_URL` env var).
2. `express.json()` — JSON body parsing.
3. `cookie-parser` and `morgan` (request logging, skipped in tests).
4. `/api/health` — a simple liveness check.
5. One router per resource, mounted under `/api/<resource>`.
6. `notFoundHandler` — catches unmatched routes.
7. `errorHandler` — centralized error handling (see below).

`server/src/server.ts` is the entry point: it connects to MongoDB (`config/db.ts`) and then starts the HTTP server.

## Middleware (`server/src/middleware/`)

- **`auth.ts`** — exports `authenticate` (verifies the JWT, loads the user, attaches `req.user`) and `authorize(...roles)` (checks `req.user.role` against an allow-list, returns `403` otherwise). See [authentication.md](./authentication.md).
- **`validate.ts`** — a factory that takes a Zod schema and returns an Express middleware validating `{ body, params, query }`, forwarding any `ZodError` to the error handler.
- **`errorHandler.ts`** — a single centralized error handler registered last in the middleware chain. It recognizes:
  - `ApiError` (a custom error class with a `statusCode`) — returned as-is.
  - `ZodError` — mapped to `400` with a readable message.
  - MongoDB duplicate-key errors (code `11000`) — mapped to `409`.
  - Anything else — logged and returned as a generic `500`.

## Controllers (`server/src/controllers/`)

Controllers contain the actual business logic and are wrapped in `asyncHandler` (`server/src/utils/asyncHandler.ts`) so any rejected promise is automatically forwarded to the error handler, without needing a `try/catch` in every function.

- **`authController`** — login, logout, get current user, change password.
- **`userController`** — exports `makeUserController(targetRole)`, a factory producing CRUD handlers scoped to a single role. Both `userRoutes.ts` (`targetRole: "USER"`) and `staffRoutes.ts` (`targetRole: "STAFF"`) use it, so User and Staff management share one implementation instead of two near-identical copies.
- **`taskController`** — CRUD + status update for tasks, including the row-level restriction that a USER can only see/modify their own assigned tasks.
- **`dashboardController`** — one aggregation function per role, each running its `countDocuments`/`find` calls in parallel via `Promise.all`.
- **`profileController`** — view/edit the currently logged-in user's own profile and password.

## Validation (`server/src/validators/`)

Every mutating endpoint validates its request body with a **Zod** schema before the controller runs. Schemas live next to the resource they validate (`authValidators.ts`, `userValidators.ts`, `taskValidators.ts`, `profileValidators.ts`), keeping validation rules easy to find and keep in sync with the frontend's mirrored Zod schemas.

## Consistent API Responses

Every successful response is shaped by `sendSuccess()` (`server/src/utils/apiResponse.ts`):

```json
{ "success": true, "message": "...", "data": { } }
```

Every error response — thrown as an `ApiError` or any other exception — is normalized by the centralized error handler into:

```json
{ "success": false, "message": "..." }
```

This means the frontend never needs to branch on error shape; it always reads `response.data.message`.

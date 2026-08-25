# Frontend

The frontend is a Vite-powered React + TypeScript single-page application, styled entirely with Tailwind CSS.

## Structure

See [project-structure.md](./project-structure.md) for the full folder layout. The key idea: pages call **services**, services call the **API**, and shared UI pieces live in **components** so pages stay focused on layout and data flow.

## Routing

`client/src/App.tsx` defines all routes using React Router. Routes are nested three levels deep:

```text
<ProtectedRoute>           — must be logged in
  <MainLayout>              — renders Sidebar + Navbar + <Outlet/>
    <RoleRoute roles=[...]> — must have one of the allowed roles
      <ActualPage/>
```

`ProtectedRoute` and `RoleRoute` (in `client/src/routes/`) are simple wrapper components that render `<Navigate/>` when the check fails, otherwise render `<Outlet/>` to continue rendering the nested route.

## State Management

Redux Toolkit is used **only** for authentication state (`client/src/store/authSlice.ts`) — the current user object and JWT token. This is the one piece of state that's genuinely needed across the whole app (every page needs to know who's logged in and what role they have).

Everything else (task lists, user lists, form state, pagination, search) is local component state via `useState`/`useEffect`, fetched directly from the relevant service on mount. A full global cache (e.g. RTK Query) was intentionally left out — for a project this size, local fetch-on-mount is simpler to read and just as correct.

## Services Layer

`client/src/services/api.ts` creates a single Axios instance with two interceptors:

- **Request interceptor** — attaches `Authorization: Bearer <token>` from `localStorage` to every outgoing request.
- **Response interceptor** — on any `401` response, clears the stored session and redirects to `/login`.

Each resource (`authService`, `userService`/`staffService`, `taskService`, `dashboardService`, `profileService`) wraps its endpoints in typed functions, so pages never construct URLs or handle raw Axios responses directly.

## Reusable Components

`client/src/components/` contains the building blocks used across every page:

- `Button`, `FormInput`, `Card`, `Modal`, `ConfirmDialog` — generic UI primitives.
- `Badge` (+ `roleBadgeColor`/`statusBadgeColor`/`priorityBadgeColor` helpers) — consistent colored labels for roles, task status, and priority.
- `StatCard` — the icon + number + label cards used on every dashboard.
- `Pagination`, `LoadingSpinner`, `EmptyState` — shared list-page states.

## Shared Pages Across Roles

Rather than building separate list/form pages per role, a few pages are parameterized and reused:

- **`UserManagementPage`** — renders `/admin/users`, `/admin/staff`, and `/staff/users` by taking a `service` (which REST base path to call) and `basePath` (which route to navigate to) as props.
- **`UserFormPage`** — the create/edit form for both Users and Staff, same pattern.
- **`TaskManagementPage`** / **`TaskDetailPage`** — shared across Admin, Staff, and User task views via `canCreate`/`canManage` boolean props that toggle which actions are shown.

This keeps the UI consistent and avoids near-duplicate components per role.

## Forms & Validation

Forms use plain controlled `useState` (no form library) with **Zod** schemas mirroring the backend validators, parsed on submit via `schema.safeParse(...)`. Field-level errors are rendered under each input; a failed submission never reaches the API.

## Feedback & Empty States

- **Toasts** (`react-hot-toast`) confirm every successful mutation and surface API error messages.
- **Loading states** (`LoadingSpinner`) show while data is being fetched.
- **Empty states** (`EmptyState`) render when a list has no results, with contextual copy.
- **Confirmation dialogs** (`ConfirmDialog`) gate destructive actions like deactivating a user or deleting a task.

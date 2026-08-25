# Testing

## Automated Tests

A small integration test suite lives at `server/src/tests/rbac.test.ts`, written with **Node's built-in test runner** (`node:test` + `node:assert/strict`) — no extra testing framework was added, keeping the dependency list minimal for a college project.

The suite makes real HTTP requests (via the global `fetch`) against a running instance of the API and a freshly seeded database, covering:

- **Authentication** — admin/staff/user login succeed; an invalid password is rejected with `401`.
- **Authorization (RBAC)** — a USER is rejected (`403`) from creating users, viewing staff, and creating tasks; a STAFF is rejected (`403`) from viewing staff and the admin dashboard; a STAFF can view users and their own dashboard; a USER can view their own tasks.
- **Row-level task access** — a task assigned to one user cannot be opened by a different user (`403`), even though both are authenticated.
- **Task assignment restriction** — attempting to create a task with `assignedTo` set to an ADMIN account is rejected (`400`); tasks can only ever be assigned to `USER`-role accounts.
- **Announcements** — a USER can view the announcement feed but cannot post (`403`); a STAFF cannot delete another author's announcement (`403`); an ADMIN can delete any announcement.

### Running the Tests

```bash
cd server
npm run seed   # ensure a clean, known dataset
npm run dev    # start the API in one terminal
npm test       # run the suite in another terminal
```

Expected output: all 9 assertions pass (`# pass 9`, `# fail 0`).

Because the suite exercises the real database, run `npm run seed` again afterward if you want to reset to a clean state (it creates one test task and deletes it as part of the run).

## Manual Verification Performed

In addition to the automated suite, the full checklist below was manually verified against the running API using `curl` during development:

| Check | Result |
|---|---|
| Admin / Staff / User login | ✅ Pass |
| Invalid login rejected | ✅ Pass (401) |
| Change password | ✅ Pass |
| Admin: create/edit/deactivate staff | ✅ Pass |
| Admin: create/edit user, reset password | ✅ Pass |
| Admin: view all tasks | ✅ Pass |
| Staff: create/edit user | ✅ Pass |
| Staff: create task, assign to user | ✅ Pass |
| Staff: view/update task | ✅ Pass |
| User: view own tasks, update status | ✅ Pass |
| User: view/edit own profile, change password | ✅ Pass |
| USER → `POST /api/users` | ✅ Rejected (403) |
| USER → `POST /api/tasks` | ✅ Rejected (403) |
| USER → `GET /api/staff` | ✅ Rejected (403) |
| STAFF → `GET /api/staff` | ✅ Rejected (403) |
| STAFF → `GET /api/dashboard/admin` | ✅ Rejected (403) |
| USER → another user's task | ✅ Rejected (403) |
| Assign task to a STAFF/ADMIN account | ✅ Rejected (400) |
| Admin/Staff: post announcement | ✅ Pass |
| USER: view announcements | ✅ Pass |
| USER → `POST /api/announcements` | ✅ Rejected (403) |
| STAFF → delete another author's announcement | ✅ Rejected (403) |

These checks confirm restrictions are enforced on the **backend API itself**, not just hidden in the UI.

## Type Checking & Build

Both projects are verified to compile cleanly before every release:

```bash
# Backend
cd server && npx tsc --noEmit

# Frontend
cd client && npm run build   # runs `tsc -b && vite build`
```

## What Isn't Covered

Frontend component tests (e.g. React Testing Library) were not added, to keep the project's scope aligned with a college assignment. The frontend was verified via a successful production build (`vite build`) and strict TypeScript compilation, plus a code-level review of every page against the API contract above. A full interactive click-through of every page in a live browser was not completed during the original build session due to a local browser-automation tooling issue — it's recommended to run `npm run dev` in both `client/` and `server/` and manually click through each role's flows once before a viva or demo. See [future-improvements.md](./future-improvements.md) for what could be added if this project were extended.

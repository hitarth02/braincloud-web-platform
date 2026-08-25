You are a senior full-stack developer helping me build a **college-level MERN stack project**.

Build the application from scratch. Keep the implementation **simple, clean, understandable, and maintainable**.

This is a college project, so **DO NOT over-engineer it**. I want a project that is easy to understand, demonstrate, explain in a viva, and extend later.

---

# 1. Project Overview

Build a **Role-Based User & Task Management System** using:

### Frontend
- React
- TypeScript
- Tailwind CSS
- React Router
- Axios
- Redux Toolkit if state management is actually useful

### Backend
- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT
- bcrypt

### Styling

Use **Tailwind CSS** for the complete UI.

Create a clean, modern, responsive SaaS-style interface.

Do NOT introduce unnecessary UI libraries unless there is a strong reason.

---

# 2. Keep the Architecture Simple

Do NOT create an unnecessarily complicated enterprise architecture.

Avoid things like:

- Repository pattern
- CQRS
- Microservices
- Event-driven architecture
- Multiple unnecessary abstraction layers
- Complicated dependency injection
- Kubernetes
- Docker
- Docker Compose
- Redis
- Message queues

Use a straightforward structure:

```text
Frontend
React Components
      ↓
API Services
      ↓
Express REST API
      ↓
Controllers
      ↓
Mongoose Models
      ↓
MongoDB
```

The backend can use:

```text
routes
controllers
models
middleware
utils
config
```

That's enough.

---

# 3. Project Structure

Use a simple structure similar to:

```text
project/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── store/
│   │   ├── hooks/
│   │   ├── types/
│   │   ├── utils/
│   │   └── App.tsx
│   │
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   └── package.json
│
├── docs/
│
├── .gitignore
├── .env.example
└── README.md
```

You can adjust the structure slightly if necessary, but keep it simple.

---

# 4. User Roles

There are three roles:

```text
ADMIN
STAFF
USER
```

## ADMIN

Admin has full access.

Admin can:

- Login
- View dashboard
- Create staff
- Edit staff
- Delete/deactivate staff
- Reset staff password
- View all users
- Create users
- Edit users
- Delete/deactivate users
- Reset user passwords
- View all tasks
- View task statistics
- Manage own profile
- Change own password

---

## STAFF

Staff can:

- Login
- View dashboard
- View users
- Create users
- Edit users
- Deactivate users
- Reset user passwords
- View user profiles
- Create tasks
- Assign tasks to users
- View tasks
- Update task status
- Manage own profile
- Change own password

Staff cannot:

- Manage admins
- Manage other staff
- Access admin-only pages
- Access admin-only APIs

---

## USER

User can:

- Login
- View dashboard
- View tasks assigned to them
- Open task details
- Update their task status
- Manage their own profile
- Change their password

User cannot:

- Create users
- Manage staff
- Manage admins
- Create tasks
- Assign tasks
- View other users' tasks

---

# 5. Authentication

Implement a complete authentication flow.

Create:

```text
/login
```

Login should contain:

- Email
- Password
- Login button
- Loading state
- Validation
- Error messages

Implement:

- JWT authentication
- bcrypt password hashing
- Protected routes
- Authentication middleware
- Role-based authorization middleware
- Logout
- Change password
- Admin/staff password reset

Do not store passwords in plain text.

Use environment variables for:

```text
MONGODB_URI
JWT_SECRET
JWT_EXPIRES_IN
PORT
```

Create:

```text
.env.example
```

---

# 6. User Model

Create a simple User model:

```text
firstName
lastName
email
password
role
phone
avatar
isActive
createdAt
updatedAt
```

Role:

```text
ADMIN
STAFF
USER
```

Email must be unique.

Passwords must be hashed using bcrypt.

Never return the password field in API responses.

---

# 7. Task Model

Create:

```text
title
description
assignedTo
createdBy
priority
status
dueDate
createdAt
updatedAt
```

Priority:

```text
LOW
MEDIUM
HIGH
URGENT
```

Status:

```text
TODO
IN_PROGRESS
COMPLETED
CANCELLED
```

Relationships:

```text
createdBy → User
assignedTo → User
```

---

# 8. Pages

Create the following pages.

## Public

```text
/login
```

## Admin

```text
/admin/dashboard
/admin/staff
/admin/staff/create
/admin/staff/:id
/admin/users
/admin/users/create
/admin/users/:id
/admin/tasks
/admin/profile
```

## Staff

```text
/staff/dashboard
/staff/users
/staff/users/create
/staff/users/:id
/staff/tasks
/staff/tasks/create
/staff/tasks/:id
/staff/profile
```

## User

```text
/user/dashboard
/user/tasks
/user/tasks/:id
/user/profile
```

Use protected routes based on authentication and role.

---

# 9. Dashboard

Create different dashboards based on role.

## Admin Dashboard

Show:

- Total users
- Total staff
- Active users
- Inactive users
- Total tasks
- Pending tasks
- In-progress tasks
- Completed tasks

Use attractive Tailwind cards and simple charts if useful.

---

## Staff Dashboard

Show:

- Total users
- Tasks created
- Pending tasks
- In-progress tasks
- Completed tasks
- Recently created tasks

---

## User Dashboard

Show:

- My tasks
- Pending tasks
- In-progress tasks
- Completed tasks
- Overdue tasks

---

# 10. Task Management

Staff should have a simple task creation form:

```text
Title
Description
Assign To
Priority
Due Date
```

After creating the task:

```text
Staff
 ↓
Create Task
 ↓
Select User
 ↓
Assign Task
 ↓
User sees task on Dashboard
```

Users should be able to:

- See their assigned tasks
- Open task details
- Update status

Example:

```text
TODO
↓
IN_PROGRESS
↓
COMPLETED
```

---

# 11. User Management

Admin:

```text
Create Staff
Edit Staff
Delete/Deactivate Staff
Reset Password
```

Admin + Staff:

```text
Create User
Edit User
Deactivate User
Reset Password
View User
```

Create clean tables with:

- Search
- Pagination
- Status
- Role
- Actions

Keep pagination simple and server-side if practical.

---

# 12. Profile

All users should have:

```text
/profile
```

or role-specific profile pages.

Allow:

- View profile
- Edit first name
- Edit last name
- Edit phone
- Change password
- Upload/change avatar if you want to include it

Keep this implementation simple.

---

# 13. API

Create REST APIs.

Authentication:

```text
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/change-password
```

Users:

```text
GET    /api/users
POST   /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
POST   /api/users/:id/reset-password
```

Staff:

```text
GET    /api/staff
POST   /api/staff
GET    /api/staff/:id
PUT    /api/staff/:id
DELETE /api/staff/:id
POST   /api/staff/:id/reset-password
```

Tasks:

```text
GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/:id
PUT    /api/tasks/:id
DELETE /api/tasks/:id
PATCH  /api/tasks/:id/status
```

Dashboard:

```text
GET /api/dashboard/admin
GET /api/dashboard/staff
GET /api/dashboard/user
```

Profile:

```text
GET /api/profile
PUT /api/profile
POST /api/profile/change-password
```

Adjust endpoint structure if necessary, but keep it RESTful and simple.

---

# 14. Authorization

Implement a simple reusable middleware:

```text
authenticate
```

and:

```text
authorize
```

Example:

```text
authorize("ADMIN")
```

or:

```text
authorize("ADMIN", "STAFF")
```

Backend authorization is mandatory.

Do NOT rely only on hiding frontend buttons.

For example:

```text
USER → POST /api/users
```

must return:

```text
403 Forbidden
```

Similarly:

```text
STAFF → /api/staff
```

must be rejected.

A user should only be able to access tasks assigned to them.

---

# 15. UI Design

Use **Tailwind CSS**.

Create:

### Main layout

```text
┌───────────────────────────────────────────┐
│ Navbar                         Profile 👤  │
├────────────┬──────────────────────────────┤
│            │                              │
│ Sidebar    │        Page Content          │
│            │                              │
│ Dashboard  │                              │
│ Users      │                              │
│ Tasks      │                              │
│ Staff      │                              │
│ Profile    │                              │
│ Logout     │                              │
│            │                              │
└────────────┴──────────────────────────────┘
```

Sidebar items must change according to role.

Use:

- Cards
- Tables
- Forms
- Modals
- Badges
- Toast messages
- Loading states
- Empty states
- Confirmation dialogs

Make it look like a polished college project rather than a basic tutorial application.

---

# 16. Error Handling

Use consistent API responses.

Success:

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

Create centralized Express error handling.

---

# 17. Validation

Validate both frontend and backend.

Validate:

- Login
- Email
- Password
- User creation
- Staff creation
- Profile update
- Password change
- Task creation
- Task update

Keep validation simple.

You can use Zod, Joi, or express-validator.

Choose one and use it consistently.

---

# 18. Seed Data

Create a simple seed script.

It should create:

```text
1 Admin
2 Staff
5 Users
```

Example development credentials:

```text
Admin:
admin@example.com

Staff:
staff@example.com

User:
user@example.com
```

Use a common documented development password.

Make sure passwords are hashed.

Document the credentials in the README.

---

# 19. Documentation

Create a dedicated:

```text
docs/
```

folder.

Because this is a college project, keep the documentation **detailed but easy to understand**.

Use this structure:

```text
docs/
├── README.md
├── project-overview.md
├── tech-stack.md
├── project-structure.md
├── architecture.md
├── authentication.md
├── role-permissions.md
├── database.md
├── api-documentation.md
├── frontend.md
├── backend.md
├── setup.md
├── testing.md
└── future-improvements.md
```

### docs/README.md

Create a documentation index with links to all documents.

### project-overview.md

Explain:

- Project purpose
- Problem statement
- Features
- User roles
- Main workflows

### tech-stack.md

Explain:

- React
- TypeScript
- Tailwind CSS
- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcrypt
- Axios

Also explain briefly why each technology is being used.

### project-structure.md

Explain the frontend and backend folder structure.

### architecture.md

Explain:

```text
React
 ↓
Axios
 ↓
Express API
 ↓
Controllers
 ↓
Mongoose
 ↓
MongoDB
```

Use simple Mermaid diagrams where useful.

### authentication.md

Explain:

- Login
- JWT
- Password hashing
- Protected routes
- Logout
- Password change

### role-permissions.md

Create a permission matrix:

| Feature | Admin | Staff | User |
|---|---|---|---|
| Manage Staff | ✅ | ❌ | ❌ |
| Manage Users | ✅ | ✅ | ❌ |
| Create Task | ✅ | ✅ | ❌ |
| Assign Task | ✅ | ✅ | ❌ |
| View Own Tasks | ✅ | ✅ | ✅ |
| Update Task | ✅ | ✅ | ✅ |
| Own Profile | ✅ | ✅ | ✅ |

### database.md

Document:

- User model
- Task model
- Fields
- Relationships
- Important indexes

### api-documentation.md

Document **every API endpoint actually implemented**.

For every API include:

- Method
- URL
- Authentication
- Required role
- Parameters
- Request body
- Example request
- Example response
- Possible errors

### setup.md

Explain:

- Prerequisites
- Node.js version
- MongoDB setup
- Installation
- Environment variables
- Running frontend
- Running backend
- Seed database

### testing.md

Explain how to run available tests and what is covered.

### future-improvements.md

Mention possible future features such as:

- Notifications
- Email
- Comments
- Attachments
- Teams
- Activity logs
- Advanced permissions
- Real-time updates

Do not implement these unless required.

---

# 20. README.md

Create a professional root README.

Include:

```text
Project Name
Project Description
Features
Tech Stack
Screenshots placeholder
Project Structure
Installation
Environment Variables
Running the Project
Seed Data
API Documentation
Documentation
Future Improvements
```

Link to:

```text
/docs/README.md
```

---

# 21. No Docker

Do NOT create:

```text
Dockerfile
docker-compose.yml
.dockerignore
```

Do not add Docker-related documentation.

The project should run directly with Node.js and MongoDB.

---

# 22. Development Process

Do not generate everything blindly in one step.

First inspect the current directory.

Then:

### Phase 1

Create the project structure and initialize:

```text
client
server
docs
```

### Phase 2

Set up:

- React
- TypeScript
- Tailwind
- Express
- MongoDB
- Mongoose

### Phase 3

Implement:

- User model
- Authentication
- JWT
- Password hashing
- Middleware
- RBAC

### Phase 4

Implement:

- Admin
- Staff
- User management

### Phase 5

Implement:

- Task management
- Task assignment
- Task status

### Phase 6

Implement:

- Admin dashboard
- Staff dashboard
- User dashboard

### Phase 7

Implement:

- Profile
- Password change
- UI polish
- Loading/error states

### Phase 8

Implement:

- Seed script
- Validation
- Basic tests

### Phase 9

Create/update the complete `docs/` folder.

### Phase 10

Run:

- TypeScript checks
- Lint
- Tests
- Frontend build
- Backend startup

Fix any errors you encounter.

---

# 23. Important Rules

Keep this project simple.

DO:

- Write clean TypeScript
- Use reusable React components
- Use Tailwind
- Use clear naming
- Keep API structure understandable
- Keep business logic simple
- Comment complicated code
- Validate backend requests
- Protect APIs using RBAC
- Handle errors properly
- Keep documentation synchronized with the actual code

DO NOT:

- Add Docker
- Add Redis
- Add microservices
- Add Kubernetes
- Add unnecessary design patterns
- Add complicated abstractions
- Create unnecessary files
- Over-engineer the database
- Build features that were not requested

This should feel like a **well-engineered final-year/college MERN project**, not an enterprise platform.

---

# 24. Final Verification

Before declaring the project finished, actually test the following:

### Authentication

```text
Admin login              ✅
Staff login              ✅
User login               ✅
Invalid login            ❌
Logout                   ✅
Change password          ✅
```

### Admin

```text
Create staff             ✅
Edit staff               ✅
Delete/deactivate staff  ✅
Create user              ✅
Edit user                ✅
Reset user password      ✅
View tasks               ✅
```

### Staff

```text
Create user              ✅
Edit user                ✅
Create task              ✅
Assign task              ✅
View task                ✅
Update task              ✅
```

### User

```text
View own tasks            ✅
Update own task           ✅
View own profile          ✅
Change password           ✅
```

### Authorization

```text
User → Manage users       ❌
User → Create task        ❌
Staff → Manage staff      ❌
Staff → Admin dashboard   ❌
User → Other user's task  ❌
```

Verify these restrictions on the **backend API**, not just the frontend.

---

# 25. Final Output

When finished, tell me:

1. What was created
2. Final project structure
3. Tech stack
4. How to install
5. How to start frontend
6. How to start backend
7. MongoDB setup
8. Environment variables
9. Seed command
10. Development credentials
11. API documentation location
12. Documentation location
13. Tests performed
14. Any issues or limitations

Start by **inspecting the current directory**.

Do not start coding until you have briefly explained the proposed simple architecture and project structure.
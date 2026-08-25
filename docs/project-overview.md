# Project Overview

## Purpose

TaskFlow is a role-based user and task management system built as a college-level MERN stack project. It demonstrates a complete, production-style full-stack application — authentication, role-based access control (RBAC), CRUD operations, dashboards, and a polished SaaS-style UI — while remaining simple enough to explain in a viva and extend later.

## Problem Statement

Small teams and organizations need a lightweight way to:

- Manage user accounts with different levels of access.
- Assign and track work items (tasks) between team members.
- Give each person visibility only into what's relevant to their role.

TaskFlow solves this with a three-tier role system (Admin, Staff, User) layered over a simple task management workflow.

## Key Features

- **Authentication** — JWT-based login, logout, and password change, with bcrypt password hashing.
- **Role-Based Access Control** — Three roles (ADMIN, STAFF, USER) with distinct permissions enforced on both the frontend and backend.
- **User & Staff Management** — Create, edit, deactivate, and reset passwords for user and staff accounts.
- **Task Management** — Create tasks, assign them to users (never to Staff or Admin), track priority and due dates, and update status through a simple workflow (`TODO → IN_PROGRESS → COMPLETED`/`CANCELLED`).
- **Announcements** — Admin and Staff can post organization-wide announcements; every role, including User, can view the feed.
- **Role-Specific Dashboards** — Each role sees a dashboard tailored to what matters to them (system-wide stats for Admin, team stats for Staff, personal task stats for User).
- **Profile Management** — Every user can view and edit their own profile and change their password.
- **Polished UI** — A responsive, Tailwind CSS-based SaaS-style interface with cards, tables, modals, badges, toasts, and empty/loading states.

## User Roles

| Role | Summary |
|---|---|
| **ADMIN** | Full access — manages staff, users, and tasks; views system-wide statistics. |
| **STAFF** | Manages regular users and tasks (create, assign, track); cannot manage staff or admins. |
| **USER** | Views and updates only the tasks assigned to them, and manages their own profile. |

See [role-permissions.md](./role-permissions.md) for the complete permission matrix.

## Main Workflows

### Task Assignment Workflow

```text
Staff/Admin
     ↓
Create Task (title, description, priority, due date)
     ↓
Select a User to assign the task to
     ↓
Task appears on the assigned User's dashboard and task list
     ↓
User updates status: TODO → IN_PROGRESS → COMPLETED
```

### User Management Workflow

```text
Admin creates Staff accounts
     ↓
Admin/Staff create User accounts
     ↓
Users log in and are assigned tasks
     ↓
Admin/Staff can deactivate or reset passwords for accounts they manage
```

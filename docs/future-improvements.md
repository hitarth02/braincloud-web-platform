# Future Improvements

The following features were intentionally left out of scope to keep this a focused, explainable college project. They would be natural next steps if the project were extended:

- **Notifications** — in-app or push notifications when a task is assigned or its status changes.
- **Email** — welcome emails, password reset via email link instead of admin-triggered reset, task deadline reminders.
- **Comments** — a discussion thread on each task for the assignee and creator to communicate.
- **Attachments** — file uploads attached to tasks (would need object storage, e.g. S3-compatible storage).
- **Teams** — grouping users into teams/departments, with team-level dashboards.
- **Activity Logs** — an audit trail of who changed what and when (user edits, task status changes, password resets).
- **Advanced Permissions** — custom/configurable roles and per-resource permissions instead of a fixed three-role system.
- **Real-Time Updates** — WebSocket-based live updates so dashboards and task lists refresh instantly when another user makes a change, instead of on next page load.
- **Automated Frontend Tests** — component and integration tests with React Testing Library / Playwright.
- **Refresh Tokens** — short-lived access tokens with a separate refresh token flow, instead of a single long-lived JWT.

None of these are implemented, and none are required for the current feature set to work correctly.

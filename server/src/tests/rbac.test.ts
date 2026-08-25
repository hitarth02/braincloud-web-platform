/**
 * Basic integration tests using Node's built-in test runner (no extra
 * dependencies). Requires the dev server to be running against a freshly
 * seeded database: `npm run seed` then `npm run dev` in another terminal,
 * then `npm test` here. See docs/testing.md.
 */
import test from "node:test";
import assert from "node:assert/strict";

const BASE_URL = process.env.TEST_API_URL || "http://localhost:5000/api";
const DEV_PASSWORD = "Password@123";

const login = async (email: string, password: string) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json: any = await res.json();
  return { status: res.status, body: json };
};

const authedRequest = async (
  method: string,
  path: string,
  token: string,
  body?: unknown
): Promise<{ status: number; body: any }> => {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: await res.json() };
};

test("Authentication", async (t) => {
  await t.test("Admin login succeeds", async () => {
    const { status, body } = await login("admin@example.com", DEV_PASSWORD);
    assert.equal(status, 200);
    assert.equal(body.data.user.role, "ADMIN");
  });

  await t.test("Staff login succeeds", async () => {
    const { status, body } = await login("staff@example.com", DEV_PASSWORD);
    assert.equal(status, 200);
    assert.equal(body.data.user.role, "STAFF");
  });

  await t.test("User login succeeds", async () => {
    const { status, body } = await login("user@example.com", DEV_PASSWORD);
    assert.equal(status, 200);
    assert.equal(body.data.user.role, "USER");
  });

  await t.test("Invalid login is rejected", async () => {
    const { status } = await login("admin@example.com", "wrong-password");
    assert.equal(status, 401);
  });
});

test("Authorization (RBAC)", async () => {
  const staff = (await login("staff@example.com", DEV_PASSWORD)).body.data.token;
  const user = (await login("user@example.com", DEV_PASSWORD)).body.data.token;

  const cases: Array<[string, string, string, string, unknown?]> = [
    ["USER cannot create users", "POST", "/users", user],
    ["USER cannot view staff", "GET", "/staff", user],
    ["USER cannot create tasks", "POST", "/tasks", user],
    ["STAFF cannot view staff", "GET", "/staff", staff],
    ["STAFF cannot view admin dashboard", "GET", "/dashboard/admin", staff],
  ];

  for (const [label, method, path, token] of cases) {
    const { status } = await authedRequest(
      method,
      path,
      token,
      method === "GET" ? undefined : {}
    );
    assert.equal(status, 403, label);
  }

  const { status: usersOk } = await authedRequest("GET", "/users", staff);
  assert.equal(usersOk, 200, "STAFF can view users");

  const { status: staffDashOk } = await authedRequest("GET", "/dashboard/staff", staff);
  assert.equal(staffDashOk, 200, "STAFF can view own dashboard");

  const { status: userTasksOk } = await authedRequest("GET", "/tasks", user);
  assert.equal(userTasksOk, 200, "USER can view own tasks");
});

test("A user cannot access another user's task", async () => {
  const staff = (await login("staff@example.com", DEV_PASSWORD)).body.data.token;
  const userA = (await login("user@example.com", DEV_PASSWORD)).body.data.token;
  const userB = (await login("user2@example.com", DEV_PASSWORD)).body.data.token;

  const usersRes = await authedRequest("GET", "/users?limit=100", staff);
  const userAAccount = usersRes.body.data.items.find(
    (u: any) => u.email === "user@example.com"
  );

  const created = await authedRequest("POST", "/tasks", staff, {
    title: "Test task for RBAC check",
    description: "Created by automated test",
    assignedTo: userAAccount.id,
    priority: "LOW",
    dueDate: "2030-01-01",
  });
  assert.equal(created.status, 201, created.body.message);
  const taskId = created.body.data._id;

  const ownAccess = await authedRequest("GET", `/tasks/${taskId}`, userA);
  assert.equal(ownAccess.status, 200, "assignee can view their task");

  const otherAccess = await authedRequest("GET", `/tasks/${taskId}`, userB);
  assert.equal(otherAccess.status, 403, "a different user cannot view it");

  await authedRequest("DELETE", `/tasks/${taskId}`, staff);
});

test("Tasks can only be assigned to USER accounts", async () => {
  const admin = await login("admin@example.com", DEV_PASSWORD);
  const staff = admin.body.data.token;
  const staffId = admin.body.data.user.id;

  const rejected = await authedRequest("POST", "/tasks", staff, {
    title: "Should not be creatable",
    description: "Attempting to assign to an admin account",
    assignedTo: staffId,
    priority: "LOW",
    dueDate: "2030-01-01",
  });
  assert.equal(rejected.status, 400, "assigning a task to an ADMIN is rejected");
});

test("Announcements", async () => {
  const admin = (await login("admin@example.com", DEV_PASSWORD)).body.data.token;
  const staff = (await login("staff@example.com", DEV_PASSWORD)).body.data.token;
  const user = (await login("user@example.com", DEV_PASSWORD)).body.data.token;

  const created = await authedRequest("POST", "/announcements", admin, {
    title: "Automated test announcement",
    content: "Posted by the RBAC test suite",
  });
  assert.equal(created.status, 201, created.body.message);
  const id = created.body.data._id;

  const userView = await authedRequest("GET", "/announcements", user);
  assert.equal(userView.status, 200, "USER can view announcements");

  const userPost = await authedRequest("POST", "/announcements", user, {
    title: "x",
    content: "y",
  });
  assert.equal(userPost.status, 403, "USER cannot post announcements");

  const staffDeleteOthers = await authedRequest("DELETE", `/announcements/${id}`, staff);
  assert.equal(staffDeleteOthers.status, 403, "STAFF cannot delete another author's announcement");

  const adminDelete = await authedRequest("DELETE", `/announcements/${id}`, admin);
  assert.equal(adminDelete.status, 200, "ADMIN can delete any announcement");
});

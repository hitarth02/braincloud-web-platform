import { Router } from "express";
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
} from "../controllers/taskController";
import { authenticate, authorize, requirePasswordFresh } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from "../validators/taskValidators";

const router = Router();

router.use(authenticate, requirePasswordFresh);

router.get("/", getTasks);
router.get("/:id", getTaskById);
router.patch("/:id/status", validate(updateTaskStatusSchema), updateTaskStatus);

// Only ADMIN/STAFF may create, edit, or delete tasks; USER may only view and update status.
router.post("/", authorize("ADMIN", "STAFF"), validate(createTaskSchema), createTask);
router.put(
  "/:id",
  authorize("ADMIN", "STAFF"),
  validate(updateTaskSchema),
  updateTask
);
router.delete("/:id", authorize("ADMIN", "STAFF"), deleteTask);

export default router;

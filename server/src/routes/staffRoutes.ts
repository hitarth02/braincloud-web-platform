import { Router } from "express";
import { makeUserController } from "../controllers/userController";
import { authenticate, authorize, requirePasswordFresh } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
} from "../validators/userValidators";

const router = Router();
const controller = makeUserController("STAFF");

// Only ADMIN may manage staff accounts.
router.use(authenticate, requirePasswordFresh, authorize("ADMIN"));

router.get("/", controller.getAll);
router.post("/", validate(createUserSchema), controller.create);
router.get("/:id", controller.getById);
router.put("/:id", validate(updateUserSchema), controller.update);
router.delete("/:id", controller.remove);
router.post(
  "/:id/reset-password",
  validate(resetPasswordSchema),
  controller.resetPassword
);

export default router;

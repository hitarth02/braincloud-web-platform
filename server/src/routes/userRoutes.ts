import { Router } from "express";
import { makeUserController, reassignUserOwner } from "../controllers/userController";
import { authenticate, authorize, requirePasswordFresh } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
  reassignOwnerSchema,
} from "../validators/userValidators";

const router = Router();
const controller = makeUserController("USER");

router.use(authenticate, requirePasswordFresh, authorize("ADMIN", "STAFF"));

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

// Admin-only: hand a User off to a different Staff member.
router.put(
  "/:id/reassign",
  authorize("ADMIN"),
  validate(reassignOwnerSchema),
  reassignUserOwner
);

export default router;

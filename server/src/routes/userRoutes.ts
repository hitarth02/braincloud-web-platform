import { Router } from "express";
import { makeUserController } from "../controllers/userController";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
} from "../validators/userValidators";

const router = Router();
const controller = makeUserController("USER");

router.use(authenticate, authorize("ADMIN", "STAFF"));

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

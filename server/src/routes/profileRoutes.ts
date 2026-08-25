import { Router } from "express";
import {
  getProfile,
  updateProfile,
  changeOwnPassword,
} from "../controllers/profileController";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { updateProfileSchema } from "../validators/profileValidators";
import { changePasswordSchema } from "../validators/authValidators";

const router = Router();

router.use(authenticate);

router.get("/", getProfile);
router.put("/", validate(updateProfileSchema), updateProfile);
router.post(
  "/change-password",
  validate(changePasswordSchema),
  changeOwnPassword
);

export default router;

import { Router } from "express";
import {
  getAdminDashboard,
  getStaffDashboard,
  getUserDashboard,
} from "../controllers/dashboardController";
import { authenticate, authorize, requirePasswordFresh } from "../middleware/auth";

const router = Router();

router.use(authenticate, requirePasswordFresh);

router.get("/admin", authorize("ADMIN"), getAdminDashboard);
router.get("/staff", authorize("STAFF"), getStaffDashboard);
router.get("/user", authorize("USER"), getUserDashboard);

export default router;

import { Router } from "express";
import { getActivityLogs } from "../controllers/activityLogController";
import { authenticate, authorize, requirePasswordFresh } from "../middleware/auth";

const router = Router();

router.use(authenticate, requirePasswordFresh, authorize("ADMIN"));

// ?scope=auth restricts to LOGIN/LOGOUT only (navbar session log);
// default/?scope=all returns every logged action (admin activity feed).
router.get("/", getActivityLogs);

export default router;

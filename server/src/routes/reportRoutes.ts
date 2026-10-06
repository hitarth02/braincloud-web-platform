import { Router } from "express";
import { exportReport } from "../controllers/reportController";
import { authenticate, requirePasswordFresh } from "../middleware/auth";

const router = Router();

router.use(authenticate, requirePasswordFresh);

// Open to every authenticated role — the controller itself enforces who may
// export whose report (User: self only; Staff: any user or their own staff
// report; Admin: anyone), the same pattern taskController.getTasks uses for
// role-scoped filtering instead of a route-level authorize().
router.get("/export", exportReport);

export default router;

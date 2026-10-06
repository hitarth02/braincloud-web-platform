import { Router } from "express";
import {
  getMyProgressFeed,
  getTeamProgressFeed,
} from "../controllers/taskProgressController";
import { authenticate, authorize, requirePasswordFresh } from "../middleware/auth";

const router = Router();

router.use(authenticate, requirePasswordFresh);

// A USER's own progress notes across all their tasks (powers their profile feed).
router.get("/me", authorize("USER"), getMyProgressFeed);

// Every USER's progress notes, visible to any Staff or Admin (no ownership model).
router.get("/team", authorize("ADMIN", "STAFF"), getTeamProgressFeed);

export default router;

import { Router } from "express";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementController";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
} from "../validators/announcementValidators";

const router = Router();

router.use(authenticate);

// Every authenticated role (Admin, Staff, User) can view announcements.
router.get("/", getAnnouncements);

// Only Admin/Staff can post, edit, or delete announcements.
router.post(
  "/",
  authorize("ADMIN", "STAFF"),
  validate(createAnnouncementSchema),
  createAnnouncement
);
router.put(
  "/:id",
  authorize("ADMIN", "STAFF"),
  validate(updateAnnouncementSchema),
  updateAnnouncement
);
router.delete("/:id", authorize("ADMIN", "STAFF"), deleteAnnouncement);

export default router;

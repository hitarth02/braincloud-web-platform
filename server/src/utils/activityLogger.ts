import { ActivityLog, ActivityAction } from "../models/ActivityLog";
import { UserRole } from "../models/User";

/**
 * Writes one activity log entry. Fired-and-forgotten by every call site
 * (never awaited) so a logging failure can never break the actual request —
 * failures are swallowed here and only reach the console.
 */
export const logActivity = (
  actor: { userId: string; role: UserRole },
  action: ActivityAction,
  message: string
): void => {
  ActivityLog.create({
    actor: actor.userId,
    actorRole: actor.role,
    action,
    message,
  }).catch((err) => {
    console.error("Failed to write activity log:", err);
  });
};

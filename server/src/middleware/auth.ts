import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";
import { User, UserRole } from "../models/User";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: UserRole;
    mustChangePassword: boolean;
  };
}

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new ApiError(401, "Not authenticated");
    }

    const token = header.split(" ")[1];
    const payload = verifyToken(token);

    const user = await User.findById(payload.userId);
    if (!user || !user.isActive) {
      throw new ApiError(401, "User not found or inactive");
    }

    req.user = {
      userId: payload.userId,
      role: payload.role,
      mustChangePassword: user.mustChangePassword,
    };
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired token"));
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, "Forbidden: insufficient permissions"));
    }
    next();
  };
};

/**
 * Blocks access to app resources until a user forced to reset their
 * password (mustChangePassword) has done so. Applied to every protected
 * route group except /api/auth and /api/profile, so the user can still
 * reach the change-password endpoints while blocked everywhere else.
 */
export const requirePasswordFresh = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  if (req.user?.mustChangePassword) {
    return next(
      new ApiError(
        403,
        "You must change your password before continuing",
        "PASSWORD_RESET_REQUIRED"
      )
    );
  }
  next();
};

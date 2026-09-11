import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User';

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Unauthorized. User context missing.' },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          message: `Access denied. Role '${req.user.role}' is not authorized to access this resource. Requires one of: [${allowedRoles.join(', ')}]`,
        },
      });
    }

    next();
  };
};

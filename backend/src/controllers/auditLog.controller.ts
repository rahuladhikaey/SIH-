import { Request, Response, NextFunction } from 'express';
import { AuditLogService } from '../services/auditLog.service';

export class AuditLogController {
  public static async getLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = parseInt(req.query.skip as string) || 0;
      const action = req.query.action as string;
      const resource = req.query.resource as string;

      const filter: Record<string, any> = {};
      if (action) filter.action = action;
      if (resource) filter.resource = resource;

      const logs = await AuditLogService.getLogs(filter, limit, skip);

      res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  }
}

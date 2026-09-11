import { AuditLog, IAuditLog } from '../models/AuditLog';
import { logger } from '../utils/logger';

export interface LogActionParams {
  actorId?: string;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  resource: string;
  resourceId: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditLogService {
  public static async logAction(params: LogActionParams): Promise<IAuditLog> {
    try {
      const logEntry = await AuditLog.create({
        actorId: params.actorId,
        actorEmail: params.actorEmail,
        actorRole: params.actorRole,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId,
        details: params.details,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        timestamp: new Date(),
      });

      logger.info(`[AUDIT LOG] ${params.action} on ${params.resource}:${params.resourceId} by ${params.actorEmail || params.actorId || 'system'}`);
      return logEntry;
    } catch (error: any) {
      logger.error(`Failed to record audit log: ${error.message}`);
      // Return a non-persisted fallback doc structure or throw depending on strategy
      throw error;
    }
  }

  public static async getLogs(query: Record<string, any> = {}, limit = 50, skip = 0) {
    return AuditLog.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }
}

import { AuditLogService, LogActionParams } from '../services/auditLog.service';
import { AuditLog } from '../models/AuditLog';
import './setup';

describe('Audit Logging Unit Service Tests', () => {
  it('should format and construct valid AuditLog entry payload', () => {
    const params: LogActionParams = {
      actorId: '507f1f77bcf86cd799439011',
      actorEmail: 'doctor@medmitra.com',
      actorRole: 'doctor',
      action: 'VERIFY_CLINICAL_RECORD',
      resource: 'VerifiedRecord',
      resourceId: 'rec_998877',
      details: { doctorSignature: 'Dr. Gregory House' },
      ipAddress: '127.0.0.1',
    };

    const doc = new AuditLog({
      actorId: params.actorId,
      actorEmail: params.actorEmail,
      actorRole: params.actorRole,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      details: params.details,
      ipAddress: params.ipAddress,
      timestamp: new Date(),
    });

    const err = doc.validateSync();
    expect(err).toBeUndefined();
    expect(doc.action).toBe('VERIFY_CLINICAL_RECORD');
    expect(doc.resource).toBe('VerifiedRecord');
    expect(doc.actorEmail).toBe('doctor@medmitra.com');
  });
});

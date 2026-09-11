import { Consultation, ConsultationStatus, IConsultation } from '../models/Consultation';
import { AuditLogService } from './auditLog.service';
import { logger } from '../utils/logger';

export class InvalidStateTransitionError extends Error {
  public statusCode = 400;
  constructor(public currentStatus: string, public targetStatus: string) {
    super(
      `Illegal consultation status transition from '${currentStatus}' to '${targetStatus}'. Allowed sequence: CREATED -> PROCESSING -> AI_GENERATED -> PENDING_REVIEW -> DOCTOR_EDITED -> DOCTOR_APPROVED -> VERIFIED.`
    );
    this.name = 'InvalidStateTransitionError';
  }
}

export class ConsultationStateMachine {
  private static readonly ALLOWED_TRANSITIONS: Record<ConsultationStatus, ConsultationStatus[]> = {
    CREATED: ['PROCESSING'],
    PROCESSING: ['AI_GENERATED'],
    AI_GENERATED: ['PENDING_REVIEW'],
    PENDING_REVIEW: ['DOCTOR_EDITED', 'DOCTOR_APPROVED'],
    DOCTOR_EDITED: ['DOCTOR_APPROVED', 'PENDING_REVIEW'],
    DOCTOR_APPROVED: ['VERIFIED'],
    VERIFIED: [], // Terminal locked state
  };

  /**
   * Check if transition from currentStatus to targetStatus is valid
   */
  public static canTransition(currentStatus: ConsultationStatus, targetStatus: ConsultationStatus): boolean {
    const validTargets = this.ALLOWED_TRANSITIONS[currentStatus] || [];
    return validTargets.includes(targetStatus);
  }

  /**
   * Transition consultation to targetStatus and record audit log
   */
  public static async transition(
    consultationId: string,
    targetStatus: ConsultationStatus,
    actorContext: {
      actorId?: string;
      actorEmail?: string;
      actorRole?: string;
      details?: Record<string, any>;
      ipAddress?: string;
    } = {}
  ): Promise<IConsultation> {
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      throw new Error(`Consultation with ID '${consultationId}' not found.`);
    }

    const currentStatus = consultation.status;

    // Reject same-state re-assignment or invalid state transition
    if (currentStatus === targetStatus) {
      return consultation;
    }

    if (!this.canTransition(currentStatus, targetStatus)) {
      logger.warn(
        `[State Machine Error] Rejected transition for Consultation ${consultationId} from ${currentStatus} -> ${targetStatus}`
      );
      throw new InvalidStateTransitionError(currentStatus, targetStatus);
    }

    consultation.status = targetStatus;
    await consultation.save();

    logger.info(
      `[State Machine] Consultation ${consultationId} transitioned: ${currentStatus} -> ${targetStatus}`
    );

    // Mandated Audit Logging
    await AuditLogService.logAction({
      actorId: actorContext.actorId,
      actorEmail: actorContext.actorEmail,
      actorRole: actorContext.actorRole,
      action: `CONSULTATION_STATUS_CHANGE_${targetStatus}`,
      resource: 'Consultation',
      resourceId: consultation._id.toString(),
      details: {
        previousStatus: currentStatus,
        newStatus: targetStatus,
        ...actorContext.details,
      },
      ipAddress: actorContext.ipAddress,
    });

    return consultation;
  }
}

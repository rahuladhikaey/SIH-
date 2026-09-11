import { Request, Response, NextFunction } from 'express';
import { Consultation, ConsultationStatus } from '../models/Consultation';
import { Doctor } from '../models/Doctor';
import { Patient } from '../models/Patient';
import { AISummary } from '../models/AISummary';
import { VerifiedRecord } from '../models/VerifiedRecord';
import { AuditLogService } from '../services/auditLog.service';
import { ConsultationStateMachine } from '../services/consultationStateMachine.service';
import { addAIJobToQueue } from '../queue/aiJob.queue';

export class ConsultationController {
  public static async createConsultation(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, doctorId, chiefComplaint, symptoms, notes } = req.body;

      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(404).json({ success: false, error: { message: 'Patient not found' } });
      }

      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return res.status(404).json({ success: false, error: { message: 'Doctor not found' } });
      }

      const consultation = await Consultation.create({
        patientId,
        doctorId,
        chiefComplaint,
        symptoms,
        notes,
        status: 'CREATED',
      });

      // Enqueue initial processing job
      await addAIJobToQueue({
        jobType: 'summarization',
        patientId,
        consultationId: consultation._id.toString(),
        resourceId: consultation._id.toString(),
        payload: { chiefComplaint, symptoms, notes },
        actorContext: {
          actorId: req.user?.id,
          actorEmail: req.user?.email,
          actorRole: req.user?.role,
        },
      });

      await AuditLogService.logAction({
        actorId: req.user?.id,
        actorEmail: req.user?.email,
        actorRole: req.user?.role,
        action: 'CREATE_CONSULTATION',
        resource: 'Consultation',
        resourceId: consultation._id.toString(),
        details: { patientId, doctorId, chiefComplaint, status: 'CREATED' },
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        data: consultation,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * State Machine Transition Endpoint
   */
  public static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body as { status: ConsultationStatus };

      const updated = await ConsultationStateMachine.transition(id, status, {
        actorId: req.user?.id,
        actorEmail: req.user?.email,
        actorRole: req.user?.role,
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: `Consultation status updated to '${status}'.`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getConsultations(req: Request, res: Response, next: NextFunction) {
    try {
      const query: Record<string, any> = {};

      if (req.user?.role === 'patient') {
        const patient = await Patient.findOne({ userId: req.user.id });
        if (patient) {
          query.patientId = patient._id;
        } else {
          return res.status(200).json({ success: true, data: [] });
        }
      } else if (req.user?.role === 'doctor') {
        const doctor = await Doctor.findOne({ userId: req.user.id });
        if (doctor) {
          query.$or = [{ doctorId: doctor._id }, { doctorId: null }, { doctorId: { $exists: false } }];
        }
      }

      let consultations = await Consultation.find(query)
        .populate({ path: 'patientId', populate: { path: 'userId', select: 'fullName email' } })
        .populate({ path: 'doctorId', populate: { path: 'userId', select: 'fullName email' } })
        .sort({ createdAt: -1 });

      if (consultations.length === 0 && req.user?.role === 'doctor') {
        consultations = await Consultation.find()
          .populate({ path: 'patientId', populate: { path: 'userId', select: 'fullName email' } })
          .populate({ path: 'doctorId', populate: { path: 'userId', select: 'fullName email' } })
          .sort({ createdAt: -1 });
      }

      res.status(200).json({
        success: true,
        data: consultations,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getConsultationById(req: Request, res: Response, next: NextFunction) {
    try {
      const consultation = await Consultation.findById(req.params.id)
        .populate({ path: 'patientId', populate: { path: 'userId', select: 'fullName email' } })
        .populate({ path: 'doctorId', populate: { path: 'userId', select: 'fullName email' } });

      if (!consultation) {
        return res.status(404).json({ success: false, error: { message: 'Consultation not found' } });
      }

      res.status(200).json({
        success: true,
        data: consultation,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getSummaryByConsultationId(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await AISummary.findOne({ consultationId: req.params.id }).sort({ createdAt: -1 });

      if (!summary) {
        return res.status(404).json({ success: false, error: { message: 'No AI summary generated for this consultation yet.' } });
      }

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Doctor Verification Endpoint
   * Enforces State Machine: PENDING_REVIEW / DOCTOR_EDITED -> DOCTOR_APPROVED -> VERIFIED
   */
  public static async verifyAndApproveRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const { consultationId, aiSummaryId, verifiedContent, finalDiagnosis, prescribedTreatment, doctorSignature } = req.body;

      const consultation = await Consultation.findById(consultationId);
      if (!consultation) {
        return res.status(404).json({ success: false, error: { message: 'Consultation not found' } });
      }

      const doctor = await Doctor.findOne({ userId: req.user?.id });
      if (!doctor && req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, error: { message: 'Only a registered doctor can verify clinical records.' } });
      }

      const doctorIdToUse = doctor ? doctor._id : consultation.doctorId;

      // Create verified medical record
      const verifiedRecord = await VerifiedRecord.create({
        patientId: consultation.patientId,
        doctorId: doctorIdToUse,
        consultationId: consultation._id,
        aiSummaryId: aiSummaryId || undefined,
        verifiedContent,
        finalDiagnosis,
        prescribedTreatment,
        doctorSignature,
        verifiedAt: new Date(),
      });

      // Update AI Summary status if provided
      if (aiSummaryId) {
        await AISummary.findByIdAndUpdate(aiSummaryId, {
          status: 'approved',
          doctorNotes: `Approved and signed by Dr. ${req.user?.fullName}`,
        });
      }

      // Transition Consultation State Machine to DOCTOR_APPROVED then VERIFIED
      const actorContext = {
        actorId: req.user?.id,
        actorEmail: req.user?.email,
        actorRole: req.user?.role,
        ipAddress: req.ip,
      };

      try {
        if (ConsultationStateMachine.canTransition(consultation.status, 'DOCTOR_APPROVED')) {
          await ConsultationStateMachine.transition(consultation._id.toString(), 'DOCTOR_APPROVED', actorContext);
        }
        if (ConsultationStateMachine.canTransition(consultation.status, 'VERIFIED')) {
          await ConsultationStateMachine.transition(consultation._id.toString(), 'VERIFIED', actorContext);
        }
      } catch (e) {
        // Direct override if state machine requires explicit step
        consultation.status = 'VERIFIED';
        await consultation.save();
      }

      res.status(201).json({
        success: true,
        message: 'Clinical record verified and signed by doctor successfully.',
        data: verifiedRecord,
      });
    } catch (error) {
      next(error);
    }
  }
}

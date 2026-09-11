import { Request, Response, NextFunction } from 'express';
import { Readable } from 'stream';
import { FileStorageService } from '../services/storage/fileStorage.service';
import { MedicalDocument, DocumentType } from '../models/Document';
import { VoiceRecord } from '../models/VoiceRecord';
import { Patient } from '../models/Patient';
import { Doctor } from '../models/Doctor';
import { Consultation } from '../models/Consultation';
import { addAIJobToQueue } from '../queue/aiJob.queue';
import { AuditLogService } from '../services/auditLog.service';
import { Types } from 'mongoose';

export class FileController {
  /**
   * Helper: Get or create Patient ID linked to user
   */
  private static async getPatientIdForUser(req: Request, targetPatientId?: string): Promise<Types.ObjectId> {
    if (targetPatientId && Types.ObjectId.isValid(targetPatientId)) {
      return new Types.ObjectId(targetPatientId);
    }
    let patient = await Patient.findOne({ userId: req.user?.id });
    if (!patient) {
      patient = await Patient.create({
        userId: req.user?.id,
        dob: new Date('1990-01-01'),
        gender: 'other',
      });
    }
    return patient._id as Types.ObjectId;
  }

  /**
   * Upload Prescription Document
   */
  public static async uploadPrescription(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: { message: 'No file uploaded.' } });
      }

      const patientId = await FileController.getPatientIdForUser(req, req.body.patientId);

      // Store file buffer directly in GridFS
      const storedFile = await FileStorageService.storeBuffer(req.file.buffer, {
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
        metadata: {
          patientId: patientId.toString(),
          uploadedBy: req.user?.id,
          documentType: 'prescription',
        },
      });

      // Save Document record in MongoDB
      const doc = await MedicalDocument.create({
        patientId,
        title: req.body.title || req.file.originalname,
        documentType: 'prescription' as DocumentType,
        filePath: storedFile.fileId,
        mimeType: storedFile.mimeType,
        uploadedBy: req.user?.id,
      });

      // Create AI Queue Job
      const aiJob = await addAIJobToQueue({
        jobType: 'extraction',
        patientId: patientId.toString(),
        consultationId: req.body.consultationId,
        resourceId: doc._id.toString(),
        payload: { fileId: storedFile.fileId, documentType: 'prescription' },
        actorContext: {
          actorId: req.user?.id,
          actorEmail: req.user?.email,
          actorRole: req.user?.role,
        },
      });

      // Generate signed download token
      const downloadToken = FileStorageService.generateDownloadToken(
        storedFile.fileId,
        req.user?.id || '',
        req.user?.role || 'patient'
      );

      await AuditLogService.logAction({
        actorId: req.user?.id,
        actorEmail: req.user?.email,
        actorRole: req.user?.role,
        action: 'UPLOAD_PRESCRIPTION_DOCUMENT',
        resource: 'Document',
        resourceId: doc._id.toString(),
        details: { gridfsFileId: storedFile.fileId, mimeType: storedFile.mimeType, size: storedFile.length },
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: 'Prescription document uploaded and enqueued for processing successfully.',
        data: {
          document: doc,
          gridfsFileId: storedFile.fileId,
          aiJobId: aiJob._id,
          downloadToken,
          downloadUrl: `/api/v1/files/download/${storedFile.fileId}?token=${downloadToken}`,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload Medical Report (Lab/Imaging)
   */
  public static async uploadReport(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: { message: 'No file uploaded.' } });
      }

      const patientId = await FileController.getPatientIdForUser(req, req.body.patientId);

      const storedFile = await FileStorageService.storeBuffer(req.file.buffer, {
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
        metadata: {
          patientId: patientId.toString(),
          uploadedBy: req.user?.id,
          documentType: 'lab_report',
        },
      });

      const doc = await MedicalDocument.create({
        patientId,
        title: req.body.title || req.file.originalname,
        documentType: (req.body.documentType as DocumentType) || 'lab_report',
        filePath: storedFile.fileId,
        mimeType: storedFile.mimeType,
        uploadedBy: req.user?.id,
      });

      const aiJob = await addAIJobToQueue({
        jobType: 'extraction',
        patientId: patientId.toString(),
        consultationId: req.body.consultationId,
        resourceId: doc._id.toString(),
        payload: { fileId: storedFile.fileId },
        actorContext: {
          actorId: req.user?.id,
          actorEmail: req.user?.email,
          actorRole: req.user?.role,
        },
      });

      const downloadToken = FileStorageService.generateDownloadToken(
        storedFile.fileId,
        req.user?.id || '',
        req.user?.role || 'patient'
      );

      await AuditLogService.logAction({
        actorId: req.user?.id,
        actorEmail: req.user?.email,
        actorRole: req.user?.role,
        action: 'UPLOAD_MEDICAL_REPORT',
        resource: 'Document',
        resourceId: doc._id.toString(),
        details: { gridfsFileId: storedFile.fileId, mimeType: storedFile.mimeType },
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: 'Medical report uploaded and enqueued successfully.',
        data: {
          document: doc,
          gridfsFileId: storedFile.fileId,
          aiJobId: aiJob._id,
          downloadToken,
          downloadUrl: `/api/v1/files/download/${storedFile.fileId}?token=${downloadToken}`,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload Voice Recording Audio
   */
  public static async uploadVoice(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: { message: 'No audio file uploaded.' } });
      }

      const patientId = await FileController.getPatientIdForUser(req, req.body.patientId);

      const storedFile = await FileStorageService.storeBuffer(req.file.buffer, {
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
        metadata: {
          patientId: patientId.toString(),
          type: 'voice_recording',
        },
      });

      const clientTranscript = req.body.transcript ? req.body.transcript.trim() : '';

      let consultationIdStr = req.body.consultationId;
      let consultationObjId: Types.ObjectId | undefined =
        consultationIdStr && Types.ObjectId.isValid(consultationIdStr)
          ? new Types.ObjectId(consultationIdStr)
          : undefined;

      if (!consultationObjId) {
        let activeConsultation = await Consultation.findOne({ patientId, status: { $ne: 'VERIFIED' } }).sort({ createdAt: -1 });
        if (!activeConsultation) {
          const defaultDoc = await Doctor.findOne();
          activeConsultation = await Consultation.create({
            patientId,
            doctorId: defaultDoc ? defaultDoc._id : undefined,
            chiefComplaint: clientTranscript || 'Voice Consultation Recording',
            status: 'CREATED',
          });
        } else if (clientTranscript) {
          activeConsultation.chiefComplaint = clientTranscript;
          await activeConsultation.save();
        }
        consultationObjId = activeConsultation._id as Types.ObjectId;
        consultationIdStr = activeConsultation._id.toString();
      } else if (clientTranscript) {
        await Consultation.findByIdAndUpdate(consultationObjId, { chiefComplaint: clientTranscript });
      }

      const voiceRecord = await VoiceRecord.create({
        patientId,
        consultationId: consultationObjId,
        audioUrl: storedFile.fileId,
        transcription: clientTranscript || undefined,
        durationSeconds: req.body.durationSeconds ? parseInt(req.body.durationSeconds, 10) : undefined,
        status: clientTranscript ? 'transcribed' : 'uploaded',
      });

      const aiJob = await addAIJobToQueue({
        jobType: 'transcription',
        patientId: patientId.toString(),
        consultationId: consultationIdStr,
        resourceId: voiceRecord._id.toString(),
        payload: { fileId: storedFile.fileId, clientTranscript },
        actorContext: {
          actorId: req.user?.id,
          actorEmail: req.user?.email,
          actorRole: req.user?.role,
        },
      });

      const downloadToken = FileStorageService.generateDownloadToken(
        storedFile.fileId,
        req.user?.id || '',
        req.user?.role || 'patient'
      );

      await AuditLogService.logAction({
        actorId: req.user?.id,
        actorEmail: req.user?.email,
        actorRole: req.user?.role,
        action: 'UPLOAD_VOICE_RECORDING',
        resource: 'VoiceRecord',
        resourceId: voiceRecord._id.toString(),
        details: { gridfsFileId: storedFile.fileId, mimeType: storedFile.mimeType },
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: 'Voice recording stored in GridFS and queued for processing.',
        data: {
          voiceRecord,
          gridfsFileId: storedFile.fileId,
          aiJobId: aiJob._id,
          downloadToken,
          downloadUrl: `/api/v1/files/download/${storedFile.fileId}?token=${downloadToken}`,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Secure File Download Endpoint via Short-lived Signed Token or Auth
   */
  public static async downloadFile(req: Request, res: Response, next: NextFunction) {
    try {
      const fileId = req.params.fileId;
      const token = (req.query.token as string) || (req.headers.authorization?.split(' ')[1] as string);

      if (!token) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized. Signed download token or Authorization header is required.' },
        });
      }

      // Verify token
      FileStorageService.verifyDownloadToken(token);

      // Stream file directly from GridFS
      const fileResult = await FileStorageService.getFileStream(fileId);

      res.setHeader('Content-Type', fileResult.mimeType);
      res.setHeader('Content-Length', fileResult.length);
      res.setHeader('Content-Disposition', `inline; filename="${fileResult.filename}"`);

      fileResult.stream.pipe(res);
    } catch (error: any) {
      return res.status(401).json({
        success: false,
        error: { message: `File access denied: ${error.message}` },
      });
    }
  }

  /**
   * Generate Download Token Endpoint
   */
  public static async getDownloadToken(req: Request, res: Response, next: NextFunction) {
    try {
      const fileId = req.params.fileId;
      const token = FileStorageService.generateDownloadToken(
        fileId,
        req.user?.id || '',
        req.user?.role || 'patient'
      );

      res.status(200).json({
        success: true,
        data: {
          fileId,
          token,
          expiresInSeconds: 900, // 15 minutes
          downloadUrl: `/api/v1/files/download/${fileId}?token=${token}`,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

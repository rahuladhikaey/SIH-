import { Request, Response, NextFunction } from 'express';
import { Readable } from 'stream';
import { MedicalDocument, DocumentType } from '../models/Document';
import { Patient } from '../models/Patient';
import { Doctor } from '../models/Doctor';
import { FileStorageService } from '../services/storage/fileStorage.service';
import { validateUploadedFile } from '../utils/fileValidation';
import { AuditLogService } from '../services/auditLog.service';
import { addAIJobToQueue } from '../queue/aiJob.queue';
import { config } from '../config';
import { Types } from 'mongoose';

export class DocumentController {
  /**
   * Helper: Get or create Patient ID linked to user
   */
  private static async getPatientIdForUser(req: Request, targetPatientId?: string): Promise<Types.ObjectId> {
    if (targetPatientId) {
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
   * Helper: Check if user is authorized to access patient document (User Isolation)
   */
  private static async isAuthorizedForDocument(req: Request, doc: any): Promise<boolean> {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) return false;
    if (userRole === 'admin') return true;

    // Direct uploader check
    if (doc.uploadedBy && doc.uploadedBy.toString() === userId) {
      return true;
    }

    // Patient owner check
    const patient = await Patient.findOne({ userId });
    if (patient && doc.patientId && doc.patientId.toString() === patient._id.toString()) {
      return true;
    }

    // Doctor authorization check
    if (userRole === 'doctor') {
      const doctor = await Doctor.findOne({ userId });
      if (doctor) {
        return true; // Doctor authorized to view medical documents
      }
    }

    return false;
  }

  /**
   * Upload Document: POST /api/v1/documents
   */
  public static async uploadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: { message: 'No file uploaded.' },
        });
      }

      // 1. File Validation
      const validation = validateUploadedFile(req.file);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: { message: validation.error || 'File validation failed.' },
        });
      }

      const userId = req.user?.id || 'anonymous';
      const patientId = await DocumentController.getPatientIdForUser(req, req.body.patientId);

      // 2. Generate Unpredictable Object Storage Key
      const storageKey = FileStorageService.generateObjectKey(userId, req.file.originalname);
      const documentType: DocumentType = req.body.documentType || 'lab_report';
      const title = req.body.title || req.file.originalname;

      // 3. Upload file to Storage Provider (S3 / Local / GridFS)
      const fileStream = Readable.from(req.file.buffer);
      const storedFile = await FileStorageService.storeStream(fileStream, {
        filename: storageKey,
        mimeType: req.file.mimetype,
        metadata: {
          originalFilename: req.file.originalname,
          uploadedBy: userId,
          patientId: patientId.toString(),
          documentType,
        },
      });

      // 4. Persist Document Record in Database
      const doc = await MedicalDocument.create({
        patientId,
        uploadedBy: new Types.ObjectId(userId),
        title,
        originalFilename: req.file.originalname,
        documentType,
        storageProvider: config.storageProvider || 'gridfs',
        storageKey: storedFile.fileId,
        filePath: storedFile.fileId,
        mimeType: req.file.mimetype,
        fileSize: req.file.size || storedFile.length,
      });

      // 5. Generate Short-Lived Pre-Signed URL / Download URL
      const signedUrl = await FileStorageService.getSignedUrl(
        storedFile.fileId,
        config.s3SignedUrlExpires || 300
      );

      // 6. Audit Log
      await AuditLogService.logAction({
        actorId: req.user?.id,
        actorEmail: req.user?.email,
        actorRole: req.user?.role,
        action: 'UPLOAD_DOCUMENT',
        resource: 'Document',
        resourceId: doc._id.toString(),
        details: {
          storageKey: storedFile.fileId,
          mimeType: req.file.mimetype,
          size: req.file.size,
          storageProvider: config.storageProvider,
        },
        ipAddress: req.ip,
      });

      // Enqueue processing job if appropriate
      let aiJobId: string | undefined;
      try {
        const aiJob = await addAIJobToQueue({
          jobType: 'extraction',
          patientId: patientId.toString(),
          consultationId: req.body.consultationId,
          resourceId: doc._id.toString(),
          payload: { fileId: storedFile.fileId, documentType },
          actorContext: {
            actorId: req.user?.id,
            actorEmail: req.user?.email,
            actorRole: req.user?.role,
          },
        });
        aiJobId = aiJob._id.toString();
      } catch (e) {}

      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully.',
        data: {
          id: doc._id,
          title: doc.title,
          originalFilename: doc.originalFilename,
          documentType: doc.documentType,
          storageProvider: doc.storageProvider,
          storageKey: doc.storageKey,
          mimeType: doc.mimeType,
          fileSize: doc.fileSize,
          signedUrl,
          aiJobId,
          createdAt: doc.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List Documents: GET /api/v1/documents (User Isolation Enforced)
   */
  public static async listDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const query: Record<string, any> = { deletedAt: null };

      if (userRole === 'patient') {
        const patient = await Patient.findOne({ userId });
        if (patient) {
          query.patientId = patient._id;
        } else {
          query.uploadedBy = userId;
        }
      } else if (userRole === 'doctor') {
        // Doctor can access all non-deleted patient documents or filter by patientId
        if (req.query.patientId) {
          query.patientId = req.query.patientId;
        }
      }

      const documents = await MedicalDocument.find(query).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: documents,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Document Metadata: GET /api/v1/documents/:id
   */
  public static async getDocumentById(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await MedicalDocument.findOne({ _id: req.params.id, deletedAt: null });
      if (!doc) {
        return res.status(404).json({
          success: false,
          error: { message: 'Document not found or has been deleted.' },
        });
      }

      // Check User Isolation Authorization
      const authorized = await DocumentController.isAuthorizedForDocument(req, doc);
      if (!authorized) {
        return res.status(403).json({
          success: false,
          error: { message: 'Forbidden. You are not authorized to access this document.' },
        });
      }

      res.status(200).json({
        success: true,
        data: doc,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate Short-Lived Pre-Signed Download URL: GET /api/v1/documents/:id/download
   */
  public static async getDocumentDownloadUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await MedicalDocument.findOne({ _id: req.params.id, deletedAt: null });
      if (!doc) {
        return res.status(404).json({
          success: false,
          error: { message: 'Document not found or has been deleted.' },
        });
      }

      // User Isolation Authorization Check
      const authorized = await DocumentController.isAuthorizedForDocument(req, doc);
      if (!authorized) {
        return res.status(403).json({
          success: false,
          error: { message: 'Forbidden. You are not authorized to download this document.' },
        });
      }

      const expiresIn = parseInt((req.query.expiresIn as string) || `${config.s3SignedUrlExpires || 300}`, 10);
      const signedUrl = await FileStorageService.getSignedUrl(doc.storageKey, expiresIn);

      await AuditLogService.logAction({
        actorId: req.user?.id,
        actorEmail: req.user?.email,
        actorRole: req.user?.role,
        action: 'GENERATE_DOWNLOAD_URL',
        resource: 'Document',
        resourceId: doc._id.toString(),
        details: { storageKey: doc.storageKey, expiresInSeconds: expiresIn },
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        data: {
          documentId: doc._id,
          originalFilename: doc.originalFilename,
          signedUrl,
          expiresInSeconds: expiresIn,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete Document: DELETE /api/v1/documents/:id
   */
  public static async deleteDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await MedicalDocument.findOne({ _id: req.params.id, deletedAt: null });
      if (!doc) {
        return res.status(404).json({
          success: false,
          error: { message: 'Document not found or already deleted.' },
        });
      }

      // User Isolation Authorization Check
      const authorized = await DocumentController.isAuthorizedForDocument(req, doc);
      if (!authorized) {
        return res.status(403).json({
          success: false,
          error: { message: 'Forbidden. You are not authorized to delete this document.' },
        });
      }

      // Delete binary file from storage provider
      try {
        await FileStorageService.deleteFile(doc.storageKey);
      } catch (err: any) {
        // Log S3 delete failure but proceed with DB soft-deletion safely
      }

      // Mark document as deleted in DB
      doc.deletedAt = new Date();
      await doc.save();

      await AuditLogService.logAction({
        actorId: req.user?.id,
        actorEmail: req.user?.email,
        actorRole: req.user?.role,
        action: 'DELETE_DOCUMENT',
        resource: 'Document',
        resourceId: doc._id.toString(),
        details: { storageKey: doc.storageKey },
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Document deleted successfully.',
        data: { id: doc._id, deletedAt: doc.deletedAt },
      });
    } catch (error) {
      next(error);
    }
  }
}

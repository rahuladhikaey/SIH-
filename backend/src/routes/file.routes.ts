import { Router } from 'express';
import { FileController } from '../controllers/file.controller';
import { authenticate } from '../middleware/auth.middleware';
import { uploadSingleFile, handleMulterError } from '../middleware/upload.middleware';

const router = Router();

// Upload Endpoints (Require Auth)
router.post('/upload/prescription', authenticate, uploadSingleFile, handleMulterError, FileController.uploadPrescription);
router.post('/upload/report', authenticate, uploadSingleFile, handleMulterError, FileController.uploadReport);
router.post('/upload/voice', authenticate, uploadSingleFile, handleMulterError, FileController.uploadVoice);

// Download Endpoints
router.get('/download/:fileId', FileController.downloadFile);
router.get('/token/:fileId', authenticate, FileController.getDownloadToken);

export default router;

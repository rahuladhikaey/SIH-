import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { authenticate } from '../middleware/auth.middleware';
import { uploadSingleFile, handleMulterError } from '../middleware/upload.middleware';

const router = Router();

router.use(authenticate);

router.post('/', uploadSingleFile, handleMulterError, DocumentController.uploadDocument);
router.get('/', DocumentController.listDocuments);
router.get('/:id', DocumentController.getDocumentById);
router.get('/:id/download', DocumentController.getDocumentDownloadUrl);
router.delete('/:id', DocumentController.deleteDocument);

export default router;

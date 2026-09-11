import { Router } from 'express';
import { ExtractionController } from '../controllers/extraction.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/consultation/:consultationId', ExtractionController.getExtractionsByConsultation);

export default router;

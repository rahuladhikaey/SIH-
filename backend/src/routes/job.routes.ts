import { Router } from 'express';
import { JobController } from '../controllers/job.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/:jobId/status', JobController.getJobStatus);
router.get('/consultation/:consultationId/status', JobController.getConsultationStatus);

export default router;

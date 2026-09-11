import { Router } from 'express';
import { ConsultationController } from '../controllers/consultation.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { createConsultationSchema, verifyRecordSchema } from '../validators/consultation.validator';

const router = Router();

router.use(authenticate);

router.post('/', validateRequest(createConsultationSchema), ConsultationController.createConsultation);
router.get('/', ConsultationController.getConsultations);
router.get('/:id', ConsultationController.getConsultationById);
router.get('/:id/summary', ConsultationController.getSummaryByConsultationId);
router.patch('/:id/status', ConsultationController.updateStatus);
router.post('/verify', authorizeRoles('doctor', 'admin'), validateRequest(verifyRecordSchema), ConsultationController.verifyAndApproveRecord);

export default router;

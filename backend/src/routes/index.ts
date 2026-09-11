import { Router } from 'express';
import authRoutes from './auth.routes';
import patientRoutes from './patient.routes';
import doctorRoutes from './doctor.routes';
import consultationRoutes from './consultation.routes';
import auditLogRoutes from './auditLog.routes';
import fileRoutes from './file.routes';
import jobRoutes from './job.routes';
import extractionRoutes from './extraction.routes';
import documentRoutes from './document.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/doctors', doctorRoutes);
router.use('/consultations', consultationRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/files', fileRoutes);
router.use('/documents', documentRoutes);
router.use('/jobs', jobRoutes);
router.use('/extractions', extractionRoutes);

export default router;

import { Router } from 'express';
import { PatientController } from '../controllers/patient.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { createPatientSchema, updatePatientSchema } from '../validators/patient.validator';

const router = Router();

router.use(authenticate);

router.post('/', authorizeRoles('patient', 'doctor', 'admin'), validateRequest(createPatientSchema), PatientController.createPatient);
router.get('/', authorizeRoles('doctor', 'admin'), PatientController.getPatients);
router.get('/:id', PatientController.getPatientById);
router.put('/:id', validateRequest(updatePatientSchema), PatientController.updatePatient);
router.delete('/:id', authorizeRoles('admin'), PatientController.deletePatient);

export default router;

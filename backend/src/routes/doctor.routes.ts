import { Router } from 'express';
import { DoctorController } from '../controllers/doctor.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { createDoctorSchema, updateDoctorSchema } from '../validators/doctor.validator';

const router = Router();

router.use(authenticate);

router.post('/', authorizeRoles('doctor', 'admin'), validateRequest(createDoctorSchema), DoctorController.createDoctor);
router.get('/', DoctorController.getDoctors);
router.get('/:id', DoctorController.getDoctorById);
router.put('/:id', authorizeRoles('doctor', 'admin'), validateRequest(updateDoctorSchema), DoctorController.updateDoctor);
router.delete('/:id', authorizeRoles('admin'), DoctorController.deleteDoctor);

export default router;

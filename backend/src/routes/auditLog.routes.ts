import { Router } from 'express';
import { AuditLogController } from '../controllers/auditLog.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';

const router = Router();

router.use(authenticate);
router.get('/', authorizeRoles('doctor', 'admin'), AuditLogController.getLogs);

export default router;

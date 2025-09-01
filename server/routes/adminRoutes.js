import express from 'express';
import { adminController } from '../controllers/adminController.js';
import { adminMiddleware } from '../middleware.js';

const router = express.Router();

router.use(adminMiddleware);

router.get('/users', adminController.getAllUsers);
router.post('/users/:id/approve', adminController.approveUser);
router.put('/users/:id/role', adminController.updateUserRole);
router.get('/stats', adminController.getStats);

export default router;

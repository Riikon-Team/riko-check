import express from 'express';
import { adminController } from '../controllers/adminController.js';
import { authMiddleware, adminMiddleware } from '../middleware.js';

const router = express.Router();

// Apply auth middleware first, then admin middleware
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/users', adminController.getAllUsers);
router.post('/users/:id/approve', adminController.approveUser);
router.put('/users/:id/role', adminController.updateUserRole);
router.get('/stats', adminController.getStats);

export default router;

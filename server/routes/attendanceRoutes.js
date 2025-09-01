import express from 'express';
import { attendanceController } from '../controllers/attendanceController.js';
import { authMiddleware } from '../middleware.js';

const router = express.Router();

router.post('/:eventId', attendanceController.submitAttendance);
router.get('/:eventId', authMiddleware, attendanceController.getAttendance);
router.put('/:attendanceId/approve', authMiddleware, attendanceController.approveAttendance);
router.delete('/:attendanceId', authMiddleware, attendanceController.deleteAttendance);

export default router;

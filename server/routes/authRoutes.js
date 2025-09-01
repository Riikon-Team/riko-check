import express from 'express';
import { authController } from '../controllers/authController.js';

const router = express.Router();

router.post('/google', authController.googleAuth);
router.get('/user/:id', authController.getUser);

export default router;

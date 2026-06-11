import express from 'express';
const router = express.Router();
import { getAdminStats, getEmployeeStats } from '../controllers/dashboardController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.get('/admin', protect, admin, getAdminStats);
router.get('/employee', protect, getEmployeeStats);

export default router;

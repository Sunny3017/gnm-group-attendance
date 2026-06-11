import express from 'express';
const router = express.Router();
import { getAttendanceReport, getSalaryReport } from '../controllers/reportController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.get('/attendance', protect, admin, getAttendanceReport);
router.get('/salary', protect, admin, getSalaryReport);

export default router;

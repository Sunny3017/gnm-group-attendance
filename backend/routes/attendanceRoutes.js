import express from 'express';
const router = express.Router();
import {
  markAttendance,
  getMyAttendance,
  getAllAttendance,
  updateAttendance,
  createManualAttendance,
  markHalfDay,
} from '../controllers/attendanceController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.post('/mark', protect, markAttendance);
router.post('/halfday', protect, markHalfDay);
router.post('/manual', protect, admin, createManualAttendance);
router.get('/my', protect, getMyAttendance);
router.get('/', protect, admin, getAllAttendance);
router.put('/:id', protect, admin, updateAttendance);

export default router;

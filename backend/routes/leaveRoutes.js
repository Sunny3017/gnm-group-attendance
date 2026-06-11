import express from 'express';
const router = express.Router();
import {
  requestLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
} from '../controllers/leaveController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/')
  .post(protect, requestLeave)
  .get(protect, admin, getAllLeaves);

router.get('/my', protect, getMyLeaves);
router.put('/:id', protect, admin, updateLeaveStatus);

export default router;

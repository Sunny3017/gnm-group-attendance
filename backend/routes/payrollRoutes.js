import express from 'express';
const router = express.Router();
import {
  generatePayroll,
  getMyPayroll,
  getAllPayroll,
  downloadSalarySlip,
} from '../controllers/payrollController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.post('/generate', protect, admin, generatePayroll);
router.get('/my', protect, getMyPayroll);
router.get('/:id/slip', protect, downloadSalarySlip);
router.get('/', protect, admin, getAllPayroll);

export default router;

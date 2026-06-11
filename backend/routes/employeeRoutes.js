import express from 'express';
const router = express.Router();
import {
  addEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employeeController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../utils/uploadMiddleware.js';

router.route('/')
  .post(protect, admin, upload.single('profilePhoto'), addEmployee)
  .get(protect, admin, getEmployees);

router.route('/:id')
  .get(protect, getEmployeeById)
  .put(protect, admin, upload.single('profilePhoto'), updateEmployee)
  .delete(protect, admin, deleteEmployee);

export default router;

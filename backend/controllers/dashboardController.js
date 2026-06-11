import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Payroll from '../models/Payroll.js';
import { startOfMonth, endOfMonth } from 'date-fns';

// @desc    Get Admin Dashboard Stats
// @route   GET /api/dashboard/admin
// @access  Private/Admin
const getAdminStats = async (req, res, next) => {
  try {
    // 1. Permanent Cleanup: Remove any attendance/payroll records that don't have a valid employee anymore
    const validEmployeeIds = await Employee.find({}, '_id').then(emps => emps.map(e => e._id));
    await Attendance.deleteMany({ employee: { $nin: validEmployeeIds } });
    await Payroll.deleteMany({ employee: { $nin: validEmployeeIds } });
    await Leave.deleteMany({ employee: { $nin: validEmployeeIds } });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalEmployees = await Employee.countDocuments();
    
    // Use the cleaned up records for counts
    const presentToday = await Attendance.countDocuments({ date: today, status: 'Present' });
    const lateToday = await Attendance.countDocuments({ date: today, status: 'Late' });
    const halfDayToday = await Attendance.countDocuments({ date: today, status: 'Half-Day' });
    const absentToday = await Attendance.countDocuments({ date: today, status: 'Absent' });
    const onLeaveToday = await Attendance.countDocuments({ date: today, status: 'Leave' });

    // Monthly Salary Expense
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const payrolls = await Payroll.find({ month: currentMonth, year: currentYear });
    const totalSalaryExpense = payrolls.reduce((acc, p) => acc + p.finalSalary, 0);
    const totalPenalties = payrolls.reduce((acc, p) => acc + p.latePenaltyAmount, 0);

    // Stats for charts (e.g., last 7 days attendance)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const count = await Attendance.countDocuments({ date: d, status: { $in: ['Present', 'Late', 'Half-Day'] } });
      last7Days.push({ date: d.toLocaleDateString(), count });
    }

    res.json({
      totalEmployees,
      presentToday,
      lateToday,
      halfDayToday,
      absentToday,
      onLeaveToday,
      totalSalaryExpense,
      totalPenalties,
      attendanceChart: last7Days,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Employee Dashboard Stats
// @route   GET /api/dashboard/employee
// @access  Private
const getEmployeeStats = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      res.status(404);
      throw new Error('Employee profile not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const attendanceRecords = await Attendance.find({
      employee: employee._id,
      date: { $gte: startOfMonth(today), $lte: endOfMonth(today) }
    });

    const todayRecord = await Attendance.findOne({
      employee: employee._id,
      date: today
    });

    const presentDays = attendanceRecords.filter(a => a.status === 'Present').length;
    const lateDays = attendanceRecords.filter(a => a.status === 'Late').length;
    const halfDays = attendanceRecords.filter(a => a.status === 'Half-Day').length;
    const absentDays = attendanceRecords.filter(a => a.status === 'Absent').length;
    const leaveDays = attendanceRecords.filter(a => a.status === 'Leave').length;

    const payroll = await Payroll.findOne({ employee: employee._id, month: currentMonth, year: currentYear });

    res.json({
      presentDays,
      lateDays,
      halfDays,
      absentDays,
      leaveDays,
      currentMonthSalary: payroll ? payroll.finalSalary : 0,
      latePenalties: attendanceRecords.reduce((acc, a) => acc + (a.penaltyAmount || 0), 0),
      todayRecord,
    });
  } catch (error) {
    next(error);
  }
};

export { getAdminStats, getEmployeeStats };

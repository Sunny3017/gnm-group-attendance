import Payroll from '../models/Payroll.js';
import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';
import Leave from '../models/Leave.js';
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns';
import PDFDocument from 'pdfkit';

// @desc    Generate payroll for an employee for a specific month
// @route   POST /api/payroll/generate
// @access  Private/Admin
const generatePayroll = async (req, res, next) => {
  const { employeeId, month, year } = req.body;

  try {
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      res.status(404);
      throw new Error('Employee not found');
    }

    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(startDate);

    // Get attendance records for the month
    const attendanceRecords = await Attendance.find({
      employee: employee._id,
      date: { $gte: startDate, $lte: endDate },
    });

    // Get approved leaves for the month
    const leaveRecords = await Leave.find({
      employee: employee._id,
      status: 'Approved',
      $or: [
        { startDate: { $gte: startDate, $lte: endDate } },
        { endDate: { $gte: startDate, $lte: endDate } },
      ],
    });

    const totalWorkingDays = 30; // Standard for salary calculation
    let presentDaysCount = 0;
    let lateDays = 0;
    let halfDays = 0;
    let latePenaltyAmount = 0;
    let halfDayPenaltyAmount = 0;
    let extraLeaveDays = 0;
    let leaveDays = 0;

    // Days in month interval
    const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

    daysInMonth.forEach((day) => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const attendance = attendanceRecords.find(a => format(a.date, 'yyyy-MM-dd') === dayStr);
      const dayName = format(day, 'EEEE');
      
      if (attendance) {
        if (attendance.status === 'Present') {
          presentDaysCount += 1;
        } else if (attendance.status === 'Late') {
          lateDays++;
          presentDaysCount += 1;
          latePenaltyAmount += (attendance.latePenalty || 100);
          halfDayPenaltyAmount += (attendance.halfDayPenalty || 0);
        } else if (attendance.status === 'Half-Day') {
          halfDays++;
          presentDaysCount += 1; 
          latePenaltyAmount += (attendance.latePenalty || 0);
          halfDayPenaltyAmount += (attendance.halfDayPenalty || Math.round((employee.monthlySalary / 30) / 2));
        } else if (attendance.status === 'Leave') {
          leaveDays++;
        } else if (attendance.status === 'Absent') {
          extraLeaveDays++;
        }
      } else {
        // No attendance record found for this day
        if (dayName === employee.weeklyOff) {
          leaveDays++;
        } else {
          // Check if it's an approved leave in the Leave model
          const isApprovedLeave = leaveRecords.some(l => day >= l.startDate && day <= l.endDate);
          if (isApprovedLeave) {
            leaveDays++;
          } else {
            extraLeaveDays++;
          }
        }
      }
    });

    const dailySalary = employee.monthlySalary / 30;
    const leaveDeductionAmount = extraLeaveDays * dailySalary;
    const finalSalary = employee.monthlySalary - latePenaltyAmount - halfDayPenaltyAmount - leaveDeductionAmount;

    const payroll = await Payroll.findOneAndUpdate(
      { employee: employee._id, month, year },
      {
        totalWorkingDays,
        presentDays: presentDaysCount,
        lateDays,
        halfDays,
        leaveDays,
        extraLeaveDays,
        latePenaltyAmount,
        halfDayPenaltyAmount,
        leaveDeductionAmount,
        finalSalary: Math.round(Math.max(0, finalSalary)),
        status: 'Unpaid',
      },
      { upsert: true, new: true }
    );

    res.json(payroll);
  } catch (error) {
    next(error);
  }
};

// @desc    Get my payroll history
// @route   GET /api/payroll/my
// @access  Private
const getMyPayroll = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    const payroll = await Payroll.find({ employee: employee._id }).sort({ year: -1, month: -1 });
    res.json(payroll);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payroll (Admin)
// @route   GET /api/payroll
// @access  Private/Admin
const getAllPayroll = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    let query = {};
    if (month) query.month = month;
    if (year) query.year = year;

    const payroll = await Payroll.find(query)
      .populate('employee', 'fullName employeeId department monthlySalary')
      .sort({ year: -1, month: -1 });

    // Filter out records where the employee profile no longer exists
    const filteredPayroll = payroll.filter(record => record.employee !== null);
    
    res.json(filteredPayroll);
  } catch (error) {
    next(error);
  }
};

// @desc    Download Salary Slip
// @route   GET /api/payroll/:id/slip
// @access  Private
const downloadSalarySlip = async (req, res, next) => {
  try {
    const payroll = await Payroll.findById(req.params.id).populate('employee');
    if (!payroll) {
      res.status(404);
      throw new Error('Payroll record not found');
    }

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=salary_slip_${payroll.month}_${payroll.year}.pdf`);
    doc.pipe(res);

    doc.fontSize(25).text('GNM REAL ESTATE', { align: 'center' });
    doc.fontSize(15).text('Salary Slip', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Employee Name: ${payroll.employee.fullName}`);
    doc.text(`Employee ID: ${payroll.employee.employeeId}`);
    doc.text(`Month/Year: ${payroll.month}/${payroll.year}`);
    doc.text(`Designation: ${payroll.employee.designation}`);
    doc.moveDown();

    doc.text('--------------------------------------------------');
    doc.text(`Monthly Salary: ₹${payroll.employee.monthlySalary}`);
    if (payroll.latePenaltyAmount > 0) doc.text(`Late Penalties: -₹${payroll.latePenaltyAmount}`);
    if (payroll.halfDayPenaltyAmount > 0) doc.text(`Half-Day Penalties: -₹${payroll.halfDayPenaltyAmount}`);
    doc.text(`Leave Deductions: -₹${payroll.leaveDeductionAmount}`);
    doc.text('--------------------------------------------------');
    doc.fontSize(14).text(`Final Payable Salary: ₹${payroll.finalSalary}`, { bold: true });

    doc.end();
  } catch (error) {
    next(error);
  }
};

export { generatePayroll, getMyPayroll, getAllPayroll, downloadSalarySlip };

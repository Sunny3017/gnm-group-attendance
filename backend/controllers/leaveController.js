import Leave from '../models/Leave.js';
import Employee from '../models/Employee.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Request a leave
// @route   POST /api/leaves
// @access  Private
const requestLeave = async (req, res, next) => {
  const { startDate, endDate, reason } = req.body;

  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      res.status(404);
      throw new Error('Employee profile not found');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Identify if any of the days are Weekly Off
    const daysCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    let extraLeaves = 0;
    let weeklyOffLeaves = 0;

    for (let i = 0; i < daysCount; i++) {
      const currentDay = new Date(start);
      currentDay.setDate(start.getDate() + i);
      const dayName = currentDay.toLocaleDateString('en-US', { weekday: 'long' });

      if (dayName === employee.weeklyOff) {
        weeklyOffLeaves++;
      } else {
        extraLeaves++;
      }
    }

    const leave = await Leave.create({
      employee: employee._id,
      startDate: start,
      endDate: end,
      type: extraLeaves > 0 ? 'Extra' : 'WeeklyOff',
      reason,
      status: 'Pending',
    });

    // Notify Admin
    await Notification.create({
      recipient: await User.findOne({ role: 'Admin' }),
      message: `Leave request from ${employee.fullName} for ${startDate} to ${endDate}`,
      type: 'LeaveRequest',
    });

    res.status(201).json(leave);
  } catch (error) {
    next(error);
  }
};

// @desc    Get my leaves
// @route   GET /api/leaves/my
// @access  Private
const getMyLeaves = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    const leaves = await Leave.find({ employee: employee._id }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all leaves (Admin)
// @route   GET /api/leaves
// @access  Private/Admin
const getAllLeaves = async (req, res, next) => {
  try {
    const leaves = await Leave.find({})
      .populate('employee', 'fullName employeeId department')
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    next(error);
  }
};

// @desc    Update leave status (Admin)
// @route   PUT /api/leaves/:id
// @access  Private/Admin
const updateLeaveStatus = async (req, res, next) => {
  const { status } = req.body;

  try {
    const leave = await Leave.findById(req.params.id).populate('employee');
    if (leave) {
      leave.status = status;
      const updatedLeave = await leave.save();

      // Notify Employee
      await Notification.create({
        recipient: leave.employee.user,
        message: `Your leave request for ${leave.startDate.toLocaleDateString()} has been ${status}`,
        type: 'LeaveUpdate',
      });

      res.json(updatedLeave);
    } else {
      res.status(404);
      throw new Error('Leave request not found');
    }
  } catch (error) {
    next(error);
  }
};

export { requestLeave, getMyLeaves, getAllLeaves, updateLeaveStatus };

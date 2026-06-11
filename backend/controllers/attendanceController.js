import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';
import { parse, isAfter } from 'date-fns';
import { calculateDistance, OFFICE_LOCATION, ALLOWED_RADIUS_METERS, MAX_GPS_ACCURACY_METERS } from '../utils/locationUtils.js';

// @desc    Mark daily attendance
// @route   POST /api/attendance/mark
// @access  Private
const markAttendance = async (req, res, next) => {
  try {
    const { latitude, longitude, gpsAccuracy } = req.body;

    // Security: Prevent attendance marking if coordinates are missing
    if (latitude === undefined || longitude === undefined) {
      res.status(400);
      throw new Error('Location coordinates are required to mark attendance.');
    }

    // Security: Validate incoming latitude and longitude values
    if (isNaN(latitude) || isNaN(longitude)) {
      res.status(400);
      throw new Error('Invalid location coordinates.');
    }

    // Accuracy Validation: Reject if GPS accuracy is too low
    if (gpsAccuracy > MAX_GPS_ACCURACY_METERS) {
      res.status(400);
      throw new Error('Location accuracy is too low. Please move to an open area and try again.');
    }

    // Backend Validation: Verify distance from office coordinates
    const distance = calculateDistance(
      latitude,
      longitude,
      OFFICE_LOCATION.latitude,
      OFFICE_LOCATION.longitude
    );

    // If distance > 100 meters, return error
    if (distance > ALLOWED_RADIUS_METERS) {
      res.status(400);
      throw new Error('You are not near the GNM Office. Attendance cannot be marked.');
    }

    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      res.status(404);
      throw new Error('Employee profile not found');
    }

    // Get current time in IST (Asia/Kolkata)
    const now = new Date();
    const istOptions = { timeZone: 'Asia/Kolkata' };
    
    // Create today's date in IST
    const todayIST = new Date(now.toLocaleString('en-US', istOptions));
    todayIST.setHours(0, 0, 0, 0);

    const alreadyMarked = await Attendance.findOne({
      employee: employee._id,
      date: todayIST,
    });

    if (alreadyMarked) {
      res.status(400);
      throw new Error('Attendance already marked for today');
    }

    // Get check-in time in IST
    const checkInTimeStr = now.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Kolkata',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });

    // Attendance Rules (Late Arrival only) - Use IST for threshold
    const [hours, minutes] = checkInTimeStr.split(':').map(Number);
    const isLate = hours > 10 || (hours === 10 && minutes > 40);

    let status = 'Present';
    let latePenalty = 0;
    let totalPenalty = 0;

    if (isLate) {
      // After 10:40 AM IST: Late
      status = 'Late';
      latePenalty = 100;
      totalPenalty = latePenalty;
    }

    const attendance = await Attendance.create({
      employee: employee._id,
      date: todayIST,
      checkInTime: checkInTimeStr,
      status,
      originalStatus: status,
      penaltyAmount: totalPenalty,
      latePenalty,
      halfDayPenalty: 0,
      isHalfDay: false,
      latitude,
      longitude,
      distanceFromOffice: Math.round(distance),
      gpsAccuracy,
    });

    res.status(201).json(attendance);
  } catch (error) {
    next(error);
  }
};

// @desc    Get employee attendance history
// @route   GET /api/attendance/my
// @access  Private
const getMyAttendance = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      res.status(404);
      throw new Error('Employee profile not found');
    }
    const attendance = await Attendance.find({ employee: employee._id }).sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all attendance (Admin)
// @route   GET /api/attendance
// @access  Private/Admin
const getAllAttendance = async (req, res, next) => {
  try {
    const { status, employeeId, startDate, endDate } = req.query;
    let query = {};

    if (status) {
      const statusArray = Array.isArray(status) ? status : status.split(',');
      query.status = { $in: statusArray };
    }
    if (employeeId) {
      const emp = await Employee.findOne({ employeeId });
      if (emp) query.employee = emp._id;
    }
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const attendance = await Attendance.find(query)
      .populate('employee', 'fullName employeeId department')
      .sort({ date: -1 });

    // Filter out records where the employee profile no longer exists
    const filteredAttendance = attendance.filter(record => record.employee !== null);
    
    res.json(filteredAttendance);
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private/Admin
const updateAttendance = async (req, res, next) => {
  try {
    const { status, penaltyAmount, checkInTime, date, latePenalty, halfDayPenalty, isHalfDay } = req.body;
    const attendance = await Attendance.findById(req.params.id).populate('employee');

    if (!attendance) {
      res.status(404);
      throw new Error('Attendance record not found');
    }

    // If status changed and penalty not provided, recalculate penalty
    let finalPenalty = penaltyAmount;
    let newLatePenalty = latePenalty !== undefined ? latePenalty : attendance.latePenalty;
    let newHalfDayPenalty = halfDayPenalty !== undefined ? halfDayPenalty : attendance.halfDayPenalty;
    let newIsHalfDay = isHalfDay !== undefined ? isHalfDay : attendance.isHalfDay;
    
    // Auto-calculate late penalty based on checkInTime (after 09:00 is late)
    if (checkInTime && (latePenalty === undefined || status === 'Late')) {
      const [hours, minutes] = checkInTime.split(':').map(Number);
      if (hours > 9 || (hours === 9 && minutes > 0)) {
        newLatePenalty = 100;
      }
    }
    
    if (status && status !== attendance.status && (penaltyAmount === undefined || penaltyAmount === 0)) {
      if (status === 'Late') {
        // If we don't have latePenalty yet, set to 100
        if (newLatePenalty === 0) newLatePenalty = 100;
        newHalfDayPenalty = attendance.halfDayPenalty;
        finalPenalty = newLatePenalty + newHalfDayPenalty;
      } else if (status === 'Half-Day') {
        const dailySalary = attendance.employee.monthlySalary / 30;
        newHalfDayPenalty = Math.round(dailySalary / 2);
        // Keep existing late penalty if any
        finalPenalty = newLatePenalty + newHalfDayPenalty;
        newIsHalfDay = true;
      } else if (status === 'Present' || status === 'Leave') {
        newLatePenalty = 0;
        newHalfDayPenalty = 0;
        finalPenalty = 0;
        newIsHalfDay = false;
      }
    }

    // If penalty wasn't set, calculate it from late and half-day
    if (finalPenalty === undefined) {
      finalPenalty = newLatePenalty + newHalfDayPenalty;
    }

    attendance.status = status || attendance.status;
    attendance.penaltyAmount = finalPenalty;
    attendance.latePenalty = newLatePenalty;
    attendance.halfDayPenalty = newHalfDayPenalty;
    attendance.isHalfDay = newIsHalfDay;
    attendance.checkInTime = checkInTime || attendance.checkInTime;
    attendance.date = date || attendance.date;

    const updatedAttendance = await attendance.save();
    res.json(updatedAttendance);
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Create manual attendance record
// @route   POST /api/attendance/manual
// @access  Private/Admin
const createManualAttendance = async (req, res, next) => {
  try {
    // Perform cleanup of orphaned records first (Optional but helpful)
    await Attendance.deleteMany({ employee: null });
    
    const { employeeId, date, status, penaltyAmount, checkInTime, latePenalty, halfDayPenalty, isHalfDay } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      res.status(404);
      throw new Error('Employee not found');
    }

    // Check if attendance already exists for this date and employee
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const alreadyExists = await Attendance.findOne({
      employee: employeeId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (alreadyExists) {
      res.status(400);
      throw new Error('Attendance already exists for this date');
    }

    // Auto-calculate penalty if not provided and status is Late/Half-Day
    let finalPenalty = penaltyAmount;
    let newLatePenalty = latePenalty !== undefined ? latePenalty : 0;
    let newHalfDayPenalty = halfDayPenalty !== undefined ? halfDayPenalty : 0;
    let newIsHalfDay = isHalfDay !== undefined ? isHalfDay : false;
    
    // Auto-calculate late penalty based on checkInTime
    if (checkInTime && latePenalty === undefined) {
      const [hours, minutes] = checkInTime.split(':').map(Number);
      if (hours > 9 || (hours === 9 && minutes > 0)) {
        newLatePenalty = 100;
      }
    }
    
    if (penaltyAmount === 0 || penaltyAmount === undefined) {
      if (status === 'Late') {
        if (newLatePenalty === 0) newLatePenalty = 100;
        finalPenalty = newLatePenalty;
      } else if (status === 'Half-Day') {
        const dailySalary = employee.monthlySalary / 30;
        newHalfDayPenalty = Math.round(dailySalary / 2);
        newIsHalfDay = true;
        finalPenalty = newLatePenalty + newHalfDayPenalty;
      } else {
        finalPenalty = newLatePenalty + newHalfDayPenalty;
      }
    }

    const attendance = await Attendance.create({
      employee: employeeId,
      date: startOfDay,
      status,
      originalStatus: status,
      penaltyAmount: finalPenalty,
      latePenalty: newLatePenalty,
      halfDayPenalty: newHalfDayPenalty,
      isHalfDay: newIsHalfDay,
      checkInTime: checkInTime || '00:00',
      latitude: 0,
      longitude: 0,
      distanceFromOffice: 0,
      gpsAccuracy: 0
    });

    res.status(201).json(attendance);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark half-day (Manual button for employee)
// @route   POST /api/attendance/halfday
// @access  Private
const markHalfDay = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      res.status(404);
      throw new Error('Employee profile not found');
    }

    // Get today in IST (Asia/Kolkata)
    const now = new Date();
    const istOptions = { timeZone: 'Asia/Kolkata' };
    const todayIST = new Date(now.toLocaleString('en-US', istOptions));
    todayIST.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      employee: employee._id,
      date: todayIST,
    });

    const dailySalary = employee.monthlySalary / 30;
    const halfDayPenalty = Math.round(dailySalary / 2);

    if (existingAttendance) {
      // Update existing attendance record
      if (existingAttendance.isHalfDay) {
        res.status(400);
        throw new Error('Half-day already marked for today');
      }

      // Keep the original late penalty if present
      existingAttendance.isHalfDay = true;
      existingAttendance.halfDayPenalty = halfDayPenalty;
      existingAttendance.penaltyAmount = existingAttendance.latePenalty + halfDayPenalty;
      existingAttendance.status = 'Half-Day';
      
      const updatedAttendance = await existingAttendance.save();
      res.json(updatedAttendance);
    } else {
      // Create new half-day record
      const attendance = await Attendance.create({
        employee: employee._id,
        date: today,
        checkInTime: 'Half-Day-Manual',
        status: 'Half-Day',
        originalStatus: 'Half-Day',
        penaltyAmount: halfDayPenalty,
        latePenalty: 0,
        halfDayPenalty,
        isHalfDay: true,
        latitude: 0,
        longitude: 0,
        distanceFromOffice: 0,
        gpsAccuracy: 0,
      });

      res.status(201).json(attendance);
    }
  } catch (error) {
    next(error);
  }
};

export { markAttendance, getMyAttendance, getAllAttendance, updateAttendance, createManualAttendance, markHalfDay };

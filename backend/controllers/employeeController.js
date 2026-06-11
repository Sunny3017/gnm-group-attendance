import Employee from '../models/Employee.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Payroll from '../models/Payroll.js';

// @desc    Add new employee
// @route   POST /api/employees
// @access  Private/Admin
const addEmployee = async (req, res, next) => {
  const {
    fullName,
    employeeId,
    username,
    password,
    mobile,
    email,
    address,
    joiningDate,
    monthlySalary,
    designation,
    department,
    weeklyOff,
  } = req.body;

  try {
    const userExists = await User.findOne({ employeeId });
    if (userExists) {
      res.status(400);
      throw new Error('Employee ID already exists');
    }

    const mobileExists = await Employee.findOne({ mobile });
    if (mobileExists) {
      res.status(400);
      throw new Error('Mobile number already registered');
    }

    const user = await User.create({
      employeeId,
      username,
      password,
      role: 'Employee',
    });

    const employee = await Employee.create({
      user: user._id,
      fullName,
      employeeId,
      mobile,
      email,
      address,
      joiningDate,
      monthlySalary,
      designation,
      department,
      weeklyOff,
      profilePhoto: req.file ? `/uploads/${req.file.filename}` : '',
    });

    res.status(201).json(employee);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private/Admin
const getEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find({}).populate('user', 'username role');
    res.json(employees);
  } catch (error) {
    next(error);
  }
};

// @desc    Get employee by ID
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('user', 'username role');
    if (employee) {
      res.json(employee);
    } else {
      res.status(404);
      throw new Error('Employee not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private/Admin
const updateEmployee = async (req, res, next) => {
  const {
    fullName,
    mobile,
    email,
    address,
    monthlySalary,
    designation,
    department,
    weeklyOff,
  } = req.body;

  try {
    const employee = await Employee.findById(req.params.id);

    if (employee) {
      employee.fullName = fullName || employee.fullName;
      employee.mobile = mobile || employee.mobile;
      employee.email = email || employee.email;
      employee.address = address || employee.address;
      employee.monthlySalary = monthlySalary || employee.monthlySalary;
      employee.designation = designation || employee.designation;
      employee.department = department || employee.department;
      employee.weeklyOff = weeklyOff || employee.weeklyOff;
      if (req.file) {
        employee.profilePhoto = `/uploads/${req.file.filename}`;
      }

      const updatedEmployee = await employee.save();
      res.json(updatedEmployee);
    } else {
      res.status(404);
      throw new Error('Employee not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private/Admin
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (employee) {
      // 1. Delete associated login user account
      await User.findByIdAndDelete(employee.user);

      // 2. Delete all attendance records of this employee
      await Attendance.deleteMany({ employee: employee._id });

      // 3. Delete all leave records of this employee
      await Leave.deleteMany({ employee: employee._id });

      // 4. Delete all payroll records of this employee
      await Payroll.deleteMany({ employee: employee._id });

      // 5. Finally, delete the employee profile itself
      await Employee.findByIdAndDelete(req.params.id);

      res.json({ message: 'Employee and all associated data (Attendance, Leaves, Payroll, User Account) removed successfully' });
    } else {
      res.status(404);
      throw new Error('Employee not found');
    }
  } catch (error) {
    next(error);
  }
};

export { addEmployee, getEmployees, getEmployeeById, updateEmployee, deleteEmployee };

import User from '../models/User.js';
import Employee from '../models/Employee.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res, next) => {
  const { username, mobile, password, role } = req.body;

  console.log(`Login attempt: role=${role}, username=${username}, mobile=${mobile}`);

  try {
    let user;
    if (role === 'Admin') {
      // Case-insensitive search for admin username
      user = await User.findOne({ 
        username: { $regex: new RegExp(`^${username}$`, 'i') }, 
        role: 'Admin' 
      });
    } else {
      // Search for employee by mobile number
      const employee = await Employee.findOne({ mobile });
      
      if (employee) {
        user = await User.findById(employee.user);
      }
    }

    if (!user) {
      console.log('Login failed: User not found');
      res.status(401);
      throw new Error('Access Denied: User not found in system.');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log('Login failed: Password mismatch');
      res.status(401);
      throw new Error('Access Denied: Invalid security credentials.');
    }

    console.log(`Login successful for user: ${user.username || user.employeeId}`);

    res.json({
      _id: user._id,
      username: user.username,
      employeeId: user.employeeId,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

export { authUser };

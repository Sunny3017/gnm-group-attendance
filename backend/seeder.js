import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Employee from './models/Employee.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await User.deleteMany();
    await Employee.deleteMany();

    const adminUser = {
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || 'adminpassword',
      role: 'Admin',
    };

    await User.create(adminUser);

    const employeeUser = {
      employeeId: 'sonu123',
      password: 'sonu123',
      role: 'Employee',
    };

    const createdEmployeeUser = await User.create(employeeUser);

    await Employee.create({
      user: createdEmployeeUser._id,
      fullName: 'Sonu Chaudhary',
      employeeId: 'sonu123',
      mobile: '9876543210',
      email: 'sonu@example.com',
      joiningDate: new Date(),
      monthlySalary: 50000,
      designation: 'Senior Developer',
      department: 'IT',
      weeklyOff: 'Tuesday',
    });

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

importData();

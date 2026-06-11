import mongoose from 'mongoose';

const employeeSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  mobile: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  address: { type: String },
  joiningDate: { type: Date, required: true },
  monthlySalary: { type: Number, required: true },
  designation: { type: String, required: true },
  department: { type: String, required: true },
  profilePhoto: { type: String },
  weeklyOff: { type: String, enum: ['Tuesday', 'Wednesday'], required: true },
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;

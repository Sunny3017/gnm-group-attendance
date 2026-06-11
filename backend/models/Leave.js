import mongoose from 'mongoose';

const leaveSchema = mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  type: { type: String, enum: ['WeeklyOff', 'Extra'], required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  reason: { type: String },
}, { timestamps: true });

const Leave = mongoose.model('Leave', leaveSchema);
export default Leave;

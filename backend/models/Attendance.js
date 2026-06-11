import mongoose from 'mongoose';

const attendanceSchema = mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: Date, required: true },
  checkInTime: { type: String },
  status: { type: String, enum: ['Present', 'Late', 'Half-Day', 'Absent', 'Leave'], required: true },
  originalStatus: { type: String, enum: ['Present', 'Late', 'Half-Day', 'Absent', 'Leave'] },
  penaltyAmount: { type: Number, default: 0 },
  latePenalty: { type: Number, default: 0 },
  halfDayPenalty: { type: Number, default: 0 },
  isHalfDay: { type: Boolean, default: false },
  latitude: { type: Number },
  longitude: { type: Number },
  distanceFromOffice: { type: Number },
  gpsAccuracy: { type: Number },
}, { timestamps: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;

import mongoose from 'mongoose';

const payrollSchema = mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true },
  totalWorkingDays: { type: Number, default: 0 },
  presentDays: { type: Number, default: 0 },
  lateDays: { type: Number, default: 0 },
  halfDays: { type: Number, default: 0 },
  leaveDays: { type: Number, default: 0 },
  extraLeaveDays: { type: Number, default: 0 },
  latePenaltyAmount: { type: Number, default: 0 },
  halfDayPenaltyAmount: { type: Number, default: 0 },
  leaveDeductionAmount: { type: Number, default: 0 },
  finalSalary: { type: Number, required: true },
  status: { type: String, enum: ['Paid', 'Unpaid'], default: 'Unpaid' },
}, { timestamps: true });

const Payroll = mongoose.model('Payroll', payrollSchema);
export default Payroll;

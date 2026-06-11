import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Payroll from '../models/Payroll.js';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

// @desc    Export Attendance Report
// @route   GET /api/reports/attendance
// @access  Private/Admin
const getAttendanceReport = async (req, res, next) => {
  try {
    const { format, startDate, endDate, employeeId, status } = req.query;
    let query = {};

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    if (status) {
      const statusArray = Array.isArray(status) ? status : status.split(',');
      query.status = { $in: statusArray };
    }

    if (employeeId) {
      const employee = await Employee.findOne({ employeeId });
      if (employee) {
        query.employee = employee._id;
      } else {
        // If employee not found, return empty report instead of everything
        query.employee = null;
      }
    }

    const attendance = await Attendance.find(query).populate('employee', 'fullName employeeId department').sort({ date: -1 });

    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 30 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.pdf');
      doc.pipe(res);

      doc.fontSize(20).text('GNM Real Estate - Attendance Report', { align: 'center' });
      doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown();

      if (attendance.length === 0) {
        doc.fontSize(12).text('No records found for the selected filters.', { align: 'center' });
      } else {
        attendance.forEach((record) => {
          if (record.employee) {
            doc.fontSize(10).text(
              `${new Date(record.date).toLocaleDateString()} | ${record.employee.fullName} (${record.employee.employeeId}) | ${record.status} | Time: ${record.checkInTime || '--:--'} | Penalty: ₹${record.penaltyAmount || 0}`
            );
            doc.moveDown(0.5);
          }
        });
      }

      doc.end();
    } else if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Attendance');

      worksheet.columns = [
        { header: 'Employee Name', key: 'name', width: 20 },
        { header: 'Employee ID', key: 'id', width: 15 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Check-in Time', key: 'time', width: 15 },
        { header: 'Penalty', key: 'penalty', width: 15 },
      ];

      attendance.forEach((record) => {
        if (record.employee) {
          worksheet.addRow({
            name: record.employee.fullName,
            id: record.employee.employeeId,
            date: new Date(record.date).toLocaleDateString(),
            status: record.status,
            time: record.checkInTime || 'N/A',
            penalty: record.penaltyAmount || 0,
          });
        }
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.xlsx');

      await workbook.xlsx.write(res);
      res.end();
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Export Salary Report
// @route   GET /api/reports/salary
// @access  Private/Admin
const getSalaryReport = async (req, res, next) => {
  try {
    const { format, month, year } = req.query;
    const query = {};
    if (month) query.month = month;
    if (year) query.year = year;

    const payroll = await Payroll.find(query).populate('employee', 'fullName employeeId department monthlySalary');

    if (format === 'pdf') {
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=salary_report.pdf');
      doc.pipe(res);

      doc.fontSize(20).text('Salary Report', { align: 'center' });
      doc.moveDown();

      payroll.forEach((record) => {
        doc.fontSize(12).text(
          `${record.employee.fullName} (${record.employee.employeeId}) - Month: ${record.month}/${record.year} - Final Salary: ${record.finalSalary}`
        );
      });

      doc.end();
    } else if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Salary');

      worksheet.columns = [
        { header: 'Employee Name', key: 'name', width: 20 },
        { header: 'Employee ID', key: 'id', width: 15 },
        { header: 'Month/Year', key: 'monthYear', width: 15 },
        { header: 'Monthly Salary', key: 'salary', width: 15 },
        { header: 'Penalty', key: 'penalty', width: 15 },
        { header: 'Deduction', key: 'deduction', width: 15 },
        { header: 'Final Salary', key: 'final', width: 15 },
      ];

      payroll.forEach((record) => {
        worksheet.addRow({
          name: record.employee.fullName,
          id: record.employee.employeeId,
          monthYear: `${record.month}/${record.year}`,
          salary: record.employee.monthlySalary,
          penalty: record.latePenaltyAmount,
          deduction: record.leaveDeductionAmount,
          final: record.finalSalary,
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=salary_report.xlsx');

      await workbook.xlsx.write(res);
      res.end();
    }
  } catch (error) {
    next(error);
  }
};

export { getAttendanceReport, getSalaryReport };

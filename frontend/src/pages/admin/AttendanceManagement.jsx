import { useEffect, useState } from 'react';
import axios from 'axios';
import { Download, Edit2, Plus, X, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import API_BASE_URL from '../../utils/api.js';

const AttendanceManagement = () => {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncingPayroll, setSyncingPayroll] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    date: '',
    status: 'Present',
    penaltyAmount: 0,
    checkInTime: '09:00',
    latePenalty: 0,
    halfDayPenalty: 0,
    isHalfDay: false
  });

  const [filters, setFilters] = useState({
    status: [],
    startDate: '',
    endDate: '',
    employeeId: '',
  });

  const statusOptions = ['Present', 'Late', 'Half-Day', 'Absent', 'Leave'];

  const toggleStatus = (status) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  };

  const getDaysInMonth = (month, year) => {
    const date = new Date(year, month - 1, 1);
    const days = [];
    while (date.getMonth() === month - 1) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const calendarDays = viewMode === 'calendar' && filters.employeeId ? getDaysInMonth(selectedMonth, selectedYear) : [];

  const fetchEmployees = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const { data } = await axios.get(`${API_BASE_URL}/api/employees`, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      setEmployees(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendance = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      let queryParams = { ...filters };
      
      if (viewMode === 'calendar' && filters.employeeId) {
        const startDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString();
        const endDate = new Date(selectedYear, selectedMonth, 0).toISOString();
        queryParams = {
          employeeId: filters.employeeId,
          startDate,
          endDate
        };
      }

      if (queryParams.status && queryParams.status.length > 0) {
        queryParams.status = queryParams.status.join(',');
      } else {
        delete queryParams.status;
      }
      
      const { data } = await axios.get(`${API_BASE_URL}/api/attendance`, {
        params: queryParams,
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      setAttendance(data);
    } catch (err) {
      toast.error('Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [filters, viewMode, selectedMonth, selectedYear]);

  const handleOpenAddModal = (date = '') => {
    let dateStr = '';
    if (date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dateStr = `${year}-${month}-${day}`;
    }

    setFormData({
      employeeId: filters.employeeId || '',
      date: dateStr,
      status: 'Present',
      penaltyAmount: 0,
      checkInTime: '09:00',
      latePenalty: 0,
      halfDayPenalty: 0,
      isHalfDay: false
    });
    setShowAddModal(true);
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setFormData({
      status: record.status,
      penaltyAmount: record.penaltyAmount,
      checkInTime: record.checkInTime,
      date: new Date(record.date).toISOString().split('T')[0],
      latePenalty: record.latePenalty,
      halfDayPenalty: record.halfDayPenalty,
      isHalfDay: record.isHalfDay
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      await axios.put(`${API_BASE_URL}/api/attendance/${selectedRecord._id}`, formData, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      toast.success('Attendance updated');
      setShowEditModal(false);
      fetchAttendance();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleAddManual = async (e) => {
    e.preventDefault();
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      await axios.post(`${API_BASE_URL}/api/attendance/manual`, formData, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      toast.success('Attendance added manually');
      setShowAddModal(false);
      fetchAttendance();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add attendance');
    }
  };

  const handleSyncPayroll = async () => {
    if (!filters.employeeId) return;
    setSyncingPayroll(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const employee = employees.find(e => e.employeeId === filters.employeeId);
      if (!employee) throw new Error('Employee not found');

      await axios.post(`${API_BASE_URL}/api/payroll`, {
        employeeId: employee._id,
        month: selectedMonth,
        year: selectedYear
      }, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      toast.success('Payroll synchronized with updated attendance');
    } catch (err) {
      toast.error('Failed to sync payroll');
    } finally {
      setSyncingPayroll(false);
    }
  };

  const exportReport = async (format) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const queryParams = { ...filters, format };
      if (queryParams.status.length > 0) {
        queryParams.status = queryParams.status.join(',');
      } else {
        delete queryParams.status;
      }

      const response = await axios.get(`${API_BASE_URL}/api/reports/attendance`, {
        params: queryParams,
        headers: { Authorization: `Bearer ${userInfo.token}` },
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_report.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Export failed');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Attendance Records</h1>
          <p className="text-xs md:text-sm text-slate-500">View and manage employee daily attendance</p>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('list')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              List View
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'calendar' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Monthly Details
            </button>
          </div>
          <button 
            onClick={() => handleOpenAddModal()} 
            className="flex-1 md:flex-none bg-primary-600 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200 text-sm"
          >
            <Plus size={16} /> Add Manual
          </button>
          <button onClick={() => exportReport('pdf')} className="flex-1 md:flex-none bg-white border border-slate-200 px-4 py-2 rounded-xl flex items-center justify-center gap-2 font-medium text-slate-700 hover:bg-slate-50 transition-colors text-sm">
            <Download size={16} /> PDF
          </button>
        </div>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Employee</label>
            <select 
              className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm font-medium"
              value={filters.employeeId}
              onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}
            >
              <option value="">{viewMode === 'calendar' ? 'Select Employee to View Monthly' : 'All Employees'}</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp.employeeId}>
                  {emp.fullName} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>

          {viewMode === 'calendar' && (
            <>
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Month</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm font-medium"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Year</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm font-medium"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </>
          )}

          {viewMode === 'list' && (
            <>
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Start Date</label>
                <input type="date" className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                  value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">End Date</label>
                <input type="date" className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                  value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
              </div>
            </>
          )}
        </div>

        {viewMode === 'list' && (
          <div className="flex flex-col gap-2">
            <label className="block text-xs font-bold text-slate-400 uppercase">Status Filter</label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(status => (
                <button
                  key={status}
                  onClick={() => toggleStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    filters.status.includes(status)
                      ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-100'
                      : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-primary-300'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {viewMode === 'list' ? (
        <div className="space-y-8">
          {Object.entries(
            attendance
              .filter((item, index, self) => 
                // Deduplicate: strictly normalize date and check employeeId
                index === self.findIndex((t) => {
                  const tDate = new Date(t.date);
                  const iDate = new Date(item.date);
                  const tStr = `${tDate.getFullYear()}-${tDate.getMonth()}-${tDate.getDate()}`;
                  const iStr = `${iDate.getFullYear()}-${iDate.getMonth()}-${iDate.getDate()}`;
                  return t.employee?._id === item.employee?._id && tStr === iStr;
                })
              )
              .reduce((acc, record) => {
                const month = new Date(record.date).toLocaleString('default', { month: 'long', year: 'numeric' });
                if (!acc[month]) acc[month] = [];
                acc[month].push(record);
                return acc;
              }, {})
          ).map(([month, records]) => (
            <div key={month} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">{month}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600 whitespace-nowrap">Employee</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600 whitespace-nowrap">Date</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600 whitespace-nowrap">Check-in</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600 whitespace-nowrap">Status</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600 whitespace-nowrap">Penalty</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600 whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {records.filter(r => r.employee).map((record) => (
                      <tr key={record._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{record.employee?.fullName}</div>
                          <div className="text-xs text-slate-500">{record.employee?.employeeId}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{new Date(record.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-slate-600">{record.checkInTime || '--:--'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            record.status === 'Present' ? 'bg-green-100 text-green-700' :
                            record.status === 'Late' ? 'bg-yellow-100 text-yellow-700' :
                            record.status === 'Half-Day' ? 'bg-orange-100 text-orange-700' :
                            record.status === 'Absent' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {record.penaltyAmount > 0 ? (
                            <div className="space-y-1">
                              {record.latePenalty > 0 && (
                                <div className="text-xs font-bold text-red-600">Late: ₹{record.latePenalty}</div>
                              )}
                              {record.halfDayPenalty > 0 && (
                                <div className="text-xs font-bold text-orange-600">Half-Day: ₹{record.halfDayPenalty}</div>
                              )}
                              <div className="text-sm font-bold text-red-600">Total: ₹{record.penaltyAmount}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400">--</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => handleEdit(record)}
                            className="text-primary-600 hover:text-primary-800 p-2 hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          {attendance.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-100 shadow-sm">
              No attendance records found for the selected filters.
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {!filters.employeeId ? (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-100 shadow-sm">
              Please select an employee to view their monthly attendance details.
            </div>
          ) : (
            <>
              {/* Monthly Summary Card */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Present</div>
                  <div className="text-xl font-black text-brand-emerald">{attendance.filter(a => a.status === 'Present').length}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Late</div>
                  <div className="text-xl font-black text-brand-gold">{attendance.filter(a => a.status === 'Late').length}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Half-Day</div>
                  <div className="text-xl font-black text-orange-600">{attendance.filter(a => a.status === 'Half-Day').length}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Penalty</div>
                  <div className="text-xl font-black text-brand-rose">₹{attendance.reduce((acc, a) => acc + (a.penaltyAmount || 0), 0)}</div>
                </div>
                <div className="col-span-2 md:col-span-1 flex items-center">
                  <button 
                    onClick={handleSyncPayroll}
                    disabled={syncingPayroll}
                    className="w-full h-full bg-brand-navy text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-slate transition-all disabled:opacity-50 shadow-lg shadow-brand-navy/10"
                  >
                    <RefreshCw size={14} className={syncingPayroll ? 'animate-spin' : ''} />
                    {syncingPayroll ? 'Syncing...' : 'Sync Payroll'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {calendarDays.map((date) => {
                // Normalize date to YYYY-MM-DD for local timezone
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;

                const record = attendance.find(a => {
                  const aDate = new Date(a.date);
                  const ay = aDate.getFullYear();
                  const am = String(aDate.getMonth() + 1).padStart(2, '0');
                  const ad = String(aDate.getDate()).padStart(2, '0');
                  return `${ay}-${am}-${ad}` === dateStr;
                });
                
                return (
                  <div 
                    key={dateStr}
                    className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between min-h-[120px] ${
                      record 
                        ? 'bg-white border-slate-100 shadow-sm hover:shadow-md' 
                        : 'bg-slate-50 border-dashed border-slate-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase">{new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                        <div className="text-lg font-black text-brand-navy">{new Date(date).getDate()}</div>
                      </div>
                      {record && (
                        <button 
                          onClick={() => handleEdit(record)}
                          className="p-1 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                    </div>

                    {record ? (
                      <div className="mt-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          record.status === 'Present' ? 'bg-green-100 text-green-700' :
                          record.status === 'Late' ? 'bg-yellow-100 text-yellow-700' :
                          record.status === 'Half-Day' ? 'bg-orange-100 text-orange-700' :
                          record.status === 'Absent' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {record.status}
                        </span>
                        {record.penaltyAmount > 0 && (
                          <div className="mt-1">
                            <div className="text-[10px] font-bold text-red-600">Total: ₹{record.penaltyAmount}</div>
                            {record.latePenalty > 0 && record.halfDayPenalty > 0 && (
                              <div className="text-[8px] text-slate-400 font-bold">(Late + Half-Day)</div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleOpenAddModal(date)}
                        className="mt-2 flex items-center gap-1 text-[10px] font-black text-primary-600 uppercase tracking-widest hover:underline"
                      >
                        <Plus size={10} /> Add Record
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            </>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Edit Attendance</h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Status</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Half-Day">Half-Day</option>
                  <option value="Absent">Absent</option>
                  <option value="Leave">Leave</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Check-in Time</label>
                <input 
                  type="time" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  value={formData.checkInTime}
                  onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Late Penalty</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    value={formData.latePenalty}
                    onChange={(e) => setFormData({ ...formData, latePenalty: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Half-Day Penalty</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    value={formData.halfDayPenalty}
                    onChange={(e) => setFormData({ ...formData, halfDayPenalty: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Total Penalty</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  value={formData.penaltyAmount}
                  onChange={(e) => setFormData({ ...formData, penaltyAmount: Number(e.target.value) })}
                />
                <div className="text-[10px] text-slate-400 mt-1">Auto-calculated as late + half-day</div>
              </div>
              <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all mt-4">
                Update Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Add Manual Attendance</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleAddManual} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Employee</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.fullName} ({emp.employeeId})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Date</label>
                <input 
                  type="date" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Status</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Half-Day">Half-Day</option>
                  <option value="Absent">Absent</option>
                  <option value="Leave">Leave</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Check-in Time</label>
                <input 
                  type="time" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  value={formData.checkInTime}
                  onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Late Penalty</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    value={formData.latePenalty}
                    onChange={(e) => setFormData({ ...formData, latePenalty: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Half-Day Penalty</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    value={formData.halfDayPenalty}
                    onChange={(e) => setFormData({ ...formData, halfDayPenalty: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Total Penalty</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  value={formData.penaltyAmount}
                  onChange={(e) => setFormData({ ...formData, penaltyAmount: Number(e.target.value) })}
                />
                <div className="text-[10px] text-slate-400 mt-1">Auto-calculated as late + half-day</div>
              </div>
              <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all mt-4">
                Add Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;

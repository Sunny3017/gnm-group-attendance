import { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import API_BASE_URL from '../../utils/api.js';

const EmployeeAttendance = () => {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const getDaysInMonth = (month, year) => {
    const date = new Date(year, month - 1, 1);
    const days = [];
    while (date.getMonth() === month - 1) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const calendarDays = viewMode === 'calendar' ? getDaysInMonth(selectedMonth, selectedYear) : [];

  const fetchAttendance = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const { data } = await axios.get(`${API_BASE_URL}/api/attendance/my`, {
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
    fetchAttendance();
  }, [selectedMonth, selectedYear, viewMode]);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-brand-navy tracking-tight">My Attendance</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs mt-2 opacity-60">Your detailed check-in history</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
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

          {viewMode === 'calendar' && (
            <div className="flex gap-2">
              <select 
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-brand-navy outline-none"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>
              <select 
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-brand-navy outline-none"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="space-y-6">
          {/* Monthly Summary Card */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-[2rem] shadow-premium border border-white">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Present</div>
              <div className="text-2xl font-black text-brand-emerald">{attendance.filter(a => a.status === 'Present').length}</div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] shadow-premium border border-white">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Late</div>
              <div className="text-2xl font-black text-brand-gold">{attendance.filter(a => a.status === 'Late').length}</div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] shadow-premium border border-white">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Half-Day</div>
              <div className="text-2xl font-black text-orange-600">{attendance.filter(a => a.status === 'Half-Day').length}</div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] shadow-premium border border-white">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Penalty</div>
              <div className="text-2xl font-black text-brand-rose">₹{attendance.reduce((acc, a) => acc + (a.penaltyAmount || 0), 0)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {calendarDays.map((date) => {
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
                  className={`p-4 rounded-[2rem] border transition-all duration-300 flex flex-col justify-between min-h-[120px] ${
                    record 
                      ? 'bg-white border-white shadow-premium' 
                      : 'bg-slate-50/50 border-dashed border-slate-200 opacity-60'
                  }`}
                >
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                    <div className="text-xl font-black text-brand-navy">{new Date(date).getDate()}</div>
                  </div>

                  {record ? (
                    <div className="mt-2">
                      <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                        record.status === 'Present' ? 'bg-brand-emerald/10 text-brand-emerald' :
                        record.status === 'Late' ? 'bg-brand-gold/10 text-brand-gold' :
                        record.status === 'Half-Day' ? 'bg-orange-100 text-orange-700' :
                        record.status === 'Absent' ? 'bg-brand-rose/10 text-brand-rose' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {record.status}
                      </span>
                      {record.penaltyAmount > 0 && (
                        <div className="text-[10px] font-bold text-brand-rose mt-1">₹{record.penaltyAmount}</div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 text-[9px] font-black text-slate-300 uppercase tracking-widest italic">
                      No Record
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
        {Object.entries(
          attendance.reduce((acc, record) => {
            const month = new Date(record.date).toLocaleString('default', { month: 'long', year: 'numeric' });
            if (!acc[month]) acc[month] = [];
            acc[month].push(record);
            return acc;
          }, {})
        ).map(([month, records]) => (
          <div key={month} className="bg-white rounded-[2.5rem] shadow-premium border border-white overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center gap-3 bg-slate-50/30">
              <div className="w-10 h-10 bg-brand-gold/10 text-brand-gold rounded-xl flex items-center justify-center">
                <Activity size={20} />
              </div>
              <h3 className="font-black text-brand-navy tracking-tight">{month}</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Check-in Time</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Penalty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((record) => (
                    <tr key={record._id} className="hover:bg-slate-50/80 transition-all duration-300">
                      <td className="px-8 py-5 text-sm font-bold text-brand-navy">{new Date(record.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td className="px-8 py-5 text-sm font-bold text-slate-500">{record.checkInTime || '--:--'}</td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                          record.status === 'Present' ? 'bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/10' :
                          record.status === 'Late' ? 'bg-brand-gold/10 text-brand-gold border border-brand-gold/10' :
                          record.status === 'Half-Day' ? 'bg-orange-100 text-orange-700 border border-orange-100' :
                          record.status === 'Absent' ? 'bg-brand-rose/10 text-brand-rose border border-brand-rose/10' :
                          'bg-primary-100 text-primary-700'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-brand-rose">
                        {record.penaltyAmount > 0 ? `₹${record.penaltyAmount}` : '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
        {attendance.length === 0 && (
          <div className="py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 opacity-50 text-slate-500">
            No attendance records found.
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default EmployeeAttendance;

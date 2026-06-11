import { useEffect, useState } from 'react';
import axios from 'axios';
import { Download, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import API_BASE_URL from '../../utils/api.js';

const PayrollManagement = () => {
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [generating, setGenerating] = useState(false);

  const fetchPayroll = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const { data } = await axios.get(`${API_BASE_URL}/api/payroll`, {
        params: { month, year },
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      setPayroll(data);
    } catch (err) {
      toast.error('Failed to fetch payroll');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [month, year]);

  const generateAllPayroll = async () => {
    setGenerating(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const { data: employees } = await axios.get(`${API_BASE_URL}/api/employees`, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });

      for (const emp of employees) {
        await axios.post(`${API_BASE_URL}/api/payroll/generate`, 
          { employeeId: emp._id, month, year },
          { headers: { Authorization: `Bearer ${userInfo.token}` } }
        );
      }
      toast.success('Payroll generated for all employees');
      fetchPayroll();
    } catch (err) {
      toast.error('Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const exportReport = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const response = await axios.get(`${API_BASE_URL}/api/reports/salary`, {
        params: { month, year, format: 'excel' },
        headers: { Authorization: `Bearer ${userInfo.token}` },
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `salary_report_${month}_${year}.xlsx`);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payroll Management</h1>
          <p className="text-slate-500">Calculate and manage employee salaries (1st to Month End)</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={generateAllPayroll}
            disabled={generating}
            className="bg-primary-600 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg hover:bg-primary-700 transition-all disabled:opacity-50"
          >
            <RefreshCw size={20} className={generating ? 'animate-spin' : ''} />
            {generating ? 'Generating...' : 'Generate Monthly Payroll'}
          </button>
          <button onClick={exportReport} className="bg-white border border-slate-200 px-6 py-2.5 rounded-xl flex items-center gap-2 font-bold text-slate-700 hover:bg-slate-50 transition-all">
            <Download size={20} /> Export Excel
          </button>
        </div>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Month</label>
          <select className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            value={month} onChange={(e) => setMonth(e.target.value)}>
            {[...Array(12)].map((_, i) => (
              <option key={i+1} value={i+1}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Year</label>
          <select className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            value={year} onChange={(e) => setYear(e.target.value)}>
            {[2024, 2025, 2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {payroll.map((record) => (
          <div key={record._id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-slate-900">{record.employee?.fullName}</h3>
                <p className="text-xs text-slate-500">{record.employee?.employeeId} | {record.employee?.department}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                record.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {record.status}
              </span>
            </div>
            
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Base Salary</span>
                <span className="font-bold">₹{record.employee?.monthlySalary}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Penalties</span>
                <span className="font-bold text-red-600">-₹{record.latePenaltyAmount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Leave Deductions</span>
                <span className="font-bold text-red-600">-₹{record.leaveDeductionAmount}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-slate-900">
                <span>Net Payable</span>
                <span>₹{record.finalSalary}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              <div>Present: <span className="text-slate-900">{record.presentDays}</span></div>
              <div>Late: <span className="text-slate-900">{record.lateDays}</span></div>
              <div>Half: <span className="text-slate-900">{record.halfDays}</span></div>
              <div>Extra Leave: <span className="text-slate-900">{record.extraLeaveDays}</span></div>
            </div>

            <button 
              onClick={() => {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                axios.get(`${API_BASE_URL}/api/payroll/${record._id}/slip`, {
                  headers: { Authorization: `Bearer ${userInfo.token}` },
                  responseType: 'blob',
                }).then(res => {
                  const url = window.URL.createObjectURL(new Blob([res.data]));
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', `salary_slip_${record.employee.fullName}.pdf`);
                  link.click();
                });
              }}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <Download size={14} /> Download Slip
            </button>
          </div>
        ))}
      </div>

      {payroll.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-100 shadow-sm">
          No payroll records found for this period. Click "Generate Monthly Payroll" to calculate.
        </div>
      )}
    </div>
  );
};

export default PayrollManagement;

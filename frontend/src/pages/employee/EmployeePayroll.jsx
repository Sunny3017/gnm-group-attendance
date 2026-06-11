import { useEffect, useState } from 'react';
import axios from 'axios';
import { Wallet, Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import API_BASE_URL from '../../utils/api.js';

const EmployeePayroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayroll = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const { data } = await axios.get(`${API_BASE_URL}/api/payroll/my`, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      setPayrolls(data);
    } catch (err) {
      toast.error('Failed to fetch payroll history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  const downloadSlip = async (payrollId, month, year) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const response = await axios.get(`${API_BASE_URL}/api/payroll/${payrollId}/slip`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `salary_slip_${month}_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Failed to download slip');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-black text-brand-navy tracking-tight">My Payroll</h1>
        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs mt-2 opacity-60">Your salary history and slips</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {payrolls.map((p) => (
          <div key={p._id} className="bg-white rounded-[2rem] shadow-premium border border-white p-8 group hover:shadow-2xl transition-all duration-500">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-brand-navy/5 text-brand-navy rounded-2xl flex items-center justify-center group-hover:bg-brand-navy group-hover:text-white transition-all">
                <Wallet size={24} />
              </div>
              <div className="text-right">
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{p.year}</div>
                <div className="text-lg font-black text-brand-navy tracking-tight">
                  {new Date(p.year, p.month - 1).toLocaleString('default', { month: 'long' })}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 mb-6">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Net Payable</div>
              <div className="text-3xl font-black text-brand-navy tracking-tighter">₹{p.finalSalary}</div>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-400">Working Days</span>
                <span className="text-brand-navy">{p.totalWorkingDays}</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-400">Present Days</span>
                <span className="text-brand-emerald">{p.presentDays}</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-400">Deductions</span>
                <span className="text-brand-rose">₹{p.latePenaltyAmount + p.leaveDeductionAmount}</span>
              </div>
            </div>

            <button 
              onClick={() => downloadSlip(p._id, p.month, p.year)}
              className="w-full py-4 bg-brand-gold text-brand-navy rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg shadow-brand-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Download size={14} />
              Download Slip
            </button>
          </div>
        ))}

        {payrolls.length === 0 && (
          <div className="col-span-full py-20 bg-white rounded-[2rem] border border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 opacity-50">
            <FileText size={48} className="text-slate-300" />
            <span className="font-black uppercase tracking-widest text-sm text-slate-400">No payroll records generated yet</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeePayroll;

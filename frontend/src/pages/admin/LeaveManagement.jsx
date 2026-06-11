import { useEffect, useState } from 'react';
import axios from 'axios';
import { Check, X, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const { data } = await axios.get('http://localhost:5000/api/leaves', {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      setLeaves(data);
    } catch (err) {
      toast.error('Failed to fetch leaves');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      await axios.put(`http://localhost:5000/api/leaves/${id}`, { status }, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      toast.success(`Leave ${status}`);
      fetchLeaves();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Leave Requests</h1>
        <p className="text-slate-500">Manage employee leave applications</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {leaves.map((leave) => (
          <div key={leave._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                {leave.employee?.fullName?.[0] || 'E'}
              </div>
              <div>
                <div className="font-bold text-slate-900 text-lg">{leave.employee?.fullName}</div>
                <div className="text-sm text-slate-500">{leave.employee?.department} • {leave.employee?.employeeId}</div>
                <div className="mt-2 flex flex-wrap items-center gap-4">
                  <div className="text-sm">
                    <span className="text-slate-400 font-medium uppercase text-xs block">Dates</span>
                    <span className="font-semibold text-slate-700">
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-400 font-medium uppercase text-xs block">Type</span>
                    <span className={`font-semibold ${leave.type === 'Extra' ? 'text-orange-600' : 'text-blue-600'}`}>
                      {leave.type} Leave
                    </span>
                  </div>
                </div>
                {leave.reason && (
                  <div className="mt-3 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 italic text-sm">
                    "{leave.reason}"
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-4 w-full md:w-auto">
              <div className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 ${
                leave.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                leave.status === 'Approved' ? 'bg-green-100 text-green-700' :
                'bg-red-100 text-red-700'
              }`}>
                {leave.status === 'Pending' && <Clock size={16} />}
                {leave.status}
              </div>
              
              {leave.status === 'Pending' && (
                <div className="flex gap-2 w-full md:w-auto">
                  <button 
                    onClick={() => updateStatus(leave._id, 'Approved')}
                    className="flex-1 md:flex-none bg-green-600 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 font-bold hover:bg-green-700 transition-all shadow-md"
                  >
                    <Check size={18} /> Approve
                  </button>
                  <button 
                    onClick={() => updateStatus(leave._id, 'Rejected')}
                    className="flex-1 md:flex-none bg-white border border-red-200 text-red-600 px-4 py-2 rounded-xl flex items-center justify-center gap-2 font-bold hover:bg-red-50 transition-all"
                  >
                    <X size={18} /> Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {leaves.length === 0 && (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center text-slate-500">
            No leave requests found.
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveManagement;

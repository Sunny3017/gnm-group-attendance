import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Search, 
  Filter, 
  MoreHorizontal,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Building2
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_BASE_URL from '../../utils/api.js';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    employeeId: '',
    username: '',
    password: '',
    mobile: '',
    email: '',
    address: '',
    joiningDate: '',
    monthlySalary: '',
    designation: '',
    department: '',
    weeklyOff: 'Tuesday',
  });

  const fetchEmployees = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const { data } = await axios.get('${API_BASE_URL}/api/employees', {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      setEmployees(data);
    } catch (err) {
      toast.error('Failed to retrieve personnel records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (editingEmployee) {
        await axios.put(`${API_BASE_URL}/api/employees/${editingEmployee._id}`, formData, {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        });
        toast.success('Record synchronized successfully');
      } else {
        await axios.post('${API_BASE_URL}/api/employees', formData, {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        });
        toast.success('New employee onboarded');
      }
      setShowModal(false);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const deleteEmployee = async (id) => {
    if (window.confirm('Are you sure you want to decommission this record? This action is irreversible.')) {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        await axios.delete(`${API_BASE_URL}/api/employees/${id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        });
        toast.success('Record purged');
        fetchEmployees();
      } catch (err) {
        toast.error('Decommissioning failed');
      }
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-brand-navy tracking-tight">Personnel Directory</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs mt-2 opacity-60">Manage your luxury real estate taskforce</p>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setEditingEmployee(null);
            setFormData({
              fullName: '', employeeId: '', username: '', password: '',
              mobile: '', email: '', address: '', joiningDate: '',
              monthlySalary: '', designation: '', department: '', weeklyOff: 'Tuesday'
            });
            setShowModal(true);
          }}
          className="w-full md:w-auto bg-brand-navy text-white px-8 py-4 rounded-[1.25rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-navy/20 flex items-center justify-center gap-3 hover:bg-brand-slate transition-all group"
        >
          <UserPlus size={18} className="group-hover:rotate-12 transition-transform" />
          Onboard New Talent
        </motion.button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 md:p-6 rounded-[2rem] shadow-premium border border-white flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-gold transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, ID, or department..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:bg-white focus:border-brand-gold transition-all text-sm font-bold"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <button className="flex-1 md:flex-none px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-500 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-100 transition-all">
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      {/* Data Grid Table */}
      <div className="bg-white rounded-[2.5rem] shadow-premium border border-white overflow-hidden group">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee Profile</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identification</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Designation</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Net Remuneration</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((emp) => (
                <tr key={emp._id} className="hover:bg-slate-50/80 transition-all duration-300 group/row">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-brand-navy rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-brand-navy/10 relative overflow-hidden group-hover/row:scale-105 transition-transform">
                        {emp.profilePhoto ? (
                          <img src={`${API_BASE_URL}${emp.profilePhoto}`} className="w-full h-full object-cover" />
                        ) : (
                          emp.fullName[0]
                        )}
                        <div className="absolute inset-0 bg-brand-gold opacity-0 group-hover/row:opacity-20 transition-opacity"></div>
                      </div>
                      <div>
                        <div className="font-black text-brand-navy group-hover/row:text-brand-gold transition-colors">{emp.fullName}</div>
                        <div className="flex items-center gap-3 mt-1 text-slate-400">
                          <div className="flex items-center gap-1 text-[10px] font-bold"><Mail size={10} /> {emp.email}</div>
                          <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                          <div className="flex items-center gap-1 text-[10px] font-bold"><Phone size={10} /> {emp.mobile}</div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-black tracking-widest uppercase">{emp.employeeId}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-gold"></div>
                      {emp.department}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-bold text-slate-600 uppercase tracking-tighter">{emp.designation}</div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="font-black text-brand-navy text-lg">₹{emp.monthlySalary.toLocaleString()}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Base Monthly</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingEmployee(emp);
                          setFormData({
                            ...emp,
                            joiningDate: emp.joiningDate?.split('T')[0] || '',
                            password: '' 
                          });
                          setShowModal(true);
                        }}
                        className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => deleteEmployee(emp._id)}
                        className="w-10 h-10 bg-brand-rose/10 text-brand-rose rounded-xl flex items-center justify-center hover:bg-brand-rose hover:text-white transition-all shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Simulation */}
        <div className="px-8 py-6 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Showing <span className="text-brand-navy">{filteredEmployees.length}</span> of <span className="text-brand-navy">{employees.length}</span> results
          </div>
          <div className="flex items-center gap-2">
             <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-white hover:text-brand-navy transition-all"><ChevronLeft size={18} /></button>
             <button className="w-10 h-10 rounded-xl bg-brand-navy text-white flex items-center justify-center text-xs font-black shadow-lg shadow-brand-navy/10">1</button>
             <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-white hover:text-brand-navy transition-all"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>

      {/* Luxury Modal Component */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-brand-navy/60 backdrop-blur-md"
            ></motion.div>
            
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative z-10 flex flex-col"
            >
              <div className="p-10 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-brand-gold rounded-2xl flex items-center justify-center text-brand-navy shadow-gold-glow">
                    <UserPlus size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-brand-navy tracking-tight">
                      {editingEmployee ? 'Synchronize Record' : 'Global Onboarding'}
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Personnel Registration Portal</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="w-12 h-12 bg-slate-50 text-slate-400 hover:bg-brand-rose/10 hover:text-brand-rose rounded-2xl transition-all flex items-center justify-center"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-10 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/30">
                  <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Form Groups */}
                  {[
                    { label: 'Full Legal Name', icon: UserPlus, field: 'fullName', type: 'text' },
                    { label: 'Corporate ID', icon: Briefcase, field: 'employeeId', type: 'text', disabled: !!editingEmployee },
                    { label: 'Portal Username', icon: UserPlus, field: 'username', type: 'text', disabled: !!editingEmployee },
                    { label: 'Secure Password', icon: UserPlus, field: 'password', type: 'password', hidden: !!editingEmployee },
                    { label: 'Enterprise Email', icon: Mail, field: 'email', type: 'email' },
                    { label: 'Direct Mobile', icon: Phone, field: 'mobile', type: 'text' },
                    { label: 'Joining Date', icon: Calendar, field: 'joiningDate', type: 'date' },
                    { label: 'Monthly Remuneration', icon: IndianRupee, field: 'monthlySalary', type: 'number' },
                    { label: 'Business Unit', icon: Building2, field: 'department', type: 'text' },
                    { label: 'Corporate Designation', icon: Briefcase, field: 'designation', type: 'text' },
                  ].map((input) => (
                    !input.hidden && (
                      <div key={input.field} className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{input.label}</label>
                        <input 
                          required 
                          type={input.type}
                          disabled={input.disabled}
                          className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-gold/10 focus:border-brand-gold outline-none font-bold text-brand-navy transition-all disabled:bg-slate-50 disabled:text-slate-400"
                          value={formData[input.field]} 
                          onChange={e => setFormData({...formData, [input.field]: e.target.value})} 
                        />
                      </div>
                    )
                  ))}
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Weekly Respite</label>
                    <select 
                      className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-gold/10 focus:border-brand-gold outline-none font-bold text-brand-navy transition-all appearance-none"
                      value={formData.weeklyOff} 
                      onChange={e => setFormData({...formData, weeklyOff: e.target.value})}
                    >
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 pt-8 flex justify-end gap-4">
                    <button 
                      type="button" 
                      onClick={() => setShowModal(false)} 
                      className="px-10 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit" 
                      className="px-10 py-4 bg-brand-navy text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-navy/20 hover:bg-brand-slate transition-all"
                    >
                      {editingEmployee ? 'Update Core Record' : 'Onboard To Enterprise'}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeeManagement;

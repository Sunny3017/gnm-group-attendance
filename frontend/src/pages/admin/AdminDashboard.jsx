import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  IndianRupee, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Download,
  Calendar,
  Building2
} from 'lucide-react';
import API_BASE_URL from '../../utils/api.js';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  AreaChart,
  Area
} from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const { data } = await axios.get(`${API_BASE_URL}/api/dashboard/admin`, {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        });
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
    </div>
  );

  const cards = [
    { 
      title: 'Total Employees', 
      value: stats?.totalEmployees, 
      icon: Users, 
      color: 'from-brand-navy to-brand-slate', 
      trend: '+12%', 
      isUp: true,
      label: 'Overall Workforce'
    },
    { 
      title: 'Present Today', 
      value: stats?.presentToday, 
      icon: UserCheck, 
      color: 'from-brand-emerald to-emerald-400', 
      trend: '+5%', 
      isUp: true,
      label: 'Active Attendance'
    },
    { 
      title: 'Late Arrivals', 
      value: stats?.lateToday, 
      icon: Clock, 
      color: 'from-brand-gold to-amber-300', 
      trend: '-2%', 
      isUp: false,
      label: 'Punctuality Check'
    },
    { 
      title: 'Half-Days', 
      value: stats?.halfDayToday, 
      icon: Clock, 
      color: 'from-orange-400 to-orange-300', 
      trend: '0%', 
      isUp: true,
      label: 'Reduced Shifts'
    },
    { 
      title: 'Absent Today', 
      value: stats?.absentToday, 
      icon: UserX, 
      color: 'from-brand-rose to-red-400', 
      trend: '+1%', 
      isUp: true,
      label: 'Unplanned Leaves'
    },
    { 
      title: 'Monthly Payroll', 
      value: `₹${(stats?.totalSalaryExpense / 100000).toFixed(2)}L`, 
      icon: IndianRupee, 
      color: 'from-brand-navy to-brand-slate', 
      trend: '+8%', 
      isUp: true,
      label: 'Salary Disbursement'
    },
    { 
      title: 'Total Penalties', 
      value: `₹${stats?.totalPenalties || 0}`, 
      icon: AlertCircle, 
      color: 'from-brand-gold to-brand-navy', 
      trend: '-15%', 
      isUp: false,
      label: 'Late Fee Deductions'
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-10"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-brand-navy tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs mt-2 opacity-60">GNM Real Estate Operations Center</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 md:px-6 py-2.5 md:py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <Calendar className="text-brand-gold" size={16} />
            <span className="text-xs md:text-sm font-black text-brand-navy">
              {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <button className="p-3 md:p-3.5 bg-brand-navy text-white rounded-2xl shadow-xl shadow-brand-navy/20 hover:bg-brand-slate transition-all group">
            <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-4 md:gap-6">
        {cards.map((card, index) => (
          <motion.div 
            key={card.title}
            variants={itemVariants}
            className="bg-white p-6 rounded-[2rem] shadow-premium border border-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.color} opacity-[0.03] -mr-8 -mt-8 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
            
            <div className="relative z-10">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg mb-5 group-hover:rotate-6 transition-transform`}>
                <card.icon size={22} />
              </div>
              
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.title}</span>
                <div className={`flex items-center gap-1 text-[10px] font-black ${card.isUp ? 'text-brand-emerald' : 'text-brand-rose'}`}>
                  {card.isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {card.trend}
                </div>
              </div>
              
              <div className="text-3xl font-black text-brand-navy tracking-tight mb-1 group-hover:text-brand-gold transition-colors">{card.value}</div>
              <div className="text-[10px] font-bold text-slate-400">{card.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Attendance Area Chart */}
        <motion.div 
          variants={itemVariants}
          className="bg-white p-10 rounded-[2.5rem] shadow-premium border border-white relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-brand-navy tracking-tight">Attendance Velocity</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time daily check-ins</p>
            </div>
            <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center">
              <ArrowUpRight size={24} />
            </div>
          </div>
          
          <div className="h-80 w-full min-h-0 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.attendanceChart}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                  dx={-15}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                    padding: '20px'
                  }}
                  itemStyle={{ fontWeight: 'black', color: '#0F172A' }}
                  labelStyle={{ fontWeight: 'bold', color: '#94a3b8', marginBottom: '8px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#0ea5e9" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Performance Line Chart */}
        <motion.div 
          variants={itemVariants}
          className="bg-white p-10 rounded-[2.5rem] shadow-premium border border-white relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-brand-navy tracking-tight">Performance Analytics</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Enterprise efficiency score</p>
            </div>
            <div className="w-12 h-12 bg-brand-gold/10 text-brand-gold rounded-2xl flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
          </div>
          
          <div className="h-80 w-full min-h-0 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.attendanceChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                  dx={-15}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                    padding: '20px'
                  }}
                />
                <Line 
                  type="step" 
                  dataKey="count" 
                  stroke="#F59E0B" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#F59E0B', strokeWidth: 4, stroke: '#fff' }} 
                  activeDot={{ r: 10, strokeWidth: 0 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Footer Branding */}
      <div className="flex items-center justify-center py-10 opacity-30">
        <div className="flex items-center gap-2">
          <Building2 size={16} className="text-brand-navy" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-navy">GNM Luxury Enterprise Suite</span>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;

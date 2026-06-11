import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setCredentials } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Briefcase, ChevronRight, Building2, ShieldCheck } from 'lucide-react';
import API_BASE_URL from '../../utils/api.js';

const LoginPage = () => {
  const [role, setRole] = useState('Admin');
  const [username, setUsername] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/users/login`, {
        role,
        username: role === 'Admin' ? username : undefined,
        mobile: role === 'Employee' ? mobile : undefined,
        password,
      });
      dispatch(setCredentials(data));
      toast.success('Access Granted. Welcome back.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-brand-ghost">
      {/* Left Side: Premium Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-brand-navy">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070" 
            alt="Real Estate Architecture" 
            className="w-full h-full object-cover opacity-60 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/40 to-transparent"></div>
        </motion.div>

        <div className="relative z-10 w-full flex flex-col justify-between p-16">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-brand-gold rounded-xl flex items-center justify-center shadow-gold-glow">
              <Building2 className="text-brand-navy" size={28} />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter">GNM REAL ESTATE</span>
          </motion.div>

          <div className="space-y-6">
            <motion.h1 
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-6xl font-black text-white leading-tight"
            >
              Enterprise <br />
              <span className="text-brand-gold">Management</span> <br />
              System.
            </motion.h1>
            <motion.p 
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-xl text-slate-300 max-w-md font-medium leading-relaxed"
            >
              Seamlessly manage attendance, payroll, and employee performance with our luxury enterprise suite.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="flex items-center gap-8"
          >
            <div className="flex flex-col">
              <span className="text-3xl font-black text-white">500+</span>
              <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">Employees</span>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="flex flex-col">
              <span className="text-3xl font-black text-white">99.9%</span>
              <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">Efficiency</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Glassmorphism Login Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -ml-32 -mb-32"></div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-md w-full"
        >
          <div className="bg-white rounded-[2.5rem] shadow-premium border border-white p-10 relative overflow-hidden">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-brand-navy tracking-tight">Welcome Back</h2>
              <p className="text-slate-500 mt-2 font-medium">Select your portal to continue</p>
            </div>

            {/* Role Switcher */}
            <div className="bg-slate-50 p-1.5 rounded-2xl flex gap-1 mb-8 border border-slate-100">
              <button
                onClick={() => setRole('Admin')}
                className={`flex-1 py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-all duration-300 ${
                  role === 'Admin' ? 'bg-brand-navy text-white shadow-lg' : 'text-slate-500 hover:text-brand-navy'
                }`}
              >
                <ShieldCheck size={18} />
                Admin
              </button>
              <button
                onClick={() => setRole('Employee')}
                className={`flex-1 py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-all duration-300 ${
                  role === 'Employee' ? 'bg-brand-navy text-white shadow-lg' : 'text-slate-500 hover:text-brand-navy'
                }`}
              >
                <Briefcase size={18} />
                Employee
              </button>
            </div>

            <form onSubmit={submitHandler} className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={role}
                  initial={{ x: 10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    {role === 'Admin' ? 'Username' : 'Phone Number'}
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-gold transition-colors" size={20} />
                    <input
                      type="text"
                      required
                      value={role === 'Admin' ? username : mobile}
                      onChange={(e) => role === 'Admin' ? setUsername(e.target.value) : setMobile(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all font-medium text-brand-navy"
                      placeholder={role === 'Admin' ? "Enter admin username" : "Enter phone number"}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-gold transition-colors" size={20} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all font-medium text-brand-navy"
                    placeholder="Enter secure password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-brand-navy focus:ring-brand-navy" />
                  <span className="text-sm font-bold text-slate-500 group-hover:text-brand-navy transition-colors">Remember me</span>
                </label>
                <button type="button" className="text-sm font-bold text-brand-gold hover:text-brand-gold/80 transition-colors">Forgot Password?</button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-4.5 bg-brand-navy text-white rounded-2xl font-black shadow-xl shadow-brand-navy/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
              >
                {loading ? 'Authenticating...' : 'Sign In Portal'}
                <ChevronRight size={20} />
              </motion.button>
            </form>
          </div>
          
          <p className="text-center mt-8 text-slate-400 text-sm font-bold uppercase tracking-widest">
            &copy; 2026 GNM Real Estate
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;

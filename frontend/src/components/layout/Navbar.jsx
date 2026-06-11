import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { motion } from 'framer-motion';
import { 
  LogOut, 
  Bell, 
  Search, 
  Settings,
  Calendar,
  ChevronDown,
  Globe,
  Menu,
  X
} from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="h-20 md:h-24 bg-white/70 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-4 md:px-10 sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-4 md:gap-8 flex-1">
        {/* Mobile Menu Button */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors text-brand-navy"
        >
          <Menu size={24} />
        </button>

        <div className="hidden sm:flex flex-col">
          <h2 className="text-lg md:text-xl font-black text-brand-navy tracking-tight leading-none">Enterprise Overview</h2>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse"></span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">System Live</span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative group max-w-md w-full hidden lg:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-gold transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search employees, reports, or records..."
            className="w-full pl-12 pr-4 py-3 bg-slate-100/50 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/5 transition-all font-medium text-sm text-brand-navy"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 pr-6 border-r border-slate-200">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-brand-navy rounded-[1.25rem] transition-all relative group"
          >
            <Bell size={20} />
            <span className="absolute top-3 right-3 w-2 h-2 bg-brand-rose rounded-full border-2 border-white group-hover:animate-ping"></span>
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-brand-navy rounded-[1.25rem] transition-all"
          >
            <Globe size={20} />
          </motion.button>
        </div>

        {/* Profile Dropdown Simulation */}
        <div className="flex items-center gap-4 pl-2 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-black text-brand-navy leading-none group-hover:text-brand-gold transition-colors">{userInfo?.username || userInfo?.employeeId}</div>
            <div className="text-[10px] font-black text-brand-gold uppercase tracking-widest mt-1 opacity-80">{userInfo?.role}</div>
          </div>
          
          <div className="relative">
            <div className="w-12 h-12 bg-brand-navy rounded-[1.25rem] flex items-center justify-center text-white shadow-lg shadow-brand-navy/20 border-2 border-transparent group-hover:border-brand-gold transition-all overflow-hidden">
               {userInfo?.profilePhoto ? (
                 <img src={`http://localhost:5000${userInfo.profilePhoto}`} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 <span className="font-black text-lg">{(userInfo?.username?.[0] || userInfo?.employeeId?.[0])?.toUpperCase()}</span>
               )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-brand-emerald rounded-full border-2 border-white"></div>
          </div>

          <ChevronDown size={16} className="text-slate-400 group-hover:text-brand-gold transition-colors" />
        </div>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="w-12 h-12 bg-brand-rose/10 text-brand-rose hover:bg-brand-rose hover:text-white rounded-[1.25rem] flex items-center justify-center transition-all shadow-sm"
          title="Sign Out"
        >
          <LogOut size={20} />
        </motion.button>
      </div>
    </header>
  );
};

export default Navbar;

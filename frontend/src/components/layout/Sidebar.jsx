import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { logout } from '../../store/slices/authSlice';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  CalendarX, 
  Wallet, 
  Building2,
  LogOut,
  ChevronRight,
  User,
  Settings,
  PieChart,
  X
} from 'lucide-react';

const Sidebar = ({ onClose }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  const adminLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Employees', path: '/employees', icon: Users },
    { name: 'Attendance', path: '/attendance', icon: CalendarCheck },
    { name: 'Leaves', path: '/leaves', icon: CalendarX },
    { name: 'Payroll', path: '/payroll', icon: Wallet },
  ];

  const employeeLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'My Attendance', path: '/attendance', icon: CalendarCheck },
    { name: 'My Payroll', path: '/payroll', icon: Wallet },
  ];

  const links = userInfo?.role === 'Admin' ? adminLinks : employeeLinks;

  return (
    <aside className="w-80 bg-brand-navy flex flex-col h-full relative z-30 shadow-2xl overflow-hidden">
      {/* Brand Section */}
      <div className="p-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.div 
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.8 }}
            className="w-12 h-12 bg-brand-gold rounded-2xl flex items-center justify-center shadow-gold-glow flex-shrink-0"
          >
            <Building2 className="text-brand-navy" size={24} />
          </motion.div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter leading-none">GNM</h2>
            <div className="text-[10px] font-black text-brand-gold uppercase tracking-[0.3em] mt-1 opacity-80">Real Estate</div>
          </div>
        </div>
        
        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
      </div>
      
      {/* Navigation Section */}
      <div className="flex-1 px-6 space-y-8 overflow-y-auto custom-scrollbar">
        <div>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-4 mb-4 opacity-50">Enterprise Portal</div>
          <nav className="space-y-2">
            {links.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-5 py-4 rounded-[1.25rem] font-bold transition-all duration-500 ${
                    isActive 
                      ? 'bg-brand-gold text-brand-navy shadow-gold-glow' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-4">
                      <link.icon size={20} className={isActive ? 'text-brand-navy' : 'text-slate-500 group-hover:text-brand-gold transition-colors'} />
                      <span className="tracking-tight">{link.name}</span>
                    </div>
                    {isActive && <ChevronRight size={16} className="text-brand-navy" />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-4 mb-4 opacity-50">Preferences</div>
          <nav className="space-y-2">
            <button className="w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-all group">
              <Settings size={20} className="text-slate-500 group-hover:text-brand-gold transition-colors" />
              <span className="tracking-tight">Settings</span>
            </button>
          </nav>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-8 mt-auto">
        <div className="bg-white/5 backdrop-blur-md rounded-[2rem] p-5 border border-white/10 relative group overflow-hidden">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-brand-gold/10 rounded-full blur-2xl"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-brand-gold/20 rounded-2xl flex items-center justify-center text-brand-gold border border-brand-gold/20 group-hover:bg-brand-gold group-hover:text-brand-navy transition-all duration-500">
              <User size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-black text-white truncate">{userInfo?.username || userInfo?.employeeId}</div>
              <div className="text-[10px] font-bold text-brand-gold uppercase tracking-widest mt-0.5 opacity-80">{userInfo?.role}</div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
             <button 
               onClick={handleLogout}
               className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-rose/10 text-brand-rose hover:bg-brand-rose hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300"
             >
               <LogOut size={14} />
               Logout
             </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  CalendarCheck, 
  CalendarX, 
  Clock, 
  IndianRupee, 
  AlertCircle,
  FileText,
  Building2,
  TrendingUp,
  Download,
  CheckCircle2,
  Activity,
  MapPin,
  Navigation,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import API_BASE_URL from '../../utils/api.js';
import toast from 'react-hot-toast';

const OFFICE_LOCATION = {
  latitude: 28.6416659,
  longitude: 77.3796490,
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const EmployeeDashboard = () => {
  const [stats, setStats] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [markingHalfDay, setMarkingHalfDay] = useState(false);
  const [showHalfDayModal, setShowHalfDayModal] = useState(false);

  // Geo-fencing states
  const [location, setLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    fetchStats();

    // Start watching location
    let watchId;
    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          setLocation({ latitude, longitude });
          setAccuracy(accuracy);
          
          const dist = calculateDistance(
            latitude,
            longitude,
            OFFICE_LOCATION.latitude,
            OFFICE_LOCATION.longitude
          );
          setDistance(dist);
          setLocationError(null);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationError(error.message);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const markAttendance = async () => {
    // Check if attendance already marked
    if (stats?.todayRecord) {
      toast.error('Attendance already marked for today');
      return;
    }

    if (!location) {
      toast.error('Waiting for location data. Please enable GPS.');
      return;
    }

    if (distance > 150) {
      toast.error('You are not near the GNM Office. Attendance cannot be marked.');
      return;
    }

    if (accuracy > 100) {
      toast.error('Location accuracy is too low. Please move to an open area and try again.');
      return;
    }

    setMarking(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      await axios.post(`${API_BASE_URL}/api/attendance/mark`, {
        latitude: location.latitude,
        longitude: location.longitude,
        distanceFromOffice: Math.round(distance),
        gpsAccuracy: Math.round(accuracy)
      }, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      toast.success('Attendance verified. Check-in complete.');
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setMarking(false);
    }
  };

  const fetchStats = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const [statsRes, attendanceRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/dashboard/employee`, {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        }),
        axios.get(`${API_BASE_URL}/api/attendance/my`, {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        })
      ]);
      setStats(statsRes.data);
      setAttendance(attendanceRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markHalfDay = async () => {
    setMarkingHalfDay(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      await axios.post(`${API_BASE_URL}/api/attendance/halfday`, {}, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      toast.success('Half-Day marked successfully!');
      setShowHalfDayModal(false);
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark half-day');
    } finally {
      setMarkingHalfDay(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
    </div>
  );

  const cards = [
    { title: 'Present Days', value: stats?.presentDays, icon: CalendarCheck, color: 'from-brand-emerald to-emerald-400', label: 'Attendance Score' },
    { title: 'Late Entries', value: stats?.lateDays, icon: Clock, color: 'from-brand-gold to-amber-300', label: 'Punctuality Rate' },
    { title: 'Half Days', value: stats?.halfDays, icon: Clock, color: 'from-orange-400 to-orange-300', label: 'Reduced Shifts' },
    { title: 'Absent Days', value: stats?.absentDays, icon: CalendarX, color: 'from-brand-rose to-red-400', label: 'Unplanned Absence' },
    { title: 'Total Penalties', value: `₹${stats?.latePenalties || 0}`, icon: AlertCircle, color: 'from-brand-navy to-brand-slate', label: 'Late Fee Deductions' },
    { title: 'Net Payable', value: `₹${stats?.currentMonthSalary || 0}`, icon: IndianRupee, color: 'from-brand-navy to-brand-slate', label: 'Est. Monthly Remuneration' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Welcome */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-8">
        <div className="space-y-4 w-full md:w-auto">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-brand-navy tracking-tight">Employee Portal</h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs mt-2 opacity-60">Manage your corporate identity and performance</p>
          </div>

          {/* Location Status Badge */}
          <div className="flex flex-wrap gap-2 md:gap-3">
            <div className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-full border ${
              !location ? 'bg-slate-100 text-slate-500 border-slate-200' :
              distance <= 150 ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20' : 
              'bg-brand-rose/10 text-brand-rose border-brand-rose/20'
            }`}>
              {distance <= 150 ? <MapPin size={10} className="text-brand-emerald" /> : <MapPin size={10} className="text-brand-rose" />}
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                {!location ? 'Detecting Location...' : distance <= 150 ? 'Inside Office Zone' : 'Outside Office Zone'}
              </span>
            </div>

            {location && (
              <div className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-brand-navy/5 text-brand-navy border border-brand-navy/10">
                <Navigation size="10" className="rotate-45" />
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                  {distance < 1000 ? `${Math.round(distance)}m from office` : `${(distance/1000).toFixed(1)}km from office`}
                </span>
              </div>
            )}

            {accuracy && (
              <div className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-full border ${
                accuracy <= 100 ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20' : 'bg-brand-gold/10 text-brand-gold border-brand-gold/20'
              }`}>
                {accuracy <= 100 ? <ShieldCheck size={10} /> : <ShieldAlert size={10} />}
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                  Accuracy: {Math.round(accuracy)}m
                </span>
              </div>
            )}
          </div>
        </div>

        <motion.button 
          whileHover={marking || !location || distance > 150 || accuracy > 100 ? {} : { scale: 1.02, y: -2 }}
          whileTap={marking || !location || distance > 150 || accuracy > 100 ? {} : { scale: 0.98 }}
          onClick={markAttendance}
          disabled={marking || !location || distance > 150 || accuracy > 100}
          className={`w-full md:w-auto group flex items-center justify-center md:justify-start gap-4 p-4 md:p-6 rounded-[2rem] border transition-all duration-500 ${
            marking || !location || distance > 150 || accuracy > 100
              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
              : 'bg-brand-navy text-white shadow-brand-navy/30 hover:bg-brand-slate'
          }`}
        >
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-gold-glow group-hover:rotate-12 transition-transform ${
            marking || !location || distance > 150 || accuracy > 100
              ? 'bg-slate-300 text-slate-500'
              : 'bg-brand-gold text-brand-navy'
          }`}>
            <CheckCircle2 size={24} />
          </div>
          <div className="text-left">
            <div className="text-lg tracking-tight leading-tight">
              {marking ? 'Verifying...' : 'Authenticate Check-in'}
            </div>
            {!marking && (
              <div className="text-[10px] uppercase tracking-widest opacity-60">
                {!location ? 'Waiting for GPS' : distance > 150 ? 'Move Closer to Office' : accuracy > 100 ? 'Low Accuracy' : 'Ready to Mark'}
              </div>
            )}
          </div>
        </motion.button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
        {cards.map((card) => (
          <motion.div 
            key={card.title}
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-[2rem] shadow-premium border border-white hover:shadow-2xl transition-all duration-500 group"
          >
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg mb-5 group-hover:scale-110 transition-transform`}>
              <card.icon size={22} />
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.title}</div>
            <div className="text-2xl font-black text-brand-navy tracking-tight group-hover:text-brand-gold transition-colors">{card.value}</div>
            <div className="text-[10px] font-bold text-slate-400 mt-1">{card.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attendance History */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-premium border border-white overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-gold/10 text-brand-gold rounded-xl flex items-center justify-center">
                <Activity size={20} />
              </div>
              <h3 className="font-black text-brand-navy tracking-tight">Activity Log</h3>
            </div>
            <button className="text-[10px] font-black text-brand-gold uppercase tracking-widest hover:underline transition-all">View All Records</button>
          </div>
          
          <div className="overflow-x-auto custom-scrollbar flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Check-in Time</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Penalty Applied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendance.slice(0, 8).map((record) => (
                  <tr key={record._id} className="hover:bg-slate-50/80 transition-all duration-300 group">
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
                    <td className="px-8 py-5 text-right">
                      {record.penaltyAmount > 0 ? (
                        <div className="space-y-1">
                          {record.latePenalty > 0 && (
                            <div className="text-xs font-black text-brand-rose">Late: ₹{record.latePenalty}</div>
                          )}
                          {record.halfDayPenalty > 0 && (
                            <div className="text-xs font-black text-orange-600">Half-Day: ₹{record.halfDayPenalty}</div>
                          )}
                          <div className="text-sm font-black text-brand-rose">Total: ₹{record.penaltyAmount}</div>
                        </div>
                      ) : (
                        '--'
                      )}
                    </td>
                  </tr>
                ))}
                {attendance.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-20">
                        <Activity size={48} className="text-brand-navy" />
                        <span className="text-sm font-black uppercase tracking-widest text-brand-navy">No activity detected</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payroll Card */}
        <div className="bg-brand-navy rounded-[2.5rem] shadow-2xl p-10 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-brand-gold/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-black tracking-tight">Payroll Overview</h3>
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-brand-gold group-hover:text-brand-navy transition-all duration-500">
                <FileText size={24} />
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-[2rem] p-8 border border-white/10 mb-8">
              <div className="text-[10px] font-black text-brand-gold uppercase tracking-[0.3em] mb-2 opacity-80">Net Payable Remuneration</div>
              <div className="text-5xl font-black tracking-tighter mb-1 group-hover:text-brand-gold transition-colors">₹{stats?.currentMonthSalary || 0}</div>
              <div className="text-xs font-bold text-slate-400">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} Cycle</div>
            </div>
            
            <div className="space-y-4 mb-10">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-400">Total Working Days</span>
                <span className="text-white">30</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-400">Attendance Score</span>
                <span className="text-brand-emerald">{stats?.presentDays || 0} Days</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-400">Penalty Deductions</span>
                <span className="text-brand-rose">₹{stats?.latePenalties || 0}</span>
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4.5 bg-brand-gold text-brand-navy rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-gold/20 flex items-center justify-center gap-2 mt-auto"
            >
              <Download size={16} />
              Generate Salary Slip
            </motion.button>

          {/* Manual Half-Day Button */}
          <motion.button 
            whileHover={markingHalfDay || stats?.todayRecord?.isHalfDay ? {} : { scale: 1.02, y: -2 }}
            whileTap={markingHalfDay || stats?.todayRecord?.isHalfDay ? {} : { scale: 0.98 }}
            onClick={() => setShowHalfDayModal(true)}
            disabled={markingHalfDay || stats?.todayRecord?.isHalfDay}
            className={`w-full md:w-auto group flex items-center justify-center md:justify-start gap-4 p-4 md:p-6 rounded-[2rem] border transition-all duration-500 ${
              markingHalfDay || stats?.todayRecord?.isHalfDay
                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                : 'bg-orange-500 text-white shadow-orange-500/30 hover:bg-orange-600'
            }`}
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform ${
              markingHalfDay || stats?.todayRecord?.isHalfDay ? 'bg-slate-300' : 'bg-orange-400 text-white'
            }`}>
              <Clock size={20} />
            </div>
            <div className="text-left pr-4">
              <div className="text-xs font-black uppercase tracking-[0.15em]">Mark Half-Day</div>
              {!markingHalfDay && (
                <div className="text-[10px] uppercase tracking-widest opacity-60">
                  {stats?.todayRecord?.isHalfDay ? 'Half-day already marked' : 'Apply for half-shift'}
                </div>
              )}
              {markingHalfDay && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Applying...</span>
                </div>
              )}
            </div>
          </motion.button>
        </div>
      </div>
      </div>

      {/* Half-Day Confirmation Modal */}
      {showHalfDayModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl border border-white"
          >
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center mb-6">
              <Clock size={32} />
            </div>
            <h3 className="text-2xl font-black text-brand-navy tracking-tight mb-4">Mark Half-Day?</h3>
            <p className="text-slate-500 font-bold text-sm leading-relaxed mb-8">
              Are you sure you want to mark your attendance as a half-day? 
              This will automatically deduct <span className="text-brand-rose">half of your daily salary</span>.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setShowHalfDayModal(false)}
                className="py-4 rounded-2xl bg-slate-50 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={markHalfDay}
                disabled={markingHalfDay}
                className="py-4 rounded-2xl bg-orange-500 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all disabled:opacity-50"
              >
                {markingHalfDay ? 'Processing...' : 'Yes, Confirm'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Footer Branding */}
      <div className="flex items-center justify-center py-10 opacity-30">
        <div className="flex items-center gap-2">
          <Building2 size={16} className="text-brand-navy" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-navy">GNM Luxury Enterprise Suite</span>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoginPage from './pages/auth/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployeeManagement from './pages/admin/EmployeeManagement';
import AttendanceManagement from './pages/admin/AttendanceManagement';
import LeaveManagement from './pages/admin/LeaveManagement';
import PayrollManagement from './pages/admin/PayrollManagement';
import EmployeeAttendance from './pages/employee/EmployeeAttendance';
import EmployeePayroll from './pages/employee/EmployeePayroll';
import Layout from './components/layout/Layout';

const App = () => {
  const { userInfo } = useSelector((state) => state.auth);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!userInfo ? <LoginPage /> : <Navigate to="/" />} />
        
        <Route path="/" element={userInfo ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={userInfo?.role === 'Admin' ? <AdminDashboard /> : <EmployeeDashboard />} />
          
          {/* Admin Routes */}
          {userInfo?.role === 'Admin' && (
            <>
              <Route path="employees" element={<EmployeeManagement />} />
              <Route path="attendance" element={<AttendanceManagement />} />
              <Route path="leaves" element={<LeaveManagement />} />
              <Route path="payroll" element={<PayrollManagement />} />
            </>
          )}

          {/* Employee Routes */}
          {userInfo?.role === 'Employee' && (
            <>
              <Route path="attendance" element={<EmployeeAttendance />} />
              <Route path="payroll" element={<EmployeePayroll />} />
            </>
          )}
        </Route>
      </Routes>
    </Router>
  );
};

export default App;

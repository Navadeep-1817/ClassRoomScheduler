import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from './config/api';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import StudentDashboard from './pages/StudentDashboard';
import TimetableManagement from './pages/TimetableManagement';
import CalendarView from './pages/CalendarView';
import NotificationsPage from './pages/NotificationsPage';
import BulkImport from './pages/BulkImport';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

const PrivateRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

const AppLayout = ({ children }) => (
  <div className="flex min-h-screen bg-slate-100 font-outfit">
    <Sidebar />
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar />
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  </div>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token  = localStorage.getItem('token');

    if (!stored || !token) {
      setChecking(false);
      return;
    }

    // Validate the stored token is still accepted by the backend
    axios.get(`${API_BASE}/schedules`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      setUser(JSON.parse(stored));
    }).catch(() => {
      // Token invalid / expired / user deleted — wipe and redirect to login
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }).finally(() => setChecking(false));
  }, []);

  if (checking) return null; // Blank screen for <300ms while validating

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/admin" element={
          <PrivateRoute allowedRoles={['Admin']}>
            <AppLayout><AdminDashboard /></AppLayout>
          </PrivateRoute>
        } />

        <Route path="/coordinator" element={
          <PrivateRoute allowedRoles={['Coordinator']}>
            <AppLayout><CoordinatorDashboard /></AppLayout>
          </PrivateRoute>
        } />

        <Route path="/faculty" element={
          <PrivateRoute allowedRoles={['Faculty']}>
            <AppLayout><FacultyDashboard /></AppLayout>
          </PrivateRoute>
        } />

        <Route path="/student" element={
          <PrivateRoute allowedRoles={['Student']}>
            <AppLayout><StudentDashboard /></AppLayout>
          </PrivateRoute>
        } />

        <Route path="/timetable" element={
          <PrivateRoute allowedRoles={['Admin', 'Coordinator']}>
            <AppLayout><TimetableManagement /></AppLayout>
          </PrivateRoute>
        } />

        <Route path="/calendar" element={
          <PrivateRoute allowedRoles={['Admin', 'Coordinator', 'Faculty', 'Student']}>
            <AppLayout><CalendarView /></AppLayout>
          </PrivateRoute>
        } />

        <Route path="/import" element={
          <PrivateRoute allowedRoles={['Admin', 'Coordinator']}>
            <AppLayout><BulkImport /></AppLayout>
          </PrivateRoute>
        } />

        <Route path="/notifications" element={
          <PrivateRoute allowedRoles={['Admin', 'Coordinator', 'Faculty', 'Student']}>
            <AppLayout><NotificationsPage /></AppLayout>
          </PrivateRoute>
        } />

        <Route path="/" element={
          user ? (
            user.role === 'Admin'       ? <Navigate to="/admin"       /> :
            user.role === 'Coordinator' ? <Navigate to="/coordinator" /> :
            user.role === 'Student'     ? <Navigate to="/student"     /> :
                                          <Navigate to="/faculty"     />
          ) : <Navigate to="/login" />
        } />
      </Routes>
    </Router>
  );
}

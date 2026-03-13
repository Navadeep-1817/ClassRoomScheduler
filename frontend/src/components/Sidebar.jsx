import { NavLink, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  TableCellsIcon,
  CalendarDaysIcon,
  ArrowLeftOnRectangleIcon,
  ClockIcon,
  BellIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

export default function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const dashPath =
    user?.role === 'Admin'       ? '/admin'       :
    user?.role === 'Coordinator' ? '/coordinator' :
    user?.role === 'Student'     ? '/student'     :
                                   '/faculty';

  const isStudent     = user?.role === 'Student';
  const isAdminOrCoord = user?.role === 'Admin' || user?.role === 'Coordinator';

  const roleBadge = {
    Admin:       'bg-violet-900/50 text-violet-300',
    Coordinator: 'bg-blue-900/50 text-blue-300',
    Faculty:     'bg-emerald-900/50 text-emerald-300',
    Student:     'bg-amber-900/50 text-amber-300',
  }[user?.role] || 'bg-slate-800 text-slate-400';

  return (
    <aside className="w-64 bg-slate-900 flex flex-col shrink-0 min-h-screen">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
            <ClockIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Smart Scheduler</p>
            <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-md ${roleBadge}`}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-2">Navigation</p>

        {/* Dashboard */}
        <NavLink to={dashPath} end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          {isStudent
            ? <AcademicCapIcon className="w-5 h-5" />
            : <HomeIcon className="w-5 h-5" />}
          {isStudent ? 'My Timetable' : 'Dashboard'}
        </NavLink>

        {/* Manage Timetable — Admin/Coordinator only */}
        {isAdminOrCoord && (
          <NavLink to="/timetable" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <TableCellsIcon className="w-5 h-5" /> Manage Timetable
          </NavLink>
        )}

        {/* Calendar — everyone */}
        <NavLink to="/calendar" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <CalendarDaysIcon className="w-5 h-5" /> Calendar View
        </NavLink>

        {/* Notifications — everyone */}
        <NavLink to="/notifications" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <BellIcon className="w-5 h-5" /> Notifications
        </NavLink>
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-slate-800">
        <div className="px-3 mb-3">
          <p className="text-slate-300 text-xs font-semibold truncate">{user?.username}</p>
          {user?.department && (
            <p className="text-slate-600 text-xs mt-0.5">{user.department} Dept.</p>
          )}
        </div>
        <button
          onClick={logout}
          className="sidebar-link w-full hover:bg-red-900/40 hover:text-red-300"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5" /> Sign Out
        </button>
      </div>
    </aside>
  );
}

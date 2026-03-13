import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  CalendarDaysIcon,
  BellIcon,
  ClockIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  BookOpenIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

const API = 'http://localhost:5000/api';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const notifStyle = {
  info:    'bg-blue-50 border-blue-200 text-blue-700',
  warning: 'bg-amber-50 border-amber-200 text-amber-700',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
};
const NotifIcon = ({ type }) => {
  if (type === 'warning') return <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />;
  if (type === 'success') return <CheckCircleIcon className="w-5 h-5 shrink-0" />;
  return <InformationCircleIcon className="w-5 h-5 shrink-0" />;
};

export default function StudentDashboard() {
  const [schedules, setSchedules]       = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    Promise.all([
      axios.get(`${API}/schedules`, { headers }),
      axios.get(`${API}/notifications`, { headers }),
    ]).then(([sr, nr]) => {
      setSchedules(sr.data);
      setNotifications(nr.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Today's classes
  const todayNum   = new Date().getDay();
  const todayStr   = new Date().toDateString();
  const todayClasses = schedules.filter(s => new Date(s.date).toDateString() === todayStr);

  // Weekly view — group by day number
  const weeklyByDay = {};
  schedules.forEach(s => {
    const d = new Date(s.date).getDay();
    if (!weeklyByDay[d]) weeklyByDay[d] = [];
    weeklyByDay[d].push(s);
  });

  const pillColors = [
    'bg-indigo-100 text-indigo-700 border-indigo-200',
    'bg-emerald-100 text-emerald-700 border-emerald-200',
    'bg-amber-100 text-amber-700 border-amber-200',
    'bg-rose-100 text-rose-700 border-rose-200',
    'bg-sky-100 text-sky-700 border-sky-200',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          My Timetable
          <span className="ml-2 text-sm font-normal text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
            {user?.department}
          </span>
        </h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Student view — {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* ── TODAY'S CLASSES ── */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <CalendarDaysIcon className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-slate-800">Today's Classes</h3>
            <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
              {DAYS[todayNum]}
            </span>
          </div>
          <span className="badge bg-indigo-50 text-indigo-700">{todayClasses.length} classes</span>
        </div>

        {loading ? (
          <p className="text-slate-400 text-sm">Loading…</p>
        ) : todayClasses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-2">🎉</p>
            <p className="text-slate-400 font-medium">No classes today!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {todayClasses.map((s, i) => (
              <div
                key={s._id}
                className={`rounded-xl border px-4 py-3 ${pillColors[i % pillColors.length]}`}
              >
                <p className="font-semibold text-sm">{s.course?.courseName}</p>
                <p className="text-xs opacity-70 mt-0.5">{s.course?.courseCode}</p>
                <div className="mt-2 space-y-1 text-xs opacity-80">
                  <div className="flex items-center gap-1.5">
                    <ClockIcon className="w-3.5 h-3.5" /> {s.timeSlot}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BuildingOfficeIcon className="w-3.5 h-3.5" /> Room {s.classroom?.roomNumber} ({s.classroom?.type})
                  </div>
                  <div className="flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5" /> {s.faculty?.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── WEEKLY TIMETABLE ── */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <AcademicCapIcon className="w-5 h-5 text-emerald-600" />
          <h3 className="font-semibold text-slate-800">Weekly Timetable — {user?.department}</h3>
        </div>

        {loading ? (
          <p className="text-slate-400 text-sm">Loading…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 pr-4 text-slate-500 font-medium w-24">Day</th>
                  <th className="text-left py-3 text-slate-500 font-medium">Classes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[1,2,3,4,5,6].map(dayNum => {
                  const isToday = dayNum === todayNum;
                  const daySched = weeklyByDay[dayNum] || [];
                  return (
                    <tr key={dayNum} className={isToday ? 'bg-indigo-50' : 'hover:bg-slate-50 transition'}>
                      <td className="py-3 pr-4 align-top">
                        <span className={`font-semibold text-xs ${isToday ? 'text-indigo-700' : 'text-slate-600'}`}>
                          {isToday && <span className="block text-[10px] text-indigo-500 font-bold uppercase tracking-wide mb-0.5">Today</span>}
                          {DAYS[dayNum]}
                        </span>
                      </td>
                      <td className="py-3">
                        {daySched.length === 0 ? (
                          <span className="text-slate-300 text-xs">No classes</span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {daySched.map((s, i) => (
                              <div
                                key={s._id}
                                className={`rounded-lg border px-3 py-1.5 text-xs ${pillColors[i % pillColors.length]}`}
                                title={`${s.faculty?.name} | Room ${s.classroom?.roomNumber}`}
                              >
                                <span className="font-semibold">{s.course?.courseCode}</span>
                                <span className="mx-1 opacity-50">·</span>
                                <span>{s.timeSlot}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── NOTIFICATIONS ── */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <BellIcon className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-slate-800">Department Notifications</h3>
          {notifications.length > 0 && (
            <span className="badge bg-amber-50 text-amber-700">{notifications.length}</span>
          )}
        </div>

        {loading ? (
          <p className="text-slate-400 text-sm">Loading…</p>
        ) : notifications.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">No notifications yet.</p>
        ) : (
          <div className="space-y-3">
            {notifications.map(n => (
              <div
                key={n._id}
                className={`flex gap-3 border rounded-xl px-4 py-3 ${notifStyle[n.type] || notifStyle.info}`}
              >
                <NotifIcon type={n.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug">{n.message}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs opacity-60">
                    <span>By: {n.createdBy?.username || 'System'}</span>
                    <span>{new Date(n.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    {n.department !== 'ALL' && (
                      <span className="font-semibold">{n.department}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  CalendarDaysIcon,
  ClockIcon,
  BuildingOfficeIcon,
  BookOpenIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function FacultyDashboard() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user?.facultyId) { setLoading(false); return; }
    axios.get(`http://localhost:5000/api/schedules?facultyId=${user.facultyId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(r => setSchedules(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const upcoming = schedules.filter(s => new Date(s.date) >= now);
  const past     = schedules.filter(s => new Date(s.date) <  now);

  const ClassCard = ({ s, variant }) => (
    <div className={`flex gap-3 p-4 rounded-xl border ${
      variant === 'upcoming'
        ? 'bg-emerald-50 border-emerald-100'
        : 'bg-slate-50 border-slate-100'
    }`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
        variant === 'upcoming' ? 'bg-emerald-100' : 'bg-slate-200'
      }`}>
        {variant === 'upcoming'
          ? <CalendarDaysIcon className="w-5 h-5 text-emerald-600" />
          : <CheckCircleIcon  className="w-5 h-5 text-slate-500"  />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 text-sm truncate">
          {s.course?.courseName}
          <span className="ml-1.5 text-xs font-normal text-slate-500">({s.course?.courseCode})</span>
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <ClockIcon className="w-3.5 h-3.5" /> {s.timeSlot}
          </span>
          <span className="flex items-center gap-1">
            <BuildingOfficeIcon className="w-3.5 h-3.5" /> Room {s.classroom?.roomNumber}
          </span>
          <span className="flex items-center gap-1">
            <BookOpenIcon className="w-3.5 h-3.5" /> {new Date(s.date).toLocaleDateString('en-GB')}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">My Classes</h2>
        <p className="text-slate-500 text-sm">Your personal teaching schedule</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Upcoming */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <CalendarDaysIcon className="w-5 h-5 text-emerald-600" />
              <h3 className="font-semibold text-slate-800">Upcoming Classes</h3>
            </div>
            <span className="badge bg-emerald-50 text-emerald-700">{upcoming.length}</span>
          </div>
          <div className="space-y-3">
            {loading ? <p className="text-slate-400 text-sm">Loading…</p>
              : upcoming.length
                ? upcoming.map(s => <ClassCard key={s._id} s={s} variant="upcoming" />)
                : <p className="text-slate-400 text-sm text-center py-6">No upcoming classes 🎉</p>}
          </div>
        </div>

        {/* Past */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-slate-500" />
              <h3 className="font-semibold text-slate-800">Past Classes</h3>
            </div>
            <span className="badge bg-slate-100 text-slate-600">{past.length}</span>
          </div>
          <div className="space-y-3">
            {loading ? <p className="text-slate-400 text-sm">Loading…</p>
              : past.length
                ? past.map(s => <ClassCard key={s._id} s={s} variant="past" />)
                : <p className="text-slate-400 text-sm text-center py-6">No past classes recorded.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

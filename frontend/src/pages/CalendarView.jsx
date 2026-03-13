import { useEffect, useState } from 'react';
import axios from 'axios';
import { ClockIcon, BuildingOfficeIcon, UserIcon } from '@heroicons/react/24/outline';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
// Mon=1, Tue=2, ..., Sat=6 (matches JS getDay())

const PILL_COLORS = [
  'bg-indigo-100 border-indigo-300 text-indigo-800',
  'bg-emerald-100 border-emerald-300 text-emerald-800',
  'bg-amber-100 border-amber-300 text-amber-800',
  'bg-rose-100 border-rose-300 text-rose-800',
  'bg-sky-100 border-sky-300 text-sky-800',
  'bg-violet-100 border-violet-300 text-violet-800',
];

export default function CalendarView() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    // Faculty needs facultyId; Student and others just hit the base endpoint
    // (backend already filters by dept for Coordinator/Student, returns all for Admin)
    const endpoint = user?.role === 'Faculty'
      ? `http://localhost:5000/api/schedules?facultyId=${user.facultyId}`
      : 'http://localhost:5000/api/schedules';

    axios.get(endpoint, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(r => setSchedules(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const forDay = (dayNum) => schedules.filter(s => new Date(s.date).getDay() === dayNum);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Weekly Calendar</h2>
        <p className="text-slate-500 text-sm">All scheduled classes by day of the week</p>
      </div>

      {loading ? (
        <p className="text-slate-400">Loading schedule…</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
          {DAYS.map((day, idx) => {
            const dayNum = idx + 1; // Mon=1 … Sat=6
            const daySchedules = forDay(dayNum);
            return (
              <div key={day} className="card flex flex-col min-h-[200px] p-0 overflow-hidden">
                {/* Day header */}
                <div className={`px-4 py-3 border-b ${
                  dayNum === new Date().getDay()
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-50 text-slate-600 border-slate-100'
                }`}>
                  <p className="font-semibold text-sm">{day}</p>
                </div>

                <div className="flex-1 p-3 space-y-2">
                  {daySchedules.length === 0 ? (
                    <p className="text-slate-300 text-xs text-center mt-6">No classes</p>
                  ) : (
                    daySchedules.map((s, i) => (
                      <div
                        key={s._id}
                        className={`rounded-lg border px-3 py-2.5 text-xs ${PILL_COLORS[i % PILL_COLORS.length]}`}
                      >
                        <p className="font-semibold truncate">{s.course?.courseCode || 'N/A'}</p>
                        <p className="truncate text-[11px] opacity-80 mt-0.5">{s.course?.courseName}</p>
                        <div className="flex items-center gap-1 mt-1.5 opacity-70">
                          <ClockIcon className="w-3 h-3 shrink-0" /> {s.timeSlot}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5 opacity-70">
                          <BuildingOfficeIcon className="w-3 h-3 shrink-0" /> {s.classroom?.roomNumber}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5 opacity-70">
                          <UserIcon className="w-3 h-3 shrink-0" />
                          <span className="truncate">{s.faculty?.name?.split(' ').slice(-1)[0]}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

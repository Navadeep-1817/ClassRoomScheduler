import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BuildingOfficeIcon,
  UsersIcon,
  BookOpenIcon,
  ClockIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const statConfig = [
  { key: 'totalClassrooms', label: 'Total Classrooms', icon: BuildingOfficeIcon, color: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-100' },
  { key: 'totalFaculty',    label: 'Total Faculty',    icon: UsersIcon,          color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
  { key: 'totalCourses',    label: 'Total Courses',    icon: BookOpenIcon,       color: 'bg-amber-50 text-amber-600',  border: 'border-amber-100'   },
  { key: 'todaysClasses',   label: "Today's Classes",  icon: ClockIcon,          color: 'bg-rose-50 text-rose-600',    border: 'border-rose-100'    },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(r => setStats(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2>
        <p className="text-slate-500 text-sm">System-wide overview & analytics</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statConfig.map(({ key, label, icon: Icon, color, border }) => (
          <div key={key} className={`card flex items-center gap-4 border ${border}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} shrink-0`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium">{label}</p>
              <p className="text-3xl font-bold text-slate-800 leading-none mt-1">
                {loading ? '—' : (stats?.[key] ?? 0)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Department Overview */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <ChartBarIcon className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-slate-800">Department-wise Schedule Overview</h3>
        </div>

        {loading ? (
          <p className="text-slate-400 text-sm">Loading…</p>
        ) : stats?.departmentSchedules?.length ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-slate-500 font-medium py-2 pb-3">Department</th>
                <th className="text-left text-slate-500 font-medium py-2 pb-3">Scheduled Classes</th>
                <th className="text-left text-slate-500 font-medium py-2 pb-3">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stats.departmentSchedules.map(d => {
                const total = stats.departmentSchedules.reduce((a, b) => a + b.count, 0);
                const pct = Math.round((d.count / total) * 100);
                return (
                  <tr key={d._id} className="hover:bg-slate-50 transition">
                    <td className="py-3">
                      <span className="badge bg-indigo-50 text-indigo-700">{d._id}</span>
                    </td>
                    <td className="py-3 text-slate-700 font-medium">{d.count}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-2 max-w-[120px]">
                          <div
                            className="bg-indigo-500 h-2 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-slate-400 text-xs">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-slate-400 text-sm">No schedule data yet.</p>
        )}
      </div>
    </div>
  );
}

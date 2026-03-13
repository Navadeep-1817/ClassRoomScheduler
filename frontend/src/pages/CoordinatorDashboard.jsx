import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  UsersIcon,
  BookOpenIcon,
  PlusCircleIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

export default function CoordinatorDashboard() {
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    Promise.all([
      axios.get('http://localhost:5000/api/courses', { headers }),
      axios.get('http://localhost:5000/api/faculty', { headers }),
    ]).then(([cr, fr]) => {
      setCourses(cr.data);
      setFaculty(fr.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {user?.department} Department
          </h2>
          <p className="text-slate-500 text-sm">Coordinator overview for your department</p>
        </div>
        <a
          href="/timetable"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition shadow-sm"
        >
          <PlusCircleIcon className="w-4 h-4" /> New Schedule
        </a>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-5">
        <div className="card border border-emerald-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
            <UsersIcon className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-slate-500 text-xs">Faculty in Dept.</p>
            <p className="text-3xl font-bold text-slate-800">{loading ? '—' : faculty.length}</p>
          </div>
        </div>
        <div className="card border border-indigo-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
            <BookOpenIcon className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-slate-500 text-xs">Courses</p>
            <p className="text-3xl font-bold text-slate-800">{loading ? '—' : courses.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Faculty Table */}
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <AcademicCapIcon className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-slate-800">Faculty Members</h3>
          </div>
          {loading ? <p className="text-slate-400 text-sm">Loading…</p> : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 text-slate-500 font-medium">Name</th>
                  <th className="text-left py-2 text-slate-500 font-medium">Subjects</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {faculty.length ? faculty.map(f => (
                  <tr key={f._id} className="hover:bg-slate-50 transition">
                    <td className="py-3 text-slate-700 font-medium">{f.name}</td>
                    <td className="py-3">
                      <span className="badge bg-emerald-50 text-emerald-700">{f.subjects?.length ?? 0} subjects</span>
                    </td>
                  </tr>
                )) : <tr><td colSpan={2} className="py-4 text-slate-400 text-center">No faculty found.</td></tr>}
              </tbody>
            </table>
          )}
        </div>

        {/* Courses Table */}
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <BookOpenIcon className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-slate-800">Courses</h3>
          </div>
          {loading ? <p className="text-slate-400 text-sm">Loading…</p> : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 text-slate-500 font-medium">Code</th>
                  <th className="text-left py-2 text-slate-500 font-medium">Name</th>
                  <th className="text-left py-2 text-slate-500 font-medium">Credits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {courses.length ? courses.map(c => (
                  <tr key={c._id} className="hover:bg-slate-50 transition">
                    <td className="py-3">
                      <span className="badge bg-indigo-50 text-indigo-700">{c.courseCode}</span>
                    </td>
                    <td className="py-3 text-slate-700">{c.courseName}</td>
                    <td className="py-3 text-slate-500">{c.credits}</td>
                  </tr>
                )) : <tr><td colSpan={3} className="py-4 text-slate-400 text-center">No courses found.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

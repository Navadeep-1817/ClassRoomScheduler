import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  BookOpenIcon,
  PlusCircleIcon,
  AcademicCapIcon,
  ArrowPathRoundedSquareIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const API = 'http://localhost:5000/api';

export default function CoordinatorDashboard() {
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    Promise.all([
      axios.get(`${API}/courses`, { headers }),
      axios.get(`${API}/faculty`, { headers }),
      axios.get(`${API}/reschedules`, { headers })
    ]).then(([cr, fr, rq]) => {
      setCourses(cr.data);
      setFaculty(fr.data);
      setRequests(rq.data);
    }).catch(console.error).finally(() => setLoading(false));
  };

  const handleRequest = async (id, status) => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      await axios.patch(`${API}/reschedules/${id}`, { status }, { headers });
      fetchData(); // reload
    } catch (err) {
      alert(`Error updating request: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {user?.department} Department
          </h2>
          <p className="text-slate-500 text-sm">Coordinator overview for your department</p>
        </div>
        <Link
          to="/timetable"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition shadow-sm"
        >
          <PlusCircleIcon className="w-4 h-4" /> New Schedule
        </Link>
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

      {/* Reschedule Requests */}
      <div className="card border-l-4 border-l-amber-500">
        <div className="flex items-center gap-2 mb-4">
          <ArrowPathRoundedSquareIcon className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-slate-800">Pending Reschedule Requests</h3>
          <span className="badge bg-amber-50 text-amber-700 ml-auto">
            {requests.filter(r => r.status === 'Pending').length} Pending
          </span>
        </div>
        {loading ? <p className="text-slate-400 text-sm">Loading…</p> : (
          <div className="space-y-3">
            {requests.filter(r => r.status === 'Pending').map(r => (
              <div key={r._id} className="flex flex-col sm:flex-row gap-4 justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{r.schedule?.course?.courseCode} - {r.faculty?.name}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Moved to: <strong>{new Date(r.proposedDate).toLocaleDateString()}</strong> at <strong>{r.proposedTimeSlot}</strong> in Room <strong>{r.proposedRoom?.roomNumber}</strong>
                  </p>
                  <p className="text-xs italic text-slate-400 mt-1">"{r.reason}"</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleRequest(r._id, 'Approved')} className="p-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg" title="Approve">
                    <CheckIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleRequest(r._id, 'Rejected')} className="p-2 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-lg" title="Reject">
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            {requests.filter(r => r.status === 'Pending').length === 0 && (
              <p className="text-sm text-slate-400">No pending requests.</p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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

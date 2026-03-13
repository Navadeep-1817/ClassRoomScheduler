import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  CalendarDaysIcon,
  ClockIcon,
  BuildingOfficeIcon,
  BookOpenIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const API = 'http://localhost:5000/api';

export default function FacultyDashboard() {
  const [schedules, setSchedules] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [reqData, setReqData] = useState({ proposedDate: '', proposedTimeSlot: '09:00-10:00', proposedRoom: '', reason: '' });

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user?.facultyId) { setLoading(false); return; }
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    
    Promise.all([
      axios.get(`${API}/schedules?facultyId=${user.facultyId}`, { headers }),
      axios.get(`${API}/classrooms`, { headers })
    ]).then(([sr, cr]) => {
      setSchedules(sr.data);
      setClassrooms(cr.data);
      if (cr.data.length > 0) setReqData(prev => ({ ...prev, proposedRoom: cr.data[0]._id }));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/reschedules`, {
        scheduleId: selectedSchedule._id,
        ...reqData
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Reschedule request submitted successfully.');
      setShowModal(false);
    } catch (err) {
      alert(`Error: ${err.response?.data?.message || err.message}`);
    }
  };

  const now = new Date();
  const upcoming = schedules.filter(s => new Date(s.date) >= now);
  const past     = schedules.filter(s => new Date(s.date) <  now);

  const ClassCard = ({ s, variant }) => (
    <div className={`flex flex-col gap-3 p-4 rounded-xl border ${
      variant === 'upcoming'
        ? 'bg-emerald-50 border-emerald-100'
        : 'bg-slate-50 border-slate-100'
    }`}>
      <div className="flex gap-3 items-center">
        <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0 ${
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
        {variant === 'upcoming' && (
          <button 
            onClick={() => { setSelectedSchedule(s); setShowModal(true); }}
            className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-50 shadow-sm"
          >
            Reschedule
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 relative">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">My Classes</h2>
        <p className="text-slate-500 text-sm">Your personal teaching schedule</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Request Reschedule</h3>
            <p className="text-sm text-slate-500 mb-4">Request to move <strong>{selectedSchedule?.course?.courseCode}</strong> to a new time. Pending coordinator approval.</p>
            
            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Proposed Date</label>
                <input type="date" required className="input-field" value={reqData.proposedDate} onChange={e => setReqData({...reqData, proposedDate: e.target.value})} />
              </div>
              
              <div>
                <label className="form-label">Proposed Time Slot</label>
                <select className="input-field" value={reqData.proposedTimeSlot} onChange={e => setReqData({...reqData, proposedTimeSlot: e.target.value})}>
                  {["09:00-10:00", "10:00-11:00", "11:00-12:00", "13:00-14:00", "14:00-15:00"].map(ts => (
                    <option key={ts} value={ts}>{ts}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Proposed Room</label>
                <select className="input-field" value={reqData.proposedRoom} onChange={e => setReqData({...reqData, proposedRoom: e.target.value})}>
                  {classrooms.map(c => (
                    <option key={c._id} value={c._id}>{c.roomNumber} ({c.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Reason</label>
                <input type="text" required placeholder="Reason for reschedule..." className="input-field" value={reqData.reason} onChange={e => setReqData({...reqData, reason: e.target.value})} />
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-slate-500 font-medium hover:bg-slate-100">Cancel</button>
                <button type="submit" className="btn-primary">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

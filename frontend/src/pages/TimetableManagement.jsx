import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PlusCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';

const TIME_SLOTS = [
  '09:00-10:00', '10:00-11:00', '11:00-12:00', '13:00-14:00', '14:00-15:00',
];
const DEPARTMENTS = ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'IT'];

export default function TimetableManagement() {
  const [courses, setCourses]     = useState([]);
  const [faculty, setFaculty]     = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading]     = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));

  const [form, setForm] = useState({
    course: '', faculty: '', department: user?.role === 'Coordinator' ? user.department : '',
    classroom: '', date: '', timeSlot: '',
  });

  useEffect(() => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    Promise.all([
      axios.get('http://localhost:5000/api/courses',    { headers }),
      axios.get('http://localhost:5000/api/faculty',    { headers }),
      axios.get('http://localhost:5000/api/classrooms', { headers }),
    ]).then(([cr, fr, clr]) => {
      setCourses(cr.data); setFaculty(fr.data); setClassrooms(clr.data);
    }).catch(console.error);
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSuggestions(null); setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      await axios.post('http://localhost:5000/api/schedules', form, { headers });
      setSuccess('Schedule created successfully!');
      setForm(p => ({ ...p, course: '', faculty: '', classroom: '', date: '', timeSlot: '' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating schedule.');
      if (err.response?.data?.suggestions) setSuggestions(err.response.data.suggestions);
    } finally {
      setLoading(false);
    }
  };

  const SelectField = ({ label, value, onChange, required, children }) => (
    <div>
      <label className="form-label">{label}</label>
      <select className="input-field" value={value} onChange={onChange} required={required}>
        {children}
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Manage Timetable</h2>
        <p className="text-slate-500 text-sm">Schedule classes with automatic conflict detection</p>
      </div>

      <div className="max-w-2xl">
        {/* Alerts */}
        {success && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-5 py-4 mb-5 text-sm animate-[fadeIn_.3s_ease]">
            <CheckCircleIcon className="w-5 h-5 shrink-0" /> {success}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-4 text-sm">
            <div className="flex items-center gap-2 text-red-700 font-semibold mb-1">
              <ExclamationTriangleIcon className="w-5 h-5 shrink-0" /> Conflict Detected
            </div>
            <p className="text-red-600">{error}</p>

            {suggestions && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-amber-700 font-semibold mb-3">
                  <LightBulbIcon className="w-4 h-4" /> Smart Suggestions
                </div>
                <div className="space-y-2 text-xs text-slate-700">
                  <div>
                    <span className="font-semibold text-slate-600">Available Rooms: </span>
                    {suggestions.availableClassrooms?.length
                      ? suggestions.availableClassrooms.map(c => (
                          <span key={c._id} className="badge bg-white border border-slate-200 text-slate-700 mr-1">{c.roomNumber}</span>
                        ))
                      : <span className="text-slate-400">None</span>}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-600">Available Faculty: </span>
                    {suggestions.availableFaculty?.length
                      ? suggestions.availableFaculty.map(f => (
                          <span key={f._id} className="badge bg-white border border-slate-200 text-slate-700 mr-1">{f.name}</span>
                        ))
                      : <span className="text-slate-400">None</span>}
                  </div>
                  {suggestions.availableTimeSlots?.length > 0 && (
                    <div>
                      <span className="font-semibold text-slate-600">Free Time Slots: </span>
                      {suggestions.availableTimeSlots.map(ts => (
                        <span key={ts} className="badge bg-indigo-50 text-indigo-700 mr-1">{ts}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            <PlusCircleIcon className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-slate-800">Schedule New Class</h3>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField label="Course" value={form.course} onChange={e => set('course', e.target.value)} required>
                <option value="">Select Course</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.courseName} ({c.courseCode})</option>)}
              </SelectField>

              <SelectField label="Faculty" value={form.faculty} onChange={e => set('faculty', e.target.value)} required>
                <option value="">Select Faculty</option>
                {faculty.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
              </SelectField>

              <SelectField label="Classroom / Lab" value={form.classroom} onChange={e => set('classroom', e.target.value)} required>
                <option value="">Select Room</option>
                {classrooms.map(c => <option key={c._id} value={c._id}>{c.roomNumber} — {c.type} (Cap: {c.capacity})</option>)}
              </SelectField>

              {user?.role === 'Admin' ? (
                <SelectField label="Department" value={form.department} onChange={e => set('department', e.target.value)} required>
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </SelectField>
              ) : (
                <div>
                  <label className="form-label">Department</label>
                  <input className="input-field bg-slate-50 cursor-not-allowed" value={form.department} readOnly />
                </div>
              )}

              <div>
                <label className="form-label">Date</label>
                <input type="date" className="input-field" required value={form.date} onChange={e => set('date', e.target.value)} />
              </div>

              <SelectField label="Time Slot" value={form.timeSlot} onChange={e => set('timeSlot', e.target.value)} required>
                <option value="">Select Slot</option>
                {TIME_SLOTS.map(ts => <option key={ts} value={ts}>{ts}</option>)}
              </SelectField>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <button type="submit" disabled={loading}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-lg transition shadow-sm disabled:opacity-60">
                {loading ? 'Checking conflicts…' : <><PlusCircleIcon className="w-4 h-4" /> Create Schedule</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

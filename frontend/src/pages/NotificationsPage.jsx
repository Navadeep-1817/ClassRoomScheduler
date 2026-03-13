import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BellIcon,
  PlusCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

const API = 'http://localhost:5000/api';
const DEPARTMENTS = ['ALL', 'CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'IT'];

const notifStyle = {
  info:    { card: 'bg-blue-50 border-blue-200',   badge: 'bg-blue-100 text-blue-700',    text: 'text-blue-800'   },
  warning: { card: 'bg-amber-50 border-amber-200', badge: 'bg-amber-100 text-amber-700',  text: 'text-amber-800'  },
  success: { card: 'bg-emerald-50 border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', text: 'text-emerald-800' },
};
const NotifIcon = ({ type }) => {
  if (type === 'warning') return <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />;
  if (type === 'success') return <CheckCircleIcon className="w-5 h-5 shrink-0" />;
  return <InformationCircleIcon className="w-5 h-5 shrink-0" />;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [form, setForm] = useState({ message: '', type: 'info', department: 'ALL' });
  const [posting, setPosting]   = useState(false);
  const [success, setSuccess]   = useState('');
  const [error, setError]       = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
  const canPost = user?.role === 'Admin' || user?.role === 'Coordinator';

  const load = () => {
    setLoading(true);
    axios.get(`${API}/notifications`, { headers })
      .then(r => setNotifications(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) return;
    setPosting(true); setError(''); setSuccess('');
    try {
      await axios.post(`${API}/notifications`, form, { headers });
      setSuccess('Notification sent!');
      setForm({ message: '', type: 'info', department: user?.role === 'Coordinator' ? user.department : 'ALL' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send notification.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Notifications</h2>
        <p className="text-slate-500 text-sm">Department announcements and schedule alerts</p>
      </div>

      {/* ── POST FORM (Admin/Coordinator only) ── */}
      {canPost && (
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <PlusCircleIcon className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-slate-800">Broadcast Notification</h3>
          </div>

          {success && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm mb-4">
              <CheckCircleIcon className="w-4 h-4 shrink-0" /> {success}
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">
              <ExclamationTriangleIcon className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handlePost} className="space-y-4">
            <div>
              <label className="form-label">Message</label>
              <textarea
                className="input-field resize-none"
                rows={3}
                placeholder="e.g., Lab session on Friday is rescheduled to Room 204…"
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Type</label>
                <select className="input-field" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="info">ℹ️ Info</option>
                  <option value="warning">⚠️ Warning</option>
                  <option value="success">✅ Success</option>
                </select>
              </div>

              <div>
                <label className="form-label">Target Department</label>
                {user?.role === 'Coordinator' ? (
                  <input className="input-field bg-slate-50 cursor-not-allowed" value={user.department} readOnly />
                ) : (
                  <select className="input-field" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d === 'ALL' ? '🌐 All Departments' : d}</option>)}
                  </select>
                )}
              </div>
            </div>

            <button type="submit" disabled={posting}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition shadow-sm disabled:opacity-60">
              <BellIcon className="w-4 h-4" />
              {posting ? 'Sending…' : 'Send Notification'}
            </button>
          </form>
        </div>
      )}

      {/* ── NOTIFICATION LIST ── */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <BellIcon className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-slate-800">All Notifications</h3>
          {notifications.length > 0 && (
            <span className="badge bg-amber-50 text-amber-700">{notifications.length}</span>
          )}
        </div>

        {loading ? (
          <p className="text-slate-400 text-sm">Loading…</p>
        ) : notifications.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">No notifications yet.</p>
        ) : (
          <div className="space-y-3">
            {notifications.map(n => {
              const style = notifStyle[n.type] || notifStyle.info;
              return (
                <div key={n._id} className={`flex gap-3 border rounded-xl px-4 py-3.5 ${style.card}`}>
                  <div className={style.text}>
                    <NotifIcon type={n.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className={`text-sm font-medium leading-snug ${style.text}`}>{n.message}</p>
                      <span className={`badge shrink-0 ${style.badge}`}>{n.department}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">
                      {n.createdBy?.username || 'System'} ·{' '}
                      {new Date(n.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

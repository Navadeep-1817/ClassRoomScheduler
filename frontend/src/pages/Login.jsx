import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  AcademicCapIcon,
  LockClosedIcon,
  UserCircleIcon,
  ArrowRightIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const API = 'http://localhost:5000/api/auth';

export default function Login() {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  /* ── Login state ── */
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  /* ── Register state ── */
  const [regData, setRegData] = useState({
    name: '', username: '', password: '', role: 'Faculty', department: ''
  });

  const redirect = (role) => {
    if (role === 'Admin') navigate('/admin');
    else if (role === 'Coordinator') navigate('/coordinator');
    else if (role === 'Student') navigate('/student');
    else navigate('/faculty');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API}/login`, loginData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      redirect(res.data.role);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API}/register`, regData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      redirect(res.data.role);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-outfit">
      {/* ── Left Hero Panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <ClockIcon className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl">Smart Scheduler</span>
        </div>

        <div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Intelligent Classroom<br />Scheduling Made Simple
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            Automate timetables, detect conflicts in real-time, and keep every department in sync — all in one place.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { icon: '🛡️', label: 'Automatic Conflict Detection' },
              { icon: '📅', label: 'Weekly Calendar View' },
              { icon: '🎓', label: 'Role-based Access Control' },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-3 text-sm text-slate-300">
                <span className="text-xl">{f.icon}</span> {f.label}
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-600 text-xs">© 2026 Smart Scheduler. All rights reserved.</p>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-md">
          {/* Tab switcher */}
          <div className="flex rounded-xl bg-slate-200 p-1 mb-8">
            {['login', 'register'].map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab === t ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <div className="card">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                {tab === 'login' ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                {tab === 'login' ? 'Sign in to access your dashboard.' : 'Fill in the details to get started.'}
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm mb-5">
                <LockClosedIcon className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            {/* LOGIN FORM */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="form-label">Username</label>
                  <div className="relative">
                    <UserCircleIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      className="input-field pl-10"
                      placeholder="Enter username"
                      value={loginData.username}
                      onChange={e => setLoginData({ ...loginData, username: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Password</label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      className="input-field pl-10"
                      placeholder="Enter password"
                      value={loginData.password}
                      onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary mt-2" disabled={loading}>
                  {loading ? 'Signing in…' : <><ArrowRightIcon className="w-4 h-4" /> Sign In</>}
                </button>
              </form>
            )}

            {/* REGISTER FORM */}
            {tab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="form-label">Full Name</label>
                  <input
                    className="input-field"
                    placeholder="Dr. Jane Smith"
                    value={regData.name}
                    onChange={e => setRegData({ ...regData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Username</label>
                  <div className="relative">
                    <UserCircleIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      className="input-field pl-10"
                      placeholder="Choose a username"
                      value={regData.username}
                      onChange={e => setRegData({ ...regData, username: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Password</label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      className="input-field pl-10"
                      placeholder="Create a password"
                      value={regData.password}
                      onChange={e => setRegData({ ...regData, password: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Role</label>
                  <select
                    className="input-field"
                    value={regData.role}
                    onChange={e => setRegData({ ...regData, role: e.target.value, department: '' })}
                  >
                    <option value="Faculty">Faculty</option>
                    <option value="Student">Student</option>
                    <option value="Coordinator">Coordinator</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                {(regData.role === 'Coordinator' || regData.role === 'Student') && (
                  <div>
                    <label className="form-label">Department</label>
                    <select
                      className="input-field"
                      value={regData.department}
                      onChange={e => setRegData({ ...regData, department: e.target.value })}
                      required
                    >
                      <option value="">Select Department</option>
                      {['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'IT'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                )}

                <button type="submit" className="btn-primary mt-2" disabled={loading}>
                  {loading ? 'Creating account…' : <><AcademicCapIcon className="w-4 h-4" /> Create Account</>}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-slate-400 text-xs mt-6">
            Smart Classroom Scheduler — Conflict-free timetabling
          </p>
        </div>
      </div>
    </div>
  );
}

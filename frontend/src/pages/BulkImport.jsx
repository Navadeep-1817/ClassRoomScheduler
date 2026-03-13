import { useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../config/api';
import { ArrowUpTrayIcon, DocumentTextIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const API = `${API_BASE}/import`;

export default function BulkImport() {
  const [studentFile, setStudentFile] = useState(null);
  const [courseFile, setCourseFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpload = async (type) => {
    const file = type === 'students' ? studentFile : courseFile;
    if (!file) return;

    setLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const endpoint = type === 'students' ? `${API}/students` : `${API}/courses`;
      const res = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setMessage(`SUCCESS: ${res.data.message}`);
      if (type === 'students') setStudentFile(null);
      if (type === 'courses') setCourseFile(null);
    } catch (err) {
      setMessage(`ERROR: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const UploadCard = ({ title, type, file, setFile }) => (
    <div className="card border border-indigo-100 p-6 flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        <p className="text-slate-500 text-sm mt-1">Upload a CSV file containing {type} records.</p>
        <p className="text-xs text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md inline-block mt-2 font-mono">
          {type === 'students' ? 'Headers: username, name, rollNumber, department, (optional) password' : 'Headers: courseCode, courseName, department, credits'}
        </p>
      </div>

      <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition cursor-pointer relative">
        <input 
          type="file" 
          accept=".csv"
          onChange={e => setFile(e.target.files[0])}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {file ? (
          <div className="flex flex-col items-center">
            <CheckCircleIcon className="w-8 h-8 text-emerald-500 mb-2" />
            <p className="font-semibold text-slate-700">{file.name}</p>
            <p className="text-xs text-slate-400 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <DocumentTextIcon className="w-8 h-8 text-indigo-300 mb-2" />
            <p className="font-medium text-indigo-600">Click to select file</p>
            <p className="text-xs text-slate-400 mt-1">or drag and drop</p>
            <p className="text-[10px] uppercase text-slate-300 font-bold mt-2">CSV Only</p>
          </div>
        )}
      </div>

      <button 
        onClick={() => handleUpload(type)}
        disabled={!file || loading}
        className="btn-primary w-full flex justify-center gap-2 items-center disabled:opacity-50"
      >
        <ArrowUpTrayIcon className="w-5 h-5" /> 
        {loading ? 'Uploading...' : `Upload ${title}`}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Bulk Import System</h2>
        <p className="text-slate-500 text-sm">Upload CSV files to batch-create records instantly.</p>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-xl border font-medium ${message.startsWith('SUCCESS:') ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UploadCard title="Import Students" type="students" file={studentFile} setFile={setStudentFile} />
        <UploadCard title="Import Courses" type="courses" file={courseFile} setFile={setCourseFile} />
      </div>
    </div>
  );
}

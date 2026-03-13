// In development mode, Vite proxy will handle /api requests (empty string base URL).
// In production, fallback to the deployed Render URL if VITE_API_URL isn't set.
const isDev = import.meta.env?.DEV;
const DEFAULT_API_URL = isDev ? '' : 'https://classroomscheduler.onrender.com';

// Clean trailing slashes
const rawApiUrl = import.meta.env.VITE_API_URL || DEFAULT_API_URL;
const normalizedApiUrl = rawApiUrl ? rawApiUrl.replace(/\/$/, '') : '';

export const API_BASE_URL = normalizedApiUrl;

// If we are using the proxy (empty base URL), just use '/api'. 
// Otherwise, append '/api' to the production URL.
export const API_BASE = API_BASE_URL ? `${API_BASE_URL}/api` : '/api';

const DEFAULT_API_URL = 'https://classroomscheduler.onrender.com';

const normalizedApiUrl = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, '');

export const API_BASE_URL = normalizedApiUrl;
export const API_PREFIX = '/api';
export const API_BASE = `${API_BASE_URL}${API_PREFIX}`;

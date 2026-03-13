import axios from 'axios';

/**
 * Global Axios interceptor — auto-logout on any 401 response.
 * This handles stale / expired JWT tokens without any manual cleanup needed.
 */
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // Don't redirect if we're already on the login page
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

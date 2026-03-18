import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Send httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: (params) => {
    const parts = [];
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        value.forEach(v => parts.push(`${key}=${encodeURIComponent(v)}`));
      } else if (value !== undefined && value !== null) {
        parts.push(`${key}=${encodeURIComponent(value)}`);
      }
    }
    return parts.join('&');
  },
});

// Request interceptor - add token from localStorage if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Handle 403 Forbidden - show error but don't redirect
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data.message);
    }

    return Promise.reject(error);
  }
);

export default api;

/*
  api.js – Central Axios instance for the Trip Planner MERN app.
  Attaches the JWT token from localStorage to every outgoing request
  and redirects to /login on a 401 (token expired / unauthorized).
*/
import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Proxied to http://localhost:5000/api via vite.config.js
});

// Request interceptor: inject the saved JWT as a Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: on 401, clear session and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

import axios from 'axios';

// Default: local backend. Override with REACT_APP_API_URL (e.g. on Vercel only if you expose a public API).
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
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

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Teachers API
export const teachersAPI = {
  getAll: () => api.get('/teachers'),
  getById: (id) => api.get(`/teachers/${id}`),
  create: (data) => api.post('/teachers', data),
  update: (id, data) => api.put(`/teachers/${id}`, data),
  delete: (id) => api.delete(`/teachers/${id}`),
};

// Rooms API
export const roomsAPI = {
  getAll: () => api.get('/rooms'),
  getById: (id) => api.get(`/rooms/${id}`),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`),
};

// Labs API
export const labsAPI = {
  getAll: () => api.get('/labs'),
  getById: (id) => api.get(`/labs/${id}`),
  create: (data) => api.post('/labs', data),
  update: (id, data) => api.put(`/labs/${id}`, data),
  delete: (id) => api.delete(`/labs/${id}`),
};

// Sections API
export const sectionsAPI = {
  getAll: () => api.get('/sections'),
  getById: (id) => api.get(`/sections/${id}`),
  create: (data) => api.post('/sections', data),
  update: (id, data) => api.put(`/sections/${id}`, data),
  delete: (id) => api.delete(`/sections/${id}`),
};

// Time Slots API
export const timeSlotsAPI = {
  getAll: () => api.get('/timeslots'),
  getById: (id) => api.get(`/timeslots/${id}`),
  create: (data) => api.post('/timeslots', data),
  update: (id, data) => api.put(`/timeslots/${id}`, data),
  delete: (id) => api.delete(`/timeslots/${id}`),
};

// Registrations API
export const registrationsAPI = {
  getAll: () => api.get('/registrations'),
  getById: (id) => api.get(`/registrations/${id}`),
  create: (data) => api.post('/registrations', data),
  update: (id, data) => api.put(`/registrations/${id}`, data),
  delete: (id) => api.delete(`/registrations/${id}`),
  approve: (id) => api.patch(`/registrations/${id}/approve`),
  reject: (id) => api.patch(`/registrations/${id}/reject`),
};

// Timetables API
export const timetablesAPI = {
  getAll: () => api.get('/timetables'),
  getById: (id) => api.get(`/timetables/${id}`),
  /** BE schedule Mon–Fri (full documents; same base URL as local or env). */
  getBE: (id) => api.get(`/timetables/${id}/BE`),
  /** Compact { schedule: [...] } for one weekday, e.g. day = 'monday'. */
  getBEByDay: (id, day) => api.get(`/timetables/${id}/BE/${encodeURIComponent(day)}`),
  generate: (data) => api.post('/timetables/generate', data),
  update: (id, data) => api.put(`/timetables/${id}`, data),
  delete: (id) => api.delete(`/timetables/${id}`),
  publish: (id) => api.patch(`/timetables/${id}/publish`),
};

export default api;


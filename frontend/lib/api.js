import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('token') || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// AUTH
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getMe: () => api.get('/api/auth/me'),
  logout: () => api.post('/api/auth/logout'),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/api/auth/reset-password', data),
};

// USERS
export const usersAPI = {
  getAll: () => api.get('/api/users'),
  getById: (id) => api.get(`/api/users/${id}`),
  updateProfile: (data) => api.put('/api/users/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteUser: (id) => api.delete(`/api/users/${id}`),
  getNotifications: () => api.get('/api/users/me/notifications'),
  markNotificationsRead: () => api.put('/api/users/notifications/read'),
  getAnalytics: () => api.get('/api/users/admin/analytics'),
};

// CHANNELS
export const channelsAPI = {
  getAll: () => api.get('/api/channels'),
  create: (data) => api.post('/api/channels', data),
  getById: (id) => api.get(`/api/channels/${id}`),
  update: (id, data) => api.put(`/api/channels/${id}`, data),
  delete: (id) => api.delete(`/api/channels/${id}`),
  join: (id) => api.post(`/api/channels/${id}/join`),
  createDirect: (userId) => api.post('/api/channels/direct', { userId }),
  getMessages: (id, params) => api.get(`/api/channels/${id}/messages`, { params }),
};

// FILES
export const filesAPI = {
  upload: (formData) => api.post('/api/files/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: (params) => api.get('/api/files', { params }),
  getCourses: () => api.get('/api/files/courses'),
  getById: (id) => api.get(`/api/files/${id}`),
  download: (id) => api.get(`/api/files/${id}/download`, { responseType: 'blob' }),
  delete: (id) => api.delete(`/api/files/${id}`),
};

// AI
export const aiAPI = {
  chat: (data) => api.post('/api/ai/chat', data),
  summarize: (fileId) => api.post('/api/ai/summarize', { fileId }),
  generateQuiz: (fileId, numQuestions) => api.post('/api/ai/quiz', { fileId, numQuestions }),
  keyPoints: (fileId) => api.post('/api/ai/key-points', { fileId }),
  search: (query, courseFilter) => api.post('/api/ai/search', { query, courseFilter }),
};

export default api;

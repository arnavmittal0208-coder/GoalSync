import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('goalsync_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 (skip login/register — wrong password is also 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isLoginAttempt = url.includes('/auth/login') || url.includes('/auth/register');
    if (error.response?.status === 401 && !isLoginAttempt) {
      localStorage.removeItem('goalsync_token');
      localStorage.removeItem('goalsync_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Goal APIs
export const goalAPI = {
  getMyGoals: (params) => api.get('/goals', { params }),
  getGoal: (id) => api.get(`/goals/${id}`),
  createGoal: (data) => api.post('/goals', data),
  updateGoal: (id, data) => api.put(`/goals/${id}`, data),
  deleteGoal: (id) => api.delete(`/goals/${id}`),
  submitGoals: () => api.post('/goals/submit'),
  getTeamGoals: (params) => api.get('/goals/manager/team', { params }),
  approveGoal: (id, data) => api.put(`/goals/${id}/approve`, data),
  rejectGoal: (id, data) => api.put(`/goals/${id}/reject`, data),
  unlockGoal: (id) => api.put(`/goals/${id}/unlock`),
  createSharedGoal: (data) => api.post('/goals/shared', data),
  getAllGoals: (params) => api.get('/goals/admin/all', { params }),
};

// CheckIn APIs
export const checkInAPI = {
  getMyCheckIns: (params) => api.get('/checkins', { params }),
  upsertCheckIn: (data) => api.post('/checkins', data),
  addManagerComment: (id, data) => api.put(`/checkins/${id}/comment`, data),
  getTeamCheckIns: (params) => api.get('/checkins/team', { params }),
  getAllCheckIns: (params) => api.get('/checkins/all', { params }),
};

// User APIs
export const userAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getManagers: () => api.get('/users/managers'),
  getTeamMembers: () => api.get('/users/team'),
  getAnalytics: () => api.get('/users/analytics'),
};

// Notification APIs
export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

// Report APIs
export const reportAPI = {
  getReportData: (params) => api.get('/reports', { params }),
  downloadReport: (params) => api.get('/reports', { params, responseType: 'blob' }),
  getAuditLogs: (params) => api.get('/reports/audit', { params }),
  getCycles: () => api.get('/reports/cycles'),
  createCycle: (data) => api.post('/reports/cycles', data),
  updateCycle: (id, data) => api.put(`/reports/cycles/${id}`, data),
  deleteCycle: (id) => api.delete(`/reports/cycles/${id}`),
};

export default api;

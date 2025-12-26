import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const notificationService = {
  getNotifications: () => api.get('/notifications/'),
  getUnreadCount: () => api.get('/notifications/unread-count/'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read/`),
  markAllAsRead: () => api.post('/notifications/mark-all-read/'),
};
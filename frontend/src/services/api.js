// Frontend API service
// Centralized axios instance with authentication

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Unauthorized - clear token and redirect
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ============================================
// Authentication APIs
// ============================================

export const authAPI = {
    signup: (data) => api.post('/auth/signup', data),
    login: (email, password) => api.post('/auth/login', { email, password }),
    getProfile: () => api.get('/auth/profile'),
};

// ============================================
// Monitor APIs
// ============================================

export const monitorAPI = {
    create: (data) => api.post('/monitors', data),
    getAll: () => api.get('/monitors'),
    getById: (id) => api.get(`/monitors/${id}`),
    update: (id, data) => api.put(`/monitors/${id}`, data),
    delete: (id) => api.delete(`/monitors/${id}`),
    getLogs: (id, params) => api.get(`/monitors/${id}/logs`, { params }),
    getAnalytics: (id, params) => api.get(`/monitors/${id}/analytics`, { params }),
};

// ============================================
// Alert APIs
// ============================================

export const alertAPI = {
    getAll: (params) => api.get('/monitors/alerts', { params }),
};

export default api;

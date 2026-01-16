import axios from 'axios';
import type { AxiosInstance } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor for auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('universo_edu_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('universo_edu_token');
            localStorage.removeItem('universo_edu_user');
            window.location.href = '/admin/login';
        }
        return Promise.reject(error);
    }
);

// Chat Service
export const chatService = {
    createSession: async (subject: string = 'General') => {
        const { data } = await api.post('/chat/session', { subject });
        return data;
    },

    sendMessage: async (sessionId: string, message: string, subject: string = 'General') => {
        const { data } = await api.post('/chat/message', { sessionId, message, subject });
        return data;
    },

    getHistory: async (sessionId: string) => {
        const { data } = await api.get(`/chat/history/${sessionId}`);
        return data;
    }
};

// Task Service
export const taskService = {
    getTasks: async (week?: number) => {
        const params = week ? { week } : {};
        const { data } = await api.get('/tasks', { params });
        return data;
    },

    getTask: async (id: string) => {
        const { data } = await api.get(`/tasks/${id}`);
        return data;
    },

    generateTask: async (subject: string, topic: string, weekNumber?: number) => {
        const { data } = await api.post('/tasks/generate', { subject, topic, weekNumber });
        return data;
    },

    publishTask: async (id: string) => {
        const { data } = await api.put(`/tasks/${id}/publish`);
        return data;
    },

    deleteTask: async (id: string) => {
        const { data } = await api.delete(`/tasks/${id}`);
        return data;
    }
};

// Auth Service
export const authService = {
    login: async (email: string, password: string) => {
        const { data } = await api.post('/auth/login', { email, password });
        if (data.success && data.token) {
            localStorage.setItem('universo_edu_token', data.token);
            localStorage.setItem('universo_edu_user', JSON.stringify(data.user));
        }
        return data;
    },

    logout: () => {
        localStorage.removeItem('universo_edu_token');
        localStorage.removeItem('universo_edu_user');
        window.location.href = '/';
    },

    getUser: () => {
        const user = localStorage.getItem('universo_edu_user');
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('universo_edu_token');
    },

    me: async () => {
        const { data } = await api.get('/auth/me');
        return data;
    }
};

// Admin Service
export const adminService = {
    getTasks: async (page: number = 1, limit: number = 10) => {
        const { data } = await api.get('/admin/tasks', { params: { page, limit } });
        return data;
    },

    getSchedules: async () => {
        const { data } = await api.get('/admin/schedules');
        return data;
    },

    createSchedule: async (schedule: {
        name: string;
        subject: string;
        topic: string;
        weekNumber: number;
        publishDays?: string[];
        publishTime?: string;
    }) => {
        const { data } = await api.post('/admin/schedules', schedule);
        return data;
    },

    updateSchedule: async (id: string, updates: Record<string, unknown>) => {
        const { data } = await api.put(`/admin/schedules/${id}`, updates);
        return data;
    },

    deleteSchedule: async (id: string) => {
        const { data } = await api.delete(`/admin/schedules/${id}`);
        return data;
    },

    getStats: async () => {
        const { data } = await api.get('/admin/stats');
        return data;
    },

    getContent: async (page: number = 1, limit: number = 20) => {
        const { data } = await api.get('/admin/content', { params: { page, limit } });
        return data;
    },

    createManualTask: async (taskData: any) => {
        const { data } = await api.post('/admin/tasks', taskData);
        return data;
    },

    updateTask: async (id: string, taskData: any) => {
        const { data } = await api.put(`/admin/tasks/${id}`, taskData);
        return data;
    },

    deleteTask: async (id: string) => {
        const { data } = await api.delete(`/admin/tasks/${id}`);
        return data;
    }
};

// Reading Service
export const readingService = {
    getTodayReading: async () => {
        const { data } = await api.get('/readings/today');
        return data;
    },
    generateDaily: async () => {
        const { data } = await api.post('/readings/generate-daily');
        return data;
    }
};

export default api;

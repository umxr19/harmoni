import axios from 'axios';
import { User, Question, RegisterData } from '../types';

const api = axios.create({
    baseURL: 'http://localhost:3000/api'
});

export default api;

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

interface LoginResponse {
    token: string;
    user: User;
}

export const authService = {
    login: async (email: string, password: string) => {
        const response = await api.post<LoginResponse>('/auth/login', { email, password });
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response;
    },
    register: async (userData: RegisterData) => {
        return api.post<User>('/auth/register', userData);
    },
    getProfile: async () => {
        return api.get<User>('/user/profile');
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};

export const adminService = {
    getUsers: async () => {
        return api.get<User[]>('/admin/users');
    },
    updateUserRole: async (userId: string, role: string) => {
        return api.put(`/admin/users/${userId}/role`, { role });
    },
    deleteUser: async (userId: string) => {
        return api.delete(`/admin/users/${userId}`);
    }
};

export const teacherService = {
    createQuestion: async (questionData: Partial<Question>) => {
        return api.post<Question>('/questions', questionData);
    },
    updateQuestion: async (id: string, questionData: Partial<Question>) => {
        return api.put<Question>(`/questions/${id}`, questionData);
    },
    deleteQuestion: async (id: string) => {
        return api.delete(`/questions/${id}`);
    }
};

export const questionService = {
    getQuestions: async () => {
        return api.get<Question[]>('/questions');
    },
    getQuestionById: async (id: string) => {
        return api.get<Question>(`/questions/${id}`);
    },
    submitAttempt: async (questionId: string, answer: string, timeSpent: number) => {
        return api.post(`/questions/${questionId}/attempt`, {
            selectedOption: answer,
            timeSpent
        });
    },
    getMyQuestions: async () => {
        return api.get<Question[]>('/questions/my-questions');
    },
    getQuestionStats: async (id: string) => {
        return api.get(`/questions/${id}/stats`);
    },
    updateQuestion: async (id: string, questionData: Partial<Question>) => {
        return api.put<Question>(`/questions/${id}`, questionData);
    }
}; 
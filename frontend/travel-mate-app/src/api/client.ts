import axios from 'axios';
import { useUserStore } from '../store/useUserStore';

const BACKEND = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
    baseURL: BACKEND,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ── THE FIX: Axios Request Interceptor ──
// This runs automatically before EVERY request and attaches your Admin/User badge
apiClient.interceptors.request.use((config) => {
    // 1. Grab the current user state from Zustand
    const state = useUserStore.getState();

    // 2. If they are logged in, attach their ID and Role to the headers
    if (state.isAuthenticated && state.user) {
        config.headers['userid'] = state.user.userId || state.user._id;
        config.headers['role'] = state.role;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});
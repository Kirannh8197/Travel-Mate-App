import { apiClient } from '../api/client';

export const authService = {
    login: async (credentials: { email: string; password: string }) => {
        const response = await apiClient.post('/auth/login', credentials);
        return response.data; // { message, data: user, role }
    }
};
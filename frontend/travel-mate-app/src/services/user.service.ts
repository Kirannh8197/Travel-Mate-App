import { apiClient } from '../api/client';

export const userService = {
    register: async (userData: any) => {
        const response = await apiClient.post('/users/', userData);
        return response.data;
    },
    
    updateProfile: async (userId: number, updateData: any) => {
        const response = await apiClient.put(`/users/${userId}`, updateData, {
            headers: { userid: userId.toString() }
        });
        return response.data;
    },

    getAllUsers: async () => {
        const response = await apiClient.get('/users/');
        return response.data;
    }
};
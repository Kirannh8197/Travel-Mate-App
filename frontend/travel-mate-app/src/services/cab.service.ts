import { apiClient } from '../api/client';

export const cabService = {
    bookCab: async (cabData: any) => {
        const response = await apiClient.post('/cabs', cabData);
        return response.data;
    },

    getUserRides: async (userId: string) => {
        const response = await apiClient.get(`/cabs/user/${userId}`);
        return response.data;
    },
    // Add other cab endpoints (cancel, complete, etc.) as needed
};
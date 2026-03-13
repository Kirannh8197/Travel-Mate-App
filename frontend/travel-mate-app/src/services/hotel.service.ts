import { apiClient } from '../api/client';

export const hotelService = {
    getAllHotels: async () => {
        const response = await apiClient.get('/hotel');
        return response.data;
    },

    getHotelById: async (hotelId: string | number) => {
        const response = await apiClient.get(`/hotel/${hotelId}`);
        return response.data;
    },

    createHotel: async (formData: FormData) => {
        const response = await apiClient.post('/hotel', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    updateHotel: async (hotelId: string | number, formData: FormData) => {
        const response = await apiClient.patch(`/hotel/${hotelId}/edit`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};
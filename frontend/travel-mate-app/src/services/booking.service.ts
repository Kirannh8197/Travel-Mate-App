import { apiClient } from '../api/client';

export const bookingService = {
    createBooking: async (bookingData: { userId: string, hotelId: string, checkInDate: string, checkOutDate: string , totalAmount: Number}) => {
        const response = await apiClient.post('/bookings', bookingData);
        return response.data;
    },

    getUserBookings: async (userId: string) => {
        const response = await apiClient.get(`/bookings/user/${userId}`);
        return response.data;
    },

    getHotelBookings: async (hotelId: string) => {
        const response = await apiClient.get(`/bookings/hotel/${hotelId}`);
        return response.data;
    },

    // State Actions
    checkIn: async (bookingId: string) => {
        const response = await apiClient.patch(`/bookings/${bookingId}/checkin`);
        return response.data;
    },

    checkOut: async (bookingId: string) => {
        const response = await apiClient.patch(`/bookings/${bookingId}/checkout`);
        return response.data;
    },

    confirmBooking: async (bookingId: string) => {
        const response = await apiClient.patch(`/bookings/${bookingId}/confirm`);
        return response.data;
    },

    cancelBooking: async (bookingId: string) => {
        const response = await apiClient.patch(`/bookings/${bookingId}/cancel`);
        return response.data;
    }
};
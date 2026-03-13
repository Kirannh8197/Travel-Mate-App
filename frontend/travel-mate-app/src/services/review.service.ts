import { apiClient } from '../api/client';

export const reviewService = {
    createReview: async (reviewData: any) => {
        const response = await apiClient.post('/reviews', reviewData);
        return response.data;
    },

    getReviewsByHotel: async (hotelId: string | number) => {
        const response = await apiClient.get(`/reviews/hotel/${hotelId}`);
        return response.data;
    },

    deleteReview: async (reviewId: string | number) => {
        const response = await apiClient.delete(`/reviews/${reviewId}`);
        return response.data;
    }
};
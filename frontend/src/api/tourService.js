import axios from './axios';

export const tourService = {
  getTours: async () => {
    const response = await axios.get('/api/tours');
    return response.data;
  },

  getTourById: async (id) => {
    const response = await axios.get(`/api/tours/${id}`);
    return response.data;
  },

  getRecommendedTours: async () => {
    const response = await axios.get('/api/tours/recommended');
    return response.data;
  },

  saveTour: async (tourId) => {
    const response = await axios.post(`/api/tours/${tourId}/save`);
    return response.data;
  },

  completeTour: async (tourId) => {
    const response = await axios.post(`/api/tours/${tourId}/complete`);
    return response.data;
  },
}; 
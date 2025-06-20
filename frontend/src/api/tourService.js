import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const tourService = {
  getTours: async () => {
    const response = await axios.get(`${API_URL}/tours`);
    return response.data;
  },

  getTourById: async (id) => {
    const response = await axios.get(`${API_URL}/tours/${id}`);
    return response.data;
  },

  getRecommendedTours: async () => {
    const response = await axios.get(`${API_URL}/tours/recommended`);
    return response.data;
  },

  saveTour: async (tourId) => {
    const response = await axios.post(`${API_URL}/tours/${tourId}/save`);
    return response.data;
  },

  completeTour: async (tourId) => {
    const response = await axios.post(`${API_URL}/tours/${tourId}/complete`);
    return response.data;
  },
}; 
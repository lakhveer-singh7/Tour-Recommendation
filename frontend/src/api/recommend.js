import axios from './axios';

export const getOptimizedRoute = async (params) => {
  const response = await axios.post('/api/recommend/optimize', params);
  return response.data;
};
import axios from './axios';

export const getOptimizedRoute = async (params) => {
  const response = await axios.post('/api/tour-plan/optimize', params);
  return response.data;
};
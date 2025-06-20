import axios from './axios';

export const getDirections = async (originLat, originLng, destinationLat, destinationLng) => {
  try {
    const response = await axios.get('/api/directions', {
      params: {
        originLat,
        originLng,
        destinationLat,
        destinationLng,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching directions:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch directions');
  }
}; 
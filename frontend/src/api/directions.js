import axios from './axios';

const API_URL = '/directions';

export const getDirections = async (originLat, originLng, destinationLat, destinationLng) => {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found.');
    }

    const response = await axios.get(`${API_URL}/directions`, {
      params: {
        originLat,
        originLng,
        destinationLat,
        destinationLng,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching directions:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch directions');
  }
}; 
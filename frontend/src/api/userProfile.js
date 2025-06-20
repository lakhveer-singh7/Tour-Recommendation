import axios from './axios';

const API_URL = '/api/auth';

export const saveUserPreferences = async (userId, preferences) => {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found.');
    }

    const response = await axios.put(`${API_URL}/profile`, { preferences }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error saving user preferences:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to save preferences');
  }
};

export const getUserPreferences = async (userId) => {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found.');
    }

    const response = await axios.get(`${API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user preferences:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch preferences');
  }
}; 
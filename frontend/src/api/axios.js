import axios from 'axios';

const backendUrl = process.env.REACT_APP_BACKEND_URL;

if (!backendUrl) {
  console.warn(
    "WARNING: REACT_APP_BACKEND_URL environment variable is not set.",
    "The application will use fallback authentication methods.",
    "Please set it in your .env file or hosting environment for full functionality."
  );
}

const instance = axios.create({
  baseURL: backendUrl || 'http://localhost:5002', // Fallback to localhost
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 second timeout
});

// Add a request interceptor to include the auth token
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add a response interceptor to handle errors
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Axios error:', error);
    return Promise.reject(error);
  }
);

export default instance;
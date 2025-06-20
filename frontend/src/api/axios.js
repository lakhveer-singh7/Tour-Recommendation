import axios from 'axios';

const backendUrl = process.env.REACT_APP_BACKEND_URL;

if (!backendUrl) {
  console.error(
    "FATAL: REACT_APP_BACKEND_URL environment variable is not set.",
    "The application will not be able to communicate with the backend.",
    "Please set it in your .env file or hosting environment."
  );
}

const instance = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
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

export default instance;
import axios from 'axios';

// Create a configured axios instance
export const api = axios.create({
  baseURL: 'http://localhost:3001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (for adding tokens later)
api.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (for standardizing error responses)
api.interceptors.response.use(
  (response) => {
    // Return only the data payload as per the backend spec
    return response.data;
  },
  (error) => {
    // Forward the custom backend error payload if available
    if (error.response && error.response.data) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);

import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://localhost:7157/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.log(`Response status: ${error.response.status}`);
      console.log(`Response data:`, error.response.data);
      if (error.response.status === 429) {
        alert('Rate limit exceeded. Please try again later.');
      }
    } else {
      console.error('Response error without status code:', error);
    }
    return Promise.reject(error);
  }
);

export default instance;

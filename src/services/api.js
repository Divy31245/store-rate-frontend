import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem('store-rating-user');

  if (storedUser) {
    try {
      const { token } = JSON.parse(storedUser);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      localStorage.removeItem('store-rating-user');
    }
  }

  return config;
});

export default api;

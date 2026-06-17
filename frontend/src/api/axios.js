import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track whether we're in production (Vite proxy unavailable)
const isProduction = !!import.meta.env.VITE_API_URL;
const uploadsBase = isProduction ? `${import.meta.env.VITE_API_URL}` : '';

// Attach token from localStorage to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-fix image URLs from backend responses
function fixImageUrls(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === 'string' && val.startsWith('/uploads/')) {
      obj[key] = `${uploadsBase}${val}`;
    } else if (Array.isArray(val)) {
      val.forEach(fixImageUrls);
    } else if (val && typeof val === 'object') {
      fixImageUrls(val);
    }
  }
  return obj;
}

API.interceptors.response.use((response) => {
  if (isProduction && response.data) {
    fixImageUrls(response.data);
  }
  return response;
});

export default API;

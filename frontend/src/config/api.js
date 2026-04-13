// API Configuration for different environments
const API_BASE_URL = import.meta.env.PROD
    ? (import.meta.env.VITE_API_URL || 'https://codemaster-1.onrender.com')
    : 'http://localhost:3000';

export default API_BASE_URL;

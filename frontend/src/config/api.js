// API Configuration for different environments
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD
    ? 'https://codemaster-backend.onrender.com'
    : 'http://localhost:3000');

export default API_BASE_URL;

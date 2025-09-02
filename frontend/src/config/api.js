export const API_BASE_URL = import.meta.env.PROD 
    ? 'https://your-backend-service-name.onrender.com'  // Replace with your actual backend URL
    : 'http://localhost:3000';

export default API_BASE_URL;

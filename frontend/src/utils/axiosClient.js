//any type of request can be make by axios
import axios from "axios"

const axiosClient = axios.create({
    baseURL : import.meta.env.VITE_API_URL,
    withCredentials : true,
    headers:{
        'Content-Type': 'application/json'
    }
});

export default axiosClient;

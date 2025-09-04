//any type of request can be make by axios
import axios from "axios"

const axiosClient = axios.create({
    baseURL : 'https://codemaster-ebbm.onrender.com',
    withCredentials : true,
    headers:{
        'Content-Type': 'application/json'
    }
});

export default axiosClient;

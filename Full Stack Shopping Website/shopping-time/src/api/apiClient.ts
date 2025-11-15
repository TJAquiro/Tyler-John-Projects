import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3001/api', // TODO: replace this with actual/dynamic URL
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;

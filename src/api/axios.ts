// import axios from 'axios';

// const api = axios.create({
//   baseURL: 'http://localhost:5000/api',
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// export default api;

import axios from 'axios';

const api = axios.create({
  baseURL: 'https://orionapisalpha.onrender.com',
  headers: {
    'Content-Type': 'application/json',
    // Add authorization header if needed
    // 'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN || ''}`,
  },
});

export default api;
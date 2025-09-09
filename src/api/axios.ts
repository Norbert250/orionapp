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
  baseURL: 'https://orionbackend-39v9.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
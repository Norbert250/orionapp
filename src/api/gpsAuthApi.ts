import axios from 'axios';

const gpsAuthApi = axios.create({
  baseURL: 'https://gps-fastapi-upload.onrender.com',
});

let cachedToken: string | null = null;

export const getGpsToken = async (): Promise<string> => {
  if (cachedToken) return cachedToken;

  try {
    const response = await gpsAuthApi.post('/auth/token', {
      username: 'USER123',
      password: 'secret123'
    });
    
    cachedToken = response.data.access_token;
    return cachedToken;
  } catch (error) {
    console.error('GPS auth failed:', error);
    throw error;
  }
};
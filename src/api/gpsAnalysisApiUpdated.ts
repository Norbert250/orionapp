import axios from 'axios';

const gpsAuthApi = axios.create({
  baseURL: 'https://gps-fastapi-upload.onrender.com',
});

const gpsApi = axios.create({
  baseURL: 'https://gps-fastapi-upload.onrender.com',
});

let cachedToken: string | null = null;

const getGpsToken = async (): Promise<string> => {
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

export const analyzeGpsImages = async (images: File[], userId: string) => {
  try {
    console.log('Starting GPS analysis for user:', userId);
    const token = await getGpsToken();
    console.log('Got GPS token:', token ? 'success' : 'failed');
    
    const formData = new FormData();
    images.forEach((image, index) => {
      console.log(`Adding image ${index + 1}:`, image.name);
      formData.append('images', image);
    });

    console.log('Sending GPS analysis request...');
    const response = await gpsApi.post(`/users/${userId}/images`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000
    });
    
    console.log('GPS analysis response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('GPS analysis API error:', error);
    if (error.response) {
      console.error('GPS API response error:', error.response.data);
      console.error('GPS API status:', error.response.status);
    }
    throw error;
  }
};
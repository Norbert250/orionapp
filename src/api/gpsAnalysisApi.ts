import axios from 'axios';
import { getGpsScore } from './gpsScoreApi';

export const calculateGpsScoreAfterAssets = async (loanId: string) => {
  try {
    console.log('Calculating GPS score after assets processing for loan:', loanId);
    const scoreResponse = await getGpsScore(loanId);
    console.log('GPS score calculated successfully:', scoreResponse);
    return scoreResponse;
  } catch (error: any) {
    console.error('GPS score calculation failed:', error);
    throw error;
  }
};

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
    console.log('Authenticating with GPS API...');
    
    const formData = new FormData();
    formData.append('username', 'USER123');
    formData.append('password', 'secret123');
    
    const response = await gpsAuthApi.post('/auth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    cachedToken = response.data.access_token;
    console.log('GPS authentication successful');
    return cachedToken;
  } catch (error: any) {
    console.error('GPS auth failed:', error);
    if (error.response) {
      console.error('GPS auth response error:', error.response.data);
    }
    throw error;
  }
};

export const analyzeGpsImages = async (images: File[], userId?: string, loanId?: string) => {
  try {
    console.log('Starting GPS analysis with', images.length, 'images');
    const token = await getGpsToken();
    
    const formData = new FormData();
    images.forEach((image, index) => {
      console.log(`Adding image ${index + 1}:`, image.name, 'size:', image.size);
      formData.append('files', image);
    });

    console.log('Sending GPS analysis request to /users/USER123/images...');
    const uploadResponse = await gpsApi.post('/users/USER123/images', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000
    });
    
    console.log('GPS images uploaded successfully:', uploadResponse.data);

    return {
      upload: uploadResponse.data,
      score: { status: 'uploaded', message: 'GPS images uploaded successfully' }
    };
  } catch (error: any) {
    console.error('GPS analysis API error:', error);
    if (error.response) {
      console.error('GPS API response error:', error.response.data);
      console.error('GPS API status:', error.response.status);
    }
    throw error;
  }
};
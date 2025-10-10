import axios from 'axios';
import { getGpsToken } from './gpsAuthApi';

const gpsApi = axios.create({
  baseURL: 'https://gps-fastapi-upload.onrender.com',
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export const analyzeGpsImages = async (images: File[], userId: string) => {
  try {
    const token = await getGpsToken();
    
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });

    const response = await gpsApi.post(`/users/${userId}/images`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000
    });
    
    return response.data;
  } catch (error: any) {
    console.error('GPS analysis API error:', error);
    throw error;
  }
};
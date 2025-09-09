import axios from 'axios';

const prescriptionAnalysisApi = axios.create({
  baseURL: 'https://prescriptionanalyzer.onrender.com',
  timeout: 60000, // 60 second timeout
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  }
});

export const analyzePrescription = async (file: File, userId?: string) => {
  try {
    const formData = new FormData();
    formData.append('files', file);
    formData.append('user_id', '1'); // Use integer user_id
    
    console.log('Sending prescription to API with user_id:', userId);
    const response = await prescriptionAnalysisApi.post('/analyze_prescription', formData);
    console.log('Prescription analysis API success:', response.status, response.data);
    return response.data;
  } catch (error: any) {
    console.error('Prescription analysis API error:', error);
    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out');
      throw new Error('Prescription analysis timed out. Please try again.');
    }
    if (error.response) {
      console.error('API response error:', error.response.data);
      throw new Error(`API Error: ${error.response.status}`);
    }
    if (error.request) {
      console.error('Network error - no response received');
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
};
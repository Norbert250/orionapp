import axios from 'axios';

const drugAnalysisApi = axios.create({
  baseURL: import.meta.env.VITE_DRUG_ANALYSIS_API_URL || 'https://druganalysis-zqu1.onrender.com',
  timeout: 60000, // 60 second timeout
});

export const analyzeMedicalNeeds = async (file: File, userId?: string) => {
  try {
    const formData = new FormData();
    formData.append('files', file);
    formData.append('user_id', '1'); // Use integer user_id
    
    console.log('Sending medical document to API');
    const response = await drugAnalysisApi.post('/analyze_drugs', formData);
    console.log('Drug analysis API success:', response.status);
    return response.data;
  } catch (error: any) {
    console.error('Drug analysis API error:', error);
    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out');
      throw new Error('Medical analysis timed out. Please try again.');
    }
    if (error.response) {
      console.error('API response error:', error.response.data);
      console.error('API error occurred');
      throw new Error(`API Error: ${error.response.status}`);
    }
    if (error.request) {
      console.error('Network error - no response received');
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
};
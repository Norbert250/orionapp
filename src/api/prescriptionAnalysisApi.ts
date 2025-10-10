import api from './axios';

export const analyzePrescription = async (file: File, userId?: string) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (userId) formData.append('user_id', userId);

    console.log('Sending prescription to API with userId:', userId);
    const response = await api.post('/prescriptions/analyze', formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000
    });
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
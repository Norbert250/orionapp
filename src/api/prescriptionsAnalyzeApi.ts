import api from './axios';

export const analyzePrescriptions = async (files: File[], userId?: string) => {
  try {
    const formData = new FormData();
    
    // Append all files
    files.forEach(file => {
      formData.append('files', file);
    });
    
    if (userId) formData.append('user_id', userId);

    console.log('Sending prescriptions analysis request:', {
      fileCount: files.length,
      fileNames: files.map(f => f.name),
      userId
    });

    const response = await api.post('/prescriptions/analyze', formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000
    });
    
    console.log('Prescriptions analysis success:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Prescriptions analysis API error:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    throw error;
  }
};
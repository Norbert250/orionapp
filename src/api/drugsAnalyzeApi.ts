import api from './axios';

export const analyzeDrugs = async (files: File[], userId?: string) => {
  try {
    const formData = new FormData();
    
    // Append all files
    files.forEach(file => {
      formData.append('files', file);
    });
    
    if (userId) formData.append('user_id', userId);

    console.log('Sending drugs analysis request:', {
      fileCount: files.length,
      fileNames: files.map(f => f.name),
      userId
    });

    const response = await api.post('/drugs/analyze', formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000
    });
    
    console.log('Drugs analysis success:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Drugs analysis API error:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    }
    throw error;
  }
};
import api from './axios';

export const analyzeDrugs = async (files: File[], userId?: string) => {
  try {
    const formData = new FormData();
    
    // Append all files
    files.forEach(file => {
      formData.append('files', file);
    });
    
    // user_id is required as integer
    formData.append('user_id', '123');

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
      console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
      
      // Log the detail array if it exists
      if (error.response.data?.detail) {
        console.error('Validation errors:', error.response.data.detail);
      }
    }
    throw error;
  }
};
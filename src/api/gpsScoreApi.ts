import axios from 'axios';

const gpsApi = axios.create({
  baseURL: 'https://gps-fastapi-upload.onrender.com',
});

// Get GPS token (reuse from gpsAnalysisApi)
const getGpsToken = async (): Promise<string> => {
  const formData = new FormData();
  formData.append('username', 'USER123');
  formData.append('password', 'secret123');
  
  const response = await gpsApi.post('/auth/token', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  
  return response.data.access_token;
};

export const getGpsScore = async (loanId: string) => {
  try {
    console.log('Getting GPS score for USER123 with loan_id:', loanId);
    const token = await getGpsToken();
    
    // Load the actual GPS CSV file from src folder
    const csvResponse = await fetch('/src/gps_points_nairobi.csv');
    if (!csvResponse.ok) {
      throw new Error('Failed to load GPS CSV file');
    }
    const csvContent = await csvResponse.text();
    const csvBlob = new Blob([csvContent], { type: 'text/csv' });
    const csvFile = new File([csvBlob], 'gps_points_nairobi.csv', { type: 'text/csv' });
    
    const formData = new FormData();
    formData.append('loan_id', loanId);
    formData.append('gps_csv', csvFile);
    
    const response = await gpsApi.post('/users/USER123/score/gps', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
      timeout: 30000
    });
    
    console.log('GPS score retrieved successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('GPS score API error:', error);
    if (error.response) {
      console.error('GPS score response error:', error.response.data);
      console.error('GPS score validation details:', JSON.stringify(error.response.data.detail, null, 2));
    }
    throw error;
  }
};
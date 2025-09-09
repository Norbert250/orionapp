import axios from 'axios';

const mpesaApi = axios.create({
  baseURL: import.meta.env.VITE_MPESA_API_URL || 'https://mpesaservice.onrender.com',
  timeout: 15000, // 15 seconds
});

export const analyzeMpesaStatement = async (file: File, password?: string, userId?: string, loanId?: string) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId || '1');
    formData.append('loan_id', loanId || '1');
    formData.append('password', password || '');
    
    console.log('M-Pesa API call:', {
      fileName: file.name,
      fileSize: file.size,
      hasPassword: !!password,
      userId: userId || '1',
      loanId: loanId || '1'
    });
    
    const response = await mpesaApi.post('/analyzempesa', formData);
    console.log('M-Pesa response:', response.data);
    
    return {
      success: true,
      ...response.data
    };
  } catch (error: any) {
    if (error.code === 'ECONNABORTED') {
      console.error('M-Pesa API timeout');
      throw new Error('M-Pesa analysis timed out. Please try again.');
    }
    console.error('M-Pesa analysis error:', error.response?.data);
    console.error('M-Pesa error status:', error.response?.status);
    throw new Error(`M-Pesa analysis failed: ${error.response?.status || error.message}`);
  }
};
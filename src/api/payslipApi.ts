import axios from 'axios';

const payslipApi = axios.create({
  baseURL: import.meta.env.VITE_PAYSLIP_API_URL || 'https://payslipservice.onrender.com',
  timeout: 120000, // 2 minutes timeout
  // Remove Content-Type header - let browser set it automatically
});

export const submitPayslipDocument = async (file: File, userId?: string, loanId?: string) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId || '1');
    formData.append('loan_id', loanId || '1');
    
    console.log('Sending payslip to API');
    const response = await payslipApi.post('/analyze_payslip', formData);
    console.log('Payslip API success:', response.status);
    return response.data;
  } catch (error: any) {
    console.error('Payslip API error:', error);
    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out');
      throw new Error('Payslip analysis timed out. Please try again.');
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
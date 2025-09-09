import axios from 'axios';

const callLogsApi = axios.create({
  baseURL: import.meta.env.VITE_CALL_LOGS_API_URL || 'https://calllogsservice.onrender.com',
  timeout: 60000,
});

export const analyzeCallLogs = async (file: File, userId?: string, loanId?: string) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId || '1');
    formData.append('loan_id', loanId || '1');
    
    console.log('Call logs API call:', {
      fileName: file.name,
      fileSize: file.size,
      userId: userId || '1',
      loanId: loanId || '1'
    });
    
    const response = await callLogsApi.post('/analyze', formData);
    console.log('Call logs response:', response.data);
    
    return {
      success: true,
      analysis: response.data.analysis,
      total_calls: response.data.total_calls,
      guarantor_calls: response.data.guarantor_calls,
      network_strength: response.data.network_strength
    };
  } catch (error: any) {
    console.error('Call logs analysis error:', error.response?.data);
    console.error('Call logs error status:', error.response?.status);
    console.error('Full call logs error:', error);
    throw new Error('Call logs analysis failed');
  }
};
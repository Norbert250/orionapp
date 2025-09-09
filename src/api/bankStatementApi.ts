import axios from 'axios';

const bankStatementApi = axios.create({
  baseURL: import.meta.env.VITE_BANK_STATEMENT_API_URL || 'https://bankstatementservice.onrender.com',
  timeout: 60000, // 60 second timeout
  // Remove Content-Type header - let browser set it automatically
});

export const submitBankStatement = async (file: File, userId?: string, loanId?: string) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId || '1');
    formData.append('loan_id', loanId || '1');
    
    console.log('Sending bank statement to API');
    const response = await bankStatementApi.post('/analyze', formData);
    console.log('Bank statement API success:', response.status);
    
    // Handle response that might be wrapped in markdown code blocks
    let data = response.data;
    if (data.error === 'Failed to parse JSON' && data.raw) {
      try {
        // Extract JSON from markdown code blocks
        const jsonMatch = data.raw.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          data = JSON.parse(jsonMatch[1]);
        }
      } catch (e) {
        console.error('Failed to parse raw JSON:', e);
      }
    }
    
    return data;
  } catch (error: any) {
    console.error('Bank statement API error:', error);
    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out');
      throw new Error('Bank statement analysis timed out. Please try again.');
    }
    if (error.response) {
      console.error('API response error:', error.response.data);
      
      // Handle 502 errors that contain valid JSON data
      if (error.response.status === 502 && error.response.data?.raw) {
        try {
          const jsonMatch = error.response.data.raw.match(/```json\n([\s\S]*?)\n```/);
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[1]);
            console.log('Parsed 502 response data successfully');
            return data;
          }
        } catch (e) {
          console.error('Failed to parse 502 JSON:', e);
        }
      }
      
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
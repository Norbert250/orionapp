import axios from 'axios';

const callLogsApi = axios.create({
  baseURL: 'https://gps-fastapi-upload.onrender.com',
});

// Get token (reuse from GPS API)
const getCallLogsToken = async (): Promise<string> => {
  const formData = new FormData();
  formData.append('username', 'USER123');
  formData.append('password', 'secret123');
  
  const response = await callLogsApi.post('/auth/token', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  
  return response.data.access_token;
};

export const analyzeCallLogs = async (callLogFiles: File[], userId?: string, loanId?: string) => {
  try {
    console.log('Analyzing call logs with', callLogFiles.length, 'files');
    const token = await getCallLogsToken();
    
    const formData = new FormData();
    formData.append('loan_id', loanId || '0000');
    
    // Use the first file as calllogs_csv
    if (callLogFiles.length > 0) {
      console.log(`Adding call log file:`, callLogFiles[0].name, 'size:', callLogFiles[0].size);
      formData.append('calllogs_csv', callLogFiles[0]);
    }
    
    const response = await callLogsApi.post('/users/USER123/score/calllogs', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000
    });
    
    console.log('Call logs analysis successful:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Call logs analysis error:', error);
    if (error.response) {
      console.error('Call logs API response error:', error.response.data);
      console.error('Call logs validation details:', JSON.stringify(error.response.data.detail, null, 2));
    }
    throw error;
  }
};
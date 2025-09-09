import axios from 'axios';

const callLogsApi = axios.create({
  baseURL: import.meta.env.VITE_CALL_LOGS_API_URL || 'https://calllogsservice.onrender.com',
  timeout: 60000,
});

export const analyzeCallLogs = async (file: File, userId?: string, loanId?: string) => {
  // API disabled - return mock data
  console.log('Call logs analysis (mock):', file.name);
  return {
    success: true,
    analysis: { call_frequency: 'high', active_behavior: 'normal' },
    total_calls: Math.floor(Math.random() * 500) + 100,
    guarantor_calls: Math.floor(Math.random() * 50) + 10,
    network_strength: 'strong'
  };
};
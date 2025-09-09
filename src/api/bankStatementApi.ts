import axios from 'axios';

const bankStatementApi = axios.create({
  baseURL: import.meta.env.VITE_BANK_STATEMENT_API_URL || 'https://bankstatementservice.onrender.com',
  timeout: 60000, // 60 second timeout
  // Remove Content-Type header - let browser set it automatically
});

export const submitBankStatement = async (file: File, userId?: string, loanId?: string) => {
  // API disabled - return mock data
  console.log('Bank statement analysis (mock):', file.name);
  return {
    success: true,
    features: {
      opening_balance: Math.floor(Math.random() * 10000),
      closing_balance: Math.floor(Math.random() * 15000),
      average_balance: Math.floor(Math.random() * 12000)
    }
  };
};
import axios from 'axios';

const mpesaApi = axios.create({
  baseURL: import.meta.env.VITE_MPESA_API_URL || 'https://mpesaservice.onrender.com',
  timeout: 15000, // 15 seconds
});

export const analyzeMpesaStatement = async (file: File, password?: string, userId?: string, loanId?: string) => {
  // API disabled - return mock data
  console.log('M-Pesa analysis (mock):', file.name);
  return {
    success: true,
    total_transactions: Math.floor(Math.random() * 200) + 50,
    total_inflow: Math.floor(Math.random() * 100000) + 20000,
    total_outflow: Math.floor(Math.random() * 80000) + 15000,
    avg_balance: Math.floor(Math.random() * 5000) + 1000
  };
};
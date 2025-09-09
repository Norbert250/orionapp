import axios from 'axios';

const payslipApi = axios.create({
  baseURL: import.meta.env.VITE_PAYSLIP_API_URL || 'https://payslipservice.onrender.com',
  timeout: 120000, // 2 minutes timeout
  // Remove Content-Type header - let browser set it automatically
});

export const submitPayslipDocument = async (file: File, userId?: string, loanId?: string) => {
  // API disabled - return mock data
  console.log('Payslip analysis (mock):', file.name);
  return {
    success: true,
    features: {
      employee_name: 'John Doe',
      employer_name: 'ABC Company',
      basic_salary: Math.floor(Math.random() * 50000) + 30000,
      gross_salary: Math.floor(Math.random() * 70000) + 40000,
      net_salary: Math.floor(Math.random() * 60000) + 25000
    }
  };
};
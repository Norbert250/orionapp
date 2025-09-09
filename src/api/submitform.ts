import api from './axios';
import type { LoanFormData } from '../types';

export const submitLoanForm = async (formData: LoanFormData) => {
  const response = await api.post('/submitform', formData);
  return response.data;
};

export const mockAssetValueCheck = async (file: File): Promise<{ value: number; requiresLicense: boolean }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock logic based on file name or type
  const fileName = file.name.toLowerCase();
  let value = Math.floor(Math.random() * 10000) + 1000;
  let requiresLicense = false;
  
  if (fileName.includes('car') || fileName.includes('vehicle')) {
    value = Math.floor(Math.random() * 50000) + 10000;
    requiresLicense = true;
  } else if (fileName.includes('jewelry') || fileName.includes('gold')) {
    value = Math.floor(Math.random() * 20000) + 5000;
  }
  
  return { value, requiresLicense };
};



 
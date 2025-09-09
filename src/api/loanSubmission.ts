import { supabase } from '../lib/supabase';
import type { LoanFormData } from '../types';

const uploadFile = async (file: File, bucket: string, path: string) => {
  console.log('Uploading file to storage');
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file);
  
  if (error) {
    console.error('Upload error occurred');
    throw error;
  }
  console.log('Upload successful');
  return data.path;
};

import { submitBankStatement } from './bankStatementApi';
import { submitPayslipDocument } from './payslipApi';
import { analyzeIdDocument } from './idAnalyzerApi';

export const submitLoanToSupabase = async (formData: LoanFormData) => {
  // API disabled - return mock success
  console.log('Loan submission (mock):', formData);
  return { id: 'mock-loan-' + Date.now(), success: true };
};
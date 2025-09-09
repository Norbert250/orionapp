import axios from 'axios';

const idAnalyzerApi = axios.create({
  baseURL: import.meta.env.VITE_ID_ANALYZER_API_URL || 'https://idandpassportanalyzer.onrender.com',
  timeout: 60000,
});

export interface IdAnalysisResult {
  name: string;
  nationality: string;
  idNumber?: string;
  passportNumber?: string;
}

export const analyzeIdDocument = async (file: File): Promise<IdAnalysisResult> => {
  // API disabled - return mock data
  console.log('ID analysis (mock):', file.name);
  return {
    name: 'John Doe',
    nationality: 'Kenyan',
    idNumber: '12345678',
    passportNumber: undefined
  };
};
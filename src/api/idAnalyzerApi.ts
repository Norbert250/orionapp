import axios from 'axios';

const orionApi = axios.create({
  baseURL: 'https://orionapisalpha.onrender.com',
});

export interface IdAnalysisResult {
  name: string;
  nationality: string;
  idNumber?: string;
  passportNumber?: string;
}

export const analyzeIdDocument = async (file: File, userId?: string, loanId?: string): Promise<IdAnalysisResult> => {
  try {
    console.log('Analyzing ID document with Orion API:', file.name, 'size:', file.size);
    
    const formData = new FormData();
    formData.append("image", file);
    if (userId) formData.append("user_id", userId);
    if (loanId) formData.append("loan_id", loanId);

    const response = await orionApi.post('/id/analyze', formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000
    });

    console.log('ID analysis successful:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('ID analyzer API error:', error);
    console.error('Response data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Response status:', error.response?.status);
    throw error;
  }
};
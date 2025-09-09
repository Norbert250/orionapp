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
  const formData = new FormData();
  formData.append('image', file);  // Changed from 'file' to 'image'
  
  const response = await idAnalyzerApi.post('/analyze_id', formData);  // Correct endpoint
  
  // Extract data from the fields object
  const fields = response.data.fields;
  
  return {
    name: fields["Full Name"] || "",
    nationality: fields["Nationality"] || "",
    idNumber: fields["ID Number"] || undefined,
    passportNumber: fields["Passport Number"] || undefined
  };
};
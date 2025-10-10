import api from './axios';

export const analyzeAssets = async (files: File[], userId?: string, loanId?: string) => {
  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append(`files`, file, file.name);
  });
  if (userId) formData.append("userId", userId);
  if (loanId) formData.append("loanId", loanId);

  const response = await api.post('/analyze-assets', formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000
  });

  return response.data;
};
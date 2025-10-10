import api from './axios';

export const analyzeMpesaStatement = async (file: File, password?: string, userId?: string, loanId?: string) => {
  const formData = new FormData();
  formData.append("file", file, file.name);
  if (password) formData.append("password", password);
  if (userId) formData.append("userId", userId);
  if (loanId) formData.append("loanId", loanId);

  const response = await api.post('/analyze-mpesa-statement', formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 15000
  });

  return response.data;
};
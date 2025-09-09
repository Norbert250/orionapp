import api from './axios';

export const sendMessage = async (message: string) => {
  const response = await api.post('/message', { message });
  return response.data;
};
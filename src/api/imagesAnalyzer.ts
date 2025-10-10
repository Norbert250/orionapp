import api from './axios';
import { createAssetsBatch } from './assetsAnalysisApi';

export const uploadImages = async (files: File[], userId?: string) => {
  try {
    console.log('Starting image analysis with', files.length, 'files for user:', userId);
    // Try new assets analysis API first
    const assetsResponse = await createAssetsBatch(files, userId);
    console.log('Assets analysis API success:', assetsResponse);
    return assetsResponse;
  } catch (assetsError) {
    console.log('Assets analysis failed, trying fallback:', assetsError);
    // Fallback to original endpoint
    const formData = new FormData();
    files.forEach((file, index) => {
      console.log(`Adding fallback file ${index + 1}:`, file.name);
      formData.append("files", file, file.name);
    });

    console.log('Trying fallback upload-images endpoint...');
    const response = await api.post('/upload-images', formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    console.log('Fallback API success:', response.data);
    return response.data;
  }
};

export { createAssetsBatch };
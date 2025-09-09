import axios from 'axios';

const assetsApi = axios.create({
  baseURL: import.meta.env.VITE_ASSETS_API_URL || '/api/assets',
  timeout: 60000, // 60 second timeout
});

export const analyzeAssets = async (files: File[], userId?: string, loanId?: string) => {
  try {
    // Step 1: Create batch with all images
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('files', file);
    });
    formData.append('user_id', userId || '1');
    formData.append('loan_id', loanId || '1');
    
    console.log('Creating asset batch with files count:', files.length);
    const batchResponse = await assetsApi.post('/analysis/create_batch', formData);
    console.log('Asset analysis completed successfully');
    
    return {
      batch_id: batchResponse.data.batch_id,
      status: batchResponse.data.status,
      total_value: batchResponse.data.analysis_result?.credit_features?.total_asset_value || 0,
      files: batchResponse.data.total_files,
      analysis_result: batchResponse.data.analysis_result
    };
  } catch (error: any) {
    console.error('Asset analysis API error:', error);
    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out');
      throw new Error('Asset analysis timed out. Please try again.');
    }
    if (error.response) {
      console.error('API response error:', error.response.data);
      console.error('API error occurred');
      throw new Error(`API Error: ${error.response.status}`);
    }
    if (error.request) {
      console.error('Network error - no response received');
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
};
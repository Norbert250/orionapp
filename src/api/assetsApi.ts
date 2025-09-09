import axios from 'axios';

const assetsApi = axios.create({
  baseURL: import.meta.env.VITE_ASSETS_API_URL || '/api/assets',
  timeout: 60000, // 60 second timeout
});

export const analyzeAssets = async (files: File[], userId?: string, loanId?: string) => {
  // API disabled - return mock data
  console.log('Asset analysis (mock):', files.length, 'files');
  return {
    batch_id: 'mock-batch-' + Date.now(),
    status: 'completed',
    total_value: Math.floor(Math.random() * 50000) + 10000,
    files: files.length,
    analysis_result: { credit_features: { total_asset_value: Math.floor(Math.random() * 50000) + 10000 } }
  };
};
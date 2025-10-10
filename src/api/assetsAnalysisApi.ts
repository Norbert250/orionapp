import axios from 'axios';

const assetsApi = axios.create({
  baseURL: 'http://157.245.20.199:8000',
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

const assetsCreditApi = axios.create({
  baseURL: 'https://rule-based-credit-scoring.onrender.com',
  timeout: 60000
});

export const createAssetsBatch = async (files: File[], userId?: string, loanId?: string) => {
  try {
    console.log('Starting assets analysis for user:', userId, 'loan:', loanId, 'with', files.length, 'files');
    
    const formData = new FormData();
    
    files.forEach((file, index) => {
      console.log(`Adding file ${index + 1}:`, file.name, 'size:', file.size);
      formData.append('files', file);
    });
    
    if (userId) {
      formData.append('user_id', userId);
      console.log('Added user_id:', userId);
    }
    
    if (loanId) {
      formData.append('loan_id', loanId);
      console.log('Added loan_id:', loanId);
    }

    console.log('Sending assets analysis request to:', assetsApi.defaults.baseURL + '/analysis/create_batch');
    const response = await assetsApi.post('/analysis/create_batch', formData, {
      timeout: 60000
    });
    
    console.log('Assets analysis response:', response.data);
    
    // Check if the batch processing failed
    if (response.data.status === 'failed') {
      console.error('Assets batch processing failed:', response.data.message);
      console.error('Batch ID:', response.data.batch_id);
      console.error('Status check URL:', response.data.status_check_url);
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Assets analysis API error:', error);
    if (error.response) {
      console.error('Assets API response error:', error.response.data);
      console.error('Assets API status:', error.response.status);
    }
    if (error.request) {
      console.error('Assets API request failed - no response received');
    }
    throw error;
  }
};

export const evaluateAssetsCredit = async (assetsAnalysisData: any) => {
  try {
    console.log('Assets analysis data for credit scoring:', JSON.stringify(assetsAnalysisData, null, 2));
    
    const response = await assetsCreditApi.post('/evaluate_credit', assetsAnalysisData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error: any) {
    console.warn('Assets credit scoring API unavailable:', error.message);
    if (error.response) {
      console.error('API response error:', error.response.data);
    }
    return {
      credit_score: Math.floor(Math.random() * 40) + 60,
      risk_level: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
      api_available: false
    };
  }
};

export const analyzeAndScoreAssets = async (files: File[], userId?: string, loanId?: string) => {
  try {
    // Step 1: Analyze assets
    console.log('Step 1: Analyzing assets...');
    const analysisResult = await createAssetsBatch(files, userId, loanId);
    
    // Check if analysis was successful and has valid data
    if (analysisResult.status === 'completed' && analysisResult.analysis_result && analysisResult.analysis_result.credit_features) {
      // Step 2: Use analysis data for credit scoring
      console.log('Step 2: Calculating assets credit score...');
      const creditResult = await evaluateAssetsCredit(analysisResult);
      
      return {
        ...analysisResult,
        credit_score: creditResult.credit_score,
        risk_level: creditResult.risk_level,
        credit_analysis: creditResult,
        two_step_process: true
      };
    } else {
      console.warn('Assets analysis failed or incomplete, using fallback data');
      // Use fallback data when analysis fails
      return {
        ...analysisResult,
        analysis_result: {
          credit_features: {
            total_asset_value: Math.floor(Math.random() * 200000) + 50000,
            asset_diversity_score: Math.random() * 100,
            has_transport_asset: Math.random() > 0.5,
            has_electronics_asset: Math.random() > 0.3,
            has_livestock_asset: Math.random() > 0.7,
            has_property_asset: Math.random() > 0.8,
            has_high_value_assets: Math.random() > 0.4,
            high_value_asset_count: Math.floor(Math.random() * 5),
            average_asset_condition: Math.random() * 100,
            total_images_processed: files.length,
            total_assets_detected: Math.floor(Math.random() * 10) + 1
          }
        },
        credit_score: Math.floor(Math.random() * 40) + 60,
        risk_level: 'Medium',
        api_processed: false,
        status: 'processed_with_fallback_data'
      };
    }
  } catch (error: any) {
    console.warn('Two-step assets analysis failed:', error.message);
    return {
      analysis_result: {
        credit_features: {
          total_asset_value: Math.floor(Math.random() * 200000) + 50000,
          asset_diversity_score: Math.random() * 100,
          has_transport_asset: Math.random() > 0.5,
          has_electronics_asset: Math.random() > 0.3,
          has_livestock_asset: Math.random() > 0.7,
          has_property_asset: Math.random() > 0.8,
          has_high_value_assets: Math.random() > 0.4,
          high_value_asset_count: Math.floor(Math.random() * 5),
          average_asset_condition: Math.random() * 100,
          total_images_processed: files.length,
          total_assets_detected: Math.floor(Math.random() * 10) + 1
        }
      },
      credit_score: Math.floor(Math.random() * 40) + 60,
      risk_level: 'Medium',
      api_processed: false,
      status: 'processed_with_dummy_data'
    };
  }
};
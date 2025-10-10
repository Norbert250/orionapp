import axios from 'axios';

const orionApi = axios.create({
  baseURL: 'https://orionapisalpha.onrender.com',
});

export const submitBankStatement = async (file: File, userId?: string, loanId?: string) => {
  try {
    console.log('Analyzing bank statement with Orion API:', file.name, 'size:', file.size);
    
    const formData = new FormData();
    formData.append("file", file);
    if (userId) formData.append("user_id", userId);
    if (loanId) formData.append("loan_id", loanId);

    const response = await orionApi.post('/bank_statements/analyze', formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000
    });

    console.log('Bank statement analysis successful:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Bank statement API error:', error);
    console.error('Response data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Response status:', error.response?.status);
    console.error('Response headers:', error.response?.headers);
    // Re-throw the error so the calling code can handle the fallback
    throw error;
  }
};

export const getBankStatementScore = async (analysisResult: any) => {
  try {
    console.log('Getting bank statement score with analysis result');
    
    // Extract the credit_score_ready_values from the analysis result
    const scoreData = analysisResult.credit_score_ready_values || analysisResult;
    
    // Replace null values with 0 for numeric fields that can't be null
    const cleanedFeatures = {
      ...scoreData.features,
      opening_balance: scoreData.features.opening_balance || 0,
      average_balance: scoreData.features.average_balance || 0,
      balance_volatility: scoreData.features.balance_volatility || 0,
      closing_opening_ratio: scoreData.features.closing_opening_ratio || 0,
      avg_closing_ratio: scoreData.features.avg_closing_ratio || 0,
      withdrawals_opening_ratio: scoreData.features.withdrawals_opening_ratio || 0
    };
    
    // Format request according to API schema - fields at root level
    const requestData = {
      success: scoreData.success,
      user_id: scoreData.user_id,
      loan_id: scoreData.loan_id,
      features: cleanedFeatures,
      timings: scoreData.timings || {}
    };
    
    const response = await orionApi.post('/bank/bankstatementscore', requestData, {
      headers: { "Content-Type": "application/json" },
      timeout: 30000
    });

    console.log('Bank statement score successful:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Bank statement score API error:', error);
    console.error('Response data:', JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
};
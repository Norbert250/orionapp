import { getGpsScore } from './gpsAnalysisApi';

export const calculateFinalGpsScore = async (loanId: string) => {
  try {
    console.log('Calculating final GPS score for loan:', loanId);
    const scoreResponse = await getGpsScore(loanId);
    console.log('Final GPS score calculated successfully:', scoreResponse);
    return scoreResponse;
  } catch (error: any) {
    console.error('Final GPS score calculation failed:', error);
    throw error;
  }
};
import api from './axios';
import { analyzeDrugs } from './drugsAnalyzeApi';
import { analyzePrescriptions } from './prescriptionsAnalyzeApi';

export const analyzeMedicalNeeds = async (file: File, userId?: string) => {
  try {
    console.log('Sending medical document to API');
    
    // Try prescriptions/analyze first, then drugs/analyze
    try {
      const prescriptionsResponse = await analyzePrescriptions(file, userId);
      console.log('Prescriptions analysis API success');
      return prescriptionsResponse;
    } catch (prescriptionsError) {
      console.log('Prescriptions endpoint failed, trying drugs endpoint');
      const drugsResponse = await analyzeDrugs(file, userId);
      console.log('Drugs analysis API success');
      return drugsResponse;
    }
  } catch (error: any) {
    console.error('Medical analysis API error:', error);
    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out');
      throw new Error('Medical analysis timed out. Please try again.');
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

export { analyzeDrugs, analyzePrescriptions };
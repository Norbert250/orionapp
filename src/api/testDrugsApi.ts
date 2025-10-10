import api from './axios';

export const testDrugsAnalysis = async (file: File, userId?: string) => {
  console.log('Testing different API formats for drugs analysis...');
  
  // Test 1: Try with 'files' (plural) parameter
  try {
    console.log('Test 1: Using "files" parameter...');
    const formData1 = new FormData();
    formData1.append('files', file);
    if (userId) formData1.append('user_id', userId);
    
    const response1 = await api.post('/drugs/analyze', formData1, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000
    });
    console.log('Test 1 SUCCESS:', response1.data);
    return response1.data;
  } catch (error: any) {
    console.log('Test 1 FAILED:', error.response?.status, error.response?.data);
  }

  // Test 2: Try with 'file' (singular) parameter
  try {
    console.log('Test 2: Using "file" parameter...');
    const formData2 = new FormData();
    formData2.append('file', file);
    if (userId) formData2.append('user_id', userId);
    
    const response2 = await api.post('/drugs/analyze', formData2, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000
    });
    console.log('Test 2 SUCCESS:', response2.data);
    return response2.data;
  } catch (error: any) {
    console.log('Test 2 FAILED:', error.response?.status, error.response?.data);
  }

  // Test 3: Try without user_id
  try {
    console.log('Test 3: Without user_id...');
    const formData3 = new FormData();
    formData3.append('file', file);
    
    const response3 = await api.post('/drugs/analyze', formData3, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000
    });
    console.log('Test 3 SUCCESS:', response3.data);
    return response3.data;
  } catch (error: any) {
    console.log('Test 3 FAILED:', error.response?.status, error.response?.data);
  }

  // Test 4: Try with different parameter name
  try {
    console.log('Test 4: Using "image" parameter...');
    const formData4 = new FormData();
    formData4.append('image', file);
    if (userId) formData4.append('user_id', userId);
    
    const response4 = await api.post('/drugs/analyze', formData4, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000
    });
    console.log('Test 4 SUCCESS:', response4.data);
    return response4.data;
  } catch (error: any) {
    console.log('Test 4 FAILED:', error.response?.status, error.response?.data);
  }

  throw new Error('All test formats failed');
};
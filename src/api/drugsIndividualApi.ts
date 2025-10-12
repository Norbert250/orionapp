import api from './axios';

export const analyzeDrugsIndividually = async (files: File[], userId?: string) => {
  try {
    console.log('Analyzing drugs individually...');
    const results = [];
    
    for (const file of files) {
      console.log(`Processing file: ${file.name}`);
      
      const formData = new FormData();
      formData.append('file', file);
      if (userId) formData.append('user_id', userId);
      
      try {
        const response = await api.post('/drugs/analyze', formData, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 60000
        });
        
        console.log(`Success for ${file.name}:`, response.data);
        results.push(response.data);
      } catch (fileError: any) {
        console.error(`Failed for ${file.name}:`, fileError.response?.data);
        // Continue with other files even if one fails
      }
    }
    
    // Combine results into a batch-like structure
    const allFiles = results.flatMap(r => r.files || []);
    const totalPrice = results.reduce((sum, r) => sum + (r.total_estimated_price_all_drugs || 0), 0);
    
    console.log('Combined results:', { fileCount: allFiles.length, totalPrice });
    
    return {
      batch_id: Date.now(),
      files: allFiles,
      total_estimated_price_all_drugs: totalPrice
    };
  } catch (error: any) {
    console.error('Individual drugs analysis error:', error);
    throw error;
  }
};
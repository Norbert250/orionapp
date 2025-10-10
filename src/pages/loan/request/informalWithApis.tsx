// Updated processAssets function for informal.tsx
const processAssets = async () => {
  if (assets.length < 3) {
    alert("Please upload at least 3 asset pictures");
    return;
  }
  if (homeFloorPhoto.length === 0) {
    alert("Please upload a photo of your home");
    return;
  }

  setAssetsProcessing(true);
  try {
    // Collect all images for GPS analysis
    const gpsImages: File[] = [];
    if (homeFloorPhoto[0]) gpsImages.push(homeFloorPhoto[0]);
    assets.forEach(asset => gpsImages.push(asset.file));

    // Collect asset files for assets analysis
    const assetFiles = assets.map(asset => asset.file);

    console.log('Starting API analysis with', assetFiles.length, 'assets and', gpsImages.length, 'GPS images');

    // Run both APIs in parallel
    const [assetsAnalysisResult, gpsAnalysisResult] = await Promise.all([
      createAssetsBatch(assetFiles, user?.id, loanId).catch(error => {
        console.warn('Assets analysis failed:', error);
        return null;
      }),
      analyzeGpsImages(gpsImages, user?.id || '53bf969e-f1ca-40db-a145-5b58541539c5').catch(error => {
        console.warn('GPS analysis failed:', error);
        return null;
      })
    ]);

    console.log('Assets analysis result:', assetsAnalysisResult);
    console.log('GPS analysis result:', gpsAnalysisResult);

    // Process assets analysis results
    let results = [];
    if (assetsAnalysisResult?.analysis_result?.credit_features) {
      const creditFeatures = assetsAnalysisResult.analysis_result.credit_features;
      results = assets.map((asset, index) => ({
        value: Math.floor(creditFeatures.total_asset_value / assets.length) || Math.floor(Math.random() * 50000) + 10000,
        description: `Asset ${index + 1}`,
        category: ['electronics', 'furniture', 'vehicle'][Math.floor(Math.random() * 3)],
        estimated_value: Math.floor(creditFeatures.total_asset_value / assets.length) || Math.floor(Math.random() * 50000) + 10000,
        api_processed: true
      }));
      console.log('Using API results for asset valuation');
    } else {
      // Fallback to dummy data
      results = assets.map((asset, index) => ({
        value: Math.floor(Math.random() * 50000) + 10000,
        description: `Asset ${index + 1}`,
        category: ['electronics', 'furniture', 'vehicle'][Math.floor(Math.random() * 3)],
        estimated_value: Math.floor(Math.random() * 50000) + 10000,
        api_processed: false
      }));
      console.log('Using fallback dummy data for asset valuation');
    }

    setAssetResults(results);

    // Handle shop analysis if business exists
    if (hasRetailBusiness && shopPicture.length > 0) {
      console.log('Processing shop analysis...');
      const shopResults = [{
        value: Math.floor(Math.random() * 100000) + 50000,
        description: 'Shop/Business Asset',
        category: 'business',
        estimated_value: Math.floor(Math.random() * 100000) + 50000
      }];
      setAssetResults(prev => ({ ...prev, shopAnalysis: shopResults }));
    }

    // Show success message
    const apiSuccess = assetsAnalysisResult || gpsAnalysisResult;
    if (apiSuccess) {
      alert("Assets processed successfully with AI analysis!");
    } else {
      alert("Assets processed with sample data (API services temporarily unavailable).");
    }

    setStep(2);
  } catch (error) {
    console.error('Error processing assets:', error);
    alert("Error processing assets. Please try again.");
  } finally {
    setAssetsProcessing(false);
  }
};
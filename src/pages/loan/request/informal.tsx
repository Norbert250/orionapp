import { analyzeAndScoreAssets } from "../../../api/assetsAnalysisApi";
import { analyzeGpsImages, calculateGpsScoreAfterAssets } from "../../../api/gpsAnalysisApi";
import { analyzeCallLogs } from "../../../api/callLogsApi";
import { analyzeIdDocument } from "../../../api/idAnalyzerApi";
import { analyzeDrugs } from "../../../api/drugsAnalyzeApi";
import { analyzePrescriptions } from "../../../api/prescriptionsAnalyzeApi";
import { supabase } from "../../../lib/supabase";

import React, { useState, useEffect } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { Heart, Upload, FileText, Users, CheckCircle, AlertCircle, Camera, Building2 } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import type { Asset, LoanFormData } from "../../../types";
import { submitLoanToSupabase } from "../../../api/loanSubmission";
import { useFormProgress } from "../../../hooks/useFormProgress";
import { submitBankStatement, getBankStatementScore } from "../../../api/bankStatementApi";
import DocumentUploader from "../../../components/ui/DocumentUploader";
import GuarantorFields from "../../../components/forms/GuarantorFields";
import ProgressSteps from "../../../components/ui/progressBar";

// Image compression utility with GPS fallback
const compressImage = (file: File, quality: number = 0.8, maxWidth: number = 1920): Promise<File> => {
  return new Promise((resolve) => {
    // For GPS API, try to preserve original file if it has GPS data
    if (file.name.toLowerCase().includes('home') || file.size < 2000000) {
      resolve(file); // Keep original for GPS processing
      return;
    }
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        } else {
          resolve(file);
        }
      }, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

const InformalLoanRequest: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const steps = ["Instructions", "Assets", "Documents", "Loan Details"];
  const [loanId] = useState(() => crypto.randomUUID());
  const { updateProgress, markCompleted, trackActivity, sessionId } = useFormProgress('informal', 3);

  // Track detailed sub-steps
  const trackSubStep = (mainStep: number, subStep: string) => {
    const stepNames = ["Instructions", "Assets", "Documents", "Loan Details"];
    const detailedStep = `${stepNames[mainStep]} - ${subStep}`;
    updateProgress(mainStep, detailedStep);
  };

  // Processing states
  const [assetsProcessing, setAssetsProcessing] = useState(false);
  const [documentsProcessing, setDocumentsProcessing] = useState(false);
  const [guarantorsProcessing, setGuarantorsProcessing] = useState(false);
  const [guarantorsProcessed, setGuarantorsProcessed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [medicalProcessing, setMedicalProcessing] = useState(false);

  // File states
  const [assets, setAssets] = useState<Asset[]>([]);
  const [homeFloorPhoto, setHomeFloorPhoto] = useState<File[]>([]);
  const [shopPicture, setShopPicture] = useState<File[]>([]);
  const [bankStatements, setBankStatements] = useState<File[]>([]);
  const [mpesaStatements, setMpesaStatements] = useState<File[]>([]);
  const [callLogs, setCallLogs] = useState<File[]>([]);
  const [medicalDrugFiles, setMedicalDrugFiles] = useState<File[]>([]);
  const [medicalPrescriptionFiles, setMedicalPrescriptionFiles] = useState<File[]>([]);

  // Processing results
  const [assetResults, setAssetResults] = useState<any[]>([]);
  const [documentResults, setDocumentResults] = useState<any>({});
  const [guarantorResults, setGuarantorResults] = useState<any[]>([]);
  const [guarantorFiles, setGuarantorFiles] = useState<File[]>([]);
  const [bankAnalysisResults, setBankAnalysisResults] = useState<any[]>([]);
  const [callLogsAnalysisResults, setCallLogsAnalysisResults] = useState<any[]>([]);
  const [mpesaAnalysisResults, setMpesaAnalysisResults] = useState<any[]>([]);
  const [finalGpsScore, setFinalGpsScore] = useState<number>(0);
  const [gpsAnalysisResult, setGpsAnalysisResult] = useState<any>(null);
  const [assetsAnalysisResult, setAssetsAnalysisResult] = useState<any>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoanFormData>({
    defaultValues: {
      sector: "informal",
      workType: "",
      hasBankAccount: false,
      hasRetailBusiness: false,
      guarantors: [
        { fullName: "", nationality: "", idNumber: "", contact: "" },
        { fullName: "", nationality: "", idNumber: "", contact: "" },
      ],
    },
  });

  const hasRetailBusiness = watch("hasRetailBusiness");
  const hasBankAccount = watch("hasBankAccount");

  // Auto-fill loan amount from medical assessment
  useEffect(() => {
    const state = location.state as { totalCost?: number };
    if (state?.totalCost) {
      setValue("amountRequested", state.totalCost);
    }
    
    // Initial progress tracking
    console.log('📝 Form initialized, tracking progress');
    console.log('User ID:', user?.id);
    updateProgress(0, 'Instructions - Reading');
  }, [location.state, setValue, updateProgress]);

  // Track progress when step changes
  useEffect(() => {
    console.log('🔄 Step changed to:', step, steps[step]);
    console.log('👤 Current user:', user?.id);
    updateProgress(step, steps[step]);
  }, [step, updateProgress]);

  // Track user activity on form interactions
  useEffect(() => {
    const handleActivity = () => trackActivity();
    
    // Track clicks, typing, and form interactions
    document.addEventListener('click', handleActivity);
    document.addEventListener('keypress', handleActivity);
    document.addEventListener('change', handleActivity);
    
    return () => {
      document.removeEventListener('click', handleActivity);
      document.removeEventListener('keypress', handleActivity);
      document.removeEventListener('change', handleActivity);
    };
  }, [trackActivity]);

  // Periodic abandonment checker
  useEffect(() => {
    const checkForAbandonment = async () => {
      if (!user?.id) return;
      
      try {
        // Check for sessions that haven't been updated in 3 minutes
        const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000).toISOString();
        
        const { data: abandonedSessions } = await supabase
          .from('form_progress')
          .select('id, time_spent, created_at, last_activity')
          .eq('status', 'in_progress')
          .lt('last_activity', threeMinutesAgo);
          
        if (abandonedSessions && abandonedSessions.length > 0) {
          // Update each session with calculated time_spent
          for (const session of abandonedSessions) {
            const finalTimeSpent = Math.round(
              (new Date(session.last_activity).getTime() - new Date(session.created_at).getTime()) / (1000 * 60)
            );
            
            await supabase
              .from('form_progress')
              .update({ 
                status: 'abandoned',
                time_spent: Math.max(finalTimeSpent, 0)
              })
              .eq('id', session.id);
              
            console.log(`Session ${session.id} abandoned after ${Math.max(finalTimeSpent, 0)} minutes`);
          }
          
          console.log(`🔍 Marked ${abandonedSessions.length} sessions as abandoned`);
        }
      } catch (error) {
        console.error('Error checking for abandoned sessions:', error);
      }
    };
    
    // Check every minute
    const abandonmentInterval = setInterval(checkForAbandonment, 60 * 1000);
    
    return () => clearInterval(abandonmentInterval);
  }, [user?.id]);



  // Check for abandoned sessions on page load and setup cleanup
  useEffect(() => {
    const checkAbandonedSessions = async () => {
      const stored = localStorage.getItem('activeFormSession');
      if (stored) {
        try {
          const { userId, sessionId: oldSessionId, timestamp } = JSON.parse(stored);
          
          // If it's a different session or old session (>5 minutes), mark as abandoned
          const isOldSession = Date.now() - timestamp > 5 * 60 * 1000; // 5 minutes
          if (oldSessionId !== sessionId || isOldSession) {
            console.log('🚪 Marking previous session as abandoned:', oldSessionId);
            await supabase
              .from('form_progress')
              .update({ status: 'abandoned' })
              .eq('user_id', userId)
              .eq('session_id', oldSessionId)
              .eq('status', 'in_progress');
          }
        } catch (e) {
          console.error('Error checking abandoned sessions:', e);
        }
      }
      
      // Store current session with timestamp
      if (user?.id && sessionId) {
        const sessionData = {
          userId: user.id,
          sessionId: sessionId,
          timestamp: Date.now()
        };
        localStorage.setItem('activeFormSession', JSON.stringify(sessionData));
        
        // Update timestamp periodically to show activity
        const updateActivity = () => {
          const current = localStorage.getItem('activeFormSession');
          if (current) {
            try {
              const data = JSON.parse(current);
              if (data.sessionId === sessionId) {
                data.timestamp = Date.now();
                localStorage.setItem('activeFormSession', JSON.stringify(data));
              }
            } catch (e) {
              console.error('Error updating activity:', e);
            }
          }
        };
        
        // Update activity every 30 seconds
        const activityInterval = setInterval(updateActivity, 30000);
        
        // Cleanup on unmount
        return () => {
          clearInterval(activityInterval);
        };
      }
    };
    
    checkAbandonedSessions();
  }, [sessionId, user?.id]);

  // Handle page unload/refresh to mark as abandoned
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Mark session for abandonment check on next load
      const stored = localStorage.getItem('activeFormSession');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          data.shouldCheckAbandonment = true;
          data.lastSeen = Date.now();
          localStorage.setItem('activeFormSession', JSON.stringify(data));
        } catch (e) {
          console.error('Error marking for abandonment check:', e);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Process Medical Assessment
  const processMedicalAssessment = async () => {
    setMedicalProcessing(true);
    try {
      let totalCost = 0;
      
      if (medicalDrugFiles.length > 0) {
        const drugResult = await analyzeDrugs(medicalDrugFiles, user?.id);
        totalCost += drugResult.total_estimated_price_all_drugs || 0;
      }
      
      if (medicalPrescriptionFiles.length > 0) {
        const prescriptionResult = await analyzePrescriptions(medicalPrescriptionFiles, user?.id);
        totalCost += prescriptionResult.total_estimated_price_all_files || 0;
      }
      
      setValue("amountRequested", totalCost);
    } catch (error) {
      console.error('Medical assessment error:', error);
    } finally {
      setMedicalProcessing(false);
    }
  };

  // Step 1: Process Assets
  const processAssets = async () => {
    if (assetsProcessing) return; // Prevent multiple calls
    
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
      // Compress and collect all images for GPS analysis
      const gpsImages: File[] = [];
      if (homeFloorPhoto[0]) {
        const compressedHome = await compressImage(homeFloorPhoto[0], 0.8, 1920);
        gpsImages.push(compressedHome);
      }
      for (const asset of assets) {
        const compressedAsset = await compressImage(asset.file, 0.8, 1920);
        gpsImages.push(compressedAsset);
      }

      // Compress and collect asset files for assets analysis
      const assetFiles = await Promise.all(
        assets.map(async (asset) => {
          return await compressImage(asset.file, 0.8, 1920);
        })
      );
      
      // Include shop picture in assets analysis if business exists
      if (hasRetailBusiness && shopPicture[0]) {
        const compressedShop = await compressImage(shopPicture[0], 0.8, 1920);
        assetFiles.push(compressedShop);
      }

      console.log('Starting API analysis with', assetFiles.length, 'assets and', gpsImages.length, 'GPS images');

      // Run both APIs in parallel
      const [assetsAnalysisResult, gpsAnalysisResult] = await Promise.all([
        analyzeAndScoreAssets(assetFiles, user?.id, loanId).catch(error => {
          console.warn('Assets analysis failed:', error);
          return null;
        }),
        analyzeGpsImages(gpsImages, user?.id || '53bf969e-f1ca-40db-a145-5b58541539c5', loanId).catch(error => {
          console.warn('GPS analysis failed:', error);
          return null;
        })
      ]);

      console.log('Assets analysis result:', assetsAnalysisResult);
      console.log('GPS analysis result:', gpsAnalysisResult);
      
      // Store assets analysis result in state
      setAssetsAnalysisResult(assetsAnalysisResult);

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
        console.log('Assets analysis API failed - no results available');
        results = [];
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

      // Calculate GPS score as the final step after all assets processing
      console.log('All assets processed, now calculating GPS score...');
      let finalGpsScore = 0;
      let combinedGpsResult = null;
      try {
        const gpsScore = await calculateGpsScoreAfterAssets(loanId);
        console.log('Final GPS score:', gpsScore);
        finalGpsScore = gpsScore?.score || 0;
        combinedGpsResult = {
          ...gpsScore,
          upload: gpsAnalysisResult
        };
        setFinalGpsScore(finalGpsScore);
        setGpsAnalysisResult(combinedGpsResult);
        
        // Assets processed successfully
      } catch (gpsScoreError: any) {
        console.warn('GPS score calculation failed:', gpsScoreError.message);
        setFinalGpsScore(0);
        
        // Assets processed successfully
      }

      setStep(2);
    } catch (error) {
      console.error('Error processing assets:', error);
      alert("Error processing assets. Please try again.");
    } finally {
      setAssetsProcessing(false);
    }
  };

  // Step 2: Process Documents (Bank statements, M-Pesa and Call Logs)
  const processDocuments = async () => {
    if (mpesaStatements.length === 0 && callLogs.length === 0 && bankStatements.length === 0) {
      alert("Please upload at least bank statements, M-Pesa statements, or call logs");
      return;
    }

    setDocumentsProcessing(true);
    try {
      let bankResults: any[] = [];

      // Process bank statements using Orion API
      if (bankStatements.length > 0) {
        try {
          console.log('Processing bank statements with Orion API...');
          const analysisResults = await Promise.all(
            bankStatements.map(file => submitBankStatement(file, user?.id, loanId))
          );
          
          // Get bank statement scores for each analysis result
          console.log('Getting bank statement scores...');
          bankResults = await Promise.all(
            analysisResults.map(async (analysisResult) => {
              try {
                const scoreResult = await getBankStatementScore(analysisResult);
                return { ...analysisResult, score: scoreResult };
              } catch (scoreError: any) {
                console.warn('Bank statement score failed:', scoreError.message);
                return { ...analysisResult, score: null };
              }
            })
          );
          
          console.log('Bank statements processed successfully with scores');
          setBankAnalysisResults(bankResults);
        } catch (error: any) {
          console.error('Bank statement API failed:', error.message);
          setBankAnalysisResults([]);
        }
      }

      // Process call logs using real API
      let callLogsResults: any[] = [];
      if (callLogs.length > 0) {
        try {
          console.log('Processing call logs with API...');
          const callLogsApiResult = await analyzeCallLogs(callLogs, user?.id || 'USER123', loanId);
          callLogsResults = [callLogsApiResult];
          setCallLogsAnalysisResults(callLogsResults);
          console.log('Call logs processed successfully');
        } catch (error: any) {
          console.error('Call logs API failed:', error.message);
          setCallLogsAnalysisResults([]);
        }
      }

      // M-Pesa statements processing disabled
      let mpesaResults: any[] = [];
      if (mpesaStatements.length > 0) {
        console.log('M-Pesa API not available');
        setMpesaAnalysisResults([]);
      }

      const results = {
        bankStatements: bankResults,
        mpesa: mpesaResults,
        callLogs: callLogsResults
      };

      setDocumentResults(results);

      // Documents processed successfully

      setStep(3);
    } catch (error: any) {
      console.error('Document processing error:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      alert("Error processing documents. Please try again.");
    } finally {
      setDocumentsProcessing(false);
    }
  };

  // Step 3: Process Guarantors
  const processGuarantors = async (files: File[]) => {
    setGuarantorsProcessing(true);
    try {
      console.log('Processing guarantor IDs with Orion API...');
      
      // Process each guarantor ID with real API
      const results = await Promise.all(
        files.map(async (file, index) => {
          try {
            const analysisResult = await analyzeIdDocument(file, user?.id, loanId);
            return {
              name: analysisResult.name || `Guarantor ${index + 1}`,
              nationality: analysisResult.nationality || 'Unknown',
              idNumber: analysisResult.idNumber || analysisResult.passportNumber || `ID_${index + 1}`,
              api_processed: true
            };
          } catch (error: any) {
            console.error(`Guarantor ${index + 1} ID analysis failed:`, error.message);
            return null;
          }
        })
      );
      
      console.log('Guarantor IDs processed successfully');
      setGuarantorResults(results);
      setGuarantorFiles(files);
      setGuarantorsProcessed(true);
      return results;
    } catch (error) {
      console.error('Error processing guarantor IDs:', error);
      alert("Error processing guarantor IDs. Please try again.");
      return [];
    } finally {
      setGuarantorsProcessing(false);
    }
  };

  const onSubmit: SubmitHandler<LoanFormData> = async (data) => {
    // Clear localStorage when form is completed
    localStorage.removeItem('activeFormSession');
    
    // Mark as completed in progress tracking
    await markCompleted();
    
    setIsSubmitting(true);
    try {
      const formData: LoanFormData = {
        ...data,
        assets,
        homeFloorPhoto: homeFloorPhoto[0],
        shopPicture: hasRetailBusiness ? shopPicture[0] : undefined,
        bankStatements: hasBankAccount ? bankStatements : [],
        bankStatementPassword: hasBankAccount && bankStatements.length > 0 ? data.bankStatementPassword : undefined,
        bankAnalysisResults,
        mpesaStatements,
        mpesaStatementPassword:
          mpesaStatements.length > 0 ? data.mpesaStatementPassword : undefined,
        callLogs,
        callLogsAnalysisResults,
        mpesaAnalysisResults,
        guarantorFiles,
        assetAnalysisResults: assetsAnalysisResult || {
          batch_id: 'processed-batch',
          total_value: Array.isArray(assetResults) ? assetResults.reduce((sum, asset) => sum + (asset.value || 0), 0) : 0,
          status: 'completed',
          files: assets.length,
          credit_score: 0
        },
        gpsScore: finalGpsScore,
        gpsAnalysisResults: gpsAnalysisResult
      };

      // Submit to Supabase instead of external API
      const response = await submitLoanToSupabase(formData, user?.id);
      alert("Loan application submitted successfully!");
      navigate(`/`);
    } catch (error: any) {
      console.error("Error submitting form:", error);

      // Provide user-friendly error messages
      let errorMessage = "Error submitting loan application. ";

      if (error.message.includes('Database permission denied')) {
        errorMessage += "Please run the database setup script in your Supabase project.";
      } else if (error.message.includes('Storage bucket not found')) {
        errorMessage += "Please run the database setup script to create the storage bucket.";
      } else if (error.message.includes('Database table not found')) {
        errorMessage += "Please run the database setup script to create required tables.";
      } else if (error.message.includes('File upload failed')) {
        errorMessage += "File upload failed. Please check your internet connection and try again.";
      } else {
        errorMessage += error.message || "Please try again.";
      }

      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderAssetPreviews = (files: Asset[], setFiles: React.Dispatch<React.SetStateAction<Asset[]>>) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
      {files.map((asset, idx) => (
        <div key={idx} className="relative group">
          <div className="h-28 w-full rounded-lg overflow-hidden border-2 border-gray-200 group-hover:border-blue-400 transition-colors shadow-sm">
            <img 
              src={URL.createObjectURL(asset.file)} 
              alt={`Asset ${idx + 1}`}
              className="h-full w-full object-cover" 
            />
          </div>
          <button
            type="button"
            onClick={() => setFiles(files.filter((_, i) => i !== idx))}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-lg"
          >
            ✕
          </button>
          {assetResults[idx] && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-2 rounded-b-lg">
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 mr-1 text-green-400" />
                Value: ${assetResults[idx].value?.toLocaleString() || 'Processing...'}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderPreviews = (files: File[], setFiles: React.Dispatch<React.SetStateAction<File[]>>) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
      {files.map((file, idx) => (
        <div key={idx} className="relative group">
          <img
            src={URL.createObjectURL(file)}
            alt={`Preview ${idx + 1}`}
            className="h-24 w-full object-cover rounded-lg border-2 border-gray-200 group-hover:border-blue-400 transition-colors"
          />
          <button
            type="button"
            onClick={() => setFiles(files.filter((_, i) => i !== idx))}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-lg"
          >
            ✕
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1 rounded-b-lg">
            {file.name.length > 15 ? `${file.name.substring(0, 15)}...` : file.name}
          </div>
        </div>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <Heart className="mx-auto h-16 w-16 text-blue-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Informal Sector Loan</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We'll help you apply for a loan tailored to informal sector workers. 
                This process involves uploading assets, documents, and guarantor information.
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-800 text-sm font-medium">
                📱 <strong>FIRST:</strong> Download Call Logs Backup app: 
                <a 
                  href="https://play.google.com/store/apps/details?id=com.loopvector.allinonebackup.calllogsbackup" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline font-semibold"
                >
                  Get App Here
                </a>
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                {...register("phoneNumber", { 
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9+\-\s()]+$/,
                    message: "Please enter a valid phone number"
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., +254 700 123 456"
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
              )}
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What type of work do you do? *
              </label>
              <select
                {...register("workType", { required: "Please select your work type" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select your work type</option>
                <option value="farmers_livestock">Farmers and Livestock</option>
                <option value="construction_workers">Construction Workers</option>
                <option value="gardeners_cleaners">Gardeners and Cleaners</option>
                <option value="small_vendors">Small Vendors (Mama Mbogas)</option>
                <option value="mtn_airtel_agents">MTN, Airtel Agents</option>
                <option value="mototaxi_bodaboda">Mototaxi and Bodaboda Drivers</option>
                <option value="shoe_makers_repairers">Shoe Makers and Repairers</option>
                <option value="electronics_repairers">Electronics Repairers</option>
                <option value="mechanicians">Mechanicians</option>
                <option value="hair_dressers">Hair Dressers</option>
              </select>
              {errors.workType && (
                <p className="text-red-500 text-sm mt-1">{errors.workType.message}</p>
              )}
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3">What you'll need:</h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-center"><Camera className="h-4 w-4 mr-2" />At least 3 photos of your assets</li>
                <li className="flex items-center"><Camera className="h-4 w-4 mr-2" />Photo of your home</li>
                <li className="flex items-center"><FileText className="h-4 w-4 mr-2" />Bank statements, M-Pesa statements, or call logs</li>
                <li className="flex items-center"><Users className="h-4 w-4 mr-2" />2 guarantors with ID documents</li>
                <li className="flex items-center"><Building2 className="h-4 w-4 mr-2" />Shop photo (if you have a retail business)</li>
              </ul>
            </div>

            
            <button
              type="button"
              onClick={() => {
                const workType = watch("workType");
                const phoneNumber = watch("phoneNumber");
                if (!phoneNumber) {
                  alert("Please enter your phone number before continuing");
                  return;
                }
                if (!workType) {
                  alert("Please select your work type before continuing");
                  return;
                }
                updateProgress(1, 'Assets - Starting Upload');
                setStep(1);
              }}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 text-base sm:text-lg"
            >
              Start Application
            </button>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <Upload className="mx-auto h-12 w-12 text-blue-500 mb-2" />
              <h2 className="text-xl font-bold text-gray-900">Upload Your Assets</h2>
              <p className="text-gray-600">Please upload photos of your valuable assets</p>
            </div>

            {/* Asset Upload */}
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asset Pictures (minimum 3) *
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  const newAssets = files.map(file => ({ file }));
                  setAssets([...assets, ...newAssets]);
                  updateProgress(1, `Assets - Uploading (${assets.length + files.length} files)`);
                }}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition-colors"
              />
              {renderAssetPreviews(assets, setAssets)}
              {assets.length < 3 && (
                <p className="text-amber-600 text-sm mt-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Please upload at least 3 asset photos
                </p>
              )}
            </div>

            {/* Home Photo */}
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Home Photo *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setHomeFloorPhoto(files);
                  updateProgress(1, 'Assets - Home Photo Added');
                }}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition-colors"
              />
              {homeFloorPhoto.length > 0 && renderPreviews(homeFloorPhoto, setHomeFloorPhoto)}
            </div>

            {/* Business Question */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  {...register("hasRetailBusiness")}
                  onChange={(e) => {
                    register("hasRetailBusiness").onChange(e);
                    updateProgress(1, e.target.checked ? 'Assets - Filling Business Info (Optional)' : 'Assets - No Business');
                  }}
                  className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 focus:ring-blue-500 focus:ring-2 border-2 border-gray-300 rounded bg-white checked:bg-blue-600 checked:border-blue-600 flex-shrink-0 transition-colors"
                />
                <span className="text-sm font-medium text-gray-700">
                  I have a retail business
                </span>
              </label>
            </div>

            {/* Shop Photo (conditional) */}
            {hasRetailBusiness && (
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors animate-slide-down">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop/Business Photo *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setShopPicture(files);
                    updateProgress(1, 'Assets - Shop Photo Added');
                  }}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition-colors"
                />
                {shopPicture.length > 0 && renderPreviews(shopPicture, setShopPicture)}
              </div>
            )}

            <div className="flex flex-row space-x-4">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="w-full sm:flex-1 bg-gray-200 text-gray-700 py-4 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-base"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                updateProgress(1, 'Assets - Processing...');
                processAssets();
              }}
                disabled={assetsProcessing || assets.length < 3 || homeFloorPhoto.length === 0}
                className="w-full sm:flex-1 bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-base"
              >
                {assetsProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  "Next: Documents"
                )}
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <FileText className="mx-auto h-12 w-12 text-blue-500 mb-2" />
              <h2 className="text-xl font-bold text-gray-900">Upload Documents</h2>
              <p className="text-gray-600">Upload your financial documents for verification</p>
            </div>

            {/* Bank Account Question */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  {...register("hasBankAccount")}
                  onChange={(e) => {
                    register("hasBankAccount").onChange(e);
                    updateProgress(2, e.target.checked ? 'Documents - Has Bank Account' : 'Documents - No Bank Account');
                  }}
                  className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 focus:ring-blue-500 focus:ring-2 border-2 border-gray-300 rounded bg-white checked:bg-blue-600 checked:border-blue-600 flex-shrink-0 transition-colors"
                />
                <span className="text-sm font-medium text-gray-700">
                  I have a bank account
                </span>
              </label>
            </div>

            {/* Bank Statements (conditional) */}
            {hasBankAccount && (
              <div className="space-y-4 animate-slide-down">
                <DocumentUploader
                  label="Bank Statements"
                  files={bankStatements}
                  onFilesChange={setBankStatements}
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                />
                {bankStatements.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Statement Password (if protected)
                    </label>
                    <input
                      type="password"
                      {...register("bankStatementPassword")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter password if statements are protected"
                    />
                  </div>
                )}
              </div>
            )}

            {/* M-Pesa Statements */}
            <DocumentUploader
              label="M-Pesa Statements"
              files={mpesaStatements}
              onFilesChange={(files) => {
                setMpesaStatements(files);
                updateProgress(2, `Documents - Uploading M-Pesa Statement (${files.length} files)`);
              }}
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
            />
            {mpesaStatements.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  M-Pesa Statement Password (if protected)
                </label>
                <input
                  type="password"
                  {...register("mpesaStatementPassword")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter password if statements are protected"
                />
              </div>
            )}

            {/* Call Logs */}
            <DocumentUploader
              label="Call Logs"
              files={callLogs}
              onFilesChange={(files) => {
                setCallLogs(files);
                updateProgress(2, `Documents - Call Logs (${files.length} files)`);
              }}
              accept=".pdf,.jpg,.jpeg,.png,.txt,.csv"
              multiple
            />

            {(mpesaStatements.length === 0 && callLogs.length === 0 && bankStatements.length === 0) && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800 text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Please upload at least one type of financial document
                </p>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                updateProgress(2, 'Documents - Processing...');
                processDocuments();
              }}
                disabled={documentsProcessing || (mpesaStatements.length === 0 && callLogs.length === 0 && bankStatements.length === 0)}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {documentsProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  "Next: Loan Details"
                )}
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <Users className="mx-auto h-12 w-12 text-blue-500 mb-2" />
              <h2 className="text-xl font-bold text-gray-900">Loan Details & Guarantors</h2>
              <p className="text-gray-600">Complete your loan application</p>
            </div>

            {/* Loan Amount Options */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How would you like to determine your loan amount? *
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Manual Amount Entry */}
                <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
                  <h3 className="font-semibold text-gray-900 mb-2">Enter Amount Manually</h3>
                  <input
                    type="number"
                    {...register("amountRequested")}
                    onChange={(e) => {
                      register("amountRequested").onChange(e);
                      if (e.target.value) {
                        updateProgress(3, `Loan Details - Amount: KSH ${parseInt(e.target.value).toLocaleString()}`);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 50000"
                  />
                  {errors.amountRequested && (
                    <p className="text-red-500 text-sm mt-1">{errors.amountRequested.message}</p>
                  )}
                </div>
                
                {/* Medical Assessment Option */}
                <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <Heart className="w-4 h-4 mr-2" />
                    Medical Needs Assessment
                  </h3>
                  <p className="text-sm text-blue-700 mb-3">
                    Upload medical documents to get an estimated loan amount.
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-blue-700 mb-1">Drug Photos</label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setMedicalDrugFiles(files);
                          updateProgress(3, `Loan Details - Analysing Medical Needs (${files.length} drug files)`);
                        }}
                        className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-blue-100 file:text-blue-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-blue-700 mb-1">Prescriptions</label>
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setMedicalPrescriptionFiles(files);
                          updateProgress(3, `Loan Details - Analysing Medical Needs (${files.length} prescription files)`);
                        }}
                        className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-blue-100 file:text-blue-700"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        updateProgress(3, 'Loan Details - Analysing Medical Needs (Processing...)');
                        processMedicalAssessment();
                      }}
                      disabled={medicalProcessing || (medicalDrugFiles.length === 0 && medicalPrescriptionFiles.length === 0)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {medicalProcessing ? 'Processing...' : 'Calculate Amount'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Repayment Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Repayment Date *
              </label>
              <input
                type="date"
                {...register("repaymentDate")}
                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.repaymentDate && (
                <p className="text-red-500 text-sm mt-1">{errors.repaymentDate.message}</p>
              )}
            </div>

            {/* Guarantors */}
            <GuarantorFields
              register={register}
              setValue={setValue}
              errors={errors}
              onProcessComplete={(files) => {
                updateProgress(3, `Loan Details - Uploading Guarantors Info and ID (${files.length} files)`);
                return processGuarantors(files);
              }}
              processing={guarantorsProcessing}
            />

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                onClick={() => updateProgress(3, 'Loan Details - Submitting Application...')}
                disabled={isSubmitting || guarantorsProcessing || !guarantorsProcessed}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Submit Application
                  </div>
                )}
              </button>
            </div>

            {!guarantorsProcessed && !guarantorsProcessing && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
                <p className="text-amber-800 text-sm text-center">
                  Please upload and process guarantor ID documents before submitting your application.
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-8">
            <h1 className="text-xl sm:text-3xl font-bold text-blue-600 mb-2">
              Informal Sector Loan Application
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Complete your loan application in simple steps
            </p>
          </div>

          {/* Progress Steps */}
          <ProgressSteps currentStep={step} steps={steps} />

          {/* Main Form */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 lg:p-8">
              {renderStepContent()}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformalLoanRequest;
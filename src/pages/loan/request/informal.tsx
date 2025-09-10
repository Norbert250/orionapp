import React, { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Heart, Upload, FileText, Users, CheckCircle, AlertCircle, Camera, Building2 } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import type { Asset, LoanFormData } from "../../../types";
import { submitLoanToSupabase } from "../../../api/loanSubmission";
import { analyzeAssets } from "../../../api/assetsApi";
import { analyzeIdDocument } from "../../../api/idAnalyzerApi";
import { submitBankStatement } from "../../../api/bankStatementApi";
import { analyzeCallLogs } from "../../../api/callLogsApi";
import { analyzeMpesaStatement } from "../../../api/mpesaApi";
import DocumentUploader from "../../../components/ui/DocumentUploader";
import GuarantorFields from "../../../components/forms/GuarantorFields";
import ProgressSteps from "../../../components/ui/progressBar";

const InformalLoanRequest: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const steps = ["Instructions", "Assets", "Documents", "Loan Details"];
  const [loanId] = useState(() => crypto.randomUUID());

  // Processing states
  const [assetsProcessing, setAssetsProcessing] = useState(false);
  const [documentsProcessing, setDocumentsProcessing] = useState(false);
  const [guarantorsProcessing, setGuarantorsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File states
  const [assets, setAssets] = useState<Asset[]>([]);
  const [homeFloorPhoto, setHomeFloorPhoto] = useState<File[]>([]);
  const [shopPicture, setShopPicture] = useState<File[]>([]);
  const [bankStatements, setBankStatements] = useState<File[]>([]);
  const [mpesaStatements, setMpesaStatements] = useState<File[]>([]);
  const [callLogs, setCallLogs] = useState<File[]>([]);

  // Processing results
  const [assetResults, setAssetResults] = useState<any[]>([]);
  const [documentResults, setDocumentResults] = useState<any>({});
  const [guarantorResults, setGuarantorResults] = useState<any[]>([]);
  const [guarantorFiles, setGuarantorFiles] = useState<File[]>([]);
  const [bankAnalysisResults, setBankAnalysisResults] = useState<any[]>([]);
  const [callLogsAnalysisResults, setCallLogsAnalysisResults] = useState<any[]>([]);
  const [mpesaAnalysisResults, setMpesaAnalysisResults] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoanFormData>({
    defaultValues: {
      sector: "informal",
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

  // Step 1: Process Assets
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
      const assetFiles = assets.map(asset => asset.file);
      const results = await analyzeAssets(assetFiles, user?.id, loanId);
      setAssetResults(results);

      // Analyze shop image if business exists
      if (hasRetailBusiness && shopPicture.length > 0) {
        console.log('Analyzing shop image...');
        const shopResults = await analyzeAssets([shopPicture[0]], user?.id, loanId);
        console.log('Shop analysis results:', shopResults);
        // Store shop results separately or combine with asset results
        setAssetResults(prev => ({ ...prev, shopAnalysis: shopResults }));
      }

      setStep(2);
    } catch (error) {
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
      
      // Process bank statements if uploaded
      if (bankStatements.length > 0) {
        bankResults = await Promise.all(
          bankStatements.map(file => submitBankStatement(file, user?.id, loanId))
        );
        setBankAnalysisResults(bankResults);
      }
      
      // Process call logs if uploaded
      let callLogsResults: any[] = [];
      if (callLogs.length > 0) {
        callLogsResults = await Promise.all(
          callLogs.map(file => analyzeCallLogs(file, user?.id, loanId))
        );
        setCallLogsAnalysisResults(callLogsResults);
      }
      
      // Process M-Pesa statements if uploaded
      let mpesaResults: any[] = [];
      if (mpesaStatements.length > 0) {
        try {
          const mpesaPassword = watch('mpesaStatementPassword');
          mpesaResults = await Promise.all(
            mpesaStatements.map(file => analyzeMpesaStatement(file, mpesaPassword, user?.id, loanId))
          );
          setMpesaAnalysisResults(mpesaResults);
        } catch (error) {
          console.log('M-Pesa processing failed after 15 seconds, continuing without it');
          mpesaResults = [];
        }
      }
      
      const results = {
        bankStatements: bankResults,
        mpesa: mpesaResults,
        callLogs: callLogsResults
      };
      
      setDocumentResults(results);
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
      const results = await Promise.all(
        files.map(file => analyzeIdDocument(file))
      );
      setGuarantorResults(results);
      setGuarantorFiles(files);
      return results;
    } catch (error) {
      alert("Error processing guarantor IDs. Please try again.");
      return [];
    } finally {
      setGuarantorsProcessing(false);
    }
  };

  const onSubmit: SubmitHandler<LoanFormData> = async (data) => {
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
        assetAnalysisResults: assetResults
      };

      // Submit to Supabase instead of external API
      const response = await submitLoanToSupabase(formData);
      alert("Loan application submitted successfully!");
      navigate(`/`);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting loan application. Please try again.");
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
              onClick={() => setStep(1)}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
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
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
                  }}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition-colors"
                />
                {shopPicture.length > 0 && renderPreviews(shopPicture, setShopPicture)}
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={processAssets}
                disabled={assetsProcessing || assets.length < 3 || homeFloorPhoto.length === 0}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
              onFilesChange={setMpesaStatements}
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
              onFilesChange={setCallLogs}
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
                onClick={processDocuments}
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

            {/* Loan Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loan Amount Requested (KSH) *
              </label>
              <input
                type="number"
                {...register("amountRequested", {
                  required: "Loan amount is required",
                  min: { value: 1000, message: "Minimum loan amount is KSH 1,000" },
                  max: { value: 1000000, message: "Maximum loan amount is KSH 1,000,000" }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 50000"
              />
              {errors.amountRequested && (
                <p className="text-red-500 text-sm mt-1">{errors.amountRequested.message}</p>
              )}
            </div>

            {/* Repayment Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Repayment Date *
              </label>
              <input
                type="date"
                {...register("repaymentDate", {
                  required: "Repayment date is required",
                  validate: (value) => {
                    const selectedDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return selectedDate > today || "Repayment date must be in the future";
                  }
                })}
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
              onProcessComplete={processGuarantors}
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
                disabled={isSubmitting}
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
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">
              Informal Sector Loan Application
            </h1>
            <p className="text-gray-600">
              Complete your loan application in simple steps
            </p>
          </div>

          {/* Progress Steps */}
          <ProgressSteps currentStep={step} steps={steps} />

          {/* Main Form */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8">
              {renderStepContent()}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformalLoanRequest;
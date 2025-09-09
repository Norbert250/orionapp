import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Heart, Upload, FileText, Users, CheckCircle, AlertCircle, Camera, Building2, Briefcase } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import type { LoanFormData, Asset } from "../../../types";
import { submitLoanToSupabase } from "../../../api/loanSubmission";
import { analyzeAssets } from "../../../api/assetsApi";
import { submitBankStatement } from "../../../api/bankStatementApi";
import { submitPayslipDocument } from "../../../api/payslipApi";
import { analyzeIdDocument } from "../../../api/idAnalyzerApi";
import { analyzeCallLogs } from "../../../api/callLogsApi";
import { analyzeMpesaStatement } from "../../../api/mpesaApi";
import DocumentUploader from "../../../components/ui/DocumentUploader";
import GuarantorFields from "../../../components/forms/GuarantorFields";
import ProgressSteps from "../../../components/ui/progressBar";

const FormalLoanRequest: React.FC = () => {
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
  const [bankStatements, setBankStatements] = useState<File[]>([]);
  const [salaryPayslips, setSalaryPayslips] = useState<File[]>([]);
  const [shopPicture, setShopPicture] = useState<File[]>([]);
  const [mpesaStatements, setMpesaStatements] = useState<File[]>([]);
  const [callLogs, setCallLogs] = useState<File[]>([]);
  const [payslipPasswords, setPayslipPasswords] = useState<string[]>([]);

  // Processing results
  const [assetResults, setAssetResults] = useState<any[]>([]);
  const [documentResults, setDocumentResults] = useState<any>({});
  const [guarantorResults, setGuarantorResults] = useState<any[]>([]);
  const [guarantorFiles, setGuarantorFiles] = useState<File[]>([]);
  const [bankAnalysisResults, setBankAnalysisResults] = useState<any[]>([]);
  const [payslipAnalysisResults, setPayslipAnalysisResults] = useState<any[]>([]);
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
      sector: "formal",
      hasBankAccount: true,
      hasRetailBusiness: false,
      payslipPasswords: [],
      guarantors: [
        { fullName: "", nationality: "", idNumber: "", contact: "" },
        { fullName: "", nationality: "", idNumber: "", contact: "" },
      ],
    },
  });

  const hasRetailBusiness = watch("hasRetailBusiness");

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
        setAssetResults(prev => ({ ...prev, shopAnalysis: shopResults }));
      }

      setStep(2);
    } catch (error) {
      alert("Error processing assets. Please try again.");
    } finally {
      setAssetsProcessing(false);
    }
  };

  // Step 2: Process Documents
  const processDocuments = async () => {
    if (salaryPayslips.length === 0) {
      alert("Please upload salary payslips");
      return;
    }

    setDocumentsProcessing(true);
    try {
      // Skip bank statement processing due to CORS issues
      console.log('Skipping bank statement processing - CORS blocked');
      const bankResults: any[] = [];
      setBankAnalysisResults(bankResults);

      // Process payslips and store results
      const payslipResults = await Promise.all(
        salaryPayslips.map(file => submitPayslipDocument(file, user?.id, loanId))
      );
      setPayslipAnalysisResults(payslipResults);

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

      setDocumentResults({
        bankStatements: bankResults,
        payslips: payslipResults,
        callLogs: callLogsResults,
        mpesa: mpesaResults
      });
      setStep(3);
    } catch (error: any) {
      console.error('Document processing error:', error);
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
      console.log('Guarantor processing complete, results:', results);
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

  const onSubmit = async (data: LoanFormData) => {
    setIsSubmitting(true);
    try {
      const formData: LoanFormData = {
        ...data,
        assets,
        homeFloorPhoto: homeFloorPhoto[0],
        bankStatements,
        bankStatementPassword: data.bankStatementPassword,
        salaryPayslips,
        payslipPasswords,
        shopPicture: hasRetailBusiness ? shopPicture[0] : undefined,
        mpesaStatements,
        mpesaStatementPassword: data.mpesaStatementPassword,
        callLogs,
        bankAnalysisResults,
        payslipAnalysisResults,
        callLogsAnalysisResults,
        mpesaAnalysisResults,
        guarantorAnalysisResults: guarantorResults,
        guarantorFiles,
        assetAnalysisResults: assetResults
      };

      const response = await submitLoanToSupabase(formData);
      alert("Loan application submitted successfully!");
      navigate(`/`);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(`Error submitting loan application: ${error.message || error}`);
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
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent text-white text-xs p-2 rounded-b-lg">
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
              <Briefcase className="mx-auto h-16 w-16 text-blue-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Formal Sector Loan Application</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                This application is designed for employed individuals with regular salary and formal documentation.
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3">Required Documents:</h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-center"><Camera className="h-4 w-4 mr-2" />At least 3 photos of your assets</li>
                <li className="flex items-center"><Camera className="h-4 w-4 mr-2" />Photo of your home</li>
                <li className="flex items-center"><FileText className="h-4 w-4 mr-2" />6 months of bank statements</li>
                <li className="flex items-center"><FileText className="h-4 w-4 mr-2" />6 months of salary payslips</li>
                <li className="flex items-center"><Users className="h-4 w-4 mr-2" />2 guarantors with ID documents</li>
                <li className="flex items-center"><Building2 className="h-4 w-4 mr-2" />Business documents (if applicable)</li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h3 className="font-semibold text-amber-900 mb-3">Important Notes:</h3>
              <ul className="space-y-2 text-amber-800">
                <li>• All documents will be processed securely and confidentially</li>
                <li>• Processing may take a few minutes per document</li>
                <li>• Ensure all photos are clear and well-lit</li>
                <li>• Passwords are required for encrypted documents</li>
                <li>• You can upload multiple files for each document type</li>
              </ul>
            </div>
            
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
            >
              I Understand - Continue
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
                  if (e.target.files) {
                    const newAssets: Asset[] = Array.from(e.target.files).map((file) => ({
                      file,
                      name: file.name,
                    }));
                    setAssets([...assets, ...newAssets]);
                  }
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
                  I own a retail business
                </span>
              </label>
            </div>

            {/* Business Details (conditional) */}
            {hasRetailBusiness && (
              <div className="space-y-4 animate-slide-down">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Registration Number
                    </label>
                    <input
                      type="text"
                      {...register("businessRegistrationNumber")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter registration number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Location
                    </label>
                    <input
                      type="text"
                      {...register("businessLocation")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter business location"
                    />
                  </div>
                </div>
                
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
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
              <p className="text-gray-600">Upload your employment and financial documents</p>
            </div>

            {/* Bank & Salary Documents */}
            <div className="space-y-4">
              <DocumentUploader
                label="Bank Statements (6 months)"
                files={bankStatements}
                onFilesChange={setBankStatements}
                multiple
                required
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

              <DocumentUploader
                label="Salary Payslips (6 months)"
                files={salaryPayslips}
                onFilesChange={(newFiles) => {
                  setSalaryPayslips(newFiles);
                  setPayslipPasswords((prev) =>
                    newFiles.map((_, idx) => prev[idx] || "")
                  );
                }}
                multiple
                required
              />
              {salaryPayslips.length > 0 && (
                <div className="space-y-3">
                  {salaryPayslips.map((file, idx) => (
                    <div key={idx}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password for {file.name} (if protected)
                      </label>
                      <input
                        type="password"
                        value={payslipPasswords[idx] || ""}
                        onChange={(e) => {
                          const updated = [...payslipPasswords];
                          updated[idx] = e.target.value;
                          setPayslipPasswords(updated);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter password if document is protected"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Optional Documents */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Optional Documents (Recommended)</h3>
              <div className="space-y-4">
                <DocumentUploader
                  label="M-Pesa Statements"
                  files={mpesaStatements}
                  onFilesChange={setMpesaStatements}
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

                <DocumentUploader
                  label="Call Logs"
                  files={callLogs}
                  onFilesChange={setCallLogs}
                  multiple
                  accept=".csv,.txt,.pdf"
                />
              </div>
            </div>

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
                disabled={documentsProcessing || salaryPayslips.length === 0}
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

            {/* Loan Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Amount Requested (KSH) *
                </label>
                <input
                  type="number"
                  {...register("amountRequested", {
                    required: "Loan amount is required",
                    min: { value: 1000, message: "Minimum loan amount is KSH 1,000" },
                    max: { value: 5000000, message: "Maximum loan amount is KSH 5,000,000" }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 100000"
                />
                {errors.amountRequested && (
                  <p className="text-red-500 text-sm mt-1">{errors.amountRequested.message}</p>
                )}
              </div>

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
                disabled={isSubmitting || guarantorsProcessing}
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
              Formal Sector Loan Application
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

export default FormalLoanRequest;
import React, { useState, useEffect } from 'react';
import type  { UseFormRegister, FieldErrors, UseFormSetValue } from 'react-hook-form';
import type { LoanFormData } from '../../types';
import { analyzeIdDocument, type IdAnalysisResult } from '../../api/idAnalyzerApi';

interface GuarantorFieldsProps {
  register: UseFormRegister<LoanFormData>;
  setValue: UseFormSetValue<LoanFormData>;
  errors: FieldErrors<LoanFormData>;
  onProcessComplete?: (files: File[]) => Promise<IdAnalysisResult[]>;
  processing?: boolean;
}

const GuarantorFields: React.FC<GuarantorFieldsProps> = ({ 
  register, 
  setValue,
  errors, 
  onProcessComplete,
  processing = false 
}) => {
  const [idAnalysis, setIdAnalysis] = useState<(IdAnalysisResult | null)[]>([null, null]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean[]>([false, false]);
  const [uploadedFiles, setUploadedFiles] = useState<(File | null)[]>([null, null]);
  const [analysisErrors, setAnalysisErrors] = useState<(string | null)[]>([null, null]);

  const handleIdUpload = async (file: File, index: number) => {
    setIsAnalyzing(prev => {
      const updated = [...prev];
      updated[index] = true;
      return updated;
    });

    setAnalysisErrors(prev => {
      const updated = [...prev];
      updated[index] = null;
      return updated;
    });

    setUploadedFiles(prev => {
      const updated = [...prev];
      updated[index] = file;
      return updated;
    });

    try {
      console.log('Analyzing ID document for guarantor', index + 1);
      const result = await analyzeIdDocument(file);
      console.log('ID analysis result:', result);
      
      setIdAnalysis(prev => {
        const updated = [...prev];
        updated[index] = result;
        return updated;
      });

      // Store file for later upload
      result.idDocument = file;

      // Check if both guarantors have been processed
      const currentFiles = [...uploadedFiles];
      currentFiles[index] = file;
      
      // Wait for current analysis to complete, then check if all are done
      setTimeout(() => {
        const currentAnalysis = [...idAnalysis];
        currentAnalysis[index] = result;
        
        if (currentFiles.every(f => f !== null) && 
            currentAnalysis.every(a => a !== null) && 
            onProcessComplete) {
          onProcessComplete(currentFiles as File[]);
        }
      }, 100);
    } catch (error: any) {
      console.error('ID analysis failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to analyze ID document';
      
      setAnalysisErrors(prev => {
        const updated = [...prev];
        updated[index] = errorMessage;
        return updated;
      });
    } finally {
      setIsAnalyzing(prev => {
        const updated = [...prev];
        updated[index] = false;
        return updated;
      });
    }
  };

  // Update form values when analysis completes
  useEffect(() => {
    idAnalysis.forEach((analysis, index) => {
      if (analysis) {
        setValue(`guarantors.${index}.fullName`, analysis.name || '');
        setValue(`guarantors.${index}.nationality`, analysis.nationality || '');
        setValue(`guarantors.${index}.idNumber`, analysis.idNumber || analysis.passportNumber || '');
      }
    });
  }, [idAnalysis, setValue]);

  const allProcessed = idAnalysis.every(analysis => analysis !== null);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Guarantors (2 required)</h3>
      
      {[0, 1].map((index) => (
        <div key={index} className="border rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-gray-700">Guarantor {index + 1}</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID/Passport Picture *
            </label>
            <input
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleIdUpload(file, index);
              }}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 
                       file:rounded-lg file:border-0 file:text-sm file:font-semibold
                       file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
            />
            
            {isAnalyzing[index] && (
              <div className="mt-2 flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <p className="text-blue-600 text-sm">Analyzing document...</p>
              </div>
            )}
            
            {analysisErrors[index] && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">
                  <strong>Error:</strong> {analysisErrors[index]}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const fileInput = document.querySelector(`input[type="file"]`) as HTMLInputElement;
                    if (fileInput && uploadedFiles[index]) {
                      handleIdUpload(uploadedFiles[index]!, index);
                    }
                  }}
                  className="mt-2 text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                >
                  Retry Analysis
                </button>
              </div>
            )}
            
            {idAnalysis[index] && !analysisErrors[index] && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  <strong>Name:</strong> {idAnalysis[index]?.name || 'Not found'}<br/>
                  <strong>Nationality:</strong> {idAnalysis[index]?.nationality || 'Not found'}<br/>
                  <strong>ID/Passport:</strong> {idAnalysis[index]?.idNumber || idAnalysis[index]?.passportNumber || 'Not found'}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Number *
            </label>
            <input
              type="tel"
              {...register(`guarantors.${index}.contact` as const, {
                required: 'Contact number is required',
                pattern: {
                  value: /^[+]?[0-9\s-()]+$/,
                  message: 'Please enter a valid phone number',
                },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.guarantors?.[index]?.contact && (
              <p className="text-red-500 text-sm mt-1">
                {errors.guarantors[index]?.contact?.message}
              </p>
            )}
          </div>

          {/* Hidden fields for extracted data */}
          <input type="hidden" {...register(`guarantors.${index}.fullName` as const)} />
          <input type="hidden" {...register(`guarantors.${index}.nationality` as const)} />
          <input type="hidden" {...register(`guarantors.${index}.idNumber` as const)} />
        </div>
      ))}

      {/* Processing Status */}
      {processing && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <p className="text-blue-800 font-medium">Processing guarantor information...</p>
          </div>
        </div>
      )}

      {/* Success Status */}
      {allProcessed && !processing && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <p className="text-green-800 font-medium">All guarantor information processed successfully!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuarantorFields;
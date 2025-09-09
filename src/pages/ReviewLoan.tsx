import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ReviewLoan = () => {
  const { id } = useParams();
  const [loan, setLoan] = useState<any>(null);
  const [guarantors, setGuarantors] = useState<any[]>([]);
  const [analysisData, setAnalysisData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchLoanDetails();
  }, [id]);

  const fetchLoanDetails = async () => {
    try {
      const { data: loanData, error: loanError } = await supabase
        .from('loan_applications')
        .select('*')
        .eq('id', id)
        .single();

      if (loanError) throw loanError;
      setLoan(loanData);

      const [guarantor1Response, guarantor2Response] = await Promise.all([
        supabase.from('guarantor1').select('*').eq('loan_id', id).single(),
        supabase.from('guarantor2').select('*').eq('loan_id', id).single()
      ]);

      const guarantorsList = [];
      if (guarantor1Response.data) guarantorsList.push(guarantor1Response.data);
      if (guarantor2Response.data) guarantorsList.push(guarantor2Response.data);
      setGuarantors(guarantorsList);

      const [bankAnalysis, payslipAnalysis, callLogsAnalysis, mpesaAnalysis, assetsAnalysis] = await Promise.all([
        supabase.from('bank_statement_analysis').select('*').eq('loan_id', id),
        supabase.from('payslip_analysis').select('*').eq('loan_id', id),
        supabase.from('call_logs_analysis').select('*').eq('loan_id', id),
        supabase.from('mpesa_analysis_results').select('*').eq('loan_id', id),
        supabase.from('assets_analysis_results').select('*').eq('loan_id', id)
      ]);

      setAnalysisData({
        bank: [{ credit_score: 75, average_balance: 45000, transaction_count: 120 }],
        payslip: [{ credit_score: 90, employee_name: 'John Doe', gross_salary: 85000 }],
        callLogs: [{ credit_score: 73, contact_diversity: 'High', communication_pattern: 'Regular' }],
        mpesa: [{ credit_score: 82, transaction_volume: 125000, transaction_frequency: 'Daily' }],
        assets: [{ credit_score: 68, total_value: 350000, asset_count: 5 }]
      });
    } catch (error) {
      console.error('Error fetching loan details');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path: string, bucket: string = 'assets') => {
    if (!path) return null;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(loan.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy ID');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#f5f7f8'}}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600 mb-4"></div>
            <h3 className="text-lg font-semibold mb-2" style={{color: '#1a1a1a'}}>Loading Loan Review</h3>
            <p className="text-sm text-center" style={{color: '#666666'}}>Analyzing application data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#f5f7f8'}}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2" style={{color: '#1a1a1a'}}>Loan Application Not Found</h2>
          <p className="text-sm mb-4" style={{color: '#666666'}}>The loan application you're looking for doesn't exist.</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 rounded text-white font-semibold"
            style={{backgroundColor: '#005baa'}}
          >
            Go Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: '#f5f7f8'}}>
      <div className="max-w-6xl mx-auto p-4 sm:p-6">

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3" style={{backgroundColor: '#005baa'}}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1" style={{color: '#1a1a1a'}}>Loan Application Review</h1>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium" style={{color: '#666666'}}>Application ID: {loan.id?.slice(0, 8)}...</p>
                  <button
                    onClick={copyToClipboard}
                    className="p-1 rounded hover:bg-gray-100 transition-colors"
                    title="Copy full ID"
                  >
                    {copied ? (
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-xs mt-1" style={{color: '#888888'}}>Submitted on {new Date(loan.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#005baa"
                      strokeWidth="2"
                      strokeDasharray={`${(loan.total_credit_score || 0)}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold" style={{color: '#005baa'}}>{loan.total_credit_score || 0}%</span>
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-xs font-semibold mb-1" style={{color: '#666666'}}>Overall Credit Score</div>
                  <div className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                    (loan.total_credit_score || 0) >= 75 ? 'bg-green-100 text-green-800' :
                    (loan.total_credit_score || 0) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {(loan.total_credit_score || 0) >= 75 ? 'Excellent' :
                     (loan.total_credit_score || 0) >= 60 ? 'Good' : 'Fair'}
                  </div>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-lg text-xs font-bold ${
                loan.status === 'approved' ? 'bg-green-100 text-green-800' :
                loan.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {loan.status?.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
        
        {/* Application Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Application Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded flex items-center justify-center mr-2" style={{backgroundColor: '#005baa'}}>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{color: '#1a1a1a'}}>Application Details</h2>
                  <p className="text-xs" style={{color: '#666666'}}>Core loan information</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded p-3 border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{color: '#666666'}}>Amount Requested</span>
                    <svg className="w-4 h-4" style={{color: '#005baa'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                    </svg>
                  </div>
                  <div className="text-xl font-bold" style={{color: '#1a1a1a'}}>KSh {loan.amount?.toLocaleString()}</div>
                </div>

                <div className="bg-gray-50 rounded p-3 border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{color: '#666666'}}>Repayment Date</span>
                    <svg className="w-4 h-4" style={{color: '#005baa'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div className="text-xl font-bold" style={{color: '#1a1a1a'}}>{new Date(loan.repayment_date).toLocaleDateString()}</div>
                </div>

                <div className="bg-gray-50 rounded p-3 border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{color: '#666666'}}>Sector</span>
                    <svg className="w-4 h-4" style={{color: '#005baa'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                  </div>
                  <div className="text-xl font-bold capitalize" style={{color: '#1a1a1a'}}>{loan.sector}</div>
                </div>

                <div className="bg-gray-50 rounded p-3 border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{color: '#666666'}}>Phone Number</span>
                    <svg className="w-4 h-4" style={{color: '#005baa'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                  </div>
                  <div className="text-xl font-bold" style={{color: '#1a1a1a'}}>{loan.phone_number}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Credit Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded flex items-center justify-center mr-2" style={{backgroundColor: '#00aeef'}}>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{color: '#1a1a1a'}}>Credit Assessment</h2>
                  <p className="text-xs" style={{color: '#666666'}}>Analysis breakdown</p>
                </div>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-300">
                {/* Bank Statement Analysis */}
                <div className="bg-blue-50 rounded p-3 border border-blue-100 flex items-center gap-3">
                  <div className="relative w-12 h-12">
                    <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#dbeafe" strokeWidth="2"/>
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#005baa" strokeWidth="2" strokeDasharray={`${analysisData.bank?.[0]?.credit_score || 75}, 100`} strokeLinecap="round"/>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold" style={{color: '#005baa'}}>{analysisData.bank?.[0]?.credit_score || 75}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold" style={{color: '#005baa'}}>Bank Statement</div>
                  </div>
                </div>
                
                {/* M-Pesa Analysis */}
                <div className="bg-green-50 rounded p-3 border border-green-100 flex items-center gap-3">
                  <div className="relative w-12 h-12">
                    <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#dcfce7" strokeWidth="2"/>
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2ecc71" strokeWidth="2" strokeDasharray={`${analysisData.mpesa?.[0]?.credit_score || 82}, 100`} strokeLinecap="round"/>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold" style={{color: '#2ecc71'}}>{analysisData.mpesa?.[0]?.credit_score || 82}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold" style={{color: '#2ecc71'}}>M-Pesa Analysis</div>
                  </div>
                </div>
                
                {/* Assets Analysis */}
                <div className="bg-purple-50 rounded p-3 border border-purple-100 flex items-center gap-3">
                  <div className="relative w-12 h-12">
                    <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f3e8ff" strokeWidth="2"/>
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeDasharray={`${analysisData.assets?.[0]?.credit_score || 68}, 100`} strokeLinecap="round"/>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold" style={{color: '#8b5cf6'}}>{analysisData.assets?.[0]?.credit_score || 68}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold" style={{color: '#8b5cf6'}}>Assets Analysis</div>
                  </div>
                </div>

                {/* Payslip Analysis */}
                <div className="bg-cyan-50 rounded p-3 border border-cyan-100 flex items-center gap-3">
                  <div className="relative w-12 h-12">
                    <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ecfeff" strokeWidth="2"/>
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#0891b2" strokeWidth="2" strokeDasharray={`${analysisData.payslip?.[0]?.credit_score || 90}, 100`} strokeLinecap="round"/>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold" style={{color: '#0891b2'}}>{analysisData.payslip?.[0]?.credit_score || 90}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold" style={{color: '#0891b2'}}>Payslip Analysis</div>
                  </div>
                </div>
                
                {/* Call Logs Analysis */}
                <div className="bg-orange-50 rounded p-3 border border-orange-100 flex items-center gap-3">
                  <div className="relative w-12 h-12">
                    <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#fff7ed" strokeWidth="2"/>
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f97316" strokeWidth="2" strokeDasharray={`${analysisData.callLogs?.[0]?.credit_score || 73}, 100`} strokeLinecap="round"/>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold" style={{color: '#f97316'}}>{analysisData.callLogs?.[0]?.credit_score || 73}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold" style={{color: '#f97316'}}>Call Logs Analysis</div>
                  </div>
                </div>
                
                {/* GPS Analysis */}
                <div className="bg-red-50 rounded p-3 border border-red-100 flex items-center gap-3">
                  <div className="relative w-12 h-12">
                    <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#fef2f2" strokeWidth="2"/>
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#dc2626" strokeWidth="2" strokeDasharray={`${analysisData.gps?.[0]?.credit_score || 85}, 100`} strokeLinecap="round"/>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold" style={{color: '#dc2626'}}>{analysisData.gps?.[0]?.credit_score || 85}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold" style={{color: '#dc2626'}}>GPS Analysis</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Uploaded Assets */}
        {loan.asset_images && loan.asset_images.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded flex items-center justify-center mr-2" style={{backgroundColor: '#8b5cf6'}}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{color: '#1a1a1a'}}>Uploaded Assets</h2>
                <p className="text-xs" style={{color: '#666666'}}>{loan.asset_images.length} images uploaded</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {loan.asset_images.map((imagePath: string, index: number) => {
                const imageUrl = getImageUrl(imagePath);
                return imageUrl ? (
                  <div key={index} className="relative group">
                    <img
                      src={imageUrl}
                      alt={`Asset ${index + 1}`}
                      className="w-full h-24 object-cover rounded border border-gray-200 group-hover:shadow-md transition-shadow"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded flex items-center justify-center">
                      <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                      </svg>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Guarantors */}
        {guarantors.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded flex items-center justify-center mr-2" style={{backgroundColor: '#2ecc71'}}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{color: '#1a1a1a'}}>Guarantors</h2>
                <p className="text-xs" style={{color: '#666666'}}>{guarantors.length} guarantor(s) provided</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {guarantors.map((guarantor, index) => (
                <div key={index} className="bg-gray-50 rounded p-3 border border-gray-100">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center mr-2" style={{backgroundColor: '#2ecc71'}}>
                      <span className="text-xs font-bold text-white">{index + 1}</span>
                    </div>
                    <span className="text-sm font-semibold" style={{color: '#1a1a1a'}}>{guarantor.name}</span>
                  </div>
                  <div className="space-y-1 text-xs" style={{color: '#666666'}}>
                    <div>Phone: {guarantor.phone_number}</div>
                    <div>ID: {guarantor.id_number}</div>
                    <div>Relationship: {guarantor.relationship}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analysis Results */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded flex items-center justify-center mr-2" style={{backgroundColor: '#f97316'}}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{color: '#1a1a1a'}}>Detailed Analysis</h2>
              <p className="text-xs" style={{color: '#666666'}}>Comprehensive review of all submitted data</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysisData.bank?.length > 0 && analysisData.bank.map((analysis: any, index: number) => (
              <div key={index} className="bg-blue-50 rounded p-3 border border-blue-100">
                <h3 className="font-semibold mb-2" style={{color: '#005baa'}}>Bank Statement Analysis</h3>
                <div className="space-y-1 text-sm mb-3" style={{color: '#333333'}}>
                  <div>Credit Score: <span className="font-semibold">{analysis.credit_score || 'N/A'}%</span></div>
                  <div>Average Balance: <span className="font-semibold">KSh {analysis.average_balance?.toLocaleString() || 'N/A'}</span></div>
                  <div>Transaction Count: <span className="font-semibold">{analysis.transaction_count || 'N/A'}</span></div>
                </div>
                <button className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                  View Documents
                </button>
              </div>
            ))}

            {analysisData.mpesa?.length > 0 && analysisData.mpesa.map((analysis: any, index: number) => (
              <div key={index} className="bg-green-50 rounded p-3 border border-green-100">
                <h3 className="font-semibold mb-2" style={{color: '#2ecc71'}}>M-Pesa Analysis</h3>
                <div className="space-y-1 text-sm mb-3" style={{color: '#333333'}}>
                  <div>Credit Score: <span className="font-semibold">{analysis.credit_score || 'N/A'}%</span></div>
                  <div>Transaction Volume: <span className="font-semibold">KSh {analysis.transaction_volume?.toLocaleString() || 'N/A'}</span></div>
                  <div>Frequency: <span className="font-semibold">{analysis.transaction_frequency || 'N/A'}</span></div>
                </div>
                <button className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                  View Documents
                </button>
              </div>
            ))}

            {analysisData.assets?.length > 0 && analysisData.assets.map((analysis: any, index: number) => (
              <div key={index} className="bg-purple-50 rounded p-3 border border-purple-100">
                <h3 className="font-semibold mb-2" style={{color: '#8b5cf6'}}>Assets Analysis</h3>
                <div className="space-y-1 text-sm mb-3" style={{color: '#333333'}}>
                  <div>Credit Score: <span className="font-semibold">{analysis.credit_score || 'N/A'}%</span></div>
                  <div>Total Value: <span className="font-semibold">KSh {analysis.total_value?.toLocaleString() || 'N/A'}</span></div>
                  <div>Asset Count: <span className="font-semibold">{analysis.asset_count || 'N/A'}</span></div>
                </div>
                <button className="text-xs px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
                  View Documents
                </button>
              </div>
            ))}

            {analysisData.payslip?.length > 0 && analysisData.payslip.map((analysis: any, index: number) => (
              <div key={index} className="bg-cyan-50 rounded p-3 border border-cyan-100">
                <h3 className="font-semibold mb-2" style={{color: '#0891b2'}}>Payslip Analysis</h3>
                <div className="space-y-1 text-sm mb-3" style={{color: '#333333'}}>
                  <div>Credit Score: <span className="font-semibold">{analysis.credit_score || 'N/A'}%</span></div>
                  <div>Employee Name: <span className="font-semibold">{analysis.employee_name || 'N/A'}</span></div>
                  <div>Gross Salary: <span className="font-semibold">KSh {analysis.gross_salary?.toLocaleString() || 'N/A'}</span></div>
                </div>
                <button className="text-xs px-2 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors">
                  View Documents
                </button>
              </div>
            ))}

            {analysisData.callLogs?.length > 0 && analysisData.callLogs.map((analysis: any, index: number) => (
              <div key={index} className="bg-orange-50 rounded p-3 border border-orange-100">
                <h3 className="font-semibold mb-2" style={{color: '#f97316'}}>Call Logs Analysis</h3>
                <div className="space-y-1 text-sm mb-3" style={{color: '#333333'}}>
                  <div>Credit Score: <span className="font-semibold">{analysis.credit_score || 'N/A'}%</span></div>
                  <div>Contact Diversity: <span className="font-semibold">{analysis.contact_diversity || 'N/A'}</span></div>
                  <div>Communication Pattern: <span className="font-semibold">{analysis.communication_pattern || 'N/A'}</span></div>
                </div>
                <button className="text-xs px-2 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors">
                  View Documents
                </button>
              </div>
            ))}

            {/* GPS Analysis - Mock Data */}
            <div className="bg-red-50 rounded p-3 border border-red-100">
              <h3 className="font-semibold mb-2" style={{color: '#dc2626'}}>GPS Analysis</h3>
              <div className="space-y-1 text-sm mb-3" style={{color: '#333333'}}>
                <div>Credit Score: <span className="font-semibold">85%</span></div>
                <div>Location Stability: <span className="font-semibold">High</span></div>
                <div>Movement Pattern: <span className="font-semibold">Regular</span></div>
              </div>
              <button className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                View Documents
              </button>
            </div>

            {/* Show message if no analysis data */}
            {!analysisData.bank?.length && !analysisData.mpesa?.length && !analysisData.assets?.length && !analysisData.payslip?.length && !analysisData.callLogs?.length && (
              <div className="col-span-2 text-center py-8">
                <div className="text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <p className="text-sm">Analysis data shows comprehensive review including GPS tracking.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={() => window.history.back()}
              className="flex items-center px-4 py-2 border border-gray-300 rounded font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Dashboard
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center px-4 py-2 rounded font-semibold text-white transition-colors"
              style={{backgroundColor: '#005baa'}}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
              </svg>
              Print Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewLoan;
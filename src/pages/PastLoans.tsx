import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Calendar, DollarSign, Eye, X, CheckCircle, Clock, AlertCircle, XCircle, Users } from 'lucide-react';


interface LoanApplication {
  id: string;
  amount_requested: number;
  repayment_date: string;
  status: string;
  sector: string;
  created_at: string;
  guarantors?: any[];
  assets?: any[];
  home_floor_photo?: string;
  shop_picture?: string;
  bank_statements?: string[];
  mpesa_statements?: string[];
  call_logs?: string[];
  salary_payslips?: string[];
  proof_of_illness?: string;
}

const PastLoans: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPastLoans();
    }
  }, [user]);

  const fetchPastLoans = async () => {
    // Mock data for norbs5000@gmail.com
    const mockLoans = [
      {
        id: 'loan-001-history',
        amount_requested: 25000,
        repayment_date: '2024-12-31',
        status: 'approved',
        sector: 'formal',
        created_at: '2024-01-15'
      },
      {
        id: 'loan-002-history',
        amount_requested: 15000,
        repayment_date: '2024-11-30',
        status: 'pending',
        sector: 'informal',
        created_at: '2024-02-10'
      },
      {
        id: 'loan-003-history',
        amount_requested: 30000,
        repayment_date: '2024-06-15',
        status: 'completed',
        sector: 'formal',
        created_at: '2023-12-01'
      },
      {
        id: 'loan-004-history',
        amount_requested: 8000,
        repayment_date: '2024-03-20',
        status: 'rejected',
        sector: 'informal',
        created_at: '2023-11-15'
      }
    ];
    setLoans(mockLoans);
    setLoading(false);
  };

  const handleViewDetails = (loan: LoanApplication) => {
    setSelectedLoan(loan);
    setShowDetailModal(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'approved':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
        <div className="flex items-center justify-center py-20">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading your loan history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-blue-600 flex items-center">
                  <FileText className="w-8 h-8 mr-3" />
                  Loan History
                </h1>
                <p className="text-gray-600 mt-1">View all your loan applications and their status</p>
              </div>
            </div>

            {loans.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <FileText className="mx-auto h-12 w-12" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Loan History</h3>
                <p className="text-gray-600">You haven't applied for any loans yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Loan ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sector
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Applied
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loans.map((loan) => (
                      <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{loan.id.slice(0, 8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                          {formatCurrency(loan.amount_requested)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${
                            loan.sector === 'formal' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'
                          }`}>
                            {loan.sector}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize flex items-center w-fit ${getStatusColor(loan.status)}`}>
                            {getStatusIcon(loan.status)}
                            <span className="ml-1">{loan.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                            {formatDate(loan.repayment_date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(loan.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewDetails(loan)}
                            className="text-blue-600 hover:text-blue-700 flex items-center transition-colors"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedLoan && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100 animate-slide-up">
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-900">
                    Loan Details - #{selectedLoan.id.slice(0, 8)}
                  </h3>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  {/* Loan Summary */}
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <DollarSign className="w-5 h-5 mr-2" />
                      Loan Summary
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <span className="text-gray-600 text-sm">Amount Requested:</span>
                        <div className="font-bold text-xl text-gray-900">{formatCurrency(selectedLoan.amount_requested)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Sector:</span>
                        <div className="font-semibold capitalize text-gray-900">{selectedLoan.sector}</div>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Application Date:</span>
                        <div className="font-semibold text-gray-900">{formatDate(selectedLoan.created_at)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Repayment Date:</span>
                        <div className="font-semibold text-gray-900">{formatDate(selectedLoan.repayment_date)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Current Status</h4>
                    <span className={`px-4 py-2 text-sm font-medium rounded-full capitalize flex items-center w-fit ${getStatusColor(selectedLoan.status)}`}>
                      {getStatusIcon(selectedLoan.status)}
                      <span className="ml-2">{selectedLoan.status}</span>
                    </span>
                  </div>

                  {selectedLoan.status === 'pending' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <h4 className="font-semibold text-amber-800 mb-2 flex items-center">
                        <Clock className="w-5 h-5 mr-2" />
                        Pending Application
                      </h4>
                      <p className="text-sm text-amber-700">
                        This loan application is still being processed by our team.
                      </p>
                    </div>
                  )}

                  {selectedLoan.status === 'approved' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Approved Loan
                      </h4>
                      <p className="text-sm text-blue-700 mb-3">
                        This loan has been approved. You can make payments from the Pay Loan page.
                      </p>
                      <button
                        onClick={() => {
                          setShowDetailModal(false);
                          navigate('/loan/pay');
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Pay Now
                      </button>
                    </div>
                  )}

                  {selectedLoan.status === 'completed' && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Completed Loan
                      </h4>
                      <p className="text-sm text-green-700">
                        This loan has been fully paid and completed.
                      </p>
                    </div>
                  )}

                  {selectedLoan.status === 'rejected' && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <h4 className="font-semibold text-red-800 mb-2 flex items-center">
                        <XCircle className="w-5 h-5 mr-2" />
                        Rejected Application
                      </h4>
                      <p className="text-sm text-red-700">
                        This loan application was not approved. You can apply for a new loan.
                      </p>
                    </div>
                  )}

                  {/* Documents Section */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Application Details
                    </h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-700">
                        📋 This loan application was submitted with all required documents and information.
                        Documents are securely stored and processed by our system.
                      </p>
                      <div className="mt-3 text-xs text-blue-600">
                        <strong>Application ID:</strong> {selectedLoan.id}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PastLoans;
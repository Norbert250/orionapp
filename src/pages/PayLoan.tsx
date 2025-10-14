import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { DollarSign, Calendar, ArrowLeft, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';


interface LoanApplication {
  id: string;
  amount_requested: number;
  repayment_date: string;
  status: string;
  sector: string;
  created_at: string;
}

const PayLoan: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchActiveLoans();
    }
  }, [user]);

  const fetchActiveLoans = async () => {
    try {
      const { data, error } = await supabase
        .from('loan_applications')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLoans(data || []);
    } catch (error) {
      console.error('Error fetching active loans:', error);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = (loan: LoanApplication) => {
    setSelectedLoan(loan);
    setPaymentAmount(loan.amount_requested.toString());
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    if (!selectedLoan || !paymentAmount) return;

    setIsProcessing(true);
    
    try {
      const { error } = await supabase
        .from('loan_applications')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedLoan.id);

      if (error) throw error;

      alert(`Payment of KSh ${Number(paymentAmount).toLocaleString()} processed successfully!`);
      setShowPaymentModal(false);
      fetchActiveLoans();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
      setSelectedLoan(null);
      setPaymentAmount('');
    }
  };

  const formatCurrency = (amount: number) => {
    return `KSh ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
        <div className="flex items-center justify-center py-20">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading your loans...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 sm:mb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
              <div className="text-center sm:text-left">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto sm:mx-0 mb-4 shadow-lg">
                  <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
                  Pay Your <span className="text-green-600">Loans</span>
                </h1>
                <p className="text-gray-600 text-lg">Manage your loan payments securely and easily</p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="bg-white text-gray-700 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center border border-gray-200 min-h-[44px]"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </button>
            </div>
          </div>

          {loans.length === 0 ? (
            <div className="text-center py-16 sm:py-20 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">No Active Loans</h3>
              <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed">You don't have any approved loans to pay at the moment.</p>
              <button
                onClick={() => navigate('/')}
                className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg"
              >
                Apply for a Loan
              </button>
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              {loans.map((loan) => (
                <div
                  key={loan.id}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-6 lg:gap-8">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg">
                          <DollarSign className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                            Loan #{loan.id.slice(0, 8)}
                          </h3>
                          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                            loan.sector === 'formal' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'
                          }`}>
                            {loan.sector.charAt(0).toUpperCase() + loan.sector.slice(1)} Sector
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 sm:p-5 border border-green-100">
                          <div className="text-sm font-semibold text-green-700 mb-2">Loan Amount</div>
                          <div className="text-2xl sm:text-3xl font-bold text-green-900">{formatCurrency(loan.amount_requested)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 sm:p-5 border border-amber-100">
                          <div className="text-sm font-semibold text-amber-700 mb-2 flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Due Date
                          </div>
                          <div className="text-lg sm:text-xl font-bold text-amber-900">{formatDate(loan.repayment_date)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 sm:p-5 border border-gray-100">
                          <div className="text-sm font-semibold text-gray-700 mb-2">Applied</div>
                          <div className="text-lg sm:text-xl font-bold text-gray-900">{formatDate(loan.created_at)}</div>
                        </div>
                      </div>
                  </div>

                    <div className="flex flex-col sm:flex-row gap-3 lg:flex-col lg:gap-4">
                      <button
                        onClick={() => handlePayNow(loan)}
                        className="px-8 py-4 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 min-h-[44px]"
                      >
                        <CreditCard className="w-5 h-5 mr-2" />
                        Pay Now
                      </button>
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}

          {/* Payment Modal */}
          {showPaymentModal && selectedLoan && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 animate-slide-up">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
                    <CreditCard className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Payment</h3>
                  <p className="text-gray-600">Loan #{selectedLoan.id.slice(0, 8)}</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Amount
                    </label>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                      placeholder="Enter amount"
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      setSelectedLoan(null);
                      setPaymentAmount('');
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    disabled={isProcessing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={processPayment}
                    disabled={isProcessing || !paymentAmount}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Pay Now
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayLoan;
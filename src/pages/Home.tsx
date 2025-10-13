
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  DollarSign,
  ArrowRight,
  Activity,
  Users,
  Stethoscope,
  Menu,
  X,
  Shield,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';


const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [showSectorModal, setShowSectorModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Authentication disabled - no admin redirect needed

  const handleSectorSelect = (sector: 'formal' | 'informal') => {
    setShowSectorModal(false);
    navigate(`/loan/request/${sector}`);
  };

  const stats = [
    { number: "15K+", label: "Patients Helped" },
    { number: "$75M+", label: "Medical Loans" },
    { number: "2 min", label: "Average Approval" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {user && <Navbar />}
      {!user && (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-blue-600">Orion Africa</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/login')}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setShowSectorModal(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Apply Now
                </button>
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>
          {showMobileMenu && (
            <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
              <div className="px-4 py-4 space-y-3">
                <button
                  onClick={() => {
                    navigate('/login');
                    setShowMobileMenu(false);
                  }}
                  className="block w-full text-left text-gray-700 hover:text-blue-600 font-medium transition-colors py-2"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setShowSectorModal(true);
                    setShowMobileMenu(false);
                  }}
                  className="block w-full text-left bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Apply for Loan
                </button>
              </div>
            </div>
          )}
        </header>
      )}

      {/* Hero Section */}
      <section className="py-12 sm:py-20 lg:py-32 animate-fade-in">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {user ? (
            /* Authenticated User Dashboard */
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 lg:mb-8 shadow-lg">
                <Heart className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6">
                Welcome back, <span className="text-blue-600">{user.email?.split('@')[0]}</span>
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto px-2">
                Ready to apply for a loan or manage your existing applications?
              </p>
            </div>
          ) : (
            /* Public Hero */
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 lg:mb-8 shadow-lg">
                <Heart className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 lg:mb-8">
                Quick Loans for
                <span className="block text-blue-600">Every Need</span>
              </h1>
              <p className="text-base sm:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-2">
                Get the financial support you need with our fast, secure loan application process.
                Tailored for both formal and informal sector workers.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mb-8 sm:mb-12 lg:mb-20 px-4">
            {user ? (
              <>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 justify-center mb-3 lg:mb-6 max-w-4xl mx-auto">
                  <button
                    onClick={() => setShowSectorModal(true)}
                    className="bg-blue-600 text-white px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-5 rounded-xl font-semibold text-base sm:text-lg lg:text-xl hover:bg-blue-700 transition-colors shadow-lg flex items-center justify-center min-h-[44px] w-full sm:w-auto sm:flex-1 lg:flex-none"
                  >
                    Apply for New Loan
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ml-2" />
                  </button>
                  <button
                    onClick={() => navigate('/loan/pay')}
                    className="border-2 border-blue-600 text-blue-600 px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-5 rounded-xl font-semibold text-base sm:text-lg lg:text-xl hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center min-h-[44px] w-full sm:w-auto sm:flex-1 lg:flex-none"
                  >
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2" />
                    Pay Loan
                  </button>
                  <button
                    onClick={() => navigate('/assess-medical-needs')}
                    className="bg-white text-gray-700 border border-gray-300 px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-5 rounded-xl font-semibold text-base sm:text-lg lg:text-xl hover:bg-gray-50 transition-colors flex items-center justify-center min-h-[44px] w-full sm:w-auto sm:flex-1 lg:flex-none"
                  >
                    <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2" />
                    Assess Medical Needs
                  </button>
                </div>
              </>
            ) : (
              <div className="flex justify-center max-w-md mx-auto">
                <button
                  onClick={() => setShowSectorModal(true)}
                  className="bg-blue-600 text-white px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-5 rounded-xl font-semibold text-base sm:text-lg lg:text-xl hover:bg-blue-700 transition-colors shadow-lg flex items-center justify-center min-h-[44px] w-full"
                >
                  Apply for Loan
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ml-2" />
                </button>
              </div>
            )}
          </div>

          {!user && (
            <div className="flex justify-center mb-12">
              <button
                onClick={() => navigate('/assess-medical-needs')}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-all duration-300 border border-blue-200 flex items-center shadow-sm"
              >
                <Stethoscope className="w-4 h-4 mr-2" />
                Assess Medical Needs
              </button>
            </div>
          )}

          {/* Stats & Features */}
          <div className="max-w-4xl mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <div className="text-center p-4 sm:p-6 bg-white/60 backdrop-blur-sm rounded-lg sm:rounded-xl border border-gray-100 shadow-soft card-hover">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-teal-600 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-4">
                  <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-lg sm:text-2xl font-bold gradient-text mb-1 sm:mb-2">15K+</div>
                <div className="text-gray-600 text-sm sm:text-base leading-tight">Applications Processed</div>
              </div>
              <div className="text-center p-4 sm:p-6 bg-white/60 backdrop-blur-sm rounded-lg sm:rounded-xl border border-gray-100 shadow-soft card-hover">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-4">
                  <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-lg sm:text-2xl font-bold text-green-600 mb-1 sm:mb-2">$75M+</div>
                <div className="text-gray-600 text-sm sm:text-base leading-tight">Loans Disbursed</div>
              </div>
              <div className="text-center p-4 sm:p-6 bg-white/60 backdrop-blur-sm rounded-lg sm:rounded-xl border border-gray-100 shadow-soft card-hover sm:col-span-2 lg:col-span-1">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-4">
                  <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-lg sm:text-2xl font-bold text-purple-600 mb-1 sm:mb-2">2 min</div>
                <div className="text-gray-600 text-sm sm:text-base leading-tight">Average Approval</div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Features Section */}
      {!user && (
        <section className="py-12 sm:py-16 lg:py-20 bg-white/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Why Choose Our Loan Platform?</h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">We make borrowing simple, fast, and accessible for everyone</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center p-6 sm:p-8 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-soft card-hover">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Secure & Safe</h3>
                <p className="text-gray-600 text-sm sm:text-base">Your data is protected with bank-level security and encryption</p>
              </div>

              <div className="text-center p-6 sm:p-8 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-soft card-hover">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Quick Approval</h3>
                <p className="text-gray-600 text-sm sm:text-base">Get approved in minutes, not days. Fast processing for urgent needs</p>
              </div>

              <div className="text-center p-6 sm:p-8 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-soft card-hover sm:col-span-2 lg:col-span-1">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">For Everyone</h3>
                <p className="text-gray-600 text-sm sm:text-base">Tailored solutions for both formal and informal sector workers</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="col-span-1 sm:col-span-2 lg:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold">Orion Africa</h3>
                  <p className="text-gray-400 text-sm sm:text-base">Financial Solutions for Everyone</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4 max-w-md text-sm sm:text-base">
                Empowering Africa with innovative financial solutions through fast, secure, and reliable loan processing.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm sm:text-base">Contact</h4>
              <div className="space-y-2 text-gray-400 text-sm sm:text-base">
                <p>support@orionafrica.com</p>
                <p>+254 (700) 123-456</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 sm:pt-8 text-center">
            <p className="text-gray-400 text-sm sm:text-base">&copy; 2024 Orion Africa. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Employment Type Modal */}
      {showSectorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6 lg:p-8 transform animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-4 sm:mb-6 lg:mb-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-blue-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-glow">
                <Activity className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2">Choose Your Employment Type</h3>
              <p className="text-gray-600 text-sm sm:text-base">This helps us customize your application process</p>
            </div>

            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 lg:mb-8">
              <button
                onClick={() => handleSectorSelect('formal')}
                className="w-full p-3 sm:p-4 lg:p-6 text-left border-2 border-blue-100 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 group card-hover min-h-[70px] sm:min-h-[80px] lg:min-h-[100px]"
              >
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg flex-shrink-0">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Employed/Salaried</div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      Regular job with salary, bank statements, and payslips available
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleSectorSelect('informal')}
                className="w-full p-3 sm:p-4 lg:p-6 text-left border-2 border-teal-100 rounded-xl hover:border-teal-400 hover:bg-teal-50 transition-all duration-300 group card-hover min-h-[70px] sm:min-h-[80px] lg:min-h-[100px]"
              >
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg flex-shrink-0">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Self-Employed/Freelance</div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      Own business, freelance work, or irregular income
                    </div>
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowSectorModal(false)}
              className="w-full py-2 sm:py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors min-h-[40px] sm:min-h-[44px] text-sm sm:text-base"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
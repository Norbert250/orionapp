
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
      <section className="py-12 sm:py-20 animate-fade-in">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {user ? (
            /* Authenticated User Dashboard */
            <div className="text-center mb-8 sm:mb-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
                Welcome back, <span className="text-blue-600">{user.email?.split('@')[0]}</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-2">
                Ready to apply for a loan or manage your existing applications?
              </p>
            </div>
          ) : (
            /* Public Hero */
            <div className="text-center mb-8 sm:mb-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
                Quick Loans for
                <span className="block text-blue-600">Every Need</span>
              </h1>
              <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
                Get the financial support you need with our fast, secure loan application process.
                Tailored for both formal and informal sector workers.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4">
            <button
              onClick={() => setShowSectorModal(true)}
              className="bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-blue-700 transition-colors shadow-lg flex items-center justify-center min-h-[44px]"
            >
              {user ? 'Apply for New Loan' : 'Apply for Loan'}
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </button>

            {user && (
              <>
                <button
                  onClick={() => navigate('/loan/pay')}
                  className="border-2 border-blue-600 text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center min-h-[44px]"
                >
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Pay Existing Loan
                </button>

                <button
                  onClick={() => navigate('/assess-medical-needs')}
                  className="bg-white text-gray-700 border border-gray-300 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-gray-50 transition-colors flex items-center justify-center min-h-[44px]"
                >
                  <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Assess Medical Needs
                </button>
              </>
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
          <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6 max-w-2xl sm:max-w-4xl mx-auto px-4">
            <div className="text-center p-2 sm:p-4 bg-white/60 backdrop-blur-sm rounded-lg sm:rounded-xl border border-gray-100 shadow-soft card-hover">
              <div className="w-6 h-6 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-teal-600 rounded-md sm:rounded-lg flex items-center justify-center mx-auto mb-1 sm:mb-3">
                <CheckCircle className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="text-sm sm:text-xl font-bold gradient-text mb-0.5 sm:mb-1">15K+</div>
              <div className="text-gray-600 text-xs sm:text-sm leading-tight">Applications</div>
            </div>
            <div className="text-center p-2 sm:p-4 bg-white/60 backdrop-blur-sm rounded-lg sm:rounded-xl border border-gray-100 shadow-soft card-hover">
              <div className="w-6 h-6 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-md sm:rounded-lg flex items-center justify-center mx-auto mb-1 sm:mb-3">
                <DollarSign className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="text-sm sm:text-xl font-bold text-green-600 mb-0.5 sm:mb-1">$75M+</div>
              <div className="text-gray-600 text-xs sm:text-sm leading-tight">Disbursed</div>
            </div>
            <div className="text-center p-2 sm:p-4 bg-white/60 backdrop-blur-sm rounded-lg sm:rounded-xl border border-gray-100 shadow-soft card-hover">
              <div className="w-6 h-6 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-md sm:rounded-lg flex items-center justify-center mx-auto mb-1 sm:mb-3">
                <Clock className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="text-sm sm:text-xl font-bold text-purple-600 mb-0.5 sm:mb-1">2 min</div>
              <div className="text-gray-600 text-xs sm:text-sm leading-tight">Approval</div>
            </div>
          </div>
        </div>
      </section>


      {/* Features Section */}
      {!user && (
        <section className="py-16 bg-white/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Loan Platform?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">We make borrowing simple, fast, and accessible for everyone</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Safe</h3>
                <p className="text-gray-600">Your data is protected with bank-level security and encryption</p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Quick Approval</h3>
                <p className="text-gray-600">Get approved in minutes, not days. Fast processing for urgent needs</p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">For Everyone</h3>
                <p className="text-gray-600">Tailored solutions for both formal and informal sector workers</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Orion Africa</h3>
                  <p className="text-gray-400">Financial Solutions for Everyone</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
Empowering Africa with innovative financial solutions through fast, secure, and reliable loan processing.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400">
                <p>support@orionafrica.com</p>
                <p>+254 (700) 123-456</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">&copy; 2024 Orion Africa. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Employment Type Modal */}
      {showSectorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 sm:p-8 transform animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-glow">
                <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Choose Your Employment Type</h3>
              <p className="text-gray-600 text-sm sm:text-base">This helps us customize your application process</p>
            </div>

            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              <button
                onClick={() => handleSectorSelect('formal')}
                className="w-full p-4 sm:p-6 text-left border-2 border-blue-100 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 group card-hover min-h-[80px] sm:min-h-[100px]"
              >
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg flex-shrink-0">
                    <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
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
                className="w-full p-4 sm:p-6 text-left border-2 border-teal-100 rounded-xl hover:border-teal-400 hover:bg-teal-50 transition-all duration-300 group card-hover min-h-[80px] sm:min-h-[100px]"
              >
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg flex-shrink-0">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
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
              className="w-full py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors min-h-[44px] text-sm sm:text-base"
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
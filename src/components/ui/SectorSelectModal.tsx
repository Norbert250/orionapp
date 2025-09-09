import React from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';

interface SectorSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SectorSelectModal: React.FC<SectorSelectModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleSectorSelect = (sector: 'formal' | 'informal') => {
    onClose();
    navigate(`/loan/request/${sector}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Your Employment Type" size="lg">
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V8a2 2 0 01-2 2H8a2 2 0 01-2-2V6m8 0H8m0 0V4"></path>
            </svg>
          </div>
          <p className="text-gray-600 text-lg">
            Choose your employment type to customize your loan application
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleSectorSelect('formal')}
            className="group w-full p-6 text-left bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl hover:border-blue-300 hover:shadow-lg hover:from-blue-100 hover:to-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-900 text-lg mb-1">Formal Sector</div>
                <div className="text-gray-600">
                  Regular employment with salary, bank statements, and payslips available
                </div>
                <div className="mt-2 flex items-center text-blue-600 font-medium">
                  <span className="text-sm">Faster approval process</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleSectorSelect('informal')}
            className="group w-full p-6 text-left bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-2xl hover:border-green-300 hover:shadow-lg hover:from-green-100 hover:to-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M8 11h8l.64 5.12a2 2 0 01-1.96 2.38H9.32a2 2 0 01-1.96-2.38L8 11z"></path>
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-900 text-lg mb-1">Informal Sector</div>
                <div className="text-gray-600">
                  Self-employed, freelance, or business owner with flexible income
                </div>
                <div className="mt-2 flex items-center text-green-600 font-medium">
                  <span className="text-sm">Alternative verification methods</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </div>
            </div>
          </button>
        </div>

        <div className="text-center text-sm text-gray-500 mt-6">
          Don't worry, you can change this later if needed
        </div>
      </div>
    </Modal>
  );
};

export default SectorSelectModal;
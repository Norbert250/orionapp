import React from "react";

interface ProgressStepsProps {
  currentStep: number;
  steps: string[];
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({ currentStep, steps }) => {
  return (
    <div className="w-full">
      {/* 📱 Mobile: horizontal progress tracker */}
      <div className="sm:hidden relative flex items-center justify-between w-full px-4 py-6">
        {/* Progress line (background) */}
        <div className="absolute top-1/2 left-4 right-4 h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
        {/* Progress line (filled) */}
        <div
          className="absolute top-1/2 left-4 h-2 bg-gradient-to-r from-blue-500 to-teal-600 rounded-full shadow-lg transition-all duration-700 ease-out"
          style={{ width: `calc(8px + ${(currentStep / (steps.length - 1)) * (100 - 16)}%)` }}
        ></div>

        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div key={step} className="flex flex-col items-center flex-1 relative">
              {/* Circle marker */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 shadow-lg transform transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-teal-600 text-white scale-110 animate-pulse"
                    : isCompleted
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white scale-105"
                    : "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600"
                }`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              {/* Step label */}
              <span
                className={`mt-2 text-xs text-center font-semibold truncate w-full transition-colors duration-300 ${
                  isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-500"
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>

      {/* 💻 Desktop: stepper with circles & lines */}
      <div className="hidden sm:flex items-center justify-center mb-12 px-8">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`flex items-center justify-center w-14 h-14 rounded-full border-3 font-bold text-lg shadow-lg transform transition-all duration-500 ${
                    isActive
                      ? "border-blue-500 bg-gradient-to-r from-blue-500 to-teal-600 text-white scale-110 animate-pulse"
                      : isCompleted
                      ? "border-green-500 bg-gradient-to-r from-green-500 to-green-600 text-white scale-105"
                      : "border-gray-300 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-500"
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>

                <span
                  className={`mt-3 text-sm font-semibold text-center transition-colors duration-300 ${
                    isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {step}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div className="flex-1 mx-6 relative">
                  <div className="h-1 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
                  <div
                    className={`h-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-700 ease-out ${
                      isCompleted ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ width: isCompleted ? '100%' : '0%' }}
                  ></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressSteps;

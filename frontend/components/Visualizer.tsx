import React from 'react';

interface VisualizerProps {
  isActive: boolean;
}

export const Visualizer: React.FC<VisualizerProps> = ({ isActive }) => {
  return (
    <div className="relative flex items-center justify-center w-48 h-48 my-8">
      {isActive && (
        <>
          <div className="absolute inset-0 rounded-full bg-blue-500 opacity-20 animate-ping"></div>
          <div className="absolute inset-4 rounded-full bg-blue-400 opacity-30 animate-pulse"></div>
        </>
      )}
      <div className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-colors duration-500 ${isActive ? 'bg-blue-600 shadow-[0_0_40px_rgba(37,99,235,0.6)]' : 'bg-gray-800 border-4 border-gray-700'}`}>
        <svg className={`w-12 h-12 transition-colors duration-500 ${isActive ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      </div>
    </div>
  );
};
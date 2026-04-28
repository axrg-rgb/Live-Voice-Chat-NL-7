import React from 'react';
import { useLiveSession } from './hooks/useLiveSession';
import { Visualizer } from './components/Visualizer';
import { TranscriptList } from './components/TranscriptList';

const App: React.FC = () => {
  const { isConnected, isConnecting, error, transcripts, connect, disconnect } = useLiveSession();

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center font-sans">
      <header className="w-full p-6 text-center border-b border-gray-800 bg-gray-900/80 backdrop-blur-md sticky top-0 z-50">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          Nederlandse Spraakassistent
        </h1>
        <p className="text-sm text-gray-400 mt-2 font-medium">Aangedreven door Gemini Live API</p>
      </header>

      <main className="flex-1 w-full flex flex-col items-center p-4 max-w-4xl mx-auto overflow-hidden">
        <Visualizer isActive={isConnected} />

        <div className="mb-8 flex flex-col items-center w-full">
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 text-red-200 rounded-xl text-sm text-center max-w-md shadow-lg">
              {error}
            </div>
          )}
          
          <button
            onClick={isConnected ? disconnect : connect}
            disabled={isConnecting}
            className={`px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-lg flex items-center space-x-3 ${
              isConnected
                ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50 shadow-red-500/10'
                : isConnecting
                ? 'bg-gray-800 text-gray-400 cursor-not-allowed border border-gray-700'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 hover:shadow-blue-500/40 hover:-translate-y-0.5'
            }`}
          >
            {isConnecting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Verbinden...</span>
              </>
            ) : isConnected ? (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
                <span>Stop Sessie</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                <span>Start Gesprek</span>
              </>
            )}
          </button>
        </div>

        <div className="w-full max-w-2xl border-t border-gray-800 pt-4 flex-1 flex flex-col min-h-[300px]">
           <TranscriptList transcripts={transcripts} />
        </div>
      </main>
    </div>
  );
};

export default App;
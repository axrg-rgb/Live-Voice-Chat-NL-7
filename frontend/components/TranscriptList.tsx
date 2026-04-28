import React, { useEffect, useRef } from 'react';
import { TranscriptEntry } from '../hooks/useLiveSession';

interface TranscriptListProps {
  transcripts: TranscriptEntry[];
}

export const TranscriptList: React.FC<TranscriptListProps> = ({ transcripts }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  if (transcripts.length === 0) {
    return (
      <div className="flex-1 w-full max-w-2xl flex items-center justify-center text-gray-500 italic">
        Start de sessie om te praten...
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-2xl overflow-y-auto p-4 space-y-6">
      {transcripts.map((t) => (
        <div key={t.id} className="flex flex-col space-y-3">
          {t.user && (
            <div className="self-end bg-blue-600 text-white px-5 py-3 rounded-2xl rounded-tr-sm max-w-[85%] shadow-md">
              <p className="text-sm font-medium opacity-75 mb-1">Jij</p>
              <p>{t.user}</p>
            </div>
          )}
          {t.model && (
            <div className="self-start bg-gray-800 border border-gray-700 text-gray-100 px-5 py-3 rounded-2xl rounded-tl-sm max-w-[85%] shadow-md">
              <p className="text-sm font-medium text-blue-400 mb-1">Assistent</p>
              <p>{t.model}</p>
            </div>
          )}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
};
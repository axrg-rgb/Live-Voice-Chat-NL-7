import { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { createBlob, decode, decodeAudioData } from '../utils/audio';

const LIVE_API_MODEL_NAME = 'gemini-live-2.5-flash-native-audio';

export interface TranscriptEntry {
  id: number;
  user: string;
  model: string;
}

export function useLiveSession() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);

  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  const currentInputTranscription = useRef('');
  const currentOutputTranscription = useRef('');
  const transcriptIdCounter = useRef(0);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      // Initialize the client strictly using the environment variable as mandated.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      inputAudioContextRef.current = inputAudioContext;
      outputAudioContextRef.current = outputAudioContext;

      const outputNode = outputAudioContext.createGain();
      outputNode.connect(outputAudioContext.destination);

      const sessionPromise = ai.live.connect({
        model: LIVE_API_MODEL_NAME,
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              // Solely rely on sessionPromise resolves to send data
              sessionPromise.then((session: any) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: any) => {
             // Handle Transcriptions
             if (message.serverContent?.outputTranscription) {
                currentOutputTranscription.current += message.serverContent.outputTranscription.text;
             } else if (message.serverContent?.inputTranscription) {
                currentInputTranscription.current += message.serverContent.inputTranscription.text;
             }

             if (message.serverContent?.turnComplete) {
                const fullInput = currentInputTranscription.current;
                const fullOutput = currentOutputTranscription.current;
                
                if (fullInput.trim() || fullOutput.trim()) {
                    setTranscripts(prev => [...prev, {
                        id: transcriptIdCounter.current++,
                        user: fullInput,
                        model: fullOutput
                    }]);
                }
                
                currentInputTranscription.current = '';
                currentOutputTranscription.current = '';
             }

             // Handle Audio Output (safely accessing parts array)
             const base64EncodedAudioString = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
             if (base64EncodedAudioString) {
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
                const audioBuffer = await decodeAudioData(
                    decode(base64EncodedAudioString),
                    outputAudioContext,
                    24000,
                    1
                );
                const source = outputAudioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputNode);
                source.addEventListener('ended', () => {
                    sourcesRef.current.delete(source);
                });
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
             }

             // Handle Interruption
             const interrupted = message.serverContent?.interrupted;
             if (interrupted) {
                for (const source of sourcesRef.current.values()) {
                    source.stop();
                }
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
             }
          },
          onerror: (e: any) => {
             console.error('Live API Error:', e);
             setError('Er is een fout opgetreden tijdens de sessie.');
             disconnect();
          },
          onclose: (e: any) => {
             console.log('Live API Closed:', e);
             disconnect();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            // 'Kore' is a female voice
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          },
          systemInstruction: 'Je bent een vriendelijke en behulpzame assistent. Je spreekt uitsluitend in natuurlijk, vloeiend Nederlands. Houd je antwoorden beknopt en conversationeel.',
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        }
      });

      sessionRef.current = sessionPromise;

    } catch (err: any) {
      console.error('Failed to connect:', err);
      setError(err.message || 'Kan geen verbinding maken met de sessie.');
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.then((session: any) => {
        if (session && typeof session.close === 'function') {
            session.close();
        }
      }).catch(console.error);
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    for (const source of sourcesRef.current.values()) {
      source.stop();
    }
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  return {
    isConnected,
    isConnecting,
    error,
    transcripts,
    connect,
    disconnect
  };
}
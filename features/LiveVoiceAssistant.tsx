
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { X, Mic, MicOff, Volume2, Bot, ChevronDown } from 'lucide-react';
import { encode, decode, decodeAudioData } from '../services/geminiService';

interface Props {
  onClose: () => void;
}

const LiveVoiceAssistant: React.FC<Props> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [status, setStatus] = useState('Connecting...');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  useEffect(() => {
    startSession();
    return () => stopSession();
  }, []);

  const startSession = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: 'You are a helpful hands-free assistant for professional drivers. Keep responses short, helpful, and audible.',
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setStatus('Listening...');
            
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              if (isMuted) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => (prev + ' ' + message.serverContent?.outputTranscription?.text).trim());
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputContextRef.current) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputContextRef.current.currentTime);
              const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                outputContextRef.current,
                24000,
                1
              );
              const source = outputContextRef.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputContextRef.current.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error("Live Error", e);
            setStatus('Connection Error');
          },
          onclose: () => {
            setStatus('Disconnected');
            setIsActive(false);
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus('Access Denied');
    }
  };

  const stopSession = () => {
    sessionRef.current?.close();
    audioContextRef.current?.close();
    outputContextRef.current?.close();
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col text-white animate-in slide-in-from-bottom duration-500">
      <div className="p-6 flex justify-between items-center">
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ChevronDown size={32} />
        </button>
        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-xs font-black uppercase tracking-widest">{status}</span>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12">
        {/* Animated Visualizer Circle */}
        <div className="relative">
          <div className={`w-48 h-48 rounded-full bg-blue-600/20 border-4 border-blue-500/30 flex items-center justify-center transition-all duration-700 ${isActive ? 'scale-110 shadow-[0_0_80px_rgba(59,130,246,0.5)]' : 'scale-100'}`}>
            <div className={`w-32 h-32 rounded-full bg-blue-500 flex items-center justify-center shadow-xl ${isActive ? 'animate-pulse' : ''}`}>
              <Bot size={64} className="text-white" />
            </div>
            {/* Waveform Mockup */}
            {isActive && !isMuted && (
              <div className="absolute inset-0 flex items-center justify-center gap-1">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-1 bg-white/40 rounded-full animate-waveform" style={{ height: '40%', animationDelay: `${i * 0.1}s` }}></div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="text-center space-y-4 max-w-sm">
          <h2 className="text-2xl font-black uppercase tracking-tighter">Gemini Voice</h2>
          <p className="text-slate-400 text-sm font-medium leading-relaxed">
            {transcription || "Talk naturally. I'm listening to your needs while you drive."}
          </p>
        </div>
      </div>

      <div className="p-12 flex items-center justify-center gap-8">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-500/20 text-red-500 border-2 border-red-500/50' : 'bg-white/5 text-white border-2 border-white/10 hover:bg-white/10'}`}
        >
          {isMuted ? <MicOff size={32} /> : <Mic size={32} />}
        </button>
        
        <button 
          onClick={onClose}
          className="w-24 h-24 bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-red-600/30 hover:scale-105 active:scale-95 transition-all"
        >
          <X size={40} strokeWidth={3} />
        </button>

        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
          <Volume2 size={32} />
        </div>
      </div>

      <style>{`
        @keyframes waveform {
          0%, 100% { height: 20%; }
          50% { height: 80%; }
        }
        .animate-waveform {
          animation: waveform 0.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LiveVoiceAssistant;

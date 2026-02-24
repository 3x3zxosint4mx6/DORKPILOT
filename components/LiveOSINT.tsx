
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

const LiveOSINT: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState<{ role: string; text: string }[]>([]);
  const [status, setStatus] = useState('Idle');
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startSession = async () => {
    try {
      setStatus('Connecting to Live OSINT Engine...');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        callbacks: {
          onopen: () => {
            setStatus('Live OSINT Briefing Active');
            setIsActive(true);
            startMic();
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn?.parts[0]?.text) {
              const text = message.serverContent.modelTurn.parts[0].text;
              setTranscript(prev => [...prev, { role: 'model', text }]);
            }
            // Handle audio output if needed
          },
          onclose: () => {
            stopSession();
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setStatus('Connection Error');
            stopSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are a real-time OSINT briefing assistant. You provide concise, tactical advice for investigative journalists. You speak clearly and professionally.",
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (error) {
      console.error("Failed to start Live session:", error);
      setStatus('Failed to connect');
    }
  };

  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      
      source.connect(processor);
      processor.connect(audioContext.destination);
      
      processor.onaudioprocess = (e) => {
        if (sessionRef.current && isActive) {
          const inputData = e.inputBuffer.getChannelData(0);
          // Convert to PCM16
          const pcm16 = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            pcm16[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
          }
          const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));
          sessionRef.current.sendRealtimeInput({
            media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
          });
        }
      };
    } catch (error) {
      console.error("Mic access error:", error);
      setStatus('Microphone access denied');
    }
  };

  const stopSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (audioContextRef.current) audioContextRef.current.close();
    
    setIsActive(false);
    setStatus('Idle');
    sessionRef.current = null;
  };

  return (
    <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700 shadow-xl flex flex-col items-center justify-center min-h-[400px]">
      <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-500 ${isActive ? 'bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-pulse' : 'bg-slate-700'}`}>
        <i className={`fas fa-microphone text-3xl ${isActive ? 'text-white' : 'text-slate-500'}`}></i>
      </div>
      
      <h2 className="text-2xl font-bold text-slate-100 mb-2">Live OSINT Briefing</h2>
      <p className="text-slate-400 text-sm mb-8 text-center max-w-md">
        Speak with DorkPilot in real-time for tactical investigative advice. Hands-free reconnaissance.
      </p>

      <div className="flex gap-4 mb-8">
        {!isActive ? (
          <button 
            onClick={startSession}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20"
          >
            <i className="fas fa-play"></i> Start Briefing
          </button>
        ) : (
          <button 
            onClick={stopSession}
            className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 shadow-lg shadow-red-900/20"
          >
            <i className="fas fa-stop"></i> End Session
          </button>
        )}
      </div>

      <div className="text-xs font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
        Status: {status}
      </div>

      {transcript.length > 0 && (
        <div className="mt-8 w-full max-w-2xl bg-slate-950/50 rounded-lg p-4 border border-slate-700 max-h-48 overflow-y-auto custom-scrollbar">
          {transcript.map((t, i) => (
            <div key={i} className="mb-2 text-sm">
              <span className="text-emerald-400 font-bold uppercase text-[10px] mr-2">Assistant:</span>
              <span className="text-slate-300">{t.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveOSINT;

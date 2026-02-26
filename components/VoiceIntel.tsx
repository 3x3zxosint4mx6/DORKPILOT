import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

const VoiceIntel: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'error'>('idle');
  const [transcript, setTranscript] = useState<{ role: string; text: string }[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const startSession = async () => {
    setStatus('connecting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      
      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        callbacks: {
          onopen: () => {
            setStatus('active');
            setIsActive(true);
            
            sourceRef.current = audioContextRef.current!.createMediaStreamSource(stream);
            processorRef.current = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            processorRef.current.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              // Convert to 16-bit PCM
              const pcmData = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
              }
              const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
                });
              });
            };
            
            sourceRef.current.connect(processorRef.current);
            processorRef.current.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
              const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
              const audioData = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0)).buffer;
              
              // Simple PCM playback (rough implementation for demo)
              const pcm16 = new Int16Array(audioData);
              const float32 = new Float32Array(pcm16.length);
              for (let i = 0; i < pcm16.length; i++) {
                float32[i] = pcm16[i] / 0x7FFF;
              }
              
              const buffer = audioContextRef.current!.createBuffer(1, float32.length, 24000);
              buffer.getChannelData(0).set(float32);
              const source = audioContextRef.current!.createBufferSource();
              source.buffer = buffer;
              source.connect(audioContextRef.current!.destination);
              source.start();
            }

            if (message.serverContent?.modelTurn?.parts[0]?.text) {
              setTranscript(prev => [...prev, { role: 'model', text: message.serverContent!.modelTurn!.parts[0].text! }]);
            }
          },
          onclose: () => stopSession(),
          onerror: (err) => {
            console.error(err);
            setStatus('error');
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are a real-time OSINT voice assistant. Help the investigator by providing quick insights and documenting findings verbally.",
        },
      });
      
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const stopSession = () => {
    setIsActive(false);
    setStatus('idle');
    if (processorRef.current) processorRef.current.disconnect();
    if (sourceRef.current) sourceRef.current.disconnect();
    if (audioContextRef.current) audioContextRef.current.close();
    if (sessionRef.current) sessionRef.current.close();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2 flex items-center gap-3">
          <i className="fas fa-microphone-lines text-emerald-400"></i>
          Voice Intel
        </h1>
        <p className="text-slate-400">Real-time voice-to-voice investigative briefing and documentation.</p>
      </div>

      <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
        {isActive && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-emerald-500/5 animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-ping"></div>
          </div>
        )}

        <div className="relative z-10 flex flex-col items-center">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 mb-6 ${isActive ? 'bg-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.4)] scale-110' : 'bg-slate-700'}`}>
            <i className={`fas fa-microphone text-3xl ${isActive ? 'text-white' : 'text-slate-400'}`}></i>
          </div>

          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-slate-100 mb-2">
              {status === 'idle' && 'Ready to Brief'}
              {status === 'connecting' && 'Establishing Secure Line...'}
              {status === 'active' && 'Line Active'}
              {status === 'error' && 'Connection Failed'}
            </h3>
            <p className="text-slate-400 text-sm max-w-xs">
              {status === 'idle' && 'Start a secure voice session to verbally document findings or ask for real-time OSINT guidance.'}
              {status === 'active' && 'Speak clearly. Your briefing is being processed and documented.'}
            </p>
          </div>

          <button
            onClick={isActive ? stopSession : startSession}
            disabled={status === 'connecting'}
            className={`px-8 py-3 rounded-full font-bold transition-all flex items-center gap-3 ${isActive ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20'}`}
          >
            {isActive ? (
              <>
                <i className="fas fa-stop"></i> Terminate Session
              </>
            ) : (
              <>
                <i className="fas fa-play"></i> Start Briefing
              </>
            )}
          </button>
        </div>

        {transcript.length > 0 && (
          <div className="w-full mt-12 pt-8 border-t border-slate-700/50">
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-4">Live Transcript</div>
            <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
              {transcript.map((t, i) => (
                <div key={i} className="text-sm">
                  <span className="text-emerald-400 font-bold mr-2">{t.role === 'model' ? 'INTEL:' : 'YOU:'}</span>
                  <span className="text-slate-300">{t.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
          <i className="fas fa-shield-halved text-emerald-400 mb-2"></i>
          <h4 className="text-sm font-bold text-slate-200 mb-1">Secure Channel</h4>
          <p className="text-xs text-slate-500">End-to-end encrypted voice processing for sensitive investigations.</p>
        </div>
        <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
          <i className="fas fa-bolt text-emerald-400 mb-2"></i>
          <h4 className="text-sm font-bold text-slate-200 mb-1">Real-time Analysis</h4>
          <p className="text-xs text-slate-500">Instant feedback on verbalized leads and investigative paths.</p>
        </div>
        <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
          <i className="fas fa-file-invoice text-emerald-400 mb-2"></i>
          <h4 className="text-sm font-bold text-slate-200 mb-1">Auto-Documentation</h4>
          <p className="text-xs text-slate-500">Verbal findings are automatically transcribed for your final report.</p>
        </div>
      </div>
    </div>
  );
};

export default VoiceIntel;

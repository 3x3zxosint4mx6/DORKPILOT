
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, ThinkingLevel, Modality } from "@google/genai";
import Markdown from 'react-markdown';

interface Message {
  role: 'user' | 'model';
  text: string;
  thinking?: string;
  groundingUrls?: string[];
}

const DorkAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hello! I'm your dumpsterdiver Assistant. I've been trained on a rigorous OSINT methodology where 'Good OSINT is slow, boring, and precise.' I can help you with objective mapping, collection strategies, and corroboration techniques. How can I assist your investigation today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinkingEnabled, setIsThinkingEnabled] = useState(true);
  const [isSearchEnabled, setIsSearchEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: messages.concat({ role: 'user', text: userMessage }).map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        config: {
          systemInstruction: `You are an expert OSINT assistant for Canadian investigative journalists, operating within the 'dumpsterdiver' investigative suite. 
          
          ADHERE TO THESE CORE PRINCIPLES:
          - 'Good OSINT is slow, boring, and precise.'
          - 'Bad OSINT is fast, exciting, and wrong.'
          - Map sources to questions, not curiosity.
          - No single source is sufficient.
          - Explicitly distinguish: FACT, INFERENCE, and UNVERIFIED CLAIM in your reasoning steps.
          
          WORKFLOW PHASES:
          4. Collection: Log URLs, dates, context. Capture screenshots/hashes. Preserve original wording. Separate raw data from analysis.
          5. Validation: Cross-source verification, timeline consistency, metadata analysis, source credibility weighting. Watch for circular reporting.
          6. Analysis: Timeline reconstruction, network mapping, pattern recognition, gap analysis. Label clearly: Fact, Inference, Unverified claim.
          7. Reporting: Methodology, confidence levels, limitations, source appendix. Use neutral language.
          8. Ethics: Confirm compliance, remove unnecessary personal data, reassess harm vs. public interest.
          
          OSINT SOURCES:
          - Search engines (advanced operators)
          - Social platforms (profiles, interactions, metadata)
          - Public records (corporate registries, court filings)
          - News & archives
          - Technical sources (WHOIS, DNS, IP data)
          - Geospatial (maps, satellite imagery)
          - Forums & niche communities
          
          When suggesting dorks, prioritize Canadian domains (.gc.ca, .ca, provincial sites). Explain the logic behind your suggestions. Use thinking mode to reason through complex investigative paths.`,
          thinkingConfig: isThinkingEnabled ? { thinkingLevel: ThinkingLevel.HIGH } : undefined,
          tools: isSearchEnabled ? [{ googleSearch: {} }] : undefined
        }
      });

      const text = response.text || "I'm sorry, I couldn't generate a response.";
      const groundingUrls = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map(chunk => chunk.web?.uri)
        .filter((uri): uri is string => !!uri);

      setMessages(prev => [...prev, { 
        role: 'model', 
        text,
        groundingUrls: groundingUrls && groundingUrls.length > 0 ? Array.from(new Set(groundingUrls)) : undefined
      }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Error: Failed to connect to the intelligence engine. Please check your connection." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = async (text: string, index: number) => {
    if (isSpeaking !== null) return;
    setIsSpeaking(index);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
        audio.onended = () => setIsSpeaking(null);
        audio.play();
      } else {
        setIsSpeaking(null);
      }
    } catch (error) {
      console.error("TTS Error:", error);
      setIsSpeaking(null);
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 shadow-xl flex flex-col h-[600px]">
      <div className="p-4 border-bottom border-slate-700 flex items-center justify-between bg-slate-800/80 rounded-t-xl">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-100">
            <i className="fas fa-trash-can text-emerald-400"></i>
            dumpsterdiver Assistant
          </h2>
          <div className="flex gap-2 ml-4">
            <button 
              onClick={() => setIsThinkingEnabled(!isThinkingEnabled)}
              className={`text-[10px] px-2 py-1 rounded border transition-all flex items-center gap-1 ${
                isThinkingEnabled 
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' 
                  : 'bg-slate-700/50 border-slate-600 text-slate-500'
              }`}
              title="Toggle Deep Thinking Mode"
            >
              <i className="fas fa-brain"></i>
              Thinking
            </button>
            <button 
              onClick={() => setIsSearchEnabled(!isSearchEnabled)}
              className={`text-[10px] px-2 py-1 rounded border transition-all flex items-center gap-1 ${
                isSearchEnabled 
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' 
                  : 'bg-slate-700/50 border-slate-600 text-slate-500'
              }`}
              title="Toggle Google Search Grounding"
            >
              <i className="fab fa-google"></i>
              Search
            </button>
          </div>
        </div>
        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
          Powered by Gemini 3.1 Pro
        </span>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-900/30"
      >
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] p-3 rounded-2xl text-sm relative group ${
                msg.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-tr-none' 
                  : 'bg-slate-700 text-slate-100 rounded-tl-none border border-slate-600'
              }`}
            >
              {msg.role === 'model' && (
                <button 
                  onClick={() => handleSpeak(msg.text, i)}
                  className={`absolute -right-8 top-0 p-2 text-slate-500 hover:text-emerald-400 transition-colors ${isSpeaking === i ? 'text-emerald-400 animate-pulse' : ''}`}
                  title="Read Aloud"
                >
                  <i className={`fas ${isSpeaking === i ? 'fa-volume-high' : 'fa-volume-low'}`}></i>
                </button>
              )}
              <div className="markdown-body prose prose-invert prose-sm max-w-none">
                <Markdown>{msg.text}</Markdown>
              </div>
              
              {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-600/50">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1 flex items-center gap-1">
                    <i className="fas fa-link text-[8px]"></i> Sources
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {msg.groundingUrls.map((url, idx) => (
                      <a 
                        key={idx} 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] bg-slate-800 hover:bg-slate-950 text-blue-400 px-2 py-0.5 rounded border border-slate-600 transition-colors truncate max-w-[150px]"
                        title={url}
                      >
                        {new URL(url).hostname}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-700 text-slate-100 p-3 rounded-2xl rounded-tl-none border border-slate-600 flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <span className="text-xs text-slate-400 italic">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-800/80 rounded-b-xl border-t border-slate-700">
        <div className="flex gap-2">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask for dork suggestions or OSINT advice..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-100 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white p-2 rounded-lg transition-colors w-10 h-10 flex items-center justify-center"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DorkAssistant;

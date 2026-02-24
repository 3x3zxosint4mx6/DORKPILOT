
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

const MapsGrounding: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string>('');
  const [links, setLinks] = useState<{ title: string; uri: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setResults('');
    setLinks([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      // Using gemini-2.5-flash with googleMaps tool as requested
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Find information about this location or entity in Canada: ${query}`,
        config: {
          tools: [{ googleMaps: {} }],
        },
      });

      setResults(response.text || "No detailed information found.");
      
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        const mapsLinks = chunks
          .filter((c: any) => c.maps)
          .map((c: any) => ({
            title: c.maps.title || "View on Maps",
            uri: c.maps.uri
          }));
        setLinks(mapsLinks);
      }
    } catch (error) {
      console.error("Maps Grounding Error:", error);
      setResults("Error: Failed to retrieve location data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-xl">
      <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-100 mb-4">
        <i className="fas fa-location-dot text-emerald-400"></i>
        Geographic Intelligence
      </h2>
      
      <p className="text-sm text-slate-400 mb-6">
        Verify physical locations, business registries, and local context using Google Maps grounding.
      </p>

      <div className="flex gap-2 mb-6">
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Enter a Canadian address, business name, or landmark..."
          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-100 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
        />
        <button 
          onClick={handleSearch}
          disabled={isLoading || !query.trim()}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white px-6 py-2 rounded-lg transition-all flex items-center gap-2"
        >
          {isLoading ? <i className="fas fa-circle-notch animate-spin"></i> : <i className="fas fa-magnifying-glass-location"></i>}
          Verify
        </button>
      </div>

      {results && (
        <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-700">
          <div className="prose prose-invert prose-sm max-w-none text-slate-300 whitespace-pre-wrap mb-4">
            {results}
          </div>
          
          {links.length > 0 && (
            <div className="pt-4 border-t border-slate-800">
              <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">Verified Map Sources</p>
              <div className="flex flex-wrap gap-2">
                {links.map((link, i) => (
                  <a 
                    key={i} 
                    href={link.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-slate-900 hover:bg-emerald-900/20 px-3 py-1.5 rounded text-xs text-emerald-400 border border-slate-700 flex items-center gap-2 transition-all"
                  >
                    <i className="fas fa-map"></i>
                    {link.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MapsGrounding;

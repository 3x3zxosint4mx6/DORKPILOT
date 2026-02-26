
import React, { useState, useEffect } from 'react';
import DorkBuilder from './components/DorkBuilder';
import DorkAssistant from './components/DorkAssistant';
import BriefingVideo from './components/BriefingVideo';
import VoiceIntel from './components/VoiceIntel';
import MapsGrounding from './components/MapsGrounding';
import Methodology from './components/Methodology';
import { SavedDork } from './types';
import { CANADIAN_RESOURCES, DARK_WEB_RESOURCES, COMMON_DORKS, OSINT_SEARCH_ENGINES, SOCMINT_ENGINES } from './constants';

const App: React.FC = () => {
  const [savedDorks, setSavedDorks] = useState<SavedDork[]>([]);
  const [activeTab, setActiveTab] = useState<'build' | 'assistant' | 'visualize' | 'live' | 'resources' | 'engines' | 'socmint' | 'library' | 'methodology'>('build');

  useEffect(() => {
    const saved = localStorage.getItem('dorkpilot_saved');
    if (saved) setSavedDorks(JSON.parse(saved));
  }, []);

  const addSavedDork = (dork: SavedDork) => {
    const newList = [dork, ...savedDorks];
    setSavedDorks(newList);
    localStorage.setItem('dorkpilot_saved', JSON.stringify(newList));
  };

  const removeDork = (id: string) => {
    const newList = savedDorks.filter(d => d.id !== id);
    setSavedDorks(newList);
    localStorage.setItem('dorkpilot_saved', JSON.stringify(newList));
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans bg-slate-950 text-slate-100">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-6 sticky top-0 h-auto md:h-screen">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-900/20">
            <i className="fas fa-trash-can text-xl"></i>
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">dumpsterdiver</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">OSINT Investigative Suite</p>
          </div>
        </div>

        <nav className="space-y-1 flex-1 overflow-y-auto custom-scrollbar pr-1">
          <div className="text-[10px] text-slate-500 mb-2 uppercase tracking-widest font-bold px-4">Core Tools</div>
          <button 
            onClick={() => setActiveTab('build')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'build' ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-600/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fas fa-terminal"></i>
            <span className="font-medium">Dork Builder</span>
          </button>
          <button 
            onClick={() => setActiveTab('assistant')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'assistant' ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-600/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fas fa-robot"></i>
            <span className="font-medium">AI Assistant</span>
          </button>
          
          <div className="text-[10px] text-slate-500 mt-6 mb-2 uppercase tracking-widest font-bold px-4">Intelligence</div>
          <button 
            onClick={() => setActiveTab('visualize')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'visualize' ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-600/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fas fa-eye"></i>
            <span className="font-medium">Visualizer</span>
          </button>
          <button 
            onClick={() => setActiveTab('live')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'live' ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-600/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fas fa-microphone"></i>
            <span className="font-medium">Live Briefing</span>
          </button>

          <div className="text-[10px] text-slate-500 mt-6 mb-2 uppercase tracking-widest font-bold px-4">Knowledge</div>
          <button 
             onClick={() => setActiveTab('library')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'library' ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-600/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fas fa-book-open"></i>
            <span className="font-medium">Saved Dorks</span>
          </button>
          <button 
            onClick={() => setActiveTab('resources')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'resources' ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-600/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fas fa-map-location-dot"></i>
            <span className="font-medium">Registry Hub</span>
          </button>
          <button 
            onClick={() => setActiveTab('engines')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'engines' ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-600/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fas fa-search"></i>
            <span className="font-medium">OSINT Engines</span>
          </button>
          <button 
            onClick={() => setActiveTab('socmint')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'socmint' ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-600/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fas fa-users-viewfinder"></i>
            <span className="font-medium">SOCMINT Hub</span>
          </button>
          <button 
            onClick={() => setActiveTab('methodology')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'methodology' ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-600/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fas fa-clipboard-list"></i>
            <span className="font-medium">Methodology</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 flex flex-col gap-6 overflow-y-auto h-screen custom-scrollbar">
        <div className="max-w-5xl mx-auto w-full space-y-6">
          {activeTab === 'build' && (
            <>
              <div className="bg-gradient-to-r from-emerald-900/20 to-transparent p-6 rounded-xl border border-emerald-600/20">
                <h2 className="text-2xl font-bold mb-2">Google Dork Builder</h2>
                <p className="text-slate-400 text-sm">
                  Construct specialized search queries for the Canadian public interest.
                </p>
              </div>
              <DorkBuilder onAddDork={addSavedDork} />
            </>
          )}

          {activeTab === 'assistant' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-900/20 to-transparent p-6 rounded-xl border border-emerald-600/20">
                <h2 className="text-2xl font-bold mb-2">AI Investigative Assistant</h2>
                <p className="text-slate-400 text-sm">
                  Strategic advice and dork generation powered by Gemini 3.1 Pro with deep reasoning.
                </p>
              </div>
              <DorkAssistant />
            </div>
          )}

          {activeTab === 'visualize' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-900/20 to-transparent p-6 rounded-xl border border-purple-600/20">
                <h2 className="text-2xl font-bold mb-2">Investigative Visualizer</h2>
                <p className="text-slate-400 text-sm">
                  Tools for geographic verification and visual storytelling.
                </p>
              </div>
              <MapsGrounding />
              <BriefingVideo />
            </div>
          )}

          {activeTab === 'live' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-900/20 to-transparent p-6 rounded-xl border border-emerald-600/20">
                <h2 className="text-2xl font-bold mb-2">Live OSINT Briefing</h2>
                <p className="text-slate-400 text-sm">
                  Real-time voice-to-voice intelligence briefing for hands-free reconnaissance.
                </p>
              </div>
              <VoiceIntel />
            </div>
          )}

          {activeTab === 'engines' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-900/20 to-transparent p-6 rounded-xl border border-emerald-600/20">
                <h2 className="text-2xl font-bold mb-2">OSINT Search Engines</h2>
                <p className="text-slate-400 text-sm">
                  Specialized tools for infrastructure, email, and threat intelligence research.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {OSINT_SEARCH_ENGINES.map((res, i) => (
                  <a 
                    key={i} 
                    href={res.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-slate-900 p-5 rounded-xl border border-slate-800 hover:border-emerald-500 group transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] px-2 py-0.5 bg-slate-800 rounded text-emerald-400 font-bold uppercase">{res.category}</span>
                      <i className="fas fa-arrow-up-right-from-square text-slate-600 group-hover:text-emerald-500 transition-colors"></i>
                    </div>
                    <h3 className="font-bold text-slate-100 mb-2">{res.name}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{res.description}</p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'socmint' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-900/20 to-transparent p-6 rounded-xl border border-emerald-600/20">
                <h2 className="text-2xl font-bold mb-2">SOCMINT Hub</h2>
                <p className="text-slate-400 text-sm">
                  Social Media Intelligence tools for profile discovery, username tracking, and forum research.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SOCMINT_ENGINES.map((res, i) => (
                  <a 
                    key={i} 
                    href={res.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-slate-900 p-5 rounded-xl border border-slate-800 hover:border-emerald-500 group transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] px-2 py-0.5 bg-slate-800 rounded text-emerald-400 font-bold uppercase">{res.category}</span>
                      <i className="fas fa-arrow-up-right-from-square text-slate-600 group-hover:text-emerald-500 transition-colors"></i>
                    </div>
                    <h3 className="font-bold text-slate-100 mb-2">{res.name}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{res.description}</p>
                  </a>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'library' && (
            <div className="space-y-6">
              {savedDorks.length === 0 ? (
                <div className="p-12 border-2 border-dashed border-slate-800 rounded-xl text-center text-slate-500">
                  No dorks saved yet. Create one in the workbench.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {savedDorks.map(dork => (
                    <div key={dork.id} className="bg-slate-900 p-5 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-all group">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-emerald-400">{dork.name}</h3>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(dork.query)}`, '_blank')}
                            className="text-slate-400 hover:text-emerald-400 p-2 transition-colors"
                          >
                            <i className="fas fa-external-link-alt"></i>
                          </button>
                          <button 
                            onClick={() => removeDork(dork.id)}
                            className="text-slate-400 hover:text-red-400 p-2 transition-colors"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                      <code className="block bg-slate-950 p-3 rounded text-sm font-mono text-slate-300 break-all border border-slate-800">
                        {dork.query}
                      </code>
                      <div className="mt-3 flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                        <span>Created {new Date(dork.createdAt).toLocaleDateString()}</span>
                        <span>{dork.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'methodology' && (
            <Methodology />
          )}

          {activeTab === 'resources' && (
            <div className="space-y-12">
              <section className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <i className="fas fa-flag text-emerald-400"></i>
                    Canadian Registry Hub
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">Essential portals for regional OSINT investigations.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CANADIAN_RESOURCES.map((res, i) => (
                    <a 
                      key={i} 
                      href={res.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-slate-900 p-5 rounded-xl border border-slate-800 hover:border-emerald-500 group transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] px-2 py-0.5 bg-slate-800 rounded text-slate-400 font-bold uppercase">{res.category}</span>
                        <i className="fas fa-arrow-up-right-from-square text-slate-600 group-hover:text-emerald-500 transition-colors"></i>
                      </div>
                      <h3 className="font-bold text-slate-100 mb-2">{res.name}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{res.description}</p>
                    </a>
                  ))}
                </div>
              </section>

              <section className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <i className="fas fa-mask text-purple-400"></i>
                    Dark Web Reconnaissance
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">Specialized gateways for indexing hidden services.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {DARK_WEB_RESOURCES.map((res, i) => (
                    <a 
                      key={i} 
                      href={res.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-slate-900 p-5 rounded-xl border border-slate-800 hover:border-purple-500 group transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] px-2 py-0.5 bg-slate-800 rounded text-purple-400 font-bold uppercase">{res.category}</span>
                        <i className="fas fa-arrow-up-right-from-square text-slate-600 group-hover:text-purple-500 transition-colors"></i>
                      </div>
                      <h3 className="font-bold text-slate-100 mb-2">{res.name}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{res.description}</p>
                    </a>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 text-center text-slate-600 text-[10px] uppercase tracking-[0.2em] font-bold border-t border-slate-900 bg-slate-950/80 backdrop-blur-md z-10 hidden md:block">
        dumpsterdiver &copy; {new Date().getFullYear()} &bull; Professional OSINT Investigative Suite
      </footer>
    </div>
  );
};

export default App;

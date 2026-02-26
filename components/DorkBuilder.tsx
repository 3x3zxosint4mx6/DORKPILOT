
import React, { useState, useEffect } from 'react';
import { DorkPart, SavedDork } from '../types';
import { DARK_WEB_ENGINES, CANADIAN_GOVT_SITES, SOURCE_TYPE_PRESETS, GEOGRAPHIC_KEYWORDS } from '../constants';

interface DorkBuilderProps {
  onAddDork: (dork: SavedDork) => void;
}

/**
 * Helper to convert a standard Date object to a Google-compatible Julian Date
 */
const toJulian = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  // Google's Julian date format is essentially (ms since Unix epoch / ms in day) + 2440587.5
  const julian = Math.floor((date.getTime() / 86400000) + 2440587.5);
  return julian.toString();
};

const GeoPicker: React.FC<{ value: string; onChange: (val: string) => void }> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [savedPresets, setSavedPresets] = useState<{ name: string; value: string }[]>([]);
  const [newPresetName, setNewPresetName] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    // Load saved presets
    const saved = localStorage.getItem('dorkpilot_geo_presets');
    if (saved) {
      setSavedPresets(JSON.parse(saved));
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Try to extract custom location from value if it's not in GEOGRAPHIC_KEYWORDS
  useEffect(() => {
    if (value.startsWith('site:.ca (') && value.endsWith(')')) {
      const content = value.slice(10, -1);
      const parts = content.split(' OR ');
      const knownValues = GEOGRAPHIC_KEYWORDS.map(k => k.value);
      const custom = parts.find(p => !knownValues.includes(p));
      if (custom) {
        setCustomLocation(custom.replace(/"/g, ''));
      } else {
        setCustomLocation('');
      }
    }
  }, [value]);

  const updateValue = (nextKeywords: typeof GEOGRAPHIC_KEYWORDS, custom: string) => {
    if (nextKeywords.length === 0 && !custom.trim()) {
      onChange('site:.ca');
    } else {
      const parts = nextKeywords.map(k => k.value);
      if (custom.trim()) {
        parts.push(`"${custom.trim()}"`);
      }
      const combined = parts.join(' OR ');
      onChange(`site:.ca (${combined})`);
    }
  };

  const savePreset = () => {
    if (!newPresetName.trim() || !value) return;
    const newPresets = [...savedPresets, { name: newPresetName.trim(), value }];
    setSavedPresets(newPresets);
    localStorage.setItem('dorkpilot_geo_presets', JSON.stringify(newPresets));
    setNewPresetName('');
  };

  const deletePreset = (index: number) => {
    const newPresets = savedPresets.filter((_, i) => i !== index);
    setSavedPresets(newPresets);
    localStorage.setItem('dorkpilot_geo_presets', JSON.stringify(newPresets));
  };

  const loadPreset = (presetValue: string) => {
    onChange(presetValue);
  };

  const selectedLabels = value === 'site:.ca' 
    ? ['All Canada'] 
    : [
        ...GEOGRAPHIC_KEYWORDS.filter(k => value.includes(k.value)).map(k => k.label),
        ...(customLocation ? [customLocation] : [])
      ];

  const toggleSelection = (geo: typeof GEOGRAPHIC_KEYWORDS[0]) => {
    const currentKeywords = GEOGRAPHIC_KEYWORDS.filter(k => value.includes(k.value));
    const isSelected = currentKeywords.some(k => k.label === geo.label);
    
    let nextKeywords = [];
    if (isSelected) {
      nextKeywords = currentKeywords.filter(k => k.label !== geo.label);
    } else {
      nextKeywords = [...currentKeywords, geo];
    }
    
    updateValue(nextKeywords, customLocation);
  };

  const handleCustomLocationChange = (val: string) => {
    setCustomLocation(val);
    const currentKeywords = GEOGRAPHIC_KEYWORDS.filter(k => value.includes(k.value));
    updateValue(currentKeywords, val);
  };

  const filteredOptions = GEOGRAPHIC_KEYWORDS.filter(geo => 
    geo.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedOptions = {
    province: filteredOptions.filter(o => o.type === 'province'),
    region: filteredOptions.filter(o => o.type === 'region'),
    city: filteredOptions.filter(o => o.type === 'city'),
  };

  return (
    <div className="flex-1 relative" ref={wrapperRef}>
      <div 
        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus-within:ring-2 focus-within:ring-emerald-500 focus-within:outline-none text-purple-400 font-medium shadow-inner cursor-pointer flex items-center justify-between min-h-[42px]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1">
          {selectedLabels.length > 0 ? (
            selectedLabels.map(label => (
              <span key={label} className="bg-purple-900/30 text-purple-300 px-1.5 py-0.5 rounded text-xs border border-purple-500/30">
                {label}
              </span>
            ))
          ) : (
            <span className="text-slate-500 font-normal">Select Provinces/Territories...</span>
          )}
        </div>
        <i className={`fas fa-chevron-down text-slate-600 transition-transform ml-2 ${isOpen ? 'rotate-180' : ''}`}></i>
      </div>
      
      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-96 flex flex-col overflow-hidden">
          <div className="p-2 border-b border-slate-800 bg-slate-950 space-y-2">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <i className="fas fa-search absolute left-2 top-1/2 -translate-y-1/2 text-slate-600 text-[10px]"></i>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Filter presets..."
                  className="w-full bg-slate-900 border border-slate-700 rounded pl-7 pr-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  autoFocus
                  onClick={e => e.stopPropagation()}
                />
              </div>
              <div className="flex-1 relative">
                <i className="fas fa-location-dot absolute left-2 top-1/2 -translate-y-1/2 text-purple-500 text-[10px]"></i>
                <input
                  type="text"
                  value={customLocation}
                  onChange={e => handleCustomLocationChange(e.target.value)}
                  placeholder="Custom Location..."
                  className="w-full bg-slate-900 border border-slate-700 rounded pl-7 pr-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  onClick={e => e.stopPropagation()}
                />
              </div>
            </div>
            
            {/* Preset Saving UI */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newPresetName}
                onChange={e => setNewPresetName(e.target.value)}
                placeholder="Name current selection..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                onClick={e => e.stopPropagation()}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  savePreset();
                }}
                disabled={!newPresetName.trim() || !value}
                className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-2 py-1 rounded text-xs transition-colors"
              >
                Save
              </button>
            </div>

            {/* Saved Presets List */}
            {savedPresets.length > 0 && (
              <div className="pt-1 pb-1 border-t border-slate-800">
                <div className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-1.5 px-1">Saved Presets</div>
                <div className="flex flex-wrap gap-2">
                  {savedPresets.map((preset, idx) => (
                    <div key={idx} className="flex items-center bg-slate-800 rounded border border-slate-700 overflow-hidden">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          loadPreset(preset.value);
                        }}
                        className="px-2 py-1 text-[10px] text-purple-300 hover:bg-slate-700 transition-colors"
                      >
                        {preset.name}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePreset(idx);
                        }}
                        className="px-1.5 py-1 text-[10px] text-slate-500 hover:text-red-400 hover:bg-slate-700 border-l border-slate-700 transition-colors"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="overflow-y-auto flex-1 p-1 custom-scrollbar bg-slate-900">
            {(['province', 'region', 'city'] as const).map(group => (
              groupedOptions[group].length > 0 && (
                <div key={group} className="mb-2">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-950/50 mb-1">
                    {group}s
                  </div>
                  {groupedOptions[group].map(geo => {
                    const isSelected = value.includes(geo.value);
                    return (
                      <div 
                        key={geo.label}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelection(geo);
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer rounded hover:bg-slate-800 transition-colors ${isSelected ? 'text-emerald-400 bg-slate-800/50' : 'text-slate-300'}`}
                      >
                        <div className={`w-3 h-3 rounded border flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-emerald-500 bg-emerald-500/20' : 'border-slate-600'}`}>
                          {isSelected && <i className="fas fa-check text-[8px]"></i>}
                        </div>
                        <span>{geo.label}</span>
                      </div>
                    );
                  })}
                </div>
              )
            ))}
            {filteredOptions.length === 0 && (
              <div className="p-3 text-center text-xs text-slate-500">No regions found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const DorkBuilder: React.FC<DorkBuilderProps> = ({ onAddDork }) => {
  const [parts, setParts] = useState<DorkPart[]>([
    { id: '1', operator: 'site:', value: 'gc.ca', enabled: true },
    { id: '2', operator: 'filetype:', value: 'pdf', enabled: true },
  ]);
  const [currentQuery, setCurrentQuery] = useState('');
  const [fixFeedback, setFixFeedback] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<{ label: string; op: string; val: string; icon: string }[]>([]);

  useEffect(() => {
    const query = parts
      .filter(p => p.enabled && p.value.trim() !== '')
      .map(p => {
        // Map the internal helper operators back to standard Google operators
        let op = p.operator;
        if (p.operator === 'site: (Dark Web)' || p.operator === 'site: (Canadian Govt)') {
          op = 'site:';
        } else if (p.operator === '- (Exclude)') {
          op = '-';
        } else if (p.operator === 'OR') {
          op = 'OR ';
        } else if (p.operator === '* (Wildcard)') {
          op = '*';
        } else if (p.operator === 'Source Type:' || p.operator === 'Geo Scope:') {
          op = ''; // Value already contains the full logic
        }
        return `${op}${p.value}`;
      })
      .join(' ');
    setCurrentQuery(query);

    // Generate suggestions
    const newSuggestions = [];
    const hasSite = parts.some(p => p.enabled && p.operator.startsWith('site:'));
    const hasFileType = parts.some(p => p.enabled && p.operator === 'filetype:');
    const hasTitle = parts.some(p => p.enabled && p.operator === 'intitle:');
    const hasAfter = parts.some(p => p.enabled && p.operator === 'after:');
    const hasRelated = parts.some(p => p.enabled && p.operator === 'related:');
    const hasAllInText = parts.some(p => p.enabled && p.operator === 'allintext:');

    if (!hasSite) {
      newSuggestions.push({ label: 'Federal (Canada.ca)', op: 'site:', val: 'canada.ca', icon: 'fa-flag' });
      newSuggestions.push({ label: 'Ontario Gov', op: 'site:', val: 'ontario.ca', icon: 'fa-map' });
      newSuggestions.push({ label: 'Dark Web (Ahmia)', op: 'site:', val: 'ahmia.fi', icon: 'fa-user-secret' });
      newSuggestions.push({ label: 'Dark Web Gateway', op: 'site:', val: 'onion.ly', icon: 'fa-link' });
    }
    if (!hasFileType) {
      newSuggestions.push({ label: 'PDF Reports', op: 'filetype:', val: 'pdf', icon: 'fa-file-pdf' });
    }
    if (!hasTitle) {
      newSuggestions.push({ label: 'Audit Search', op: 'intitle:', val: 'audit', icon: 'fa-magnifying-glass-chart' });
    }
    if (!hasAfter) {
      const lastYear = new Date();
      lastYear.setFullYear(lastYear.getFullYear() - 1);
      const dateStr = lastYear.toISOString().split('T')[0];
      newSuggestions.push({ label: 'Recent Docs', op: 'after:', val: dateStr, icon: 'fa-calendar-days' });
    }

    const hasBefore = parts.some(p => p.enabled && p.operator === 'before:');
    if (!hasBefore) {
      newSuggestions.push({ label: 'Archive Search', op: 'before:', val: '2020-01-01', icon: 'fa-box-archive' });
    }
    
    const hasExclude = parts.some(p => p.enabled && p.operator === '- (Exclude)');
    if (!hasExclude) {
      newSuggestions.push({ label: 'Exclude Junk', op: '- (Exclude)', val: 'stock', icon: 'fa-filter-circle-xmark' });
    }

    if (!hasRelated) {
      newSuggestions.push({ label: 'Similar Sites', op: 'related:', val: 'cbc.ca', icon: 'fa-diagram-project' });
    }

    const hasWildcard = parts.some(p => p.enabled && p.operator === '* (Wildcard)');
    if (!hasWildcard) {
      newSuggestions.push({ label: 'Phrase Wildcard', op: '* (Wildcard)', val: ' of Canada', icon: 'fa-asterisk' });
    }

    if (!hasAllInText) {
      newSuggestions.push({ label: 'Full Text Search', op: 'allintext:', val: '"confidential report"', icon: 'fa-file-lines' });
    }

    newSuggestions.push({ label: 'Exposed S3 Buckets', op: 'site:', val: 's3.amazonaws.com', icon: 'fa-bucket' });
    newSuggestions.push({ label: 'Trello Boards', op: 'site:', val: 'trello.com', icon: 'fa-trello' });
    
    setSuggestions(newSuggestions.slice(0, 11));
  }, [parts]);

  const addPart = (op?: string, val?: string) => {
    setParts([...parts, { 
      id: Date.now().toString(), 
      operator: op || 'intext:', 
      value: val || '', 
      enabled: true 
    }]);
  };

  const removePart = (id: string) => {
    setParts(parts.filter(p => p.id !== id));
  };

  const updatePart = (id: string, updates: Partial<DorkPart>) => {
    setParts(parts.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleDateChange = (id: string, dateType: 'start' | 'end', dateValue: string, currentValue: string) => {
    const [startJulian, endJulian] = currentValue.includes('-') ? currentValue.split('-') : ['', ''];
    
    // Convert new date to Julian
    const newJulian = toJulian(dateValue);
    
    let newValue = '';
    if (dateType === 'start') {
      newValue = `${newJulian}-${endJulian || newJulian}`;
    } else {
      newValue = `${startJulian || newJulian}-${newJulian}`;
    }
    
    updatePart(id, { value: newValue });
  };

  const handleSearch = () => {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(currentQuery)}`, '_blank');
  };

  const saveDork = () => {
    if (!currentQuery) return;
    const name = prompt("Enter a name for this dork:");
    if (name) {
      onAddDork({
        id: Date.now().toString(),
        name,
        query: currentQuery,
        description: "Built using DorkBuilder",
        createdAt: Date.now()
      });
    }
  };

  const clearAll = () => {
    if (confirm("Clear all current operators?")) {
      setParts([]);
    }
  };

  const runFixErrors = () => {
    const newParts = [...parts];
    const feedback: string[] = [];
    let hasChanges = false;

    // Track seen operators for conflict detection
    const seenSites: string[] = [];

    newParts.forEach((part, idx) => {
      if (!part.enabled || !part.value.trim()) return;

      let val = part.value.trim();
      let op = part.operator;
      const originalVal = val;
      const originalOp = op;

      // 1. Unclosed quotes
      const quoteCount = (val.match(/"/g) || []).length;
      if (quoteCount % 2 !== 0) {
        val += '"';
        feedback.push(`Part ${idx + 1}: Closed an unclosed quotation mark.`);
      }

      // 2. Malformed filetype (remove dots, extra spaces)
      if (op === 'filetype:' || op === 'ext:') {
        if (val.startsWith('.')) {
          val = val.substring(1);
          feedback.push(`Part ${idx + 1}: Removed leading dot from filetype.`);
        }
        if (/\s/.test(val)) {
          val = val.replace(/\s+/g, '');
          feedback.push(`Part ${idx + 1}: Removed invalid spaces from filetype.`);
        }
      }

      // 3. Extra spaces/colons in value
      if (val.includes(':') || val.includes('  ')) {
        const cleaned = val.replace(/\s*:\s*/g, ':').replace(/:+/g, ':').replace(/\s\s+/g, ' ');
        if (cleaned !== val) {
          val = cleaned;
          feedback.push(`Part ${idx + 1}: Cleaned up extra colons or spaces.`);
        }
      }

      // 4. Duplicate operators (if user typed operator in value field)
      const baseOp = op.split(' ')[0]; 
      const checkOps = [baseOp, 'intitle:', 'inurl:', 'intext:', 'filetype:', 'site:', 'related:', 'cache:', 'allintext:'];
      
      for (const checkOp of checkOps) {
        if (val.toLowerCase().startsWith(checkOp.toLowerCase())) {
          val = val.substring(checkOp.length).trim();
          if (val.startsWith(':')) val = val.substring(1).trim();
          feedback.push(`Part ${idx + 1}: Removed redundant '${checkOp}' prefix from value.`);
          break;
        }
      }

      // 5. AND/OR logic in value
      if (/\s+or\s+/i.test(val) && !/\s+OR\s+/.test(val)) {
        val = val.replace(/\s+or\s+/gi, ' OR ');
        feedback.push(`Part ${idx + 1}: Standardized 'OR' to uppercase.`);
      }
      if (/\s+and\s+/i.test(val)) {
        val = val.replace(/\s+and\s+/gi, ' ');
        feedback.push(`Part ${idx + 1}: Removed redundant 'AND' (Google assumes AND).`);
      }

      // 6. Conflict detection: Multiple site: operators
      if (op.startsWith('site:')) {
        if (seenSites.length > 0 && !newParts.some(p => p.enabled && p.operator === 'OR')) {
          feedback.push(`Warning: Multiple 'site:' operators detected without 'OR'. This usually returns zero results.`);
        }
        seenSites.push(val);
        
        // Check for protocol in site (e.g. site:https://google.com)
        if (val.includes('://')) {
          val = val.split('://')[1];
          feedback.push(`Part ${idx + 1}: Removed protocol (http/https) from site operator.`);
        }
      }

      if (val !== originalVal || op !== originalOp) {
        newParts[idx] = { ...part, value: val, operator: op };
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setParts(newParts);
    }
    
    if (feedback.length > 0) {
      setFixFeedback(feedback);
    } else {
      setFixFeedback(["Query looks solid! No obvious errors detected."]);
    }
    
    setTimeout(() => setFixFeedback([]), 8000);
  };

  return (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-100">
          <i className="fas fa-hammer text-emerald-400"></i>
          Query Constructor
        </h2>
        <div className="flex gap-2">
          {parts.length > 0 && (
            <button 
              onClick={runFixErrors}
              className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-600/30 px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-2"
              title="Detect and fix common dorking errors"
            >
              <i className="fas fa-wand-magic-sparkles"></i> Smart Fix
            </button>
          )}
          <button 
            onClick={clearAll}
            className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-2 text-slate-300"
          >
            <i className="fas fa-eraser"></i> Clear
          </button>
          <button 
            onClick={() => addPart()}
            className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/30 px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-2"
          >
            <i className="fas fa-plus"></i> Add Operator
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {fixFeedback.length > 0 && (
          <div className="mb-4 p-3 bg-slate-900 border-l-4 border-amber-500 rounded-r-lg animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex justify-between items-start mb-1">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Auto-Correction Report</span>
              <button onClick={() => setFixFeedback([])} className="text-slate-500 hover:text-slate-300"><i className="fas fa-times text-[10px]"></i></button>
            </div>
            <ul className="space-y-1">
              {fixFeedback.map((msg, i) => (
                <li key={i} className="text-[11px] text-slate-300 flex items-center gap-2">
                  <i className="fas fa-check-circle text-emerald-500 text-[9px]"></i>
                  {msg}
                </li>
              ))}
            </ul>
          </div>
        )}
        {parts.map((part, index) => (
          <div 
            key={part.id} 
            className={`group flex flex-col sm:flex-row gap-3 items-start sm:items-center p-4 rounded-xl border transition-all duration-200 ${
              !part.enabled 
                ? 'bg-slate-900/20 border-slate-800 opacity-60 grayscale' 
                : part.operator === '- (Exclude)' || part.operator === '-site:'
                  ? 'bg-red-900/10 border-red-500/30 shadow-lg shadow-red-900/5' 
                  : 'bg-slate-900/60 border-slate-700/50 hover:border-emerald-500/30 shadow-lg shadow-black/20'
            }`}
          >
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button 
                onClick={() => updatePart(part.id, { enabled: !part.enabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                  part.enabled ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
                title={part.enabled ? "Disable operator" : "Enable operator"}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    part.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              
              <div className="flex-1 sm:hidden flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Operator {index + 1}
                </span>
                <button 
                  onClick={() => removePart(part.id)}
                  className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                >
                  <i className="fas fa-trash-can text-xs"></i>
                </button>
              </div>
            </div>

            <div className="flex flex-1 gap-2 w-full">
              <div className="relative flex-shrink-0">
                <select 
                  value={part.operator}
                  onChange={(e) => {
                    const newOp = e.target.value;
                    let newVal = '';
                    if (newOp === 'Geo Scope:') newVal = 'site:.ca';
                    updatePart(part.id, { operator: newOp, value: newVal });
                  }}
                  className={`appearance-none bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:outline-none min-w-[150px] font-semibold transition-all cursor-pointer ${
                    part.operator === '- (Exclude)' || part.operator === '-site:' 
                      ? 'text-red-400 border-red-900/50 focus:ring-red-500' 
                      : 'text-emerald-400 border-slate-700 focus:ring-emerald-500'
                  }`}
                >
                  <optgroup label="Logic">
                    <option value="- (Exclude)">- (Exclude)</option>
                    <option value="OR">OR (Either term)</option>
                    <option value="* (Wildcard)">* (Wildcard)</option>
                  </optgroup>
                  <optgroup label="Standard">
                    <option value="site:">site:</option>
                    <option value="-site:">-site: (Exclude site)</option>
                    <option value="filetype:">filetype:</option>
                    <option value="ext:">ext:</option>
                    <option value="intitle:">intitle:</option>
                    <option value="intext:">intext:</option>
                    <option value="inurl:">inurl:</option>
                  </optgroup>
                  <optgroup label="Quick Presets">
                    <option value="site: (Canadian Govt)">site: (Canada Govt)</option>
                    <option value="site: (Dark Web)">site: (Dark Web)</option>
                    <option value="Source Type:">Source Type</option>
                    <option value="Geo Scope:">Geo Scope (Canada)</option>
                  </optgroup>
                  <optgroup label="Time & Date">
                    <option value="daterange:">daterange:</option>
                    <option value="before:">before:</option>
                    <option value="after:">after:</option>
                  </optgroup>
                  <optgroup label="Advanced">
                    <option value="cache:">cache:</option>
                    <option value="related:">related:</option>
                    <option value="allintitle:">allintitle:</option>
                    <option value="allinurl:">allinurl:</option>
                    <option value="allintext:">allintext:</option>
                  </optgroup>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 text-[10px]">
                  <i className="fas fa-chevron-down"></i>
                </div>
              </div>

              <div className="flex-1 flex gap-2">
                {part.operator === 'site: (Dark Web)' ? (
                  <select
                    value={part.value}
                    onChange={(e) => updatePart(part.id, { value: e.target.value })}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-emerald-400 font-medium shadow-inner"
                  >
                    <option value="">Select Dark Web Indexer...</option>
                    {DARK_WEB_ENGINES.map(engine => (
                      <option key={engine.value} value={engine.value}>{engine.label}</option>
                    ))}
                  </select>
                ) : part.operator === 'site: (Canadian Govt)' ? (
                  <select
                    value={part.value}
                    onChange={(e) => updatePart(part.id, { value: e.target.value })}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-blue-400 font-medium shadow-inner"
                  >
                    <option value="">Select Government Domain...</option>
                    {CANADIAN_GOVT_SITES.map(site => (
                      <option key={site.value} value={site.value}>{site.label}</option>
                    ))}
                  </select>
                ) : part.operator === 'Source Type:' ? (
                  <select
                    value={part.value}
                    onChange={(e) => updatePart(part.id, { value: e.target.value })}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-amber-400 font-medium shadow-inner"
                  >
                    <option value="">Select Source Type...</option>
                    {SOURCE_TYPE_PRESETS.map(source => (
                      <option key={source.value} value={source.value}>{source.label}</option>
                    ))}
                  </select>
                ) : part.operator === 'Geo Scope:' ? (
                  <GeoPicker 
                    value={part.value} 
                    onChange={(val) => updatePart(part.id, { value: val })} 
                  />
                ) : part.operator === 'daterange:' ? (
                  <div className="flex-1 flex gap-3 items-center bg-slate-950 border border-slate-700 rounded-lg px-4 py-1.5 shadow-inner">
                    <div className="flex-1 flex flex-col">
                      <span className="text-[8px] text-slate-500 uppercase font-black tracking-tighter mb-0.5">Start Date</span>
                      <input 
                        type="date"
                        onChange={(e) => handleDateChange(part.id, 'start', e.target.value, part.value)}
                        className="w-full bg-transparent border-none p-0 text-xs text-slate-200 focus:ring-0 focus:outline-none"
                      />
                    </div>
                    <div className="h-6 w-px bg-slate-800"></div>
                    <div className="flex-1 flex flex-col">
                      <span className="text-[8px] text-slate-500 uppercase font-black tracking-tighter mb-0.5">End Date</span>
                      <input 
                        type="date"
                        onChange={(e) => handleDateChange(part.id, 'end', e.target.value, part.value)}
                        className="w-full bg-transparent border-none p-0 text-xs text-slate-200 focus:ring-0 focus:outline-none"
                      />
                    </div>
                    <div className="text-[9px] text-emerald-500/40 font-mono hidden lg:block" title="Julian Serial">
                      {part.value || '...'}
                    </div>
                  </div>
                ) : part.operator === 'filetype:' || part.operator === 'ext:' ? (
                  <div className="flex-1 relative">
                    <input 
                      type="text"
                      list={`filetypes-${part.id}`}
                      value={part.value}
                      onChange={(e) => updatePart(part.id, { value: e.target.value })}
                      placeholder="extension (pdf, xlsx...)"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-100 shadow-inner"
                    />
                    <datalist id={`filetypes-${part.id}`}>
                      <option value="pdf" />
                      <option value="xlsx" />
                      <option value="docx" />
                      <option value="pptx" />
                      <option value="csv" />
                      <option value="txt" />
                      <option value="sql" />
                      <option value="log" />
                      <option value="env" />
                      <option value="xml" />
                      <option value="json" />
                    </datalist>
                  </div>
                ) : part.operator === 'before:' || part.operator === 'after:' ? (
                  <input 
                    type="date"
                    value={part.value}
                    onChange={(e) => updatePart(part.id, { value: e.target.value })}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-100 shadow-inner"
                  />
                ) : (
                  <input 
                    type="text"
                    value={part.value}
                    onChange={(e) => updatePart(part.id, { value: e.target.value })}
                    placeholder={
                      part.operator === '- (Exclude)' ? 'Exclude keyword...' :
                      part.operator === '-site:' ? 'Exclude domain (e.g. cbc.ca)...' :
                      part.operator === 'related:' ? 'URL (e.g. google.com)...' :
                      part.operator === 'allintext:' ? 'Keywords in body...' :
                      part.operator === '* (Wildcard)' ? 'Term variation...' :
                      part.operator === 'intitle:' ? 'Keyword in title...' :
                      part.operator === 'inurl:' ? 'Keyword in URL...' :
                      'value...'
                    }
                    className={`flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:outline-none transition-all shadow-inner ${
                      part.operator === '- (Exclude)' || part.operator === '-site:' ? 'text-red-300 placeholder:text-red-900/40 focus:ring-red-500' : 'text-slate-100 focus:ring-emerald-500'
                    }`}
                  />
                )}
              </div>
            </div>

            <button 
              onClick={() => removePart(part.id)}
              className="hidden sm:flex text-slate-600 hover:text-red-400 p-2 transition-all hover:scale-110 active:scale-90"
              title="Remove operator"
            >
              <i className="fas fa-trash-can"></i>
            </button>
          </div>
        ))}
        {parts.length === 0 && (
          <div className="text-center py-6 border-2 border-dashed border-slate-700 rounded-lg text-slate-500 text-sm">
            No operators added. Click "Add Operator" to begin.
          </div>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-3 flex items-center gap-2">
            <i className="fas fa-lightbulb text-amber-500"></i>
            Refinement Suggestions
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => addPart(s.op, s.val)}
                className="bg-slate-900/60 hover:bg-emerald-900/20 border border-slate-700 hover:border-emerald-500/50 p-2 rounded-lg text-left transition-all group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <i className={`fas ${s.icon} text-[10px] text-emerald-500/70 group-hover:text-emerald-400`}></i>
                  <span className="text-[10px] font-bold text-slate-300 group-hover:text-emerald-400">{s.label}</span>
                </div>
                <div className="text-[9px] font-mono text-slate-500 truncate">
                  {s.op}{s.val}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-slate-950 p-4 rounded-lg border border-slate-700 mb-6 shadow-inner">
        <div className="flex justify-between items-center mb-2">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest flex items-center gap-2">
            <i className="fas fa-eye text-emerald-500"></i>
            Live Query Preview
          </div>
          <button 
            onClick={() => navigator.clipboard.writeText(currentQuery)}
            className="text-[10px] text-slate-400 hover:text-emerald-400 uppercase font-bold transition-colors"
          >
            Copy Text
          </button>
        </div>
        <div className="font-mono text-emerald-400 break-all select-all text-sm leading-relaxed min-h-[1.5rem]">
          {currentQuery || <span className="text-slate-700 italic">Query string will appear here...</span>}
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={handleSearch}
          disabled={!currentQuery}
          className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/10"
        >
          <i className="fab fa-google"></i> Run Search
        </button>
        <button 
          onClick={saveDork}
          disabled={!currentQuery}
          className="px-5 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 transition-colors border border-slate-600"
          title="Save to Library"
        >
          <i className="fas fa-save"></i>
        </button>
      </div>
    </div>
  );
};

export default DorkBuilder;

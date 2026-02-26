
import React from 'react';

const Methodology: React.FC = () => {
  const workflow = [
    {
      phase: 4,
      name: "Collection Phase",
      objective: "Collect only what supports the objective.",
      best_practices: [
        "Log source URL, date, and context",
        "Capture screenshots or hashes for volatile content",
        "Preserve original wording (don’t paraphrase yet)",
        "Separate raw data from analysis notes",
        "Avoid automation unless legally permitted."
      ]
    },
    {
      phase: 5,
      name: "Validation & Corroboration",
      objective: "No single source is sufficient.",
      apply: [
        "Cross‑source verification",
        "Timeline consistency checks",
        "Metadata analysis",
        "Source credibility weighting"
      ],
      red_flags: [
        "Circular reporting",
        "Anonymous claims without corroboration",
        "Edited or reposted content without originals"
      ]
    },
    {
      phase: 6,
      name: "Analysis & Synthesis",
      objective: "Turn data into insight.",
      techniques: [
        "Timeline reconstruction",
        "Network mapping (people, entities, assets)",
        "Pattern recognition",
        "Gap analysis (what’s missing matters)"
      ],
      label_clearly: [
        "Fact",
        "Inference",
        "Unverified claim"
      ]
    },
    {
      phase: 7,
      name: "Reporting & Documentation",
      objective: "Your output should survive scrutiny.",
      include: [
        "Executive summary",
        "Methodology",
        "Key findings",
        "Confidence levels",
        "Limitations",
        "Source appendix"
      ],
      guidelines: [
        "Use neutral language.",
        "Avoid speculation."
      ]
    },
    {
      phase: 8,
      name: "Review & Ethics Check",
      objective: "OSINT is about responsible transparency, not exposure.",
      before_sharing: [
        "Confirm compliance with laws and platform terms",
        "Remove unnecessary personal data",
        "Reassess harm vs. public interest"
      ]
    }
  ];

  return (
    <div className="space-y-8 pb-20">
      <div className="bg-gradient-to-r from-emerald-900/20 to-transparent p-8 rounded-2xl border border-emerald-600/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/40">
            <i className="fas fa-clipboard-list text-xl"></i>
          </div>
          <div>
            <h2 className="text-3xl font-bold">OSINT Methodology</h2>
            <p className="text-slate-400">Professional workflow for investigative transparency.</p>
          </div>
        </div>
        <div className="flex gap-4 mt-6">
          <div className="bg-slate-950/50 border border-emerald-500/20 p-4 rounded-xl flex-1">
            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest block mb-1">Pro Insight</span>
            <p className="text-sm italic text-slate-300">"Good OSINT is slow, boring, and precise."</p>
          </div>
          <div className="bg-slate-950/50 border border-red-500/20 p-4 rounded-xl flex-1">
            <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest block mb-1">Warning</span>
            <p className="text-sm italic text-slate-300">"Bad OSINT is fast, exciting, and wrong."</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {workflow.map((item) => (
          <div key={item.phase} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden group hover:border-emerald-500/30 transition-all">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-48 bg-slate-950 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800">
                <span className="text-4xl font-black text-emerald-500/20 group-hover:text-emerald-500/40 transition-colors">0{item.phase}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Phase</span>
              </div>
              <div className="flex-1 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-100">{item.name}</h3>
                    <p className="text-emerald-400 text-sm font-medium mt-1">{item.objective}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {item.best_practices && (
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Best Practices</h4>
                      <ul className="space-y-2">
                        {item.best_practices.map((bp, i) => (
                          <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                            <i className="fas fa-check text-emerald-500 text-[10px] mt-1"></i>
                            {bp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.apply && (
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Application</h4>
                      <ul className="space-y-2">
                        {item.apply.map((a, i) => (
                          <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                            <i className="fas fa-layer-group text-blue-500 text-[10px] mt-1"></i>
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.red_flags && (
                    <div>
                      <h4 className="text-[10px] font-bold text-red-500/70 uppercase tracking-widest mb-3">Red Flags</h4>
                      <ul className="space-y-2">
                        {item.red_flags.map((rf, i) => (
                          <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                            <i className="fas fa-triangle-exclamation text-red-500 text-[10px] mt-1"></i>
                            {rf}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.techniques && (
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Techniques</h4>
                      <ul className="space-y-2">
                        {item.techniques.map((t, i) => (
                          <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                            <i className="fas fa-microscope text-purple-500 text-[10px] mt-1"></i>
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.label_clearly && (
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Label Clearly</h4>
                      <div className="flex flex-wrap gap-2">
                        {item.label_clearly.map((l, i) => (
                          <span key={i} className="px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[10px] text-slate-300 font-bold uppercase tracking-tighter">
                            {l}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.include && (
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Include in Report</h4>
                      <ul className="space-y-2">
                        {item.include.map((inc, i) => (
                          <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                            <i className="fas fa-file-contract text-amber-500 text-[10px] mt-1"></i>
                            {inc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.before_sharing && (
                    <div className="col-span-full">
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Before Sharing</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {item.before_sharing.map((bs, i) => (
                          <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-center gap-3">
                            <i className="fas fa-shield-halved text-emerald-500"></i>
                            {bs}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Methodology;

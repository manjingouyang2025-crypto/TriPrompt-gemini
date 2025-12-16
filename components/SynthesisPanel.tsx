import React from 'react';
import { SynthesisResult, AppStatus } from '../types';

interface SynthesisPanelProps {
  synthesis: SynthesisResult | null;
  status: AppStatus;
  onSavePrompt: (prompt: string, label: string) => void;
}

const SynthesisPanel: React.FC<SynthesisPanelProps> = ({ synthesis, status, onSavePrompt }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!synthesis && status !== AppStatus.SYNTHESIZING) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center bg-white">
        <p className="text-sm font-medium">This is where Old TriPrompt blends the three persona drafts into a master version — the strongest synthesis of all perspectives.</p>
      </div>
    );
  }

  if (status === AppStatus.SYNTHESIZING) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-slate-600 font-medium">Synthesizing the strongest insights...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto p-6">
      {/* Master Draft */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Master Draft</h2>
        <p className="text-sm text-slate-500 mb-4">
          A refined synthesis combining the strongest elements from all three perspectives.
        </p>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 shadow-sm relative group mb-4">
          <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
            {synthesis?.masterDraft}
          </div>
          <button 
            onClick={() => synthesis && copyToClipboard(synthesis.masterDraft)}
            className="absolute top-2 right-2 bg-white p-1.5 rounded text-slate-500 hover:text-purple-600 border border-purple-100 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Copy
          </button>
        </div>

        <div className="bg-slate-50 rounded-md p-4 border border-slate-100">
           <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contribution Map</h3>
           <ul className="space-y-2">
             {synthesis?.contributions.map((item, i) => (
               <li key={i} className="text-sm text-slate-600 flex items-start">
                 <span className="text-purple-400 mr-2">•</span>
                 {item}
               </li>
             ))}
           </ul>
        </div>
      </section>

      {/* Prompt Intelligence */}
      <section className="mt-auto border-t border-slate-100 pt-6">
        <div className="flex items-center justify-between mb-4">
           <h2 className="text-lg font-bold text-slate-800">Prompt Intelligence</h2>
           <button className="text-slate-400" title="Old TriPrompt evaluates your inputs, drafts, and choices to recommend a better prompt for future tasks.">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
           </button>
        </div>

        <div className="mb-4">
           {synthesis?.promptFeedback.map((feedback, i) => (
             <div key={i} className="text-sm text-slate-600 mb-1 flex">
               <span className="text-green-500 mr-2">✓</span> {feedback}
             </div>
           ))}
        </div>

        <div className="bg-slate-900 text-slate-100 p-4 rounded-lg relative group">
           <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Improved Prompt v2</h4>
           <div className="text-sm font-mono whitespace-pre-wrap">
             {synthesis?.improvedPrompt}
           </div>
            <button 
            onClick={() => synthesis && copyToClipboard(synthesis.improvedPrompt)}
            className="absolute top-2 right-2 bg-slate-800 p-1.5 rounded text-slate-300 hover:text-white border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Copy
          </button>
        </div>

        <div className="mt-4">
          <button 
             onClick={() => synthesis && onSavePrompt(synthesis.improvedPrompt, `v2 - ${new Date().toLocaleDateString()}`)}
             className="w-full py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-md hover:bg-slate-50 transition-colors"
          >
            Save to Toolbox
          </button>
        </div>
      </section>
    </div>
  );
};

export default SynthesisPanel;
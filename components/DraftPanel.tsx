import React from 'react';
import { GoldenPromptResult, Draft, AppStatus } from '../types';

interface DraftPanelProps {
  goldenResult: GoldenPromptResult | null;
  drafts: Draft[];
  status: AppStatus;
  onGenerateDrafts: () => void;
  onSynthesize: () => void;
}

const DraftPanel: React.FC<DraftPanelProps> = ({ 
  goldenResult, 
  drafts, 
  status,
  onGenerateDrafts,
  onSynthesize
}) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!goldenResult && status !== AppStatus.GENERATING_GOLDEN) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center bg-slate-50 border-l border-r border-slate-200">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
        <p className="font-medium text-slate-500 mb-2">Old TriPrompt is waiting for your materials, goal, and personas.</p>
        <p className="text-sm">Once you’re ready, we’ll design your Golden Prompt and generate three persona-driven perspectives.</p>
      </div>
    );
  }

  if (status === AppStatus.GENERATING_GOLDEN) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 border-l border-r border-slate-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mb-4"></div>
        <p className="text-slate-600 font-medium">Designing your Golden Prompt...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 border-l border-r border-slate-200 overflow-y-auto">
      {/* Golden Prompt Section */}
      {goldenResult && (
        <div className="p-6 bg-white border-b border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Your Golden Prompt</h2>
              <p className="text-sm text-slate-500 mt-1">
                Old TriPrompt analyzed your inputs and crafted an optimized starting prompt.
              </p>
            </div>
            <button className="text-slate-400 hover:text-brand-600" title="Golden Prompt is a task-specific prompt generated from your goals, personas, and source material.">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>

          <div className="bg-amber-50 border border-amber-100 p-4 rounded-md my-4 relative group">
            <pre className="text-xs text-slate-800 whitespace-pre-wrap font-mono">
              {goldenResult.goldenPrompt}
            </pre>
            <button 
              onClick={() => copyToClipboard(goldenResult.goldenPrompt)}
              className="absolute top-2 right-2 bg-white bg-opacity-90 p-1.5 rounded text-slate-600 hover:text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity border border-slate-200"
            >
              Copy
            </button>
          </div>

          <div className="flex space-x-2">
             {status === AppStatus.READY_FOR_DRAFTS ? (
               <button 
                onClick={onGenerateDrafts}
                className="bg-brand-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-700 shadow-sm"
               >
                 Use Prompt for Drafts
               </button>
             ) : (
                <button disabled className="text-slate-400 px-4 py-2 text-sm">
                   Drafts Generated
                </button>
             )}
          </div>
        </div>
      )}

      {/* Drafts Section */}
      <div className="p-6 flex-1 bg-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Three Perspectives</h3>

        {status === AppStatus.GENERATING_DRAFTS && (
           <div className="flex flex-col items-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mb-2"></div>
              <p className="text-slate-500 text-sm">Generating three perspectives...</p>
           </div>
        )}

        <div className="space-y-4">
          {drafts.map((draft, idx) => (
            <div key={idx} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-slate-800 text-sm">Persona {idx+1} — {draft.perspectiveRole}</h4>
                <div className="flex space-x-1">
                   <button 
                    onClick={() => copyToClipboard(draft.content)}
                    className="text-xs text-slate-400 hover:text-brand-600 px-2 py-1"
                   >
                     Copy
                   </button>
                </div>
              </div>
              
              <div className="max-h-40 overflow-y-auto text-sm text-slate-600 whitespace-pre-wrap leading-relaxed pr-1 mb-2">
                {draft.content}
              </div>
            </div>
          ))}
        </div>

        {drafts.length === 3 && status === AppStatus.READY_FOR_SYNTHESIS && (
          <div className="mt-6 flex justify-center">
             <button 
              onClick={onSynthesize}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 shadow-md flex items-center"
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
               Synthesize Master Draft
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DraftPanel;
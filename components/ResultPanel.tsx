import React, { useState } from 'react';
import { PromptUpgradeResult, Draft, AppStatus } from '../types';

interface ResultPanelProps {
  result: PromptUpgradeResult | null;
  status: AppStatus;
  progressMsg?: string;
  onSave: (content: string) => void;
}

const ResultPanel: React.FC<ResultPanelProps> = ({ result, status, progressMsg, onSave }) => {
  const [expandedDraft, setExpandedDraft] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (status === AppStatus.IDLE && !result) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50 p-8 text-center">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-600 mb-2">Ready to Upgrade</h3>
        <p className="max-w-md">Enter your goal on the left. TriPrompt will simulate perspectives to build a robust, production-ready prompt.</p>
      </div>
    );
  }

  if (status === AppStatus.PROCESSING) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50">
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-800 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <h3 className="text-xl font-bold text-slate-800 animate-pulse">{progressMsg || "Thinking..."}</h3>
        <p className="text-slate-500 mt-2">Simulating perspectives & optimizing...</p>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full p-6 md:p-10 pb-20">
        
        {/* 1. HERO: FINAL DRAFT (NEW PRIMARY) */}
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-2xl font-bold text-slate-900 flex items-center">
               <span className="bg-brand-100 text-brand-700 p-1.5 rounded-md mr-3">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l-.9-1.35a1 1 0 00-1.664 0l-.9 1.35H5a2 2 0 01-2-2V5zm5 11v-1h4v1a1 1 0 01-1 1H9a1 1 0 01-1-1z" clipRule="evenodd" />
                   <path d="M10 13a3 3 0 100-6 3 3 0 000 6z" />
                 </svg>
               </span>
               Final Draft
             </h2>
             <button 
                onClick={() => copyToClipboard(result.finalDraft)}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 border border-slate-200 px-3 py-1 rounded bg-white"
             >
               Copy Draft
             </button>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 md:p-8">
            <pre className="whitespace-pre-wrap font-sans text-base text-slate-800 leading-relaxed">
              {result.finalDraft}
            </pre>
            
            {/* Trade-offs Section (Nested in Final Draft Card) */}
            {result.tradeOffsResolved && result.tradeOffsResolved.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Trade-offs Resolved</h4>
                     <ul className="space-y-3">
                       {result.tradeOffsResolved.map((point, i) => (
                         <li key={i} className="flex items-start text-sm text-slate-600 bg-slate-50/80 p-3 rounded border border-slate-100">
                           <span className="text-brand-500 mr-2 font-bold mt-0.5">↳</span>
                           {point}
                         </li>
                       ))}
                     </ul>
                </div>
            )}
          </div>
        </div>

        {/* 2. IMPROVED PROMPT (SECONDARY HERO) */}
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-75">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-bold text-slate-700 flex items-center">
               <span className="text-green-600 mr-2">⚡</span>
               Improved Prompt
             </h3>
             <button 
                onClick={() => onSave(result.improvedPrompt)}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 underline underline-offset-4"
             >
               Save to Toolbox
             </button>
          </div>
          
          <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden relative group">
            <div className="p-6">
              <pre className="whitespace-pre-wrap font-mono text-sm text-slate-200 leading-relaxed">
                {result.improvedPrompt}
              </pre>
            </div>
            <div className="bg-slate-900 px-6 py-2 border-t border-slate-700 flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Instruction Set</span>
              <button 
                onClick={() => copyToClipboard(result.improvedPrompt)}
                className="text-slate-300 hover:text-white text-xs font-bold uppercase"
              >
                Copy Prompt
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
           {/* 3. WHY IT IS BETTER */}
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
             <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Why This Works</h3>
             <ul className="space-y-3">
               {result.whyItIsBetter.map((point, i) => (
                 <li key={i} className="flex items-start text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                   <span className="text-accent-500 mr-2 mt-0.5">•</span>
                   {point}
                 </li>
               ))}
             </ul>
           </div>

           {/* 4. GENERALIZABLE INSIGHT */}
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
             <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Prompt Intelligence</h3>
             <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl h-full flex flex-col justify-center">
               <div className="text-blue-500 text-xs font-bold uppercase mb-2">Key Lesson</div>
               <p className="text-lg font-medium leading-relaxed text-blue-900">
                 "{result.generalizableInsight}"
               </p>
             </div>
           </div>
        </div>

        {/* 5. SUPPORTING PERSPECTIVES (EVIDENCE) */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
           <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-t border-slate-200 pt-8">
             Supporting Perspectives (Evidence)
           </h3>
           <div className="grid grid-cols-1 gap-4">
             {result.drafts.map((draft, i) => (
               <div key={i} className="bg-white border border-slate-200 rounded-lg overflow-hidden transition-all hover:shadow-md">
                 <div 
                   className="p-4 flex items-center justify-between cursor-pointer bg-slate-50/50 hover:bg-slate-50"
                   onClick={() => setExpandedDraft(expandedDraft === draft.perspectiveId ? null : draft.perspectiveId)}
                 >
                   <div className="flex items-center">
                     <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs mr-3">
                       {i + 1}
                     </div>
                     <div>
                       <h4 className="font-bold text-slate-800 text-sm">{draft.perspectiveRole}</h4>
                       <p className="text-xs text-slate-500">{draft.keyPoint}</p>
                     </div>
                   </div>
                   <button className="text-slate-400">
                     {expandedDraft === draft.perspectiveId ? (
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                         <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                       </svg>
                     ) : (
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                         <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                       </svg>
                     )}
                   </button>
                 </div>
                 {expandedDraft === draft.perspectiveId && (
                   <div className="p-4 bg-white border-t border-slate-100 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                     {draft.content}
                   </div>
                 )}
               </div>
             ))}
           </div>
        </div>

      </div>
    </div>
  );
};

export default ResultPanel;
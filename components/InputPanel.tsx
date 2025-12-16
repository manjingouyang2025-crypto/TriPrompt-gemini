import React, { useState, useEffect } from 'react';
import { Perspective, AppStatus } from '../types';
import { suggestPerspectives } from '../services/geminiService';

interface InputPanelProps {
  source: string;
  setSource: (s: string) => void;
  goal: string;
  setGoal: (s: string) => void;
  perspectives: Perspective[];
  setPerspectives: (p: Perspective[]) => void;
  status: AppStatus;
  onGenerate: () => void;
  onError: (msg: string) => void;
}

const PLACEHOLDERS = [
  "Explain a technical design decision to non-engineers...",
  "Turn meeting notes into a structured proposal...",
  "Draft a persuasive internal memo for budget approval...",
  "Write a cold outreach email to a potential partner...",
  "Create a launch announcement for a new feature..."
];

const InputPanel: React.FC<InputPanelProps> = ({
  source, setSource,
  goal, setGoal,
  perspectives, setPerspectives,
  status, onGenerate, onError
}) => {
  const [loadingPerspectives, setLoadingPerspectives] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx(prev => (prev + 1) % PLACEHOLDERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSuggest = async () => {
    if (!goal) {
      onError("Please enter a goal first.");
      return;
    }
    setLoadingPerspectives(true);
    try {
      const suggested = await suggestPerspectives(goal);
      if (suggested && suggested.length > 0) {
        setPerspectives(suggested);
      } else {
        onError("Could not generate perspectives. Try refining your goal.");
      }
    } catch (e: any) {
      onError(e.message);
    } finally {
      setLoadingPerspectives(false);
    }
  };

  const updatePerspective = (idx: number, field: 'role' | 'context', value: string) => {
    const newP = [...perspectives];
    newP[idx] = { ...newP[idx], [field]: value };
    setPerspectives(newP);
  };

  const getPerspectivePlaceholder = (idx: number) => {
     switch(idx) {
        case 0: return "e.g., CFO reviewing budget impact · Senior Engineer · Hiring Manager · Famous expert · LinkedIn profile";
        case 1: return "e.g., End user · Legal reviewer · Product leader · Customer advocate";
        case 2: return "e.g., Skeptical stakeholder · Market analyst · Executive decision-maker";
        default: return "e.g. Role or Perspective";
     }
  };

  const getPerspectiveSubtext = (idx: number) => {
     switch(idx) {
        case 0: return "Focus on what this perspective cares most about.";
        case 1: return "Choose a perspective with different priorities than Perspective 1.";
        case 2: return "This often surfaces blind spots or risks.";
        default: return "";
     }
  };

  return (
    <div className="flex flex-col h-full bg-white p-6 overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">TriPrompt</h2>
        <p className="text-lg text-slate-500 font-medium">Write Better. Prompt Smarter.</p>
        <p className="text-sm text-slate-400 mt-2">
          A cognitive assistant that thinks through your goal from multiple angles to deliver a publish-ready answer — and a reusable prompt you can save to your Toolbox.
        </p>
      </div>

      {/* Inputs */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
            Your Goal
          </label>
          <textarea
            className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none text-slate-800 text-base h-32 resize-none transition-all"
            placeholder={PLACEHOLDERS[placeholderIdx]}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
        </div>

        <div>
           <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
            Context / Source (Optional)
          </label>
          <textarea
            className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none text-slate-700 text-sm h-24 resize-none transition-all"
            placeholder="Paste relevant background info, code, or constraints..."
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
        </div>

        <div>
          <div className="flex justify-between items-baseline mb-2">
             <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
              Customize Perspectives (Optional)
            </label>
            <button
              onClick={handleSuggest}
              disabled={loadingPerspectives || !goal}
              title="Suggest relevant perspectives based on your goal."
              className="text-xs font-semibold text-accent-600 hover:text-accent-800 disabled:opacity-50 transition-colors"
            >
              {loadingPerspectives ? 'Thinking...' : 'Auto-Suggest Roles'}
            </button>
          </div>
          
          <p className="text-sm text-slate-500 leading-relaxed mb-5">
            Think about up to three relevant roles, people, or viewpoints that would challenge or improve this work.
            <br className="hidden md:block" />
            If nothing comes to mind, TriPrompt will infer the most useful perspectives automatically.
          </p>
          
          <div className="space-y-4">
            {perspectives.map((p, idx) => (
              <div key={p.id} className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm focus-within:ring-1 focus-within:ring-accent-500 transition-shadow hover:shadow-md">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                   Perspective {idx + 1}
                </label>
                <input 
                  type="text"
                  placeholder={getPerspectivePlaceholder(idx)}
                  className="text-sm font-bold text-slate-800 placeholder-slate-300 outline-none mb-2 w-full border-b border-transparent focus:border-accent-200 transition-colors"
                  value={p.role}
                  onChange={(e) => updatePerspective(idx, 'role', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Context or Bio (Optional)"
                  className="text-xs text-slate-600 placeholder-slate-300 outline-none w-full"
                  value={p.context}
                  onChange={(e) => updatePerspective(idx, 'context', e.target.value)}
                />
                <p className="text-xs text-slate-400 mt-2">
                   {getPerspectiveSubtext(idx)}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4 leading-relaxed">
            You can paste a LinkedIn profile, type a role, or name a well-known person.
            <br/>
            TriPrompt reasons at the role level, not as fictional characters.
          </p>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <button
          onClick={onGenerate}
          disabled={!goal || status === AppStatus.PROCESSING}
          className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transform active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
        >
          {status === AppStatus.PROCESSING ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Thinking...
            </>
          ) : (
            "Upgrade My Prompt & Generate a Publish-Ready Answer"
          )}
        </button>
      </div>
    </div>
  );
};

export default InputPanel;
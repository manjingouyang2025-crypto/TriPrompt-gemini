import React, { useState } from 'react';
import InputPanel from './components/InputPanel';
import ResultPanel from './components/ResultPanel';
import Toolbox from './components/Toolbox';
import HistoryModal from './components/HistoryModal';
import { AppStatus, PromptUpgradeResult, Perspective, Draft, SavedPrompt, RunHistoryItem } from './types';
import { generatePerspectiveDraft, generatePromptUpgrade } from './services/geminiService';

const createDefaultPerspectives = (): Perspective[] => [
  { id: `p1-${Date.now()}`, role: '', context: '' },
  { id: `p2-${Date.now()}`, role: '', context: '' },
  { id: `p3-${Date.now()}`, role: '', context: '' },
];

const App: React.FC = () => {
  const [source, setSource] = useState('');
  const [goal, setGoal] = useState('');
  const [perspectives, setPerspectives] = useState<Perspective[]>(createDefaultPerspectives());
  
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [progressMsg, setProgressMsg] = useState('');
  const [result, setResult] = useState<PromptUpgradeResult | null>(null);

  const [isToolboxOpen, setIsToolboxOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [toolboxRefreshTrigger, setToolboxRefreshTrigger] = useState(0);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);

  const handleError = (msg: string) => {
    alert(msg); // Simple alert for now
    setStatus(AppStatus.IDLE);
  };

  const handleReset = () => {
    if (goal && !confirm("Are you sure you want to clear everything and start a new run?")) {
      return;
    }
    setGoal('');
    setSource('');
    setPerspectives(createDefaultPerspectives());
    setResult(null);
    setStatus(AppStatus.IDLE);
  };

  const handleRun = async () => {
    setStatus(AppStatus.PROCESSING);
    setResult(null);

    try {
      // 1. Prepare Perspectives
      let activePerspectives = perspectives.filter(p => p.role.trim() !== '');
      if (activePerspectives.length === 0) {
        // Fallback hardcoded if user didn't use auto-suggest
        activePerspectives = [
          { id: 'fb1', role: 'Critical Skeptic', context: 'Focus on flaws and risks.' },
          { id: 'fb2', role: 'Domain Expert', context: 'Focus on accuracy and depth.' },
          { id: 'fb3', role: 'Layperson Audience', context: 'Focus on clarity and simplicity.' }
        ];
      }

      // 2. Generate Drafts (Parallel)
      setProgressMsg("Simulating 3 Perspectives...");
      const draftPromises = activePerspectives.map(p => 
        generatePerspectiveDraft(p, goal, source)
      );
      const drafts = await Promise.all(draftPromises);

      // 3. Synthesize Upgrade
      setProgressMsg("Synthesizing Insights & Upgrading Prompt...");
      const upgrade = await generatePromptUpgrade(goal, drafts);

      const finalResult: PromptUpgradeResult = {
        ...upgrade,
        drafts
      };

      setResult(finalResult);
      setStatus(AppStatus.COMPLETE);

      // Save History (Optimization: Limit to last 50 items to protect localStorage size)
      const runItem: RunHistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        originalGoal: goal,
        perspectives: activePerspectives,
        result: finalResult
      };
      
      const rawHist = localStorage.getItem('triPrompt_history');
      let list = rawHist ? JSON.parse(rawHist) : [];
      list.push(runItem);
      
      // Keep only last 50
      if (list.length > 50) {
        list = list.slice(list.length - 50);
      }
      
      localStorage.setItem('triPrompt_history', JSON.stringify(list));
      setHistoryRefreshTrigger(prev => prev + 1);

    } catch (e: any) {
      handleError("Something went wrong: " + e.message);
    }
  };

  const handleSavePrompt = (content: string) => {
    const newPrompt: SavedPrompt = {
      id: Date.now().toString(),
      label: `Upgrade: ${goal.slice(0, 20)}...`,
      content,
      timestamp: Date.now()
    };
    const raw = localStorage.getItem('triPrompt_toolbox');
    const list = raw ? JSON.parse(raw) : [];
    list.push(newPrompt);
    localStorage.setItem('triPrompt_toolbox', JSON.stringify(list));
    setToolboxRefreshTrigger(prev => prev + 1);
    alert("Saved to Toolbox!");
  };

  const applySavedPrompt = (content: string) => {
    setGoal(content);
    // Logic to maybe reset result?
    setResult(null);
    setStatus(AppStatus.IDLE);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-3 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => { setResult(null); setStatus(AppStatus.IDLE); }}>
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white shrink-0">
             <span className="font-bold text-lg">T</span>
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">TriPrompt</span>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleReset}
            className="text-sm font-bold text-slate-700 hover:text-brand-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md transition-colors mr-2"
          >
            + New Run
          </button>
          
          <div className="h-5 w-px bg-slate-300 mx-2 hidden md:block"></div>

          <button onClick={() => setIsHistoryOpen(true)} className="text-sm font-medium text-slate-500 hover:text-slate-900 px-2">History</button>
          <button onClick={() => setIsToolboxOpen(true)} className="text-sm font-medium text-slate-500 hover:text-slate-900 px-2">Toolbox</button>
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Input */}
        <div className="w-full md:w-5/12 border-r border-slate-200 bg-white z-0 relative shadow-xl md:shadow-none">
          <InputPanel 
            source={source} setSource={setSource}
            goal={goal} setGoal={setGoal}
            perspectives={perspectives} setPerspectives={setPerspectives}
            status={status}
            onGenerate={handleRun}
            onError={handleError}
          />
        </div>

        {/* Right: Results */}
        <div className="w-full md:w-7/12 bg-slate-50 relative">
          <ResultPanel 
            result={result}
            status={status}
            progressMsg={progressMsg}
            onSave={handleSavePrompt}
          />
        </div>
      </div>

      <Toolbox 
        isOpen={isToolboxOpen} 
        onClose={() => setIsToolboxOpen(false)} 
        onApply={applySavedPrompt} 
        triggerRefresh={toolboxRefreshTrigger}
      />
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        triggerRefresh={historyRefreshTrigger}
      />
    </div>
  );
};

export default App;
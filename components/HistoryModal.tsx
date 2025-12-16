import React, { useState, useEffect } from 'react';
import { RunHistoryItem } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRefresh: number;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, triggerRefresh }) => {
  const [history, setHistory] = useState<RunHistoryItem[]>([]);
  const [selectedRun, setSelectedRun] = useState<RunHistoryItem | null>(null);

  const loadHistory = () => {
    const raw = localStorage.getItem('triPrompt_history');
    if (raw) {
      try {
        setHistory(JSON.parse(raw).reverse());
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    } else {
        setHistory([]);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [isOpen, triggerRefresh]);

  const clearHistory = () => {
    if (confirm("Are you sure you want to delete all history? This cannot be undone.")) {
        localStorage.removeItem('triPrompt_history');
        setHistory([]);
        setSelectedRun(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-4xl h-5/6 rounded-xl shadow-2xl flex flex-col overflow-hidden" 
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Run History</h2>
          <div className="flex items-center space-x-4">
             {history.length > 0 && (
                 <button onClick={clearHistory} className="text-xs text-red-500 hover:text-red-700 font-medium">Clear History</button>
             )}
             <button onClick={onClose} className="text-slate-500 hover:text-slate-800">Close</button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* List Sidebar */}
          <div className="w-1/3 border-r border-slate-200 overflow-y-auto bg-slate-50 p-2">
            {history.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">No history yet.</div>
            ) : (
              history.map(run => (
                <div 
                  key={run.id} 
                  onClick={() => setSelectedRun(run)}
                  className={`p-3 mb-2 rounded cursor-pointer border transition-colors ${selectedRun?.id === run.id ? 'bg-white border-slate-400 shadow-sm' : 'border-transparent hover:bg-slate-100'}`}
                >
                  <div className="text-xs text-slate-400 mb-1">
                    {new Date(run.timestamp).toLocaleString()}
                  </div>
                  <div className="text-sm font-semibold text-slate-800 line-clamp-2 mb-1">
                    {run.originalGoal || "No Goal"}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Details View */}
          <div className="w-2/3 overflow-y-auto p-6 bg-white">
            {selectedRun ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Original Goal</h3>
                  <div className="bg-slate-50 p-3 rounded text-sm text-slate-700">{selectedRun.originalGoal}</div>
                </div>
                
                {/* Final Draft Display for History */}
                <div>
                  <h3 className="text-sm font-bold text-brand-600 uppercase tracking-wider mb-2">Final Draft</h3>
                  <div className="bg-white border border-slate-200 p-4 rounded-lg text-sm text-slate-900 whitespace-pre-wrap shadow-sm">
                    {selectedRun.result.finalDraft || "No draft available."}
                    
                    {/* Trade-offs in history */}
                    {selectedRun.result.tradeOffsResolved && selectedRun.result.tradeOffsResolved.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                             <div className="text-xs font-bold text-slate-400 uppercase mb-2">Trade-offs Resolved</div>
                             <ul className="space-y-1">
                               {selectedRun.result.tradeOffsResolved.map((point, i) => (
                                 <li key={i} className="text-xs text-slate-500 flex items-start">
                                   <span className="mr-1 text-brand-500 font-bold">↳</span> {point}
                                 </li>
                               ))}
                             </ul>
                        </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-green-600 uppercase tracking-wider mb-2">Improved Prompt</h3>
                  <div className="bg-slate-800 p-4 rounded-lg text-sm text-slate-200 font-mono whitespace-pre-wrap shadow-sm">
                    {selectedRun.result.improvedPrompt}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Why It Works</h3>
                  <ul className="list-disc list-inside text-sm text-slate-600">
                    {selectedRun.result.whyItIsBetter.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
                
                 <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Insight</h3>
                   <div className="bg-blue-50 text-blue-900 p-3 rounded text-sm">
                     {selectedRun.result.generalizableInsight}
                   </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <p>Select a run to view details.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
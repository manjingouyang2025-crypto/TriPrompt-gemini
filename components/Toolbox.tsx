import React, { useState, useEffect } from 'react';
import { SavedPrompt } from '../types';

interface ToolboxProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (content: string) => void;
  triggerRefresh: number;
}

const Toolbox: React.FC<ToolboxProps> = ({ isOpen, onClose, onApply, triggerRefresh }) => {
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem('triPrompt_toolbox');
    if (raw) {
      setSavedPrompts(JSON.parse(raw).reverse());
    }
  }, [isOpen, triggerRefresh]);

  const handleDelete = (id: string) => {
    const updated = savedPrompts.filter(p => p.id !== id);
    setSavedPrompts(updated);
    localStorage.setItem('triPrompt_toolbox', JSON.stringify(updated.reverse()));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-md h-3/4 rounded-xl shadow-2xl flex flex-col overflow-hidden" 
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Your Toolbox</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">Close</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {savedPrompts.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p>No prompts saved yet.</p>
            </div>
          ) : (
            savedPrompts.map(prompt => (
              <div key={prompt.id} className="border border-slate-200 rounded-lg p-3 hover:border-slate-300 transition-colors">
                 <div className="flex justify-between items-start mb-2">
                   <h3 className="font-bold text-slate-700 text-sm truncate pr-2">{prompt.label}</h3>
                   <span className="text-xs text-slate-400 shrink-0">{new Date(prompt.timestamp).toLocaleDateString()}</span>
                 </div>
                 <p className="text-xs text-slate-500 line-clamp-3 mb-3 font-mono bg-slate-50 p-2 rounded">
                   {prompt.content}
                 </p>
                 <div className="flex justify-end space-x-2">
                    <button 
                      onClick={() => handleDelete(prompt.id)}
                      className="text-xs text-red-500 hover:text-red-700 px-2 py-1"
                    >
                      Delete
                    </button>
                    <button 
                      onClick={() => copyToClipboard(prompt.content)}
                      className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1"
                    >
                      Copy
                    </button>
                    <button 
                      onClick={() => { onApply(prompt.content); onClose(); }}
                      className="text-xs bg-slate-900 text-white hover:bg-slate-700 font-medium px-3 py-1 rounded"
                    >
                      Apply
                    </button>
                 </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Toolbox;
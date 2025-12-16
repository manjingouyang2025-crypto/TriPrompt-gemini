export interface Perspective {
  id: string;
  role: string; // e.g., "Chief Technology Officer" or "Skeptic"
  context: string; // Background/Context
}

export interface Draft {
  perspectiveId: string;
  perspectiveRole: string;
  content: string;
  keyPoint: string; // A one-line summary of this perspective's main contribution
}

export interface PromptUpgradeResult {
  finalDraft: string; // The completed writing goal (New Primary)
  improvedPrompt: string; // The Reusable Artifact
  whyItIsBetter: string[]; // 3 bullet points
  generalizableInsight: string; // "When writing for X, always Y"
  tradeOffsResolved?: string[]; // 1-2 bullets explaining resolved trade-offs (Optional for backward compatibility)
  drafts: Draft[]; // Supporting evidence
}

export interface GoldenPromptResult {
  goldenPrompt: string;
}

export interface SynthesisResult {
  masterDraft: string;
  contributions: string[];
  promptFeedback: string[];
  improvedPrompt: string;
}

export interface SavedPrompt {
  id: string;
  label: string;
  content: string;
  timestamp: number;
}

export interface RunHistoryItem {
  id: string;
  timestamp: number;
  originalGoal: string;
  perspectives: Perspective[];
  result: PromptUpgradeResult;
}

export enum AppStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING', // Generic busy state
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
  // Extended statuses for DraftPanel and SynthesisPanel
  GENERATING_GOLDEN = 'GENERATING_GOLDEN',
  READY_FOR_DRAFTS = 'READY_FOR_DRAFTS',
  GENERATING_DRAFTS = 'GENERATING_DRAFTS',
  READY_FOR_SYNTHESIS = 'READY_FOR_SYNTHESIS',
  SYNTHESIZING = 'SYNTHESIZING'
}
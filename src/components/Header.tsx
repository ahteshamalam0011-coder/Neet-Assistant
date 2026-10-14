import React from 'react';
import { ShieldCheck, Sparkles, BookOpen } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenBackup: () => void;
  onOpenCopilot: () => void;
  dueCardsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenBackup,
  onOpenCopilot,
  dueCardsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className="text-lg font-bold tracking-tight text-slate-100 hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
          neet assistant
        </button>

        {/* Zone 2: 4-5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'dashboard'
                ? 'text-white border-b-2 border-emerald-500 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('planner')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'planner'
                ? 'text-white border-b-2 border-emerald-500 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Daily Plan
          </button>
          <button
            onClick={() => setActiveTab('syllabus')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'syllabus'
                ? 'text-white border-b-2 border-emerald-500 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Mastery Matrix
          </button>
          <button
            onClick={() => setActiveTab('revision')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 relative ${
              activeTab === 'revision'
                ? 'text-white border-b-2 border-emerald-500 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Spaced Repetition
            {dueCardsCount > 0 && (
              <span className="ml-1.5 text-xs text-amber-400 font-mono">
                ({dueCardsCount})
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'analytics'
                ? 'text-white border-b-2 border-emerald-500 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Mock Tests & Practice
          </button>
          <button
            onClick={() => setActiveTab('knowledge')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'knowledge'
                ? 'text-white border-b-2 border-emerald-500 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Knowledge Base
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenCopilot}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-750 hover:border-slate-600 rounded-lg transition-colors whitespace-nowrap shrink-0"
            title="Study Copilot & Concept Explainer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Copilot</span>
          </button>

          <button
            onClick={onOpenBackup}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Local Vault</span>
          </button>
        </div>
      </div>
    </header>
  );
};

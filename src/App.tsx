import React, { useState, useEffect } from 'react';
import { AppState, TopicItem, Flashcard, MockTest, PracticeLog, DailyPlanItem, DayReflection, FocusSession, KnowledgeNote } from './types';
import { loadAppState, saveAppState } from './utils/storage';
import { computeDailyOSAnswers } from './utils/recommendations';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { StudyPlanner } from './components/StudyPlanner';
import { SyllabusMastery } from './components/SyllabusMastery';
import { SpacedRepetition } from './components/SpacedRepetition';
import { MockTestAnalyzer } from './components/MockTestAnalyzer';
import { KnowledgeBase } from './components/KnowledgeBase';
import { FocusTimer } from './components/FocusTimer';
import { BackupPrivacyModal } from './components/BackupPrivacyModal';
import { AICopilotModal } from './components/AICopilotModal';
import { INITIAL_NEET_TOPICS } from './data/defaultSyllabus';
import { ShieldAlert, X, Clock, Play } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadAppState());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isFocusTimerOpen, setIsFocusTimerOpen] = useState(false);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(() => state.settings.showPrivacyNotice);

  // Sync to local storage on state update
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  const answers = computeDailyOSAnswers(state);

  const handleAddXP = (xp: number) => {
    setState((prev) => ({
      ...prev,
      userXP: prev.userXP + xp,
    }));
  };

  const handleUpdateTopic = (updatedTopic: TopicItem) => {
    setState((prev) => ({
      ...prev,
      topics: prev.topics.map((t) => (t.id === updatedTopic.id ? updatedTopic : t)),
    }));
  };

  const handleAddTopic = (newTopic: TopicItem) => {
    setState((prev) => ({
      ...prev,
      topics: [newTopic, ...prev.topics],
    }));
  };

  const handleDeleteTopic = (topicId: string) => {
    setState((prev) => ({
      ...prev,
      topics: prev.topics.filter((t) => t.id !== topicId),
    }));
  };

  const handleUpdateFlashcard = (updatedCard: Flashcard) => {
    setState((prev) => ({
      ...prev,
      flashcards: prev.flashcards.map((c) => (c.id === updatedCard.id ? updatedCard : c)),
    }));
  };

  const handleAddFlashcard = (newCard: Flashcard) => {
    setState((prev) => ({
      ...prev,
      flashcards: [newCard, ...prev.flashcards],
    }));
  };

  const handleAddMockTest = (test: MockTest) => {
    setState((prev) => ({
      ...prev,
      mockTests: [test, ...prev.mockTests],
    }));
  };

  const handleAddPracticeLog = (log: PracticeLog) => {
    setState((prev) => {
      // Also update verified accuracy of the matched topic if found
      const updatedTopics = prev.topics.map((t) => {
        if (t.name.toLowerCase() === log.topicName.toLowerCase()) {
          const newTotal = t.totalQuestionsPracticed + log.questionsAttempted;
          const currentCorrect = Math.round((t.verifiedAccuracy / 100) * t.totalQuestionsPracticed);
          const newCorrect = currentCorrect + log.correctCount;
          const newAccuracy = newTotal > 0 ? Math.round((newCorrect / newTotal) * 100) : t.verifiedAccuracy;
          return {
            ...t,
            totalQuestionsPracticed: newTotal,
            verifiedAccuracy: newAccuracy,
            lastStudiedDate: log.date,
          };
        }
        return t;
      });

      return {
        ...prev,
        topics: updatedTopics,
        practiceLogs: [log, ...prev.practiceLogs],
      };
    });
  };

  const handleUpdateDailyPlan = (date: string, items: DailyPlanItem[]) => {
    setState((prev) => ({
      ...prev,
      dailyPlans: {
        ...prev.dailyPlans,
        [date]: items,
      },
    }));
  };

  const handleTogglePlanItem = (planId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const current = state.dailyPlans[today] || [];
    const updated = current.map((p) => {
      if (p.id === planId) {
        if (!p.completed) handleAddXP(20);
        return { ...p, completed: !p.completed };
      }
      return p;
    });
    handleUpdateDailyPlan(today, updated);
  };

  const handleQuickAddPlanItem = (task: string, subject: any) => {
    const today = new Date().toISOString().split('T')[0];
    const current = state.dailyPlans[today] || [];
    const newItem: DailyPlanItem = {
      id: `task-${Date.now()}`,
      timeSlot: 'High Priority',
      task,
      subject: subject || 'General',
      type: 'concept_study',
      completed: false,
      priority: 'high',
      estimatedMinutes: 60,
    };
    handleUpdateDailyPlan(today, [newItem, ...current]);
  };

  const handleSaveReflection = (date: string, reflection: DayReflection) => {
    setState((prev) => ({
      ...prev,
      reflections: {
        ...prev.reflections,
        [date]: reflection,
      },
    }));
  };

  const handleSaveFocusSession = (session: FocusSession) => {
    setState((prev) => ({
      ...prev,
      focusSessions: [session, ...prev.focusSessions],
    }));
    setIsFocusTimerOpen(false);
  };

  const handleAddNote = (note: KnowledgeNote) => {
    setState((prev) => ({
      ...prev,
      notes: [note, ...prev.notes],
    }));
  };

  const handleDeleteNote = (noteId: string) => {
    setState((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== noteId),
    }));
  };

  const handleLoadNeetTemplate = () => {
    setState((prev) => ({
      ...prev,
      topics: INITIAL_NEET_TOPICS,
    }));
  };

  const handleDismissNotice = () => {
    setShowPrivacyNotice(false);
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, showPrivacyNotice: false },
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        dueCardsCount={answers.dueFlashcards.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Subtle Local-First Privacy Notice */}
        {showPrivacyNotice && (
          <div className="mb-6 p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span>
                <strong className="text-white">Local-First Assurance:</strong> Your study records, test scores, and notes are stored strictly in your browser. No accounts or remote tracking. Remember to export regular backups.
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setIsBackupOpen(true)}
                className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 whitespace-nowrap"
              >
                Backup Vault
              </button>
              <button
                onClick={handleDismissNotice}
                className="text-slate-500 hover:text-slate-300 p-1"
                title="Dismiss banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* View Routing */}
        {activeTab === 'dashboard' && (
          <DashboardOverview
            state={state}
            answers={answers}
            onNavigate={(tab) => setActiveTab(tab)}
            onStartFocus={() => setIsFocusTimerOpen(true)}
            onTogglePlanItem={handleTogglePlanItem}
            onQuickAddPlanItem={handleQuickAddPlanItem}
            onLoadNeetTemplate={handleLoadNeetTemplate}
          />
        )}

        {activeTab === 'planner' && (
          <StudyPlanner
            state={state}
            onUpdateDailyPlan={handleUpdateDailyPlan}
            onSaveReflection={handleSaveReflection}
            onAddXP={handleAddXP}
          />
        )}

        {activeTab === 'syllabus' && (
          <SyllabusMastery
            topics={state.topics}
            onUpdateTopic={handleUpdateTopic}
            onAddTopic={handleAddTopic}
            onDeleteTopic={handleDeleteTopic}
            onLoadNeetTemplate={handleLoadNeetTemplate}
          />
        )}

        {activeTab === 'revision' && (
          <SpacedRepetition
            flashcards={state.flashcards}
            onUpdateFlashcard={handleUpdateFlashcard}
            onAddFlashcard={handleAddFlashcard}
            onAddXP={handleAddXP}
          />
        )}

        {activeTab === 'analytics' && (
          <MockTestAnalyzer
            mockTests={state.mockTests}
            practiceLogs={state.practiceLogs}
            onAddMockTest={handleAddMockTest}
            onAddPracticeLog={handleAddPracticeLog}
            onAddXP={handleAddXP}
          />
        )}

        {activeTab === 'knowledge' && (
          <KnowledgeBase
            notes={state.notes}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
          />
        )}
      </main>

      {/* Floating Focus Timer Bar / Drawer Modal */}
      {isFocusTimerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="max-w-xl w-full my-8 relative">
            <button
              onClick={() => setIsFocusTimerOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
            <FocusTimer
              onSaveSession={handleSaveFocusSession}
              onAddXP={handleAddXP}
              soundEnabled={state.settings.audioChimesEnabled}
            />
          </div>
        </div>
      )}

      {/* Backup and Privacy Vault Modal */}
      <BackupPrivacyModal
        state={state}
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onRestoreState={(restored) => {
          setState(restored);
          setIsBackupOpen(false);
        }}
      />

      {/* AI Copilot & Concept Explainer Modal */}
      <AICopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />

      {/* Quiet Minimal Footer */}
      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>neet assistant · Personal Learning OS</div>
          <div>Privacy-First · Local Storage · Evidence-Based Mastery</div>
        </div>
      </footer>
    </div>
  );
}

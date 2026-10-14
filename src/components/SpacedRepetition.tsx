import React, { useState } from 'react';
import { Flashcard, SubjectType } from '../types';
import { calculateSM2, isCardDue } from '../utils/sm2';
import {
  RotateCcw,
  Sparkles,
  Plus,
  Eye,
  Check,
  Brain,
  Search,
  BookOpen,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';

interface SpacedRepetitionProps {
  flashcards: Flashcard[];
  onUpdateFlashcard: (card: Flashcard) => void;
  onAddFlashcard: (card: Flashcard) => void;
  onAddXP: (xp: number) => void;
}

export const SpacedRepetition: React.FC<SpacedRepetitionProps> = ({
  flashcards,
  onUpdateFlashcard,
  onAddFlashcard,
  onAddXP,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const dueCards = flashcards.filter((c) => isCardDue(c, todayStr));

  // Review mode state
  const [reviewIndex, setReviewIndex] = useState<number>(0);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);

  // Deck browser state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Add Card Form State
  const [frontText, setFrontText] = useState('');
  const [backText, setBackText] = useState('');
  const [cardSubject, setCardSubject] = useState<SubjectType>('Chemistry');
  const [topicName, setTopicName] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [highYieldFact, setHighYieldFact] = useState('');

  const currentCard = dueCards[reviewIndex];

  const handleGrade = (grade: 1 | 2 | 3 | 4) => {
    if (!currentCard) return;

    const updated = calculateSM2(currentCard, grade, todayStr);
    onUpdateFlashcard(updated);

    // Reward XP based on quality
    const xpReward = grade === 4 ? 30 : grade === 3 ? 25 : grade === 2 ? 15 : 5;
    onAddXP(xpReward);

    setIsRevealed(false);
    if (reviewIndex + 1 < dueCards.length) {
      setReviewIndex(reviewIndex + 1);
    } else {
      setSessionCompleted(true);
    }
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontText.trim() || !backText.trim()) return;

    const newCard: Flashcard = {
      id: `card-${Date.now()}`,
      topicId: 'custom-topic',
      topicName: topicName.trim() || 'General Concept',
      subject: cardSubject,
      front: frontText.trim(),
      back: backText.trim(),
      mnemonic: mnemonic.trim() || undefined,
      highYieldFact: highYieldFact.trim() || undefined,
      interval: 1,
      repetition: 0,
      easeFactor: 2.5,
      dueDate: todayStr,
      history: [],
    };

    onAddFlashcard(newCard);
    setFrontText('');
    setBackText('');
    setTopicName('');
    setMnemonic('');
    setHighYieldFact('');
    setShowAddModal(false);
  };

  const filteredCards = flashcards.filter((c) => {
    const matchesSubj = selectedSubject === 'All' || c.subject === selectedSubject;
    const matchesSearch =
      c.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.back.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.topicName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubj && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Spaced Repetition & Active Recall Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            SuperMemo SM-2 algorithm: interval expands automatically when recall is effortless and resets upon blackout.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors shadow-sm self-start"
        >
          <Plus className="w-4 h-4" />
          <span>New Flashcard</span>
        </button>
      </div>

      {/* Active Review Session Deck */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 md:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Active Recall Drill
              </h3>
              <div className="text-xs text-slate-400 font-mono">
                {dueCards.length > 0 && !sessionCompleted
                  ? `Card ${reviewIndex + 1} of ${dueCards.length} in Due Today Queue`
                  : 'Due Queue Cleared'}
              </div>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-400">
            {dueCards.length} cards scheduled for today
          </div>
        </div>

        {flashcards.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 text-sky-400 flex items-center justify-center mx-auto">
              <Brain className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">
              Spaced Repetition Deck is Empty
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Create your first flashcard with front/back cues, formulas, and mnemonics to activate automated SuperMemo SM-2 interval expansion.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Flashcard</span>
            </button>
          </div>
        ) : dueCards.length === 0 || sessionCompleted ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h4 className="text-base font-bold text-white">
              All due memory items consolidated!
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              You have refreshed your forgetting curve for today. Cards will resurface on their mathematically scheduled intervals.
            </p>
            {sessionCompleted && (
              <button
                onClick={() => {
                  setSessionCompleted(false);
                  setReviewIndex(0);
                  setIsRevealed(false);
                }}
                className="mt-4 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg transition-colors"
              >
                Review Deck Again
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* The Flashcard Viewport */}
            <div className="min-h-[220px] rounded-xl bg-slate-950 border border-slate-800 p-6 flex flex-col justify-between relative shadow-inner">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-4">
                  <span className="text-emerald-400">{currentCard.subject}</span>
                  <span>{currentCard.topicName}</span>
                  <span>Interval: {currentCard.interval}d · Rep: {currentCard.repetition}</span>
                </div>

                {/* Front Prompt */}
                <div className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed">
                  {currentCard.front}
                </div>
              </div>

              {/* Back Answer (Revealed) */}
              {isRevealed && (
                <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-3 animate-in fade-in duration-200">
                  <div className="text-sm sm:text-base text-emerald-300/90 leading-relaxed font-sans">
                    {currentCard.back}
                  </div>

                  {currentCard.mnemonic && (
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                      <Lightbulb className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                      <div>
                        <span className="font-semibold">Mnemonic Trigger: </span>
                        {currentCard.mnemonic}
                      </div>
                    </div>
                  )}

                  {currentCard.highYieldFact && (
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300">
                      <Sparkles className="w-4 h-4 shrink-0 text-sky-400 mt-0.5" />
                      <div>
                        <span className="font-semibold">NEET High-Yield Trap: </span>
                        {currentCard.highYieldFact}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Reveal Button if not revealed */}
              {!isRevealed && (
                <div className="pt-6 mt-4 flex justify-center">
                  <button
                    onClick={() => setIsRevealed(true)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700 shadow-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Reveal Verified Answer</span>
                  </button>
                </div>
              )}
            </div>

            {/* SM-2 Grade Assessment Bar */}
            {isRevealed && (
              <div className="pt-2">
                <div className="text-center text-xs text-slate-400 mb-3">
                  Rate your active recall difficulty:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    onClick={() => handleGrade(1)}
                    className="p-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-left transition-colors"
                  >
                    <div className="text-xs font-bold">1. Again (Failed)</div>
                    <div className="text-[11px] text-rose-400/80 font-mono mt-0.5">Reset interval (1d)</div>
                  </button>

                  <button
                    onClick={() => handleGrade(2)}
                    className="p-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-left transition-colors"
                  >
                    <div className="text-xs font-bold">2. Hard (Struggled)</div>
                    <div className="text-[11px] text-amber-400/80 font-mono mt-0.5">Short interval (~{Math.round(currentCard.interval * 1.2)}d)</div>
                  </button>

                  <button
                    onClick={() => handleGrade(3)}
                    className="p-3 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-left transition-colors"
                  >
                    <div className="text-xs font-bold">3. Good (Accurate)</div>
                    <div className="text-[11px] text-sky-400/80 font-mono mt-0.5">Standard interval (~{Math.round(currentCard.interval * currentCard.easeFactor)}d)</div>
                  </button>

                  <button
                    onClick={() => handleGrade(4)}
                    className="p-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-left transition-colors"
                  >
                    <div className="text-xs font-bold">4. Easy (Instant)</div>
                    <div className="text-[11px] text-emerald-400/80 font-mono mt-0.5">Bonus expansion (~{Math.round(currentCard.interval * currentCard.easeFactor * 1.3)}d)</div>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Deck Inventory Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <h3 className="text-base font-bold text-white">
            Deck Inventory ({flashcards.length} Cards)
          </h3>

          <div className="flex items-center gap-3">
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search flashcards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/30 rounded-xl border border-slate-800 divide-y divide-slate-800">
          {filteredCards.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              {flashcards.length === 0
                ? "No flashcards in your deck yet. Click 'New Flashcard' above to create your first card."
                : 'No flashcards match current search query.'}
            </div>
          ) : (
            filteredCards.map((card) => {
            const isDue = isCardDue(card, todayStr);
            return (
              <div key={card.id} className="p-4 hover:bg-slate-900/60 transition-colors space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-semibold">{card.subject}</span>
                    <span aria-hidden="true">·</span>
                    <span>{card.topicName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={isDue ? 'text-amber-400 font-semibold' : 'text-slate-400'}>
                      Due: {card.dueDate} {isDue ? '(Today)' : ''}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Interval: {card.interval}d</span>
                    <span aria-hidden="true">·</span>
                    <span>EF: {card.easeFactor}</span>
                  </div>
                </div>

                <div className="text-sm font-medium text-white">{card.front}</div>
                <div className="text-xs text-slate-300 line-clamp-1">{card.back}</div>
              </div>
            );
          })
          )}
        </div>
      </div>

      {/* Add Flashcard Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white">Create High-Yield Flashcard</h3>

            <form onSubmit={handleCreateCard} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
                  <select
                    value={cardSubject}
                    onChange={(e) => setCardSubject(e.target.value as SubjectType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Botany">Botany</option>
                    <option value="Zoology">Zoology</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Topic Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ray Optics"
                    value={topicName}
                    onChange={(e) => setTopicName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Front (Question / Prompt)</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. What is the lens maker's formula with sign conventions?"
                  value={frontText}
                  onChange={(e) => setFrontText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Back (Verified Answer)</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. 1/f = (μ_lens/μ_med - 1) × (1/R1 - 1/R2)..."
                  value={backText}
                  onChange={(e) => setBackText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Mnemonic / Recall Anchor (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. R1 convex = positive, R2 concave = negative"
                  value={mnemonic}
                  onChange={(e) => setMnemonic(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">High Yield Note / Trap Alert (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. When submerged in medium of higher refractive index, lens nature reverses."
                  value={highYieldFact}
                  onChange={(e) => setHighYieldFact(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors"
                >
                  Save Flashcard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

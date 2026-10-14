import React, { useState } from 'react';
import { MockTest, PracticeLog, SubjectType, ErrorType } from '../types';
import {
  TrendingUp,
  AlertTriangle,
  Zap,
  CheckCircle2,
  XCircle,
  Plus,
  Clock,
  Sparkles,
  Search,
  BookOpen,
} from 'lucide-react';

interface MockTestAnalyzerProps {
  mockTests: MockTest[];
  practiceLogs: PracticeLog[];
  onAddMockTest: (test: MockTest) => void;
  onAddPracticeLog: (log: PracticeLog) => void;
  onAddXP: (xp: number) => void;
}

export const MockTestAnalyzer: React.FC<MockTestAnalyzerProps> = ({
  mockTests,
  practiceLogs,
  onAddMockTest,
  onAddPracticeLog,
  onAddXP,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'mocks' | 'practice' | 'error_notebook'>('mocks');
  const [showLogMockModal, setShowLogMockModal] = useState(false);
  const [showLogPracticeModal, setShowLogPracticeModal] = useState(false);

  // New Mock Form State
  const [mockTitle, setMockTitle] = useState('');
  const [mockScore, setMockScore] = useState(600);
  const [mockPercentile, setMockPercentile] = useState(95.0);
  const [mockTimeMin, setMockTimeMin] = useState(195);
  const [notes, setNotes] = useState('');
  const [priorityFix, setPriorityFix] = useState('');

  // Subject inputs for mock test
  const [botanyCorrect, setBotanyCorrect] = useState(40);
  const [botanyIncorrect, setBotanyIncorrect] = useState(5);
  const [zoologyCorrect, setZoologyCorrect] = useState(41);
  const [zoologyIncorrect, setZoologyIncorrect] = useState(4);
  const [chemCorrect, setChemCorrect] = useState(35);
  const [chemIncorrect, setChemIncorrect] = useState(8);
  const [phyCorrect, setPhyCorrect] = useState(30);
  const [phyIncorrect, setPhyIncorrect] = useState(12);

  // Practice drill form
  const [practiceTopic, setPracticeTopic] = useState('');
  const [practiceSubj, setPracticeSubj] = useState<SubjectType>('Physics');
  const [attempted, setAttempted] = useState(30);
  const [correct, setCorrect] = useState(24);
  const [timeSpent, setTimeSpent] = useState(35);
  const [difficulty, setDifficulty] = useState<'Foundational' | 'Moderate' | 'Challenging' | 'Past NEET Paper'>('Moderate');
  const [mistakeSummary, setMistakeSummary] = useState('');
  const [mistakeType, setMistakeType] = useState<ErrorType>('calculation_error');
  const [mistakeTakeaway, setMistakeTakeaway] = useState('');

  const latestMock = mockTests[0];

  const handleCreateMock = (e: React.FormEvent) => {
    e.preventDefault();
    const botScore = botanyCorrect * 4 - botanyIncorrect * 1;
    const zooScore = zoologyCorrect * 4 - zoologyIncorrect * 1;
    const chemScore = chemCorrect * 4 - chemIncorrect * 1;
    const phyScore = phyCorrect * 4 - phyIncorrect * 1;
    const computedTotal = botScore + zooScore + chemScore + phyScore;
    const totalNegative = botanyIncorrect + zoologyIncorrect + chemIncorrect + phyIncorrect;

    const newTest: MockTest = {
      id: `mock-${Date.now()}`,
      title: mockTitle.trim() || `NEET Mock Test #${mockTests.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      examFormat: 'NEET_720',
      totalMarks: 720,
      score: computedTotal,
      percentile: Number(mockPercentile),
      accuracy: Math.round(((botanyCorrect + zoologyCorrect + chemCorrect + phyCorrect) / 180) * 100),
      timeTakenMinutes: Number(mockTimeMin),
      totalNegativeMarks: totalNegative,
      analysisNotes: notes.trim() || 'Comprehensive test review logged.',
      priorityFixForNextTest: priorityFix.trim() || 'Focus on Physics calculation speed and Chemistry exceptions.',
      subjects: {
        Botany: {
          attempted: botanyCorrect + botanyIncorrect,
          correct: botanyCorrect,
          incorrect: botanyIncorrect,
          unattempted: 45 - (botanyCorrect + botanyIncorrect),
          marksObtained: botScore,
          maxMarks: 180,
          errorBreakdown: { conceptual_gap: 1, memory_slip: 2, calculation_error: 0, misread_question: 1, time_panic: 0 },
        },
        Zoology: {
          attempted: zoologyCorrect + zoologyIncorrect,
          correct: zoologyCorrect,
          incorrect: zoologyIncorrect,
          unattempted: 45 - (zoologyCorrect + zoologyIncorrect),
          marksObtained: zooScore,
          maxMarks: 180,
          errorBreakdown: { conceptual_gap: 1, memory_slip: 1, calculation_error: 0, misread_question: 1, time_panic: 1 },
        },
        Chemistry: {
          attempted: chemCorrect + chemIncorrect,
          correct: chemCorrect,
          incorrect: chemIncorrect,
          unattempted: 45 - (chemCorrect + chemIncorrect),
          marksObtained: chemScore,
          maxMarks: 180,
          errorBreakdown: { conceptual_gap: 3, memory_slip: 2, calculation_error: 2, misread_question: 1, time_panic: 0 },
        },
        Physics: {
          attempted: phyCorrect + phyIncorrect,
          correct: phyCorrect,
          incorrect: phyIncorrect,
          unattempted: 45 - (phyCorrect + phyIncorrect),
          marksObtained: phyScore,
          maxMarks: 180,
          errorBreakdown: { conceptual_gap: 3, memory_slip: 1, calculation_error: 5, misread_question: 2, time_panic: 1 },
        },
      },
    };

    onAddMockTest(newTest);
    onAddXP(100); // 100 XP for in-depth mock logging
    setShowLogMockModal(false);
  };

  const handleCreatePracticeLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!practiceTopic.trim()) return;

    const incorrect = Math.max(0, attempted - correct);
    const errorsLog = mistakeSummary.trim()
      ? [
          {
            questionSummary: mistakeSummary.trim(),
            errorType: mistakeType,
            correctionTakeaway: mistakeTakeaway.trim() || 'Reviewed official NCERT solution.',
          },
        ]
      : [];

    const newLog: PracticeLog = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      topicId: 'custom-topic',
      topicName: practiceTopic.trim(),
      subject: practiceSubj,
      questionsAttempted: Number(attempted),
      correctCount: Number(correct),
      incorrectCount: incorrect,
      unattemptedCount: 0,
      timeSpentMinutes: Number(timeSpent),
      difficulty,
      errorsLog,
    };

    onAddPracticeLog(newLog);
    onAddXP(Math.round(attempted * 0.8));
    setPracticeTopic('');
    setMistakeSummary('');
    setMistakeTakeaway('');
    setShowLogPracticeModal(false);
  };

  // Collect all errors across practice logs & mock tests for the Error Notebook
  const allMistakes: Array<{
    source: string;
    topic: string;
    summary: string;
    type: string;
    takeaway: string;
    date: string;
  }> = [];

  practiceLogs.forEach((l) => {
    (l.errorsLog || []).forEach((err) => {
      allMistakes.push({
        source: `Practice Drill (${l.difficulty})`,
        topic: l.topicName,
        summary: err.questionSummary,
        type: err.errorType.replace('_', ' '),
        takeaway: err.correctionTakeaway,
        date: l.date,
      });
    });
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header and Sub Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Mock Test Diagnostics & Question Practice
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Analyze exactly where marks are bleeding: conceptual gap, calculation slip, memory blackout, or time rush.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeSubTab === 'mocks' ? (
            <button
              onClick={() => setShowLogMockModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Log Mock Test</span>
            </button>
          ) : (
            <button
              onClick={() => setShowLogPracticeModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Log MCQ Practice Batch</span>
            </button>
          )}
        </div>
      </div>

      {/* Segmented Control */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 w-fit">
        <button
          onClick={() => setActiveSubTab('mocks')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeSubTab === 'mocks'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Mock Tests (NEET 720)
        </button>
        <button
          onClick={() => setActiveSubTab('practice')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeSubTab === 'practice'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          MCQ Practice Logs ({practiceLogs.length})
        </button>
        <button
          onClick={() => setActiveSubTab('error_notebook')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeSubTab === 'error_notebook'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Error Notebook ({allMistakes.length})
        </button>
      </div>

      {/* TAB 1: MOCK TESTS */}
      {activeSubTab === 'mocks' && (
        <div className="space-y-6">
          {latestMock ? (
            <div className="bg-slate-900/40 rounded-xl border border-slate-800 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-1">
                    <span>{latestMock.date}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-400 font-medium">{latestMock.examFormat}</span>
                    <span aria-hidden="true">·</span>
                    <span>{latestMock.timeTakenMinutes} minutes</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{latestMock.title}</h3>
                </div>

                <div className="flex items-baseline gap-3">
                  <div className="text-right">
                    <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
                      {latestMock.score}
                      <span className="text-xs text-slate-400 font-normal"> / 720</span>
                    </div>
                    <div className="text-xs text-emerald-400 font-mono">
                      {latestMock.percentile}% Percentile · {latestMock.accuracy}% Accuracy
                    </div>
                  </div>
                </div>
              </div>

              {/* Subject Breakdown Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(latestMock.subjects || {}).map(([subj, data]) => {
                  if (!data) return null;
                  const lost = data.incorrect * 5; // 4 missed + 1 negative mark
                  return (
                    <div key={subj} className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                        <span className="text-white font-medium">{subj}</span>
                        <span>Max 180</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xl font-bold text-white font-mono tabular-nums">
                          {data.marksObtained}
                        </span>
                        <span className="text-xs text-rose-400 font-mono tabular-nums">
                          -{lost} marks lost
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-850">
                        <span className="text-emerald-400">{data.correct} correct</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-rose-400">{data.incorrect} wrong (-{data.incorrect})</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Diagnostic Root Cause Waterfall */}
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                    <Zap className="w-4 h-4" />
                    <span>Negative Marking Root-Cause Breakdown</span>
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    Total penalty: -{latestMock.totalNegativeMarks} marks
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <span className="font-semibold text-white">Analyzer Diagnosis: </span>
                      {latestMock.analysisNotes}
                    </p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded border border-slate-800">
                    <div className="text-xs font-semibold text-emerald-400 mb-1">
                      Actionable Prescription for Next Mock:
                    </div>
                    <div className="text-xs text-slate-300">
                      {latestMock.priorityFixForNextTest}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-900/30 rounded-xl border border-slate-800 text-slate-400 text-xs">
              No mock tests recorded yet. Click "Log Mock Test" to evaluate your performance.
            </div>
          )}

          {/* Historical Mock Log List */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white">All Logged Mock Tests</h4>
            <div className="bg-slate-900/30 rounded-xl border border-slate-800 divide-y divide-slate-800">
              {mockTests.map((t) => (
                <div key={t.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="font-semibold text-white">{t.title}</div>
                    <div className="text-slate-400 font-mono mt-0.5">
                      {t.date} · {t.timeTakenMinutes}m · {t.accuracy}% Accuracy
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-base font-bold text-emerald-400 tabular-nums">
                      {t.score} / 720
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      -{t.totalNegativeMarks} neg marks
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRACTICE DRILLS */}
      {activeSubTab === 'practice' && (
        <div className="space-y-4">
          <div className="bg-slate-900/30 rounded-xl border border-slate-800 divide-y divide-slate-800">
            {practiceLogs.map((p) => {
              const speedSec = Math.round((p.timeSpentMinutes * 60) / p.questionsAttempted);
              const acc = Math.round((p.correctCount / p.questionsAttempted) * 100);

              return (
                <div key={p.id} className="p-4 sm:p-5 hover:bg-slate-900/60 transition-colors space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-semibold">{p.subject}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-white font-medium">{p.topicName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{p.difficulty}</span>
                    </div>
                    <span>{p.date}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                    <span className="text-slate-300">
                      Attempted: <span className="font-bold text-white">{p.questionsAttempted}</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-400">
                      Correct: <span className="font-bold">{p.correctCount}</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-rose-400">
                      Incorrect: <span className="font-bold">{p.incorrectCount}</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-300">
                      Accuracy: <span className="font-bold text-white">{acc}%</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-400">
                      Speed: ~{speedSec}s / Q
                    </span>
                  </div>

                  {p.errorsLog && p.errorsLog.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-800/80 text-xs text-amber-300/90 space-y-1">
                      {p.errorsLog.map((err, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold shrink-0">Mistake:</span>
                          <span>{err.questionSummary} — <span className="text-slate-300">{err.correctionTakeaway}</span></span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ERROR NOTEBOOK */}
      {activeSubTab === 'error_notebook' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-white">The Error Notebook Principle: </span>
            Every mark lost in a mock exam or practice batch represents an unassimilated principle or a sloppy habit. Reviewing these corrections weekly prevents repeat blunders on exam day.
          </div>

          <div className="bg-slate-900/30 rounded-xl border border-slate-800 divide-y divide-slate-800">
            {allMistakes.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No mistakes logged yet. As you practice and log incorrect questions, they will compile here.
              </div>
            ) : (
              allMistakes.map((m, idx) => (
                <div key={idx} className="p-4 space-y-1.5 hover:bg-slate-900/50 transition-colors">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-rose-400 font-semibold uppercase">{m.type}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-white font-medium">{m.topic}</span>
                    </div>
                    <span>{m.date}</span>
                  </div>
                  <div className="text-sm font-medium text-slate-200">
                    {m.summary}
                  </div>
                  <div className="text-xs text-emerald-300 font-sans bg-emerald-500/5 p-2 rounded border border-emerald-500/20">
                    <span className="font-semibold">Correction Takeaway: </span>
                    {m.takeaway}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Log Mock Test Modal */}
      {showLogMockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-xl my-8">
            <h3 className="text-base font-bold text-white">Log Full NEET Mock Test (720 Marks)</h3>

            <form onSubmit={handleCreateMock} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Test Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Major All-India Test #04"
                    value={mockTitle}
                    onChange={(e) => setMockTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Time Taken (minutes)</label>
                  <input
                    type="number"
                    min="60"
                    max="220"
                    value={mockTimeMin}
                    onChange={(e) => setMockTimeMin(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Subject scores breakdown */}
              <div className="border border-slate-800 rounded-lg p-3 bg-slate-950 space-y-3">
                <div className="text-xs font-bold text-slate-300">Subject-wise Questions Breakdown</div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Botany (Correct / Wrong)</label>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="45"
                        value={botanyCorrect}
                        onChange={(e) => setBotanyCorrect(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white"
                        placeholder="Cor"
                      />
                      <input
                        type="number"
                        min="0"
                        max="45"
                        value={botanyIncorrect}
                        onChange={(e) => setBotanyIncorrect(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-rose-400"
                        placeholder="Inc"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Zoology (Correct / Wrong)</label>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="45"
                        value={zoologyCorrect}
                        onChange={(e) => setZoologyCorrect(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white"
                      />
                      <input
                        type="number"
                        min="0"
                        max="45"
                        value={zoologyIncorrect}
                        onChange={(e) => setZoologyIncorrect(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-rose-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Chemistry (Correct / Wrong)</label>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="45"
                        value={chemCorrect}
                        onChange={(e) => setChemCorrect(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white"
                      />
                      <input
                        type="number"
                        min="0"
                        max="45"
                        value={chemIncorrect}
                        onChange={(e) => setChemIncorrect(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-rose-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Physics (Correct / Wrong)</label>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="45"
                        value={phyCorrect}
                        onChange={(e) => setPhyCorrect(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white"
                      />
                      <input
                        type="number"
                        min="0"
                        max="45"
                        value={phyIncorrect}
                        onChange={(e) => setPhyIncorrect(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-rose-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Root Cause & Test Reflection</label>
                <textarea
                  rows={2}
                  placeholder="Where did marks leak? e.g. Calculation blunders in Physics, rushed guessing in last 10 minutes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">One Strategic Adjustment for Next Test</label>
                <input
                  type="text"
                  placeholder="e.g. Finish Biology in 45m strictly to leave 90m for Physics scratchpad."
                  value={priorityFix}
                  onChange={(e) => setPriorityFix(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLogMockModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors"
                >
                  Calculate & Save Mock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Practice Batch Modal */}
      {showLogPracticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white">Log MCQ Practice Batch</h3>

            <form onSubmit={handleCreatePracticeLog} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
                  <select
                    value={practiceSubj}
                    onChange={(e) => setPracticeSubj(e.target.value as SubjectType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Botany">Botany</option>
                    <option value="Zoology">Zoology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Foundational">Foundational</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Challenging">Challenging</option>
                    <option value="Past NEET Paper">Past NEET Paper</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Topic Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ionic Equilibrium Buffers"
                  value={practiceTopic}
                  onChange={(e) => setPracticeTopic(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Attempted</label>
                  <input
                    type="number"
                    min="1"
                    value={attempted}
                    onChange={(e) => setAttempted(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Correct</label>
                  <input
                    type="number"
                    min="0"
                    max={attempted}
                    value={correct}
                    onChange={(e) => setCorrect(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Time (mins)</label>
                  <input
                    type="number"
                    min="1"
                    value={timeSpent}
                    onChange={(e) => setTimeSpent(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 space-y-2">
                <div className="text-xs font-bold text-slate-300">Log A Key Mistake to Error Notebook (Optional)</div>
                <input
                  type="text"
                  placeholder="Question summary / concept missed"
                  value={mistakeSummary}
                  onChange={(e) => setMistakeSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={mistakeType}
                    onChange={(e) => setMistakeType(e.target.value as ErrorType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="calculation_error">Calculation Error</option>
                    <option value="conceptual_gap">Conceptual Gap</option>
                    <option value="memory_slip">Memory Slip</option>
                    <option value="misread_question">Misread Question</option>
                    <option value="time_panic">Time Panic</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Takeaway / rule to remember"
                    value={mistakeTakeaway}
                    onChange={(e) => setMistakeTakeaway(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLogPracticeModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors"
                >
                  Save Practice Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

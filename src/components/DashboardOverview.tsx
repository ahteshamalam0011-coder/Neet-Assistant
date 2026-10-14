import React from 'react';
import { AppState, DailyPlanItem } from '../types';
import { DailyOSAnswers } from '../utils/recommendations';
import {
  ArrowRight,
  Clock,
  AlertTriangle,
  Flame,
  TrendingUp,
  Brain,
  Target,
  CheckCircle2,
  Calendar,
  Sparkles,
  Play,
  RotateCcw,
  Zap,
  BookOpen,
  Plus,
} from 'lucide-react';

interface DashboardOverviewProps {
  state: AppState;
  answers: DailyOSAnswers;
  onNavigate: (tab: string) => void;
  onStartFocus: () => void;
  onTogglePlanItem: (planId: string) => void;
  onQuickAddPlanItem: (task: string, subject: any) => void;
  onLoadNeetTemplate?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  state,
  answers,
  onNavigate,
  onStartFocus,
  onTogglePlanItem,
  onQuickAddPlanItem,
  onLoadNeetTemplate,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayPlan = state.dailyPlans[todayStr] || [];
  const completedPlanCount = todayPlan.filter((p) => p.completed).length;

  // Calculate Scholar Level from userXP
  const scholarLevel = Math.floor(state.userXP / 500) + 1;
  const xpCurrentLevel = state.userXP % 500;
  const xpPercent = Math.min(100, Math.round((xpCurrentLevel / 500) * 100));

  const scholarTitle =
    scholarLevel >= 8
      ? 'Exam Ascendant'
      : scholarLevel >= 6
      ? 'Concept Master'
      : scholarLevel >= 4
      ? 'Syllabus Strategist'
      : scholarLevel >= 2
      ? 'Analytical Thinker'
      : 'Diligent Inquirer';

  const isFresh = state.topics.length === 0;

  return (
    <div className="space-y-8 pb-16">
      {/* Editorial Hero & Daily Readiness Header */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/50">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[300px]">
          {/* Left Text Zone */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mb-3">
                <span className="text-emerald-400 font-medium">{state.settings.targetExam} Preparation OS</span>
                <span aria-hidden="true">·</span>
                <span>Target: {state.settings.targetScore} / 720</span>
                <span aria-hidden="true">·</span>
                <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2 text-balance">
                Daily Command & Decision Engine
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                Ground your preparation in evidence rather than anxiety. Master verified recall, eradicate negative marks, and focus on high-yield leverage points.
              </p>
            </div>

            {/* Quick Action & Scholar Status Bar */}
            <div className="pt-6 border-t border-slate-800/80 mt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={onStartFocus}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors whitespace-nowrap shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Focus Session</span>
                </button>

                {answers.dueFlashcards.length > 0 ? (
                  <button
                    onClick={() => onNavigate('revision')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-750 rounded-lg transition-colors whitespace-nowrap border border-slate-700/60"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Review {answers.dueFlashcards.length} Due Cards</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigate('revision')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-750 rounded-lg transition-colors whitespace-nowrap border border-slate-700/60"
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-400" />
                    <span>Create Flashcard</span>
                  </button>
                )}
              </div>

              {/* Scholar Level Indicator */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs font-semibold text-white">
                    Level {scholarLevel} · {scholarTitle}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                    {state.userXP} XP ({xpCurrentLevel}/500)
                  </div>
                </div>
                <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-300"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual Image Zone */}
          <div className="lg:col-span-5 relative hidden lg:block overflow-hidden border-l border-slate-800">
            <img
              src="/src/assets/images/neet_study_companion_1791971157209.jpg"
              alt="NEET Study Desk Setup"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 font-mono">
              Zero-Server Local DB · Private
            </div>
          </div>
        </div>
      </div>

      {/* Fresh Start Setup Banner (Only shown if user has zero syllabus topics) */}
      {isFresh && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/20 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Clean Slate · Personal Learning OS Ready</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Initialize Your Syllabus Architecture
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Start completely fresh by adding your custom subjects and chapters, or load the pre-structured NEET UG syllabus template (Physics, Chemistry, Botany, Zoology) to activate automatic priority tracking.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onLoadNeetTemplate && (
              <button
                onClick={onLoadNeetTemplate}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors shadow-sm whitespace-nowrap"
              >
                <BookOpen className="w-4 h-4" />
                <span>Load NEET Syllabus Template</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('syllabus')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700 whitespace-nowrap"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Add Custom Topic</span>
            </button>
          </div>
        </div>
      )}

      {/* The 8 Daily Answers: Grid Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              The 8 Daily Grounding Questions
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated diagnostics computed locally from your test errors, retention curve, and practice history.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Question 1: What should I study next? */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-2">
                <Target className="w-4 h-4" />
                <span>1. What should I study next?</span>
              </div>
              {answers.studyNextRecommendations[0] ? (
                <>
                  <div className="text-sm font-bold text-white mb-1 line-clamp-1">
                    {answers.studyNextRecommendations[0].topic.name}
                  </div>
                  <div className="text-xs text-slate-400 mb-2 font-mono">
                    {answers.studyNextRecommendations[0].topic.subject} · {answers.studyNextRecommendations[0].recommendedAction}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {answers.studyNextRecommendations[0].reason}
                  </p>
                </>
              ) : (
                <p className="text-xs text-slate-400 leading-relaxed">
                  Add syllabus units to calculate your highest priority study interventions based on retention and weightage.
                </p>
              )}
            </div>
            <button
              onClick={() => onNavigate('syllabus')}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mt-2 pt-2 border-t border-slate-800/80"
            >
              <span>{isFresh ? 'Configure Syllabus' : 'Explore Priority Queue'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Question 2: Genuinely understand vs familiarity trap */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span>2. Familiarity vs Mastery</span>
              </div>
              {answers.familiarityTraps[0] ? (
                <>
                  <div className="text-sm font-bold text-white mb-1 line-clamp-1">
                    {answers.familiarityTraps[0].topic.name}
                  </div>
                  <div className="text-xs text-amber-300/90 font-mono mb-2">
                    Confidence: {answers.familiarityTraps[0].topic.perceivedConfidence}/5 vs Accuracy: {answers.familiarityTraps[0].topic.verifiedAccuracy}%
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Passive reading illusion detected. Switch to blind recall questions.
                  </p>
                </>
              ) : (
                <p className="text-xs text-slate-400 leading-relaxed">
                  No familiarity traps detected. Record MCQ practice logs to uncover differences between feeling confident and actual test accuracy.
                </p>
              )}
            </div>
            <button
              onClick={() => onNavigate('syllabus')}
              className="text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1 mt-2 pt-2 border-t border-slate-800/80"
            >
              <span>View Mastery Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Question 3: What am I forgetting? */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 mb-2">
                <Brain className="w-4 h-4" />
                <span>3. What am I forgetting?</span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold text-white font-mono tabular-nums">
                  {answers.dueFlashcards.length}
                </span>
                <span className="text-xs text-slate-400">cards due today</span>
              </div>
              {answers.dueFlashcards.length > 0 ? (
                <p className="text-xs text-slate-300 leading-relaxed">
                  Memory items scheduled for recall. Review today to strengthen neural pathways.
                </p>
              ) : (
                <p className="text-xs text-slate-400 leading-relaxed">
                  {state.flashcards.length === 0
                    ? 'Create your first flashcard to start SuperMemo SM-2 active recall.'
                    : 'All memory items refreshed. No cards due for review today.'}
                </p>
              )}
            </div>
            <button
              onClick={() => onNavigate('revision')}
              className="text-xs font-medium text-sky-400 hover:text-sky-300 flex items-center gap-1 mt-2 pt-2 border-t border-slate-800/80"
            >
              <span>{state.flashcards.length === 0 ? 'Add First Card' : 'Launch Active Recall'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Question 4: Where am I losing marks & why? */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 mb-2">
                <Zap className="w-4 h-4" />
                <span>4. Where am I losing marks?</span>
              </div>
              {state.mockTests.length > 0 ? (
                <>
                  <div className="text-sm font-bold text-white mb-1">
                    Culprit: {answers.negativeMarksDiagnosis.primaryCulprit}
                  </div>
                  <div className="text-xs text-rose-300/90 font-mono mb-2">
                    -{answers.negativeMarksDiagnosis.totalLostMarks} marks lost in last mock test
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {answers.negativeMarksDiagnosis.actionableRemedy}
                  </p>
                </>
              ) : (
                <p className="text-xs text-slate-400 leading-relaxed">
                  No mock tests recorded yet. Log your first test to reveal whether marks are lost to concepts, calculation slips, or time panic.
                </p>
              )}
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs font-medium text-rose-400 hover:text-rose-300 flex items-center gap-1 mt-2 pt-2 border-t border-slate-800/80"
            >
              <span>{state.mockTests.length === 0 ? 'Log First Mock Test' : 'Mock Test Breakdown'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Second Row of 4 Questions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {/* Question 5: Highest ROI Tasks */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-violet-400 mb-2">
                <TrendingUp className="w-4 h-4" />
                <span>5. Highest ROI Study Tasks</span>
              </div>
              {answers.highestRoiTasks[0] ? (
                <>
                  <div className="text-sm font-bold text-white mb-1 line-clamp-1">
                    {answers.highestRoiTasks[0].title}
                  </div>
                  <div className="text-xs text-emerald-400 font-mono mb-2">
                    {answers.highestRoiTasks[0].potentialMarksImpact} · ~{answers.highestRoiTasks[0].estimatedMinutes} min
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {answers.highestRoiTasks[0].why}
                  </p>
                </>
              ) : (
                <p className="text-xs text-slate-400 leading-relaxed">
                  Populate your syllabus to rank tasks by marks gained per hour invested.
                </p>
              )}
            </div>
            <button
              onClick={() => {
                if (answers.highestRoiTasks[0]) {
                  onQuickAddPlanItem(answers.highestRoiTasks[0].title, 'General');
                  onNavigate('planner');
                } else {
                  onNavigate('syllabus');
                }
              }}
              className="text-xs font-medium text-violet-400 hover:text-violet-300 flex items-center gap-1 mt-2 pt-2 border-t border-slate-800/80"
            >
              <span>{answers.highestRoiTasks[0] ? "Add to Today's Plan" : 'Setup Syllabus'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Question 6: How much focused work am I completing? */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 mb-2">
                <Clock className="w-4 h-4" />
                <span>6. Focused Work Completed</span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold text-white font-mono tabular-nums">
                  {Math.round((answers.focusStats.todayMinutes / 60) * 10) / 10}h
                </span>
                <span className="text-xs text-slate-400">
                  of {answers.focusStats.targetHours}h goal today
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                <div
                  className="bg-teal-400 h-full transition-all"
                  style={{ width: `${answers.focusStats.targetCompletionPercent}%` }}
                />
              </div>
              <p className="text-xs text-slate-300">
                7-day rolling average: <span className="text-white font-mono font-medium">{answers.focusStats.dailyAverageHours}h/day</span>.
              </p>
            </div>
            <button
              onClick={onStartFocus}
              className="text-xs font-medium text-teal-400 hover:text-teal-300 flex items-center gap-1 mt-2 pt-2 border-t border-slate-800/80"
            >
              <span>Launch Focus Timer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Question 7: Improving vs previous performance? */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-2">
                <Flame className="w-4 h-4" />
                <span>7. Progress vs Past Self</span>
              </div>
              {state.mockTests.length >= 2 ? (
                <>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
                      {answers.improvementMetrics.scoreDeltaLastTwoMocks >= 0 ? '+' : ''}
                      {answers.improvementMetrics.scoreDeltaLastTwoMocks}
                    </span>
                    <span className="text-xs text-slate-400">marks delta between last 2 mocks</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Practice accuracy: <span className="font-mono text-white font-medium">{answers.improvementMetrics.accuracyTrend}%</span> across {answers.improvementMetrics.totalQuestionsLogged} questions.
                  </p>
                </>
              ) : (
                <p className="text-xs text-slate-400 leading-relaxed">
                  Log at least 2 mock tests or practice batches to track your accuracy growth curve and personal bests.
                </p>
              )}
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-2 pt-2 border-t border-slate-800/80"
            >
              <span>View Practice Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Question 8: What should I change about tomorrow? */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-2">
                <Calendar className="w-4 h-4" />
                <span>8. Change for Tomorrow</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed mb-3">
                {answers.adaptiveSuggestions[0] || 'Maintain current study rhythm.'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('planner')}
              className="text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1 mt-2 pt-2 border-t border-slate-800/80"
            >
              <span>Daily Planner & Debrief</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Section: Today's Action Schedule & High-Yield Blueprint */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Today's Schedule Card */}
        <div className="lg:col-span-7 bg-slate-900/40 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">
                Today's Execution Blueprint
              </h3>
              <div className="text-xs text-slate-400 mt-0.5">
                {completedPlanCount} of {todayPlan.length} sessions completed
              </div>
            </div>
            <button
              onClick={() => onNavigate('planner')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              <span>Manage Full Day</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {todayPlan.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-lg space-y-2">
                <p>No study blocks scheduled for today.</p>
                <button
                  onClick={() => onNavigate('planner')}
                  className="text-emerald-400 hover:underline font-medium"
                >
                  Schedule today's first focus block
                </button>
              </div>
            ) : (
              todayPlan.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onTogglePlanItem(item.id)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    item.completed
                      ? 'bg-slate-950/40 border-slate-850 opacity-60'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                        item.completed
                          ? 'bg-emerald-500 text-slate-950'
                          : 'border border-slate-600 hover:border-emerald-400'
                      }`}
                    >
                      {item.completed && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                    </div>

                    <div>
                      <div
                        className={`text-sm font-medium ${
                          item.completed ? 'line-through text-slate-400' : 'text-slate-100'
                        }`}
                      >
                        {item.task}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                        <span>{item.timeSlot}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.subject}</span>
                        <span aria-hidden="true">·</span>
                        <span>~{item.estimatedMinutes}m</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs font-mono text-slate-400 uppercase tracking-wider shrink-0">
                    {item.type.replace('_', ' ')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* High Yield Blueprint & Mastery Breakdown */}
        <div className="lg:col-span-5 bg-slate-900/40 rounded-xl border border-slate-800 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">
                Syllabus Mastery Spread
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {state.topics.length} Tracked Units
              </span>
            </div>

            {/* Level 1-5 mastery visual bar */}
            {state.topics.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-lg mb-6">
                No syllabus units added yet. Add topics to see your level 1-5 mastery distribution.
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {[
                  { level: 5, label: 'Level 5 · Exam Ready (≥90%)', color: 'bg-emerald-400' },
                  { level: 4, label: 'Level 4 · Mastered', color: 'bg-teal-400' },
                  { level: 3, label: 'Level 3 · Competent (~70%)', color: 'bg-sky-400' },
                  { level: 2, label: 'Level 2 · Familiar (Trap Risk)', color: 'bg-amber-400' },
                  { level: 1, label: 'Level 1 · Novice / Exposed', color: 'bg-rose-400' },
                ].map((tier) => {
                  const count = answers.improvementMetrics.masteryLevelDistribution[tier.level] || 0;
                  const pct = state.topics.length > 0 ? Math.round((count / state.topics.length) * 100) : 0;
                  return (
                    <div key={tier.level} className="text-xs">
                      <div className="flex items-center justify-between mb-1 text-slate-300">
                        <span>{tier.label}</span>
                        <span className="font-mono tabular-nums text-slate-400">
                          {count} units ({pct}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${tier.color} transition-all duration-300`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Scientific Blueprint Card */}
            <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
              <img
                src="/src/assets/images/exam_blueprint_med_1791971157717.jpg"
                alt="Cellular Biology & Organic Chemistry Blueprint"
                referrerPolicy="no-referrer"
                className="w-full h-32 object-cover opacity-80 hover:opacity-100 transition-opacity"
              />
              <div className="p-3 bg-slate-900/90 border-t border-slate-800 text-xs">
                <div className="font-semibold text-white mb-0.5">High Yield Chemistry & Biology Nexus</div>
                <div className="text-slate-400 text-[11px]">
                  Cell Biology & Named Reactions account for up to ~112 marks in standard NEET papers.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Privacy Status</span>
            <span className="text-xs text-emerald-400 font-mono">100% Client-Side DB</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { AppState, DailyPlanItem, DayReflection, SubjectType } from '../types';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Send,
  Zap,
} from 'lucide-react';

interface StudyPlannerProps {
  state: AppState;
  onUpdateDailyPlan: (date: string, items: DailyPlanItem[]) => void;
  onSaveReflection: (date: string, reflection: DayReflection) => void;
  onAddXP: (xp: number) => void;
}

export const StudyPlanner: React.FC<StudyPlannerProps> = ({
  state,
  onUpdateDailyPlan,
  onSaveReflection,
  onAddXP,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // New task form
  const [taskName, setTaskName] = useState('');
  const [timeSlot, setTimeSlot] = useState('09:00 - 11:00');
  const [subject, setSubject] = useState<SubjectType>('Physics');
  const [taskType, setTaskType] = useState<DailyPlanItem['type']>('concept_study');
  const [estMinutes, setEstMinutes] = useState(120);

  // Reflection form
  const currentReflection = state.reflections[selectedDate] || {
    date: selectedDate,
    focusMinutesTotal: 0,
    questionsSolvedTotal: 0,
    whatWentWell: '',
    whatToChangeTomorrow: '',
    energyLevel: 4,
  };

  const [wentWell, setWentWell] = useState(currentReflection.whatWentWell);
  const [changeTomorrow, setChangeTomorrow] = useState(currentReflection.whatToChangeTomorrow);
  const [energyLevel, setEnergyLevel] = useState<1 | 2 | 3 | 4 | 5>(currentReflection.energyLevel);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const planItems = state.dailyPlans[selectedDate] || [];

  const handleToggleTask = (taskId: string) => {
    const updated = planItems.map((p) => {
      if (p.id === taskId) {
        const nextCompleted = !p.completed;
        if (nextCompleted) onAddXP(20);
        return { ...p, completed: nextCompleted };
      }
      return p;
    });
    onUpdateDailyPlan(selectedDate, updated);
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = planItems.filter((p) => p.id !== taskId);
    onUpdateDailyPlan(selectedDate, updated);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    const newItem: DailyPlanItem = {
      id: `task-${Date.now()}`,
      timeSlot,
      task: taskName.trim(),
      subject,
      type: taskType,
      completed: false,
      priority: 'high',
      estimatedMinutes: Number(estMinutes),
    };

    onUpdateDailyPlan(selectedDate, [...planItems, newItem]);
    setTaskName('');
    setShowAddTaskModal(false);
  };

  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: DayReflection = {
      date: selectedDate,
      focusMinutesTotal: currentReflection.focusMinutesTotal,
      questionsSolvedTotal: currentReflection.questionsSolvedTotal,
      whatWentWell: wentWell.trim(),
      whatToChangeTomorrow: changeTomorrow.trim(),
      energyLevel,
    };
    onSaveReflection(selectedDate, updated);
    onAddXP(30);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const shiftDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const completedCount = planItems.filter((p) => p.completed).length;

  return (
    <div className="space-y-8 pb-16">
      {/* Date Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Intelligent Daily Study Planner
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Time-blocking based on energy cycles. Adapt tomorrow's plan based on today's honest execution debrief.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-lg">
          <button
            onClick={() => shiftDate(-1)}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="px-3 text-xs font-mono font-medium text-white">
            {selectedDate === new Date().toISOString().split('T')[0]
              ? `Today (${selectedDate})`
              : selectedDate}
          </div>
          <button
            onClick={() => shiftDate(1)}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Execution Board & Debrief Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Scheduled Study Blocks */}
        <div className="lg:col-span-7 bg-slate-900/40 rounded-xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">
                Study Time Blocks
              </h3>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                {completedCount} / {planItems.length} blocks completed
              </div>
            </div>

            <button
              onClick={() => setShowAddTaskModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Block</span>
            </button>
          </div>

          <div className="space-y-3">
            {planItems.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                <p>No study blocks scheduled for this date yet.</p>
                <button
                  onClick={() => setShowAddTaskModal(true)}
                  className="text-emerald-400 hover:underline font-medium"
                >
                  Schedule first focus block
                </button>
              </div>
            ) : (
              planItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                    item.completed
                      ? 'bg-slate-950/40 border-slate-850 opacity-60'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleTask(item.id)}
                      className={`w-5 h-5 mt-0.5 rounded flex items-center justify-center transition-colors ${
                        item.completed
                          ? 'bg-emerald-500 text-slate-950'
                          : 'border border-slate-600 hover:border-emerald-400'
                      }`}
                    >
                      {item.completed && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                    </button>

                    <div className="space-y-1">
                      <div
                        className={`text-sm font-semibold ${
                          item.completed ? 'line-through text-slate-400' : 'text-white'
                        }`}
                      >
                        {item.task}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                        <span className="text-emerald-400 font-medium">{item.subject}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.timeSlot}</span>
                        <span aria-hidden="true">·</span>
                        <span>~{item.estimatedMinutes}m</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{item.type.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteTask(item.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete block"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Daily Reflection & Adaptive Tomorrow Engine */}
        <div className="lg:col-span-5 bg-slate-900/40 rounded-xl border border-slate-800 p-6 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Evening Debrief & Calibration</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              "What should I change about tomorrow's plan?" Honest reflection prevents repeating ineffective study days.
            </p>
          </div>

          <form onSubmit={handleSaveReflection} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                What went genuinely well today? (Wins & breakthroughs)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Mastered organic mechanisms without looking at answer key; maintained 2h uninterrupted focus..."
                value={wentWell}
                onChange={(e) => setWentWell(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-amber-300 mb-1">
                What MUST I change about tomorrow's plan? (Friction fix)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Cut down morning passive reading. Start 07:00 AM directly with 30 MCQs before phone check..."
                value={changeTomorrow}
                onChange={(e) => setChangeTomorrow(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Physical & Mental Energy Level Today
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setEnergyLevel(lvl as any)}
                    className={`flex-1 py-1.5 text-xs font-mono rounded transition-colors ${
                      energyLevel === lvl
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {lvl} {lvl === 5 ? '⚡' : lvl === 1 ? '😴' : ''}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-emerald-400 font-mono">
                {savedSuccess ? 'Debrief saved to local vault!' : ''}
              </span>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Save Reflection (+30 XP)</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white">Schedule Study Block</h3>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Task / Chapter Objective
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 40 MCQs on Chemical Bonding (VSEPR & MOT)"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value as SubjectType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Botany">Botany</option>
                    <option value="Zoology">Zoology</option>
                    <option value="General">General / Mock Review</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Block Type
                  </label>
                  <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="concept_study">Concept Study</option>
                    <option value="mcq_drill">MCQ Drill</option>
                    <option value="active_recall">Active Recall Flashcards</option>
                    <option value="test_analysis">Test Analysis</option>
                    <option value="revision">Quick Formula Revision</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Time Window
                  </label>
                  <input
                    type="text"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    placeholder="e.g. 06:30 - 08:30"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Estimated Duration (mins)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="300"
                    value={estMinutes}
                    onChange={(e) => setEstMinutes(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors"
                >
                  Add to Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

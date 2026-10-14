import React, { useState } from 'react';
import { TopicItem, SubjectType, MasteryLevel, Weightage } from '../types';
import {
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  BookOpen,
  Sparkles,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface SyllabusMasteryProps {
  topics: TopicItem[];
  onUpdateTopic: (updatedTopic: TopicItem) => void;
  onAddTopic: (newTopic: TopicItem) => void;
  onDeleteTopic: (topicId: string) => void;
  onLoadNeetTemplate?: () => void;
}

export const SyllabusMastery: React.FC<SyllabusMasteryProps> = ({
  topics,
  onUpdateTopic,
  onAddTopic,
  onDeleteTopic,
  onLoadNeetTemplate,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTrapOnly, setFilterTrapOnly] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New topic state
  const [newTopicName, setNewTopicName] = useState('');
  const [newSubject, setNewSubject] = useState<SubjectType>('Physics');
  const [newUnit, setNewUnit] = useState('');
  const [newWeightage, setNewWeightage] = useState<Weightage>('High Yield');

  const filteredTopics = topics.filter((t) => {
    const matchesSubj = selectedSubject === 'All' || t.subject === selectedSubject;
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.unit.toLowerCase().includes(searchQuery.toLowerCase());
    const isTrap = t.perceivedConfidence >= 3 && (t.perceivedConfidence - t.masteryLevel >= 1 || t.verifiedAccuracy < 68);
    const matchesTrap = filterTrapOnly ? isTrap : true;

    return matchesSubj && matchesSearch && matchesTrap;
  });

  const subjects: string[] = ['All', 'Botany', 'Zoology', 'Chemistry', 'Physics'];

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;

    const topic: TopicItem = {
      id: `topic-${Date.now()}`,
      name: newTopicName.trim(),
      subject: newSubject,
      unit: newUnit.trim() || 'General Unit',
      weightage: newWeightage,
      masteryLevel: 2,
      perceivedConfidence: 3,
      verifiedAccuracy: 70,
      lastStudiedDate: new Date().toISOString().split('T')[0],
      nextReviewDate: new Date().toISOString().split('T')[0],
      retentionDecayDays: 0,
      notesCount: 0,
      cardsCount: 0,
      totalQuestionsPracticed: 0,
      isHighYield: newWeightage === 'High Yield',
    };

    onAddTopic(topic);
    setNewTopicName('');
    setNewUnit('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Syllabus & Mastery Architecture
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track genuine understanding vs deceptive familiarity. Level 5 indicates verified high-speed recall under timed conditions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Syllabus Unit</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
        {/* Subject Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {subjects.map((subj) => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedSubject === subj
                  ? 'bg-slate-800 text-white font-semibold border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterTrapOnly(!filterTrapOnly)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap border flex items-center gap-1.5 ${
              filterTrapOnly
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 font-semibold'
                : 'border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Familiarity Traps Only</span>
          </button>

          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Topics Table / Grid */}
      <div className="bg-slate-900/30 rounded-xl border border-slate-800 overflow-hidden">
        <div className="divide-y divide-slate-800/80">
          {topics.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Your Syllabus Matrix is Fresh & Empty</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Start tracking your genuine understanding vs familiarity illusions. Add custom chapters or load the standard NEET UG syllabus with one click.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {onLoadNeetTemplate && (
                  <button
                    onClick={onLoadNeetTemplate}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors shadow-sm"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Load NEET UG Syllabus Template</span>
                  </button>
                )}
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Create First Chapter</span>
                </button>
              </div>
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No topics match current search and filter criteria.
            </div>
          ) : (
            filteredTopics.map((topic) => {
              const isTrap =
                topic.perceivedConfidence >= 3 &&
                (topic.perceivedConfidence - topic.masteryLevel >= 1 || topic.verifiedAccuracy < 68);

              return (
                <div
                  key={topic.id}
                  className="p-4 sm:p-5 hover:bg-slate-900/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <span className="text-emerald-400 font-medium">{topic.subject}</span>
                      <span aria-hidden="true">·</span>
                      <span>{topic.unit}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={
                          topic.weightage === 'High Yield'
                            ? 'text-amber-400 font-semibold'
                            : 'text-slate-400'
                        }
                      >
                        {topic.weightage}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-semibold text-white">
                        {topic.name}
                      </h3>
                      {isTrap && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-mono">
                          <AlertTriangle className="w-3 h-3" />
                          Familiarity Trap
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      <span>Practice: {topic.totalQuestionsPracticed} MCQs logged</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Verified Accuracy:{' '}
                        <span className="font-mono text-slate-200 tabular-nums">
                          {topic.verifiedAccuracy}%
                        </span>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Last Studied:{' '}
                        <span className="font-mono text-slate-200">
                          {topic.lastStudiedDate}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Right: Interactive Mastery Level Selector */}
                  <div className="flex items-center gap-6 shrink-0 self-end md:self-center">
                    {/* Perceived vs Verified Diagnostic */}
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400 uppercase font-mono">
                        Confidence vs Mastery
                      </div>
                      <div className="text-xs text-slate-300 font-mono mt-0.5">
                        Felt: <span className="text-amber-300">{topic.perceivedConfidence}/5</span> · Real:{' '}
                        <span className="text-emerald-300">{topic.masteryLevel}/5</span>
                      </div>
                    </div>

                    {/* Mastery Level 1-5 Radio / Buttons */}
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() =>
                            onUpdateTopic({
                              ...topic,
                              masteryLevel: lvl as MasteryLevel,
                              lastStudiedDate: new Date().toISOString().split('T')[0],
                            })
                          }
                          className={`w-7 h-7 text-xs font-mono font-medium rounded transition-colors ${
                            topic.masteryLevel === lvl
                              ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                              : 'text-slate-400 hover:text-white hover:bg-slate-850'
                          }`}
                          title={`Set Mastery Level to ${lvl}`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Topic Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white">Add New Syllabus Unit</h3>

            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Topic / Chapter Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wave Optics & Interference"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Subject
                  </label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value as SubjectType)}
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
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Weightage
                  </label>
                  <select
                    value={newWeightage}
                    onChange={(e) => setNewWeightage(e.target.value as Weightage)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="High Yield">High Yield (4+ Qs)</option>
                    <option value="Medium">Medium (2-3 Qs)</option>
                    <option value="Standard">Standard (1-2 Qs)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Unit / Block Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Optics"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
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
                  Save Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

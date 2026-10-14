import React, { useState } from 'react';
import { KnowledgeNote, SubjectType } from '../types';
import { BookOpen, Search, Plus, Sparkles, Tag, Lightbulb, Trash2 } from 'lucide-react';

interface KnowledgeBaseProps {
  notes: KnowledgeNote[];
  onAddNote: (note: KnowledgeNote) => void;
  onDeleteNote: (noteId: string) => void;
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({
  notes,
  onAddNote,
  onDeleteNote,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Note Form
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<SubjectType>('Chemistry');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [formulasInput, setFormulasInput] = useState('');
  const [mnemonicsInput, setMnemonicsInput] = useState('');

  const filteredNotes = notes.filter((n) => {
    const matchesSubj = selectedSubject === 'All' || n.subject === selectedSubject;
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.highYieldTags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSubj && matchesSearch;
  });

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const highYieldTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const formulaList = formulasInput
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);
    const mnemonics = mnemonicsInput
      .split('\n')
      .map((m) => m.trim())
      .filter(Boolean);

    const newNote: KnowledgeNote = {
      id: `note-${Date.now()}`,
      title: title.trim(),
      subject,
      content: content.trim(),
      highYieldTags,
      formulaList,
      mnemonics,
      updatedAt: new Date().toISOString(),
    };

    onAddNote(newNote);
    setTitle('');
    setContent('');
    setTagsInput('');
    setFormulasInput('');
    setMnemonicsInput('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Personal Knowledge System & High-Yield Vault
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Atomic concept summaries, formula derivations, and mnemonic anchors linked directly to your exam syllabus.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors shadow-sm self-start"
        >
          <Plus className="w-4 h-4" />
          <span>New Knowledge Note</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1 overflow-x-auto">
          {['All', 'Physics', 'Chemistry', 'Botany', 'Zoology'].map((subj) => (
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

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notes, formulas, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-xl border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-white">Knowledge Vault is Fresh & Empty</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Record high-yield concepts, NCERT exceptions, key formulas, and mnemonics as you study.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors shadow-sm mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Note</span>
          </button>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400 bg-slate-900/30 rounded-xl border border-slate-800">
          No knowledge notes match current search or subject filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredNotes.map((note) => (
          <div
            key={note.id}
            className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors space-y-4"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
                <span className="text-emerald-400 font-semibold">{note.subject}</span>
                <button
                  onClick={() => onDeleteNote(note.id)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="text-base font-bold text-white mb-2 leading-snug">
                {note.title}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans mb-3">
                {note.content}
              </p>

              {note.formulaList && note.formulaList.length > 0 && (
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 mb-3 space-y-1">
                  <div className="text-[11px] font-mono text-emerald-400 font-semibold uppercase">
                    Key Formulas / Laws
                  </div>
                  {note.formulaList.map((formula, idx) => (
                    <div key={idx} className="text-xs font-mono text-slate-200">
                      • {formula}
                    </div>
                  ))}
                </div>
              )}

              {note.mnemonics && note.mnemonics.length > 0 && (
                <div className="p-2.5 bg-amber-500/10 rounded-lg border border-amber-500/20 mb-3 text-xs text-amber-300 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    {note.mnemonics.map((m, idx) => (
                      <div key={idx}>{m}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {note.highYieldTags && note.highYieldTags.length > 0 && (
              <div className="pt-3 border-t border-slate-800 flex flex-wrap gap-1.5">
                {note.highYieldTags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-mono"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      )}

      {/* Add Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 space-y-4 shadow-xl my-8">
            <h3 className="text-base font-bold text-white">Create High-Yield Note</h3>

            <form onSubmit={handleCreateNote} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value as SubjectType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Botany">Botany</option>
                    <option value="Zoology">Zoology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Thermodynamics, High Yield, Carnot"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Note Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Carnot Cycle & Second Law of Thermodynamics"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Key Conceptual Takeaways</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Summarize the core concept, conditions, and NCERT exception traps..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Formulas (one per line)</label>
                <textarea
                  rows={2}
                  placeholder="η = 1 - T2/T1 = W/Q1"
                  value={formulasInput}
                  onChange={(e) => setFormulasInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Mnemonic / Recall Anchor (one per line)</label>
                <input
                  type="text"
                  placeholder="e.g. Heat flows spontaneously from hot to cold (Clausius)"
                  value={mnemonicsInput}
                  onChange={(e) => setMnemonicsInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
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
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

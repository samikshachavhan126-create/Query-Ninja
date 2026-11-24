import { useState } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  Circle,
  Plus,
  ExternalLink,
  Trash2,
  BookmarkPlus,
} from 'lucide-react';
import { Doubt, Persona } from '../types';
import { TrustBadges } from './TrustBadges';

interface RatraaPlannerViewProps {
  doubts: Doubt[];
  activePersona: Persona;
  onSelectDoubt: (doubtId: string) => void;
}

interface StudyBlock {
  id: string;
  timeSlot: string;
  title: string;
  subject: string;
  linkedDoubtId?: string;
  completed: boolean;
}

const INITIAL_BLOCKS: StudyBlock[] = [
  {
    id: 'plan-1',
    timeSlot: '9:30 PM – 10:15 PM',
    title: "Review stdin newline buffer fix for scanf('%c')",
    subject: 'C Programming',
    linkedDoubtId: 'doubt-1',
    completed: true,
  },
  {
    id: 'plan-2',
    timeSlot: '10:30 PM – 11:30 PM',
    title: 'Dry-run recursive singly linked list base case & NULL check',
    subject: 'Data Structures',
    linkedDoubtId: 'doubt-3',
    completed: false,
  },
  {
    id: 'plan-3',
    timeSlot: '11:45 PM – 12:30 AM',
    title: 'Compare Merge Sort vs Quick Sort pointer rewiring',
    subject: 'Data Structures',
    linkedDoubtId: 'doubt-4',
    completed: false,
  },
];

export function RatraaPlannerView({
  doubts,
  activePersona,
  onSelectDoubt,
}: RatraaPlannerViewProps) {
  const [blocks, setBlocks] = useState<StudyBlock[]>(INITIAL_BLOCKS);
  const [newTitle, setNewTitle] = useState('');
  const [newSlot, setNewSlot] = useState('12:30 AM – 1:15 AM');

  const toggleBlock = (id: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, completed: !b.completed } : b))
    );
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setBlocks((prev) => [
      ...prev,
      {
        id: `plan-${Date.now()}`,
        timeSlot: newSlot.trim() || 'Late-Night Slot',
        title: newTitle.trim(),
        subject: 'Self Revision',
        completed: false,
      },
    ]);
    setNewTitle('');
  };

  const handleScheduleDoubt = (doubt: Doubt) => {
    if (blocks.some((b) => b.linkedDoubtId === doubt.id)) return;
    setBlocks((prev) => [
      ...prev,
      {
        id: `plan-${doubt.id}-${Date.now()}`,
        timeSlot: 'Tonight • Sprint Slot',
        title: doubt.title,
        subject: doubt.subject,
        linkedDoubtId: doubt.id,
        completed: false,
      },
    ]);
  };

  const completedCount = blocks.filter((b) => b.completed).length;

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Ratraa Planner
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Late-night revision cadence for{' '}
            <strong className="text-slate-900 dark:text-slate-100">{activePersona.postingIdentityLabel}</strong>{' '}
            — pair campus doubts with focused study sprints.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-xs font-semibold text-indigo-700 dark:text-indigo-300 tabular-nums self-start sm:self-auto">
          <CalendarClock className="w-4 h-4" />
          <span>
            {completedCount} of {blocks.length} sprints done
          </span>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Tonight's Revision Timeline */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
            {blocks.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                No study blocks scheduled yet. Add one below or pin a doubt from the right panel.
              </div>
            ) : (
              blocks.map((block) => (
                <div
                  key={block.id}
                  className="p-4 sm:p-5 flex items-start justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleBlock(block.id)}
                    className="flex items-start gap-3 text-left flex-1 min-w-0"
                  >
                    {block.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold leading-snug ${
                          block.completed
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {block.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {block.subject} ·{' '}
                        <span className="tabular-nums font-medium">{block.timeSlot}</span>
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {block.linkedDoubtId && (
                      <button
                        type="button"
                        onClick={() => onSelectDoubt(block.linkedDoubtId!)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                      >
                        <span>Open Doubt</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeBlock(block.id)}
                      aria-label="Remove study block"
                      className="p-1.5 rounded-md text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <form
            onSubmit={handleAddCustom}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs p-4 flex flex-col sm:flex-row gap-2.5"
          >
            <input
              type="text"
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value)}
              placeholder="Time slot"
              className="sm:w-44 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500"
            />
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Add a focused late-night revision topic..."
              className="flex-1 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 text-white transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Sprint</span>
            </button>
          </form>
        </div>

        {/* Right: Pin Campus Doubts into Tonight's Sprint */}
        <aside className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5 space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
              Campus Threads to Revisit
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pin any open or verified doubt from the feed straight into tonight’s sprint.
            </p>
          </div>

          <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-0.5">
            {doubts.map((doubt) => {
              const isScheduled = blocks.some((b) => b.linkedDoubtId === doubt.id);
              return (
                <div
                  key={doubt.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                      {doubt.subject} · {doubt.topic}
                    </span>
                    <TrustBadges doubt={doubt} />
                  </div>

                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                    {doubt.title}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={isScheduled}
                      onClick={() => handleScheduleDoubt(doubt)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        isScheduled
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 cursor-default'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      <span>{isScheduled ? 'Pinned Tonight ✓' : 'Pin to Tonight'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectDoubt(doubt.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <span>Open Thread</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </section>
  );
}

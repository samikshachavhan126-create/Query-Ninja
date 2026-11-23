import { useState } from 'react';
import { CalendarClock, CheckCircle2, Circle, Plus } from 'lucide-react';

interface StudyBlock {
  id: string;
  timeSlot: string;
  title: string;
  subject: string;
  completed: boolean;
}

const INITIAL_BLOCKS: StudyBlock[] = [
  {
    id: 'plan-1',
    timeSlot: '9:00 PM – 9:45 PM',
    title: 'Revise stdin buffer handling & scanf() edge cases',
    subject: 'C Programming',
    completed: true,
  },
  {
    id: 'plan-2',
    timeSlot: '10:00 PM – 11:00 PM',
    title: 'Dry-run recursive singly linked list reversal on paper',
    subject: 'Data Structures',
    completed: false,
  },
  {
    id: 'plan-3',
    timeSlot: '11:15 PM – 12:00 AM',
    title: 'Compare Merge Sort vs Quick Sort pointer rewiring',
    subject: 'Data Structures',
    completed: false,
  },
];

export function RatraaPlannerView() {
  const [blocks, setBlocks] = useState<StudyBlock[]>(INITIAL_BLOCKS);
  const [newTitle, setNewTitle] = useState('');
  const [newSlot, setNewSlot] = useState('12:00 AM – 12:45 AM');

  const toggleBlock = (id: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, completed: !b.completed } : b))
    );
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setBlocks((prev) => [
      ...prev,
      {
        id: `plan-${Date.now()}`,
        timeSlot: newSlot.trim() || 'Flexible Slot',
        title: newTitle.trim(),
        subject: 'Self Study',
        completed: false,
      },
    ]);
    setNewTitle('');
  };

  const completedCount = blocks.filter((b) => b.completed).length;

  return (
    <section className="max-w-4xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Ratraa Planner
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Late-night exam and lab sprint planner — pair open doubts with focused revision blocks.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 tabular-nums self-start sm:self-auto">
          <CalendarClock className="w-4 h-4" />
          <span>
            {completedCount} of {blocks.length} blocks complete
          </span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-xs divide-y divide-slate-100">
        {blocks.map((block) => (
          <button
            key={block.id}
            type="button"
            onClick={() => toggleBlock(block.id)}
            className="w-full text-left p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-start gap-3">
              {block.completed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
              )}
              <div>
                <p
                  className={`text-sm sm:text-base font-semibold ${
                    block.completed ? 'line-through text-slate-400' : 'text-slate-900'
                  }`}
                >
                  {block.title}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {block.subject} · <span className="tabular-nums font-medium">{block.timeSlot}</span>
                </p>
              </div>
            </div>

            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-md whitespace-nowrap ${
                block.completed
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {block.completed ? 'Done' : 'Scheduled'}
            </span>
          </button>
        ))}
      </div>

      <form
        onSubmit={handleAdd}
        className="bg-white border border-slate-200 rounded-xl shadow-xs p-4 flex flex-col sm:flex-row gap-2.5"
      >
        <input
          type="text"
          value={newSlot}
          onChange={(e) => setNewSlot(e.target.value)}
          placeholder="Time slot"
          className="sm:w-48 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
        />
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a late-night revision task..."
          className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={!newTitle.trim()}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add Block</span>
        </button>
      </form>
    </section>
  );
}

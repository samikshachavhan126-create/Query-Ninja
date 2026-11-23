import { useState } from 'react';
import { Bot, Send, Sparkles, ArrowRight } from 'lucide-react';
import { Doubt } from '../types';

interface AiFriendViewProps {
  doubts: Doubt[];
  onSelectDoubt: (doubtId: string) => void;
}

interface StudyHint {
  topic: string;
  question: string;
  socraticHint: string;
}

const STUDY_HINTS: StudyHint[] = [
  {
    topic: 'C Programming · Input/Output',
    question: "Why does scanf('%c') skip after scanf('%d')?",
    socraticHint:
      "Think about what stays in the keyboard buffer when you hit the Enter key after typing an integer. What character represents pressing Enter, and does %d consume it?",
  },
  {
    topic: 'Data Structures · Pointers & Memory',
    question: 'Recursive linked list reversal segfaults at the base case',
    socraticHint:
      'Trace your function with a 1-node list and a 0-node (NULL) list. Before accessing head->next->next, are you checking both head == NULL and head->next == NULL?',
  },
  {
    topic: 'Data Structures · Sorting',
    question: 'Merge Sort vs Quick Sort on Linked Lists',
    socraticHint:
      'Quick Sort relies heavily on random O(1) index access for partitioning. Merge Sort splits via slow/fast pointers and merges by relinking next pointers—how much extra node memory does relinking actually need?',
  },
];

export function AiFriendView({ doubts, onSelectDoubt }: AiFriendViewProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedHintIdx, setSelectedHintIdx] = useState(0);
  const [customReplies, setCustomReplies] = useState<{ q: string; a: string }[]>([]);

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    const q = prompt.trim();
    if (!q) return;
    setCustomReplies((prev) => [
      ...prev,
      {
        q,
        a: `Socratic Check: Break "${q}" into your input state, expected invariant, and edge case (NULL or 0 elements). Compare your trace against our verified peer explanations in the Doubt Feed.`,
      },
    ]);
    setPrompt('');
  };

  return (
    <section className="space-y-5">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          AI Friend (24×7)
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Late-night Socratic study hints that guide you toward the answer before you post or submit lab code.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Guided Topic Hints */}
        <div className="lg:col-span-1 space-y-2.5">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Quick Concept Walkthroughs
          </h2>
          {STUDY_HINTS.map((item, idx) => (
            <button
              key={item.question}
              type="button"
              onClick={() => setSelectedHintIdx(idx)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedHintIdx === idx
                  ? 'bg-indigo-50/70 border-indigo-300 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <p className="text-xs font-semibold text-indigo-700">{item.topic}</p>
              <p className="text-sm font-semibold text-slate-900 mt-1">{item.question}</p>
            </button>
          ))}
        </div>

        {/* Right: Interactive Companion Workspace */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-xs p-5 sm:p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3.5 border-b border-slate-100">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">
                  Socratic Study Companion
                </h3>
                <p className="text-xs text-slate-500">
                  Gives step-by-step hints without spoiling full assignment solutions.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{STUDY_HINTS[selectedHintIdx].topic}</span>
              </div>
              <p className="text-sm font-semibold text-slate-900">
                {STUDY_HINTS[selectedHintIdx].question}
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">
                {STUDY_HINTS[selectedHintIdx].socraticHint}
              </p>
              {doubts[selectedHintIdx] && (
                <button
                  type="button"
                  onClick={() => onSelectDoubt(doubts[selectedHintIdx].id)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 pt-1"
                >
                  <span>Open related peer thread</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {customReplies.map((entry, index) => (
              <div key={index} className="space-y-2">
                <div className="ml-auto max-w-xl bg-indigo-600 text-white text-sm px-4 py-2.5 rounded-xl">
                  {entry.q}
                </div>
                <div className="max-w-xl bg-slate-100 text-slate-800 text-sm px-4 py-2.5 rounded-xl">
                  {entry.a}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAsk} className="flex gap-2 pt-3 border-t border-slate-100">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask for a hint on pointers, recursion, or time complexity..."
              className="flex-1 px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!prompt.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

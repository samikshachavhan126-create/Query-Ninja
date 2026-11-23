import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Layers,
  Lightbulb,
  Trophy,
} from 'lucide-react';
import { Doubt } from '../types';
import { getDoubtTrustState } from './TrustBadges';

interface UnresolvedTrackerViewProps {
  doubts: Doubt[];
  onSelectDoubt: (doubtId: string) => void;
}

type TrackerSortMode = 'waiting' | 'topic';

const SUBJECT_FILTERS = [
  'All Subjects',
  'C Programming',
  'Data Structures',
  'Algorithms',
  'Engineering Mathematics',
];

const TOP_SOLVERS = [
  {
    rank: 1,
    name: 'Priya Deshmukh',
    points: 420,
    badge: 'C & DS Ninja',
  },
  {
    rank: 2,
    name: 'Kabir Verma',
    points: 290,
    badge: 'Quick Responder',
  },
  {
    rank: 3,
    name: 'Sneha Patel',
    points: 185,
    badge: 'Helper Badge',
  },
];

function formatTrackerWaitLabel(hours: number): string {
  if (hours <= 0) return 'Just now';
  if (hours < 1) {
    const mins = Math.max(1, Math.round(hours * 60));
    return `${mins} mins`;
  }
  const rounded = Math.round(hours);
  return `${rounded} ${rounded === 1 ? 'hr' : 'hrs'}`;
}

export function UnresolvedTrackerView({
  doubts,
  onSelectDoubt,
}: UnresolvedTrackerViewProps) {
  const [sortMode, setSortMode] = useState<TrackerSortMode>('waiting');
  const [subjectFilter, setSubjectFilter] = useState<string>('All Subjects');

  // All doubts without any visible Peer-Accepted or Teacher-Verified answer
  const allUnresolved = useMemo(
    () => doubts.filter((d) => getDoubtTrustState(d).isUnresolved),
    [doubts]
  );

  // Teacher "What to Re-Teach" Insight: topic with highest open doubt count
  const topUnresolvedTopic = useMemo(() => {
    if (allUnresolved.length === 0) return null;
    const counts = new Map<string, number>();
    for (const d of allUnresolved) {
      counts.set(d.topic, (counts.get(d.topic) ?? 0) + 1);
    }
    let bestTopic = '';
    let bestCount = 0;
    for (const [topic, count] of counts.entries()) {
      if (count > bestCount) {
        bestTopic = topic;
        bestCount = count;
      }
    }
    return { topic: bestTopic, count: bestCount };
  }, [allUnresolved]);

  const filteredUnresolved = useMemo(() => {
    const base =
      subjectFilter === 'All Subjects'
        ? allUnresolved
        : allUnresolved.filter((d) => d.subject === subjectFilter);

    return [...base].sort((a, b) => b.waitingHours - a.waitingHours);
  }, [allUnresolved, subjectFilter]);

  const groupedByTopic = useMemo(() => {
    const map = new Map<string, Doubt[]>();
    for (const doubt of filteredUnresolved) {
      const list = map.get(doubt.topic) ?? [];
      list.push(doubt);
      map.set(doubt.topic, list);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [filteredUnresolved]);

  const renderQueueCard = (doubt: Doubt) => {
    const visibleAnswers = doubt.answers.filter((a) => !a.isHiddenByModerator);
    const isUrgent = doubt.waitingHours >= 6;
    const waitLabel = formatTrackerWaitLabel(doubt.waitingHours);

    return (
      <article
        key={doubt.id}
        onClick={() => onSelectDoubt(doubt.id)}
        className="bg-white border border-slate-200 rounded-xl shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all p-5 space-y-3 cursor-pointer"
      >
        {/* Top Row: Waiting Alert Badge + Subject / Topic */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {doubt.subject}
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
              {doubt.topic}
            </span>
          </div>

          {isUrgent ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 tabular-nums whitespace-nowrap">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Waiting {waitLabel} • Urgent Teacher Alert</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 tabular-nums whitespace-nowrap">
              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                {doubt.waitingHours <= 0 ? 'Just now' : `Waiting ${waitLabel}`}
              </span>
            </span>
          )}
        </div>

        {/* Title & Snippet */}
        <div>
          <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {doubt.title}
          </h2>
          <p className="text-sm text-slate-600 mt-1 line-clamp-2 leading-relaxed">
            {doubt.description}
          </p>
        </div>

        {/* Bottom Metadata & Resolve CTA */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span>
              Asked by <strong className="text-slate-700">{doubt.authorName}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-medium text-slate-700 tabular-nums">
              {visibleAnswers.length === 0
                ? '0 answers yet'
                : `${visibleAnswers.length} unaccepted peer ${
                    visibleAnswers.length === 1 ? 'answer' : 'answers'
                  }`}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectDoubt(doubt.id);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors whitespace-nowrap shrink-0 shadow-xs"
          >
            <span>Resolve / Answer Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </article>
    );
  };

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Unresolved Doubt Tracker
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Operational queue of questions awaiting a Peer-Accepted or Teacher-Verified solution.
          </p>
        </div>
        <div className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg tabular-nums self-start sm:self-auto">
          {allUnresolved.length} open doubts in queue
        </div>
      </div>

      {/* Teacher "What to Re-Teach" Insight Bar */}
      {topUnresolvedTopic && (
        <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 flex items-start sm:items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Lightbulb className="w-4 h-4" />
          </span>
          <p className="text-sm text-blue-950 leading-relaxed">
            <strong>Faculty Insight:</strong>{' '}
            <span className="font-semibold">&lsquo;{topUnresolvedTopic.topic}&rsquo;</span>{' '}
            currently has the most open doubts (
            <span className="tabular-nums font-semibold">
              {topUnresolvedTopic.count}
            </span>{' '}
            unresolved) — recommended for next class recap.
          </p>
        </div>
      )}

      {/* Sort & Filter Controls */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-1">View:</span>
          <button
            type="button"
            onClick={() => setSortMode('waiting')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              sortMode === 'waiting'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Longest Waiting Time</span>
          </button>

          <button
            type="button"
            onClick={() => setSortMode('topic')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              sortMode === 'topic'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Group by Topic</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="tracker-subject" className="text-xs font-medium text-slate-500">
            Subject:
          </label>
          <select
            id="tracker-subject"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            {SUBJECT_FILTERS.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2-Column Layout: Queue Cards (Left 8) + Leaderboard (Right 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-4">
          {filteredUnresolved.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-10 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
              <h2 className="font-display text-lg font-bold text-slate-900">
                No unresolved doubts in this view
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {subjectFilter === 'All Subjects'
                  ? 'Every student question has at least one Peer-Accepted or Teacher-Verified solution.'
                  : `All doubts in ${subjectFilter} are currently resolved.`}
              </p>
            </div>
          ) : sortMode === 'waiting' ? (
            <div className="space-y-3.5">{filteredUnresolved.map(renderQueueCard)}</div>
          ) : (
            <div className="space-y-6">
              {groupedByTopic.map(([topicName, topicDoubts]) => (
                <div key={topicName} className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h3 className="font-display text-base font-bold text-slate-900">
                      {topicName}
                    </h3>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full tabular-nums">
                      {topicDoubts.length} open
                    </span>
                  </div>
                  <div className="space-y-3">{topicDoubts.map(renderQueueCard)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Trusted Solver Leaderboard Widget */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                <Trophy className="w-4 h-4" />
              </span>
              <div>
                <h2 className="font-display text-base font-bold text-slate-900">
                  Trusted Solver Leaderboard
                </h2>
                <p className="text-xs text-slate-500">
                  Earn points by clearing open peer doubts
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {TOP_SOLVERS.map((solver) => (
                <div
                  key={solver.rank}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold tabular-nums shrink-0 ${
                        solver.rank === 1
                          ? 'bg-amber-500 text-white'
                          : solver.rank === 2
                            ? 'bg-slate-700 text-white'
                            : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      #{solver.rank}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {solver.name}
                      </p>
                      <p className="text-xs text-slate-600 flex items-center gap-1">
                        <Award className="w-3 h-3 text-indigo-600 shrink-0" />
                        <span>{solver.badge}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md tabular-nums whitespace-nowrap shrink-0">
                    {solver.points} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

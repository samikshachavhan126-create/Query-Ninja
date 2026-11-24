import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Layers,
  Lightbulb,
  Search,
  Trophy,
  X,
} from 'lucide-react';
import { Doubt } from '../types';
import { UNRESOLVED_SUBJECT_FILTERS } from '../data/languages';
import { getDoubtTrustState } from './TrustBadges';

interface UnresolvedTrackerViewProps {
  doubts: Doubt[];
  onSelectDoubt: (doubtId: string) => void;
}

type TrackerSortMode = 'waiting' | 'topic';

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
  const [searchQuery, setSearchQuery] = useState<string>('');

  // All doubts without any visible Peer-Accepted or Teacher-Verified answer
  const allUnresolved = useMemo(
    () => doubts.filter((d) => getDoubtTrustState(d).isUnresolved),
    [doubts]
  );

  // Merge canonical subject filters with any dynamic subjects present in open doubts
  const subjectFilters = useMemo(() => {
    const known = new Set<string>(UNRESOLVED_SUBJECT_FILTERS);
    const extras = allUnresolved
      .map((d) => d.subject)
      .filter((s) => !known.has(s));
    return [...UNRESOLVED_SUBJECT_FILTERS, ...Array.from(new Set(extras))];
  }, [allUnresolved]);

  const openCountBySubject = useMemo(() => {
    const counts = new Map<string, number>();
    for (const d of allUnresolved) {
      counts.set(d.subject, (counts.get(d.subject) ?? 0) + 1);
    }
    return counts;
  }, [allUnresolved]);

  const filteredUnresolved = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const base = allUnresolved.filter((d) => {
      if (subjectFilter !== 'All Subjects' && d.subject !== subjectFilter) {
        return false;
      }
      if (q) {
        const haystack = [
          d.title,
          d.description,
          d.subject,
          d.topic,
          d.authorName,
          ...d.attachments,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    return [...base].sort((a, b) => b.waitingHours - a.waitingHours);
  }, [allUnresolved, subjectFilter, searchQuery]);

  // Teacher "What to Re-Teach" Insight: topic with highest open doubt count in active queue
  const topUnresolvedTopic = useMemo(() => {
    const source =
      subjectFilter === 'All Subjects' ? allUnresolved : filteredUnresolved;
    if (source.length === 0) return null;
    const counts = new Map<string, number>();
    for (const d of source) {
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
  }, [allUnresolved, filteredUnresolved, subjectFilter]);

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
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all p-5 space-y-3 cursor-pointer"
      >
        {/* Top Row: Waiting Alert Badge + Subject / Topic */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/70">
              {doubt.subject}
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {doubt.topic}
            </span>
          </div>

          {isUrgent ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 tabular-nums whitespace-nowrap">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>Waiting {waitLabel} • Urgent Teacher Alert</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 tabular-nums whitespace-nowrap">
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                {doubt.waitingHours <= 0 ? 'Just now' : `Waiting ${waitLabel}`}
              </span>
            </span>
          )}
        </div>

        {/* Title & Snippet */}
        <div>
          <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
            {doubt.title}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
            {doubt.description}
          </p>
        </div>

        {/* Bottom Metadata & Resolve CTA */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Asked by <strong className="text-slate-700 dark:text-slate-200">{doubt.authorName}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-medium text-slate-700 dark:text-slate-300 tabular-nums">
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
            <span>Step In &amp; Resolve</span>
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
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Unresolved Doubt Tracker
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Priority queue of open questions awaiting a Peer-Accepted or Teacher-Verified walkthrough.
          </p>
        </div>
        <div className="text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 px-3 py-1.5 rounded-lg tabular-nums self-start sm:self-auto">
          {allUnresolved.length} open in queue
        </div>
      </div>

      {/* Teacher "What to Re-Teach" Insight Bar */}
      {topUnresolvedTopic && (
        <div className="bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 rounded-xl p-4 flex items-start sm:items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Lightbulb className="w-4 h-4" />
          </span>
          <p className="text-sm text-blue-950 dark:text-blue-200 leading-relaxed">
            <strong>
              Faculty Pulse
              {subjectFilter !== 'All Subjects' ? ` (${subjectFilter})` : ''}:
            </strong>{' '}
            <span className="font-semibold">&lsquo;{topUnresolvedTopic.topic}&rsquo;</span>{' '}
            currently leads with{' '}
            <span className="tabular-nums font-semibold">
              {topUnresolvedTopic.count}
            </span>{' '}
            open {topUnresolvedTopic.count === 1 ? 'doubt' : 'doubts'} — ideal for your next lecture recap.
          </p>
        </div>
      )}

      {/* Sort & Filter Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">View:</span>
          <button
            type="button"
            onClick={() => setSortMode('waiting')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              sortMode === 'waiting'
                ? 'bg-slate-900 dark:bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700'
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
                ? 'bg-slate-900 dark:bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Group by Topic</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 flex-1 sm:flex-initial justify-end">
          {/* Tracker Keyword Search */}
          <div className="relative flex-1 sm:w-56 min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search open doubts..."
              aria-label="Search unresolved doubts by keyword, language, or topic"
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear tracker search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="tracker-subject" className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Subject:
            </label>
            <select
              id="tracker-subject"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {subjectFilters.map((subj) => {
                const count =
                  subj === 'All Subjects'
                    ? allUnresolved.length
                    : openCountBySubject.get(subj) ?? 0;
                return (
                  <option key={subj} value={subj}>
                    {subj} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* 2-Column Layout: Queue Cards (Left 8) + Leaderboard (Right 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-4">
          {filteredUnresolved.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs p-10 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
                {searchQuery.trim()
                  ? 'No matching open doubts'
                  : 'Queue cleared!'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {searchQuery.trim()
                  ? 'Try clearing your search keyword or switching to All Subjects.'
                  : subjectFilter === 'All Subjects'
                    ? 'Every question now has at least one Peer-Accepted or Teacher-Verified walkthrough.'
                    : `All doubts in ${subjectFilter} are currently resolved.`}
              </p>
              {(searchQuery.trim() || subjectFilter !== 'All Subjects') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSubjectFilter('All Subjects');
                  }}
                  className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Reset Tracker Filters
                </button>
              )}
            </div>
          ) : sortMode === 'waiting' ? (
            <div className="space-y-3.5">{filteredUnresolved.map(renderQueueCard)}</div>
          ) : (
            <div className="space-y-6">
              {groupedByTopic.map(([topicName, topicDoubts]) => (
                <div key={topicName} className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                      {topicName}
                    </h3>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full tabular-nums">
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/80 flex items-center justify-center shrink-0">
                <Trophy className="w-4 h-4" />
              </span>
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                  Trusted Solver Leaderboard
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Climb the ranks by unblocking classmates
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {TOP_SOLVERS.map((solver) => (
                <div
                  key={solver.rank}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold tabular-nums shrink-0 ${
                        solver.rank === 1
                          ? 'bg-amber-500 text-white'
                          : solver.rank === 2
                            ? 'bg-slate-700 dark:bg-slate-600 text-white'
                            : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                      }`}
                    >
                      #{solver.rank}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {solver.name}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1">
                        <Award className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span>{solver.badge}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-2 py-1 rounded-md tabular-nums whitespace-nowrap shrink-0">
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

import { useMemo, useState } from 'react';
import {
  Paperclip,
  MessageSquare,
  ArrowRight,
  SlidersHorizontal,
  RotateCcw,
  AlertTriangle,
  ThumbsUp,
} from 'lucide-react';
import { Doubt, UserRole } from '../types';
import { TrustBadges, getDoubtTrustState } from './TrustBadges';

interface DoubtFeedViewProps {
  doubts: Doubt[];
  searchQuery: string;
  onClearSearch: () => void;
  onSelectDoubt: (doubtId: string) => void;
  onOpenAskDoubt: () => void;
  activeRole: UserRole;
}

type StatusFilter = 'all' | 'unresolved' | 'peer_accepted' | 'teacher_verified';
type SortOption = 'priority' | 'recent' | 'answers';

export function DoubtFeedView({
  doubts,
  searchQuery,
  onClearSearch,
  onSelectDoubt,
  onOpenAskDoubt,
  activeRole,
}: DoubtFeedViewProps) {
  const [subjectFilter, setSubjectFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [topicFilter, setTopicFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  const subjects = useMemo(() => {
    const unique = Array.from(new Set(doubts.map((d) => d.subject)));
    return ['All', ...unique];
  }, [doubts]);

  const topics = useMemo(() => {
    const unique = Array.from(new Set(doubts.map((d) => d.topic)));
    return ['All', ...unique];
  }, [doubts]);

  const filteredDoubts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const matches = doubts.filter((doubt) => {
      if (subjectFilter !== 'All' && doubt.subject !== subjectFilter) {
        return false;
      }
      if (topicFilter !== 'All' && doubt.topic !== topicFilter) {
        return false;
      }

      const { hasPeerAccepted, hasTeacherVerified, isUnresolved } = getDoubtTrustState(doubt);
      if (statusFilter === 'unresolved' && !isUnresolved) return false;
      if (statusFilter === 'peer_accepted' && !hasPeerAccepted) return false;
      if (statusFilter === 'teacher_verified' && !hasTeacherVerified) return false;

      if (q) {
        const haystack = [
          doubt.title,
          doubt.description,
          doubt.subject,
          doubt.topic,
          doubt.authorName,
          ...doubt.attachments,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });

    if (sortBy === 'priority') {
      return [...matches].sort((a, b) => b.waitingHours - a.waitingHours);
    }
    if (sortBy === 'answers') {
      return [...matches].sort((a, b) => b.answers.length - a.answers.length);
    }
    return matches;
  }, [doubts, subjectFilter, topicFilter, statusFilter, searchQuery, sortBy]);

  const hasActiveFilters =
    subjectFilter !== 'All' ||
    statusFilter !== 'all' ||
    topicFilter !== 'All' ||
    searchQuery.trim().length > 0;

  const resetAllFilters = () => {
    setSubjectFilter('All');
    setStatusFilter('all');
    setTopicFilter('All');
    onClearSearch();
  };

  return (
    <section className="space-y-5">
      {/* Page Title & Role Context Strip */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Academic Doubt Feed
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Peer-powered, faculty-curated engineering Q&amp;A for First-Year CSE.
          </p>
        </div>
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
          Showing <span className="font-semibold text-slate-900 dark:text-slate-100">{filteredDoubts.length}</span> of{' '}
          <span className="font-semibold text-slate-900 dark:text-slate-100">{doubts.length}</span> doubts
        </div>
      </div>

      {/* Compact Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Subject Segmented Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Subject:
            </span>
            {subjects.map((subject) => (
              <button
                key={subject}
                type="button"
                onClick={() => setSubjectFilter(subject)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  subjectFilter === subject
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700'
                }`}
              >
                {subject}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="feed-sort" className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Sort:
            </label>
            <select
              id="feed-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="recent">Feed Order</option>
              <option value="priority">Longest Waiting</option>
              <option value="answers">Most Answers</option>
            </select>
          </div>
        </div>

        {/* Status & Topic Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">Status:</span>
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'unresolved', label: 'Unresolved' },
                { id: 'peer_accepted', label: 'Peer-Accepted' },
                { id: 'teacher_verified', label: 'Teacher-Verified' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setStatusFilter(item.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  statusFilter === item.id
                    ? 'bg-slate-900 dark:bg-indigo-600 text-white'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">Topic:</span>
            {topics.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => setTopicFilter(topic)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  topicFilter === topic
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/80 font-semibold'
                    : 'bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {topic}
              </button>
            ))}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors whitespace-nowrap ml-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Doubt Cards List */}
      {filteredDoubts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs p-10 text-center">
          <p className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
            No threads match your filters
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Try clearing your active filters or search keywords, or spark a new thread for your batch.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={resetAllFilters}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Reset Filters
            </button>
            <button
              type="button"
              onClick={onOpenAskDoubt}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
            >
              Ask a Doubt
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredDoubts.map((doubt) => {
            const visibleAnswers = doubt.answers.filter((a) => !a.isHiddenByModerator);
            const flaggedAnswerCount = visibleAnswers.filter(
              (a) => a.ratings.misleading >= 3
            ).length;
            const totalHelpful = visibleAnswers.reduce(
              (sum, a) => sum + a.ratings.helpful,
              0
            );

            return (
              <article
                key={doubt.id}
                onClick={() => onSelectDoubt(doubt.id)}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all p-5 cursor-pointer"
              >
                {/* Top Row: Subject/Topic Pills + Trust Status Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/70 whitespace-nowrap">
                      {doubt.subject}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {doubt.topic}
                    </span>
                  </div>

                  <TrustBadges doubt={doubt} />
                </div>

                {/* Title & 2-Line Description Preview */}
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                  {doubt.title}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">
                  {doubt.description}
                </p>

                {/* Moderation Notice (e.g., Doubt #2 Misleading Answer Alert) */}
                {flaggedAnswerCount > 0 && (
                  <div
                    className={`mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                      activeRole === 'teacher'
                        ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80'
                        : 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/80'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {activeRole === 'teacher'
                        ? `${flaggedAnswerCount} reply flagged as misleading — needs faculty review`
                        : 'Heads up: 1 reply has received misleading reports'}
                    </span>
                  </div>
                )}

                {/* Bottom Row: Meta, Attachments, Answer Count, View & Answer CTA */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      Asked by <strong className="font-semibold text-slate-700 dark:text-slate-200">{doubt.authorName}</strong>
                    </span>
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
                      ·
                    </span>
                    <span className="tabular-nums">{doubt.createdAt}</span>

                    {doubt.attachments.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                        <Paperclip className="w-3 h-3 text-slate-500 dark:text-slate-400 shrink-0" />
                        <span>
                          {doubt.attachments.length === 1
                            ? doubt.attachments[0]
                            : `${doubt.attachments.length} files`}
                        </span>
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <span>
                        {visibleAnswers.length}{' '}
                        {visibleAnswers.length === 1 ? 'answer' : 'answers'}
                      </span>
                    </span>

                    {totalHelpful > 0 && (
                      <span className="inline-flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400 tabular-nums">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{totalHelpful} helpful</span>
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDoubt(doubt.id);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Open &amp; Answer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

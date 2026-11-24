import { useMemo } from 'react';
import { Flame, RotateCcw, TrendingUp } from 'lucide-react';
import { Doubt } from '../types';
import { getDoubtTrustState } from './TrustBadges';

interface PopularTopicsCloudProps {
  doubts: Doubt[];
  activeTopic: string;
  onSelectTopic: (topic: string) => void;
}

interface TopicMetric {
  topic: string;
  doubtCount: number;
  answerCount: number;
  helpfulCount: number;
  unresolvedCount: number;
  activityScore: number;
  ratio: number;
  primarySubject: string;
}

export function PopularTopicsCloud({
  doubts,
  activeTopic,
  onSelectTopic,
}: PopularTopicsCloudProps) {
  const { cloudTopics, topActiveTopics, maxScore } = useMemo(() => {
    const map = new Map<
      string,
      {
        doubtCount: number;
        answerCount: number;
        helpfulCount: number;
        unresolvedCount: number;
        subjectCounts: Map<string, number>;
      }
    >();

    for (const doubt of doubts) {
      const entry = map.get(doubt.topic) ?? {
        doubtCount: 0,
        answerCount: 0,
        helpfulCount: 0,
        unresolvedCount: 0,
        subjectCounts: new Map<string, number>(),
      };

      const visibleAnswers = doubt.answers.filter((a) => !a.isHiddenByModerator);
      const helpfulVotes = visibleAnswers.reduce(
        (sum, a) => sum + a.ratings.helpful,
        0
      );
      const { isUnresolved } = getDoubtTrustState(doubt);

      entry.doubtCount += 1;
      entry.answerCount += visibleAnswers.length;
      entry.helpfulCount += helpfulVotes;
      if (isUnresolved) entry.unresolvedCount += 1;
      entry.subjectCounts.set(
        doubt.subject,
        (entry.subjectCounts.get(doubt.subject) ?? 0) + 1
      );

      map.set(doubt.topic, entry);
    }

    const raw = Array.from(map.entries()).map(([topic, stats]) => {
      const activityScore =
        stats.doubtCount * 4 +
        stats.answerCount * 2 +
        Math.min(stats.helpfulCount, 40) * 0.35 +
        stats.unresolvedCount * 1.5;

      let primarySubject = '';
      let bestSubjectCount = 0;
      for (const [subj, count] of stats.subjectCounts.entries()) {
        if (count > bestSubjectCount) {
          primarySubject = subj;
          bestSubjectCount = count;
        }
      }

      return {
        topic,
        doubtCount: stats.doubtCount,
        answerCount: stats.answerCount,
        helpfulCount: stats.helpfulCount,
        unresolvedCount: stats.unresolvedCount,
        activityScore,
        primarySubject,
      };
    });

    raw.sort((a, b) => {
      if (b.activityScore !== a.activityScore) {
        return b.activityScore - a.activityScore;
      }
      if (b.doubtCount !== a.doubtCount) {
        return b.doubtCount - a.doubtCount;
      }
      return a.topic.localeCompare(b.topic);
    });

    const highest = raw.length > 0 ? raw[0].activityScore : 1;
    const lowest = raw.length > 0 ? raw[raw.length - 1].activityScore : 0;
    const spread = highest - lowest;

    const withRatios: TopicMetric[] = raw.map((item) => ({
      ...item,
      ratio: spread > 0 ? (item.activityScore - lowest) / spread : 0.5,
    }));

    // Arrange cloud tags symmetrically from center-ish emphasis while keeping top tags easy to scan
    const arranged: TopicMetric[] = [];
    withRatios.forEach((item, idx) => {
      if (idx % 2 === 0) {
        arranged.push(item);
      } else {
        arranged.unshift(item);
      }
    });

    return {
      cloudTopics: arranged,
      topActiveTopics: withRatios.slice(0, 3),
      maxScore: highest,
    };
  }, [doubts]);

  const getTagClasses = (item: TopicMetric, isSelected: boolean, isTopHot: boolean) => {
    const sizeClasses =
      item.ratio >= 0.72
        ? 'text-[15px] font-bold px-3.5 py-2'
        : item.ratio >= 0.42
        ? 'text-sm font-semibold px-3 py-1.5'
        : item.ratio >= 0.18
        ? 'text-xs font-semibold px-2.5 py-1.5'
        : 'text-xs font-medium px-2.5 py-1';

    if (isSelected) {
      return `${sizeClasses} bg-indigo-600 text-white border-indigo-600 shadow-xs`;
    }

    if (isTopHot || item.ratio >= 0.72) {
      return `${sizeClasses} bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/70`;
    }

    if (item.ratio >= 0.42) {
      return `${sizeClasses} bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-700 dark:hover:text-indigo-300`;
    }

    return `${sizeClasses} bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100`;
  };

  const hottestTopicName = topActiveTopics[0]?.topic;

  return (
    <aside
      aria-label="Popular Topics tag cloud"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs p-5 space-y-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 pb-3.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
            <TrendingUp className="w-4 h-4" />
          </span>
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
              Popular Topics
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Click a trending tag to filter active threads
            </p>
          </div>
        </div>

        {activeTopic !== 'All' && (
          <button
            type="button"
            onClick={() => onSelectTopic('All')}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Interactive Tag Cloud */}
      {cloudTopics.length === 0 ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Topic activity will appear once doubts are posted.
        </p>
      ) : (
        <div
          role="group"
          aria-label="Filter feed by popular topic"
          className="flex flex-wrap items-center gap-2"
        >
          {cloudTopics.map((item) => {
            const isSelected = activeTopic === item.topic;
            const isHottest = item.topic === hottestTopicName;
            return (
              <button
                key={item.topic}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelectTopic(item.topic)}
                title={`${item.topic}: ${item.doubtCount} ${
                  item.doubtCount === 1 ? 'doubt' : 'doubts'
                }, ${item.answerCount} ${
                  item.answerCount === 1 ? 'answer' : 'answers'
                }${item.unresolvedCount > 0 ? `, ${item.unresolvedCount} open` : ''}`}
                className={`inline-flex items-center gap-1.5 rounded-lg border transition-all whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${getTagClasses(
                  item,
                  isSelected,
                  isHottest
                )}`}
              >
                {isHottest && (
                  <Flame
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isSelected
                        ? 'text-amber-200'
                        : 'text-amber-500 dark:text-amber-400'
                    }`}
                  />
                )}
                <span>{item.topic}</span>
                <span
                  className={`text-[11px] font-mono tabular-nums ${
                    isSelected
                      ? 'text-indigo-100'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {item.doubtCount}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* High-Activity Breakdown */}
      {topActiveTopics.length > 0 && (
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              High-Activity Areas
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Doubts · Replies
            </span>
          </div>

          <div className="space-y-2.5">
            {topActiveTopics.map((item) => {
              const isSelected = activeTopic === item.topic;
              const barPercent = Math.max(
                14,
                Math.round((item.activityScore / maxScore) * 100)
              );

              return (
                <button
                  key={item.topic}
                  type="button"
                  onClick={() => onSelectTopic(item.topic)}
                  className={`w-full text-left rounded-lg p-2 -mx-2 transition-colors ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/50'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span
                      className={`font-semibold truncate ${
                        isSelected
                          ? 'text-indigo-700 dark:text-indigo-300'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {item.topic}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap shrink-0">
                      {item.doubtCount}d · {item.answerCount}a
                      {item.unresolvedCount > 0 ? ` · ${item.unresolvedCount} open` : ''}
                    </span>
                  </div>

                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${barPercent}%` }}
                      className={`h-full rounded-full transition-all duration-300 ${
                        isSelected
                          ? 'bg-indigo-600 dark:bg-indigo-400'
                          : 'bg-indigo-500/80 dark:bg-indigo-500/70'
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}

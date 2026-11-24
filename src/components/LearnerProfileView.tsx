import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Code2,
  Compass,
  Flame,
  GraduationCap,
  Layers,
  Lock,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  Trophy,
} from 'lucide-react';
import { Doubt, Persona } from '../types';
import { computeUserActivity, EarnedBadge } from '../utils/userActivity';

interface LearnerProfileViewProps {
  doubts: Doubt[];
  activePersona: Persona;
  onSelectDoubt: (doubtId: string) => void;
  onOpenUnresolved: () => void;
  onBackToFeed: () => void;
}

type BadgeFilter = 'all' | 'earned' | 'in_progress';

export function LearnerProfileView({
  doubts,
  activePersona,
  onSelectDoubt,
  onOpenUnresolved,
  onBackToFeed,
}: LearnerProfileViewProps) {
  const [badgeFilter, setBadgeFilter] = useState<BadgeFilter>('all');

  const activity = useMemo(
    () => computeUserActivity(doubts, activePersona),
    [doubts, activePersona]
  );

  const earnedBadgesCount = useMemo(
    () => activity.badges.filter((b) => b.earned).length,
    [activity.badges]
  );

  const inProgressBadgesCount = activity.badges.length - earnedBadgesCount;

  const filteredBadges = useMemo(() => {
    if (badgeFilter === 'earned') return activity.badges.filter((b) => b.earned);
    if (badgeFilter === 'in_progress') return activity.badges.filter((b) => !b.earned);
    return activity.badges;
  }, [activity.badges, badgeFilter]);

  const maxSubjectScore = useMemo(() => {
    if (activity.subjectBreakdown.length === 0) return 1;
    return Math.max(
      1,
      ...activity.subjectBreakdown.map(
        (s) => s.solvedCount * 3 + s.answersCount * 2 + s.askedCount
      )
    );
  }, [activity.subjectBreakdown]);

  const getBadgeIcon = (badge: EarnedBadge) => {
    const iconClass = badge.earned
      ? 'w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0'
      : 'w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0';

    switch (badge.id) {
      case 'first-resolution':
        return <CheckCircle2 className={iconClass} />;
      case 'helpful-contributor':
        return <ThumbsUp className={iconClass} />;
      case 'faculty-endorsed':
        return <ShieldCheck className={iconClass} />;
      case 'code-mentor':
        return <Code2 className={iconClass} />;
      case 'polyglot-solver':
        return <Layers className={iconClass} />;
      case 'doubt-pathfinder':
        return <Compass className={iconClass} />;
      case 'community-pillar':
        return <Award className={iconClass} />;
      case 'campus-sensei':
        return <Trophy className={iconClass} />;
      default:
        return <Sparkles className={iconClass} />;
    }
  };

  const getStatusTagClasses = (statusTag: string) => {
    if (statusTag === 'Teacher-Verified') {
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/80';
    }
    if (statusTag === 'Peer-Accepted') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80';
    }
    if (statusTag === 'Peer Reply') {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/80';
    }
    return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/80';
  };

  const getDayHeatClasses = (contributions: number, isToday: boolean) => {
    if (contributions >= 3) {
      return `bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-400 ${
        isToday ? 'ring-2 ring-indigo-500/30 dark:ring-indigo-400/30' : ''
      }`;
    }
    if (contributions === 2) {
      return `bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/80 dark:text-indigo-200 dark:border-indigo-800 ${
        isToday ? 'ring-2 ring-indigo-500/30 dark:ring-indigo-400/30' : ''
      }`;
    }
    if (contributions === 1) {
      return `bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800 ${
        isToday ? 'ring-2 ring-emerald-500/30 dark:ring-emerald-400/30' : ''
      }`;
    }
    return `bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800/70 dark:text-slate-400 dark:border-slate-700 ${
      isToday ? 'ring-2 ring-slate-300/60 dark:ring-slate-600/60' : ''
    }`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/80 whitespace-nowrap">
                <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                <span>Learner Profile</span>
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${activity.rankTier.badgeClasses}`}
              >
                <Trophy className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {activity.rankTier.tierLabel} · {activity.rankTier.title}
                </span>
              </span>
              {activity.isHelpfulContributor && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80 whitespace-nowrap">
                  <ThumbsUp className="w-3 h-3 shrink-0" />
                  <span>Helpful Contributor</span>
                </span>
              )}
            </div>

            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {activePersona.fullName}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                {activePersona.roleTitle} · {activePersona.metaText} — Live statistics computed across{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                  {doubts.length}
                </span>{' '}
                campus threads.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onBackToFeed}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span>Back to Doubt Feed</span>
            </button>

            <button
              type="button"
              onClick={onOpenUnresolved}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <span>Solve Open Doubts</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>
      </section>

      {/* 4-Column KPI Strip */}
      <section
        aria-label="Key learner metrics"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Total Solved Doubts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Solved Doubts
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          </div>
          <p className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
            {activity.solvedCount}
          </p>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {activity.teacherVerifiedCount} Teacher-Verified · {activity.peerAcceptedCount}{' '}
            Peer-Accepted
          </p>
        </div>

        {/* Helpfulness Points */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Helpfulness Points
            </span>
            <ThumbsUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          </div>
          <p className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
            {activity.activityPoints}{' '}
            <span className="text-base font-semibold text-slate-500 dark:text-slate-400">
              pts
            </span>
          </p>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {activity.helpfulVotes} helpful votes · {activity.totalAnswersCount} replies posted
          </p>
        </div>

        {/* Rank Tier */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Current Rank Tier
            </span>
            <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-slate-100 truncate">
            {activity.rankTier.title}
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {activity.rankTier.nextTierTitle && activity.rankTier.nextTierPoints !== null
              ? `${activity.rankTier.tierLabel} · ${Math.max(
                  0,
                  activity.rankTier.nextTierPoints - activity.activityPoints
                )} pts to ${activity.rankTier.nextTierTitle}`
              : `${activity.rankTier.tierLabel} · Highest campus rank`}
          </p>
        </div>

        {/* Contribution Streak */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Contribution Streak
            </span>
            <Flame className="w-4 h-4 text-orange-500 dark:text-orange-400 shrink-0" />
          </div>
          <p className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
            {activity.streak.currentDays}{' '}
            <span className="text-base font-semibold text-slate-500 dark:text-slate-400">
              {activity.streak.currentDays === 1 ? 'day' : 'days'}
            </span>
          </p>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            Longest: {activity.streak.longestDays}d ·{' '}
            {activity.streak.activeToday ? 'Active today' : 'No activity logged today'}
          </p>
        </div>
      </section>

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Columns: Streak Tracker + Earned Badges */}
        <div className="lg:col-span-7 space-y-6">
          {/* Streak Tracker & Rank Progression Card */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
                  7-Day Streak & Rank Progression
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Daily consistency from solved doubts, peer replies, and questions raised.
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${
                  activity.streak.activeToday
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80'
                    : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                }`}
              >
                <Flame className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {activity.streak.activeToday
                    ? 'Streak kept alive today'
                    : 'Reply or solve today to extend streak'}
                </span>
              </span>
            </div>

            {/* 7-Day Activity Strip */}
            <div className="grid grid-cols-7 gap-2">
              {activity.streak.days.map((day) => (
                <div
                  key={day.dateLabel}
                  title={`${day.dateLabel}: ${day.contributions} contribution${
                    day.contributions === 1 ? '' : 's'
                  }`}
                  className={`rounded-lg border p-2.5 text-center transition-colors ${getDayHeatClasses(
                    day.contributions,
                    day.isToday
                  )}`}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide truncate">
                    {day.label}
                  </p>
                  <p className="mt-1.5 font-display text-lg font-bold tabular-nums leading-none">
                    {day.contributions}
                  </p>
                  <p className="mt-1 text-[10px] opacity-80 truncate">{day.dateLabel}</p>
                </div>
              ))}
            </div>

            {/* Rank Progress Bar */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  Next Milestone:{' '}
                  <span className="text-indigo-700 dark:text-indigo-300">
                    {activity.rankTier.nextTierTitle ?? 'Maximum Tier Reached'}
                  </span>
                </span>
                <span className="font-mono font-semibold text-slate-600 dark:text-slate-300 tabular-nums">
                  {activity.progressPercent}% · {activity.activityPoints}
                  {activity.rankTier.nextTierPoints !== null
                    ? ` / ${activity.rankTier.nextTierPoints} pts`
                    : ' pts'}
                </span>
              </div>

              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${activity.progressPercent}%` }}
                  className="h-full rounded-full bg-indigo-600 dark:bg-indigo-400 transition-all duration-300"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                <span>
                  Scoring: +30 solved · +15 faculty verified · +10 reply · +2 helpful vote · +5
                  asked
                </span>
                <span>{activity.askedCount} doubts raised</span>
              </div>
            </div>
          </section>

          {/* Earned Badges Section */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
                  Earned Badges & Milestones
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                  {earnedBadgesCount} of {activity.badges.length} badges unlocked from live
                  contributions
                </p>
              </div>

              {/* Badge Filter Tabs */}
              <div
                role="tablist"
                aria-label="Filter badges"
                className="inline-flex items-center p-1 rounded-lg bg-slate-100 dark:bg-slate-800 self-start sm:self-auto"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={badgeFilter === 'all'}
                  onClick={() => setBadgeFilter('all')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 tabular-nums ${
                    badgeFilter === 'all'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  All ({activity.badges.length})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={badgeFilter === 'earned'}
                  onClick={() => setBadgeFilter('earned')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 tabular-nums ${
                    badgeFilter === 'earned'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Earned ({earnedBadgesCount})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={badgeFilter === 'in_progress'}
                  onClick={() => setBadgeFilter('in_progress')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 tabular-nums ${
                    badgeFilter === 'in_progress'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  In Progress ({inProgressBadgesCount})
                </button>
              </div>
            </div>

            {filteredBadges.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <Award className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {badgeFilter === 'earned'
                    ? 'No badges earned yet for this persona'
                    : 'Every campus badge is unlocked!'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {badgeFilter === 'earned'
                    ? 'Answer an open doubt or include a runnable code snippet to unlock your first badge.'
                    : 'Outstanding contribution consistency across Query Ninja.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredBadges.map((badge) => {
                  const pct = Math.min(
                    100,
                    Math.round((badge.progressCurrent / badge.progressTarget) * 100)
                  );
                  return (
                    <div
                      key={badge.id}
                      className={`py-4 first:pt-4 last:pb-1 flex items-start justify-between gap-4 ${
                        badge.earned ? '' : 'opacity-85'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div
                          className={`mt-0.5 w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            badge.earned
                              ? 'bg-indigo-50 dark:bg-indigo-950/60'
                              : 'bg-slate-100 dark:bg-slate-800'
                          }`}
                        >
                          {getBadgeIcon(badge)}
                        </div>

                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {badge.title}
                            </h3>
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                              {badge.category}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            {badge.description}
                          </p>

                          <div className="flex items-center gap-3 pt-0.5">
                            <div className="h-1.5 flex-1 max-w-[180px] rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div
                                style={{ width: `${pct}%` }}
                                className={`h-full rounded-full transition-all duration-300 ${
                                  badge.earned
                                    ? 'bg-emerald-500 dark:bg-emerald-400'
                                    : 'bg-indigo-500 dark:bg-indigo-400'
                                }`}
                              />
                            </div>
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">
                              {badge.progressLabel}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 pt-0.5">
                        {badge.earned ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80 whitespace-nowrap">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Earned</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 whitespace-nowrap">
                            <Lock className="w-3 h-3 shrink-0" />
                            <span>Locked</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right 5 Columns: Subject Breakdown + Recent Contributions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Subject & Language Breakdown */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
                  Subject & Language Activity
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Where {activePersona.shortName} contributes across campus tracks.
                </p>
              </div>
              <BookOpen className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
            </div>

            {activity.subjectBreakdown.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  No subject activity recorded yet for {activePersona.shortName}.
                </p>
                <button
                  type="button"
                  onClick={onOpenUnresolved}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 transition-colors whitespace-nowrap"
                >
                  <span>Browse Open Doubts</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {activity.subjectBreakdown.map((item) => {
                  const score = item.solvedCount * 3 + item.answersCount * 2 + item.askedCount;
                  const barPct = Math.max(10, Math.round((score / maxSubjectScore) * 100));

                  return (
                    <div key={item.subject} className="py-3.5 first:pt-4 last:pb-1 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {item.subject}
                        </span>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">
                          {item.helpfulVotes} helpful votes
                        </span>
                      </div>

                      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          style={{ width: `${barPct}%` }}
                          className="h-full rounded-full bg-indigo-600 dark:bg-indigo-400"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                        <span>
                          <strong className="text-slate-700 dark:text-slate-200">
                            {item.solvedCount}
                          </strong>{' '}
                          solved
                        </span>
                        <span>·</span>
                        <span>
                          <strong className="text-slate-700 dark:text-slate-200">
                            {item.answersCount}
                          </strong>{' '}
                          replies
                        </span>
                        <span>·</span>
                        <span>
                          <strong className="text-slate-700 dark:text-slate-200">
                            {item.askedCount}
                          </strong>{' '}
                          asked
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Recent Contributions */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
                  Recent Contributions
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Click any item to inspect the full thread and annotations.
                </p>
              </div>
              <MessageSquare className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
            </div>

            {activity.recentContributions.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  No recent threads or replies found yet.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {activity.recentContributions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectDoubt(item.doubtId)}
                    className="w-full text-left py-3.5 first:pt-4 last:pb-1 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap ${getStatusTagClasses(
                              item.statusTag
                            )}`}
                          >
                            {item.statusTag}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {item.subject}
                          </span>
                        </div>

                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                          {item.doubtTitle}
                        </p>

                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                          <span className="capitalize">
                            {item.kind === 'solved'
                              ? 'Solved thread'
                              : item.kind === 'answered'
                                ? 'Posted reply'
                                : 'Asked doubt'}
                          </span>
                          <span>·</span>
                          <span>{item.timestamp}</span>
                          {item.helpfulVotes > 0 && (
                            <>
                              <span>·</span>
                              <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                                {item.helpfulVotes} helpful
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shrink-0 mt-1 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

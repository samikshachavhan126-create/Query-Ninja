import { Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Doubt } from '../types';

interface TrustBadgesProps {
  doubt: Doubt;
}

export function formatWaitingTime(hours: number): string {
  if (hours <= 0) {
    return 'Just now';
  }
  if (hours < 1) {
    const mins = Math.max(1, Math.round(hours * 60));
    return `${mins}m`;
  }
  return `${Math.round(hours)}h`;
}

export function getDoubtTrustState(doubt: Doubt) {
  const visibleAnswers = doubt.answers.filter((a) => !a.isHiddenByModerator);
  const hasPeerAccepted = visibleAnswers.some((a) => a.isPeerAccepted);
  const hasTeacherVerified = visibleAnswers.some((a) => a.isTeacherVerified);
  const isUnresolved = !hasPeerAccepted && !hasTeacherVerified;
  return { hasPeerAccepted, hasTeacherVerified, isUnresolved };
}

export function TrustBadges({ doubt }: TrustBadgesProps) {
  const { hasPeerAccepted, hasTeacherVerified, isUnresolved } = getDoubtTrustState(doubt);

  return (
    <div className="flex flex-wrap items-center gap-2 shrink-0">
      {isUnresolved && (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap tabular-nums ${
            doubt.waitingHours >= 6
              ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/80'
              : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/80'
          }`}
        >
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>
            {doubt.waitingHours <= 0
              ? 'Unresolved • Just now'
              : `Unresolved • Waiting ${formatWaitingTime(doubt.waitingHours)}`}
          </span>
        </span>
      )}

      {hasPeerAccepted && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80 whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Peer-Accepted</span>
        </span>
      )}

      {hasTeacherVerified && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/80 whitespace-nowrap">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
          <span>Teacher-Verified</span>
        </span>
      )}
    </div>
  );
}

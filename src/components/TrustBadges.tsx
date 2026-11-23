import { Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Doubt } from '../types';

interface TrustBadgesProps {
  doubt: Doubt;
}

export function formatWaitingTime(hours: number): string {
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
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>
            Unresolved • Waiting {formatWaitingTime(doubt.waitingHours)}
          </span>
        </span>
      )}

      {hasPeerAccepted && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Peer-Accepted</span>
        </span>
      )}

      {hasTeacherVerified && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Teacher-Verified</span>
        </span>
      )}
    </div>
  );
}

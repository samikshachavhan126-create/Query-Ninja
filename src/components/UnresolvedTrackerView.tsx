import { ArrowRight, ClockAlert, CheckCircle2 } from 'lucide-react';
import { Doubt } from '../types';
import { formatWaitingTime, getDoubtTrustState } from './TrustBadges';

interface UnresolvedTrackerViewProps {
  doubts: Doubt[];
  onSelectDoubt: (doubtId: string) => void;
}

export function UnresolvedTrackerView({
  doubts,
  onSelectDoubt,
}: UnresolvedTrackerViewProps) {
  const unresolvedDoubts = doubts
    .filter((d) => getDoubtTrustState(d).isUnresolved)
    .sort((a, b) => b.waitingHours - a.waitingHours);

  return (
    <section className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Unresolved Doubt Tracker
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Prioritized queue of open doubts ordered by student waiting duration so no question slips through.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 tabular-nums self-start sm:self-auto">
          <ClockAlert className="w-4 h-4" />
          <span>{unresolvedDoubts.length} open in queue</span>
        </div>
      </div>

      {unresolvedDoubts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-10 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
          <h2 className="font-display text-lg font-bold text-slate-900">
            All doubts resolved
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Every student question currently has a Peer-Accepted or Teacher-Verified answer.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {unresolvedDoubts.map((doubt) => {
            const isUrgent = doubt.waitingHours >= 6;
            return (
              <div
                key={doubt.id}
                onClick={() => onSelectDoubt(doubt.id)}
                className="bg-white border border-slate-200 rounded-xl shadow-xs hover:border-indigo-300 transition-all p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border tabular-nums ${
                        isUrgent
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      <ClockAlert className="w-3.5 h-3.5" />
                      {isUrgent ? 'High Priority' : 'Recently Asked'} · Waiting{' '}
                      {formatWaitingTime(doubt.waitingHours)}
                    </span>
                    <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {doubt.subject}
                    </span>
                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {doubt.topic}
                    </span>
                  </div>

                  <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {doubt.title}
                  </h2>

                  <p className="text-xs text-slate-500">
                    Asked by <strong className="text-slate-700">{doubt.authorName}</strong> ·{' '}
                    {doubt.createdAt} · {doubt.answers.length} answers so far
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectDoubt(doubt.id);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Solve Doubt</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

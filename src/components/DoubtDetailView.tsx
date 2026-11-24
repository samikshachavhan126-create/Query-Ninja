import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Paperclip,
  CheckCircle2,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  EyeOff,
  Eye,
  Send,
  Code2,
  FileText,
  Image as ImageIcon,
  Video,
  Download,
  Flag,
  Ban,
  Clock,
  MessageSquarePlus,
} from 'lucide-react';
import { Answer, AnswerRatings, Doubt, Persona, UserRole } from '../types';
import { TrustBadges, formatWaitingTime, getDoubtTrustState } from './TrustBadges';

interface DoubtDetailViewProps {
  doubt: Doubt;
  activeRole: UserRole;
  activePersona: Persona;
  onBack: () => void;
  onAddAnswer: (
    doubtId: string,
    payload: {
      content: string;
      codeBlock?: string;
      attachmentLabel?: string;
      verifyImmediately?: boolean;
    }
  ) => void;
  onTogglePeerAccept: (doubtId: string, answerId: string) => void;
  onToggleTeacherVerify: (doubtId: string, answerId: string, facultyNote?: string) => void;
  onUpdateFacultyNote: (doubtId: string, answerId: string, facultyNote: string) => void;
  onToggleModeration: (doubtId: string, answerId: string, reason: string) => void;
  onRateAnswer: (
    doubtId: string,
    answerId: string,
    ratingKey: keyof AnswerRatings
  ) => void;
}

function getAnswerSortRank(answer: Answer): number {
  if (answer.isHiddenByModerator) return 5;
  if (answer.isPeerAccepted && answer.isTeacherVerified) return 1;
  if (answer.isTeacherVerified) return 2;
  if (answer.isPeerAccepted) return 3;
  return 4;
}

function getAttachmentIcon(filename: string, type?: string) {
  const lower = filename.toLowerCase();
  if (type === 'pdf' || lower.endsWith('.pdf')) {
    return <FileText className="w-4 h-4 text-rose-600 shrink-0" />;
  }
  if (type === 'image' || /\.(png|jpg|jpeg|webp|svg)$/.test(lower)) {
    return <ImageIcon className="w-4 h-4 text-indigo-600 shrink-0" />;
  }
  if (type === 'video' || /\.(mp4|mov|webm)$/.test(lower)) {
    return <Video className="w-4 h-4 text-blue-600 shrink-0" />;
  }
  return <Code2 className="w-4 h-4 text-emerald-600 shrink-0" />;
}

export function DoubtDetailView({
  doubt,
  activeRole,
  activePersona,
  onBack,
  onAddAnswer,
  onTogglePeerAccept,
  onToggleTeacherVerify,
  onUpdateFacultyNote,
  onToggleModeration,
  onRateAnswer,
}: DoubtDetailViewProps) {
  const [answerText, setAnswerText] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [composerAttachment, setComposerAttachment] = useState<string>('');
  const [verifyImmediately, setVerifyImmediately] = useState(true);

  const [sessionVotes, setSessionVotes] = useState<
    Record<string, Partial<Record<keyof AnswerRatings, boolean>>>
  >({});
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [previewedFile, setPreviewedFile] = useState<string | null>(null);

  const { isUnresolved } = getDoubtTrustState(doubt);

  const sortedAnswers = useMemo(() => {
    return [...doubt.answers].sort((a, b) => {
      const rankDiff = getAnswerSortRank(a) - getAnswerSortRank(b);
      if (rankDiff !== 0) return rankDiff;
      return b.ratings.helpful - a.ratings.helpful;
    });
  }, [doubt.answers]);

  const visibleAnswers = sortedAnswers.filter((a) => !a.isHiddenByModerator);
  const hiddenAnswers = sortedAnswers.filter((a) => a.isHiddenByModerator);

  const handleVote = (answerId: string, key: keyof AnswerRatings) => {
    setSessionVotes((prev) => ({
      ...prev,
      [answerId]: {
        ...(prev[answerId] ?? {}),
        [key]: true,
      },
    }));
    onRateAnswer(doubt.id, answerId, key);
  };

  const handleDownloadSample = (filename: string, bodyText: string) => {
    const blob = new Blob([bodyText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = answerText.trim();
    if (!trimmed) return;

    onAddAnswer(doubt.id, {
      content: trimmed,
      codeBlock: showCodeInput && codeSnippet.trim() ? codeSnippet.trim() : undefined,
      attachmentLabel: composerAttachment || undefined,
      verifyImmediately: activeRole === 'teacher' ? verifyImmediately : false,
    });

    setAnswerText('');
    setCodeSnippet('');
    setShowCodeInput(false);
    setComposerAttachment('');
  };

  const renderAnswerCard = (answer: Answer) => {
    const votes = sessionVotes[answer.id] ?? {};
    const isMisleadingWarned = answer.ratings.misleading >= 2 || Boolean(votes.misleading);

    // Hidden State (Collapsed Moderation Banner)
    if (answer.isHiddenByModerator) {
      return (
        <div
          key={answer.id}
          className="bg-rose-50/90 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-start sm:items-center gap-2.5 text-sm text-rose-800 dark:text-rose-200">
            <Ban className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5 sm:mt-0" />
            <span>
              This reply was collapsed by <strong>Prof. R. K. Kulkarni (Faculty Moderator)</strong>{' '}
              for containing inaccurate or misleading guidance.
            </span>
          </div>

          {activeRole === 'teacher' && (
            <button
              type="button"
              onClick={() =>
                onToggleModeration(
                  doubt.id,
                  answer.id,
                  'Inaccurate or misleading information'
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-700 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Show / Unhide</span>
            </button>
          )}
        </div>
      );
    }

    return (
      <article
        key={answer.id}
        className={`bg-white dark:bg-slate-900 border rounded-xl shadow-xs p-5 space-y-4 transition-colors ${
          answer.isTeacherVerified
            ? 'border-blue-200 dark:border-blue-800/80'
            : answer.isPeerAccepted
              ? 'border-emerald-200 dark:border-emerald-800/80'
              : isMisleadingWarned
                ? 'border-amber-300 dark:border-amber-700/80'
                : 'border-slate-200 dark:border-slate-800'
        }`}
      >
        {/* Answer Header: Author + Role Badge + Timestamp + Trust Badges */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-sm font-bold text-slate-900 dark:text-slate-100">
              {answer.authorName}
            </span>
            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {answer.authorRole}
            </span>
            {answer.authorBadge && (
              <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                {answer.authorBadge}
              </span>
            )}
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-600 text-xs">
              ·
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {answer.createdAt ?? 'Just now'}
            </span>
          </div>

          {/* Strictly Separate Two-Tier Trust Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {answer.isPeerAccepted && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 whitespace-nowrap">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Peer-Accepted</span>
              </span>
            )}
            {answer.isTeacherVerified && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 whitespace-nowrap">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>Teacher-Verified</span>
              </span>
            )}
          </div>
        </div>

        {/* Misleading Warning Tag */}
        {isMisleadingWarned && (
          <div className="px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                <strong>Flagged for accuracy review</strong> ({answer.ratings.misleading}{' '}
                community reports)
              </span>
            </div>
          </div>
        )}

        {/* Explanation Text */}
        <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
          {answer.content}
        </p>

        {/* Optional Code Snippet */}
        {answer.codeBlock && (
          <pre className="p-4 rounded-lg bg-slate-900 dark:bg-slate-950 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
            <code>{answer.codeBlock}</code>
          </pre>
        )}

        {/* Optional Answer Attachment Pill */}
        {answer.attachmentLabel && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300">
              <Paperclip className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>{answer.attachmentLabel}</span>
            </span>
          </div>
        )}

        {/* Faculty Note Callout Box (when Teacher-Verified) */}
        {answer.isTeacherVerified && (
          <div className="p-3 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-800 dark:text-blue-300">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Faculty Note</span>
              </span>
              {activeRole === 'teacher' && editingNoteId !== answer.id && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingNoteId(answer.id);
                    setNoteDraft(
                      answer.facultyNote ??
                        'Verified: Accurate explanation and optimal complexity.'
                    );
                  }}
                  className="text-xs font-medium text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 underline"
                >
                  {answer.facultyNote ? 'Edit Note' : 'Add Note'}
                </button>
              )}
            </div>

            {editingNoteId === answer.id ? (
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="Verified: Accurate explanation and optimal complexity."
                  className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateFacultyNote(doubt.id, answer.id, noteDraft.trim());
                      setEditingNoteId(null);
                    }}
                    className="px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingNoteId(null)}
                    className="px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-blue-900 dark:text-blue-200">
                {answer.facultyNote ||
                  'Verified: Accurate explanation and optimal complexity.'}
              </p>
            )}
          </div>
        )}

        {/* 3-Way Community Rating Bar + Role-Specific Trust & Moderation Controls */}
        <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* 3-Way Rating Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleVote(answer.id, 'helpful')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors tabular-nums ${
                  votes.helpful
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-700'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Helpful ({answer.ratings.helpful})</span>
              </button>

              <button
                type="button"
                onClick={() => handleVote(answer.id, 'notHelpful')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors tabular-nums ${
                  votes.notHelpful
                    ? 'bg-slate-800 dark:bg-slate-700 text-white border-slate-800 dark:border-slate-600'
                    : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>Not Helpful ({answer.ratings.notHelpful})</span>
              </button>

              <button
                type="button"
                onClick={() => handleVote(answer.id, 'misleading')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors tabular-nums ${
                  votes.misleading || answer.ratings.misleading >= 2
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700 hover:bg-rose-100 dark:hover:bg-rose-900/60'
                    : 'bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/50 text-slate-600 dark:text-slate-300 hover:text-amber-800 dark:hover:text-amber-300 border-slate-200 dark:border-slate-700 hover:border-amber-200 dark:hover:border-amber-700'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Misleading ({answer.ratings.misleading})</span>
              </button>
            </div>

            {/* Role-Specific Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Asker Control: Peer Acceptance */}
              {activeRole === 'asker' && (
                <button
                  type="button"
                  onClick={() => onTogglePeerAccept(doubt.id, answer.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap ${
                    answer.isPeerAccepted
                      ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                      : 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {answer.isPeerAccepted
                      ? 'Peer-Accepted ✓'
                      : 'Accept Answer (Cleared My Doubt)'}
                  </span>
                </button>
              )}

              {/* Student / Peer Flag for Moderation */}
              {(activeRole === 'asker' || activeRole === 'peer') && (
                <button
                  type="button"
                  onClick={() => handleVote(answer.id, 'misleading')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-700 dark:hover:text-rose-300 border border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors whitespace-nowrap"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Flag for Review</span>
                </button>
              )}

              {/* Teacher Controls: Verify Solution + Hide / Moderate Response */}
              {activeRole === 'teacher' && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      onToggleTeacherVerify(
                        doubt.id,
                        answer.id,
                        answer.facultyNote ||
                          'Verified: Accurate explanation and optimal complexity.'
                      )
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap ${
                      answer.isTeacherVerified
                        ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                        : 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>
                      {answer.isTeacherVerified
                        ? 'Teacher-Verified ✓'
                        : 'Verify Solution (Faculty)'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onToggleModeration(
                        doubt.id,
                        answer.id,
                        'Inaccurate or misleading guidance'
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors whitespace-nowrap"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Hide / Moderate Reply</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {activeRole === 'asker' && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Asker vantage point: toggle Peer-Accepted on any walkthrough that resolved your doubt.
            </p>
          )}
        </div>
      </article>
    );
  };

  return (
    <section className="space-y-6">
      {/* Top Back Button */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </button>
      </div>

      {/* 1. DOUBT HEADER & DYNAMIC STATUS SUMMARY */}
      <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/70">
              {doubt.subject}
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {doubt.topic}
            </span>
          </div>

          {/* Dynamic Overall Doubt Status Badges */}
          <TrustBadges doubt={doubt} />
        </div>

        <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-snug">
          {doubt.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Asked by <strong className="font-semibold text-slate-800 dark:text-slate-200">{doubt.authorName}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{doubt.createdAt}</span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            {isUnresolved
              ? `Waiting ${formatWaitingTime(doubt.waitingHours)}`
              : 'Resolution active'}
          </span>
        </div>

        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
          {doubt.description}
        </p>

        {/* Full Attachment Preview Box */}
        {(doubt.attachment || doubt.attachments.length > 0) && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Supporting Attachments
            </p>

            {/* Rich Code Attachment */}
            {doubt.attachment?.type === 'code' && (
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900 dark:bg-slate-950">
                <div className="px-4 py-2 bg-slate-800/80 dark:bg-slate-900 border-b border-slate-700 dark:border-slate-800 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 text-xs font-mono text-slate-200">
                    <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                    {doubt.attachment.label}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleDownloadSample(
                        doubt.attachment!.label,
                        doubt.attachment!.content || '// Sample C snippet'
                      )
                    }
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 hover:text-white"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-slate-100 overflow-x-auto leading-relaxed">
                  <code>
                    {doubt.attachment.content || '// Attached code snippet preview'}
                  </code>
                </pre>
              </div>
            )}

            {/* Non-Code Structured Attachment (PDF / Image / Video) */}
            {doubt.attachment && doubt.attachment.type !== 'code' && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                    {getAttachmentIcon(doubt.attachment.label, doubt.attachment.type)}
                  </div>
                  <div>
                    <p className="text-sm font-mono font-semibold text-slate-900 dark:text-slate-100">
                      {doubt.attachment.label}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      {doubt.attachment.content ||
                        `Attached ${doubt.attachment.type.toUpperCase()} supporting material`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewedFile((prev) =>
                        prev === doubt.attachment!.label ? null : doubt.attachment!.label
                      )
                    }
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    {previewedFile === doubt.attachment.label ? 'Hide Preview' : 'Preview'}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleDownloadSample(
                        doubt.attachment!.label,
                        `${doubt.title}\n\nAttachment: ${doubt.attachment!.label}\n${doubt.attachment!.content}`
                      )
                    }
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            )}

            {/* Seed Attachment Cards (when doubt.attachments array has files without structured doubt.attachment) */}
            {!doubt.attachment && doubt.attachments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {doubt.attachments.map((file) => (
                  <div
                    key={file}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                        {getAttachmentIcon(file)}
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {file}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewedFile((prev) => (prev === file ? null : file))
                        }
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        {previewedFile === file ? 'Close' : 'Preview'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleDownloadSample(
                            file,
                            `// Query Ninja Sample Attachment: ${file}\n// Doubt: ${doubt.title}\n`
                          )
                        }
                        aria-label={`Download ${file}`}
                        className="p-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 hover:border-indigo-200 dark:hover:border-indigo-700"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {previewedFile && (
              <div className="p-4 rounded-xl bg-slate-900 dark:bg-slate-950 text-slate-100 border border-slate-800 text-xs font-mono space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Preview: {previewedFile}</span>
                  <button
                    type="button"
                    onClick={() => setPreviewedFile(null)}
                    className="text-slate-300 hover:text-white"
                  >
                    Close
                  </button>
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {doubt.attachment?.content ||
                    `/* ${previewedFile} — Attached student reference for "${doubt.title}" */`}
                </p>
              </div>
            )}
          </div>
        )}
      </article>

      {/* 2. ANSWERS LIST & SORTING PRIORITY */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">
            {visibleAnswers.length}{' '}
            {visibleAnswers.length === 1 ? 'Explanation' : 'Explanations'}
          </h2>
          {hiddenAnswers.length > 0 && (
            <span className="text-xs font-medium text-rose-700 dark:text-rose-400 tabular-nums">
              {hiddenAnswers.length} hidden by moderator
            </span>
          )}
        </div>

        {sortedAnswers.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center space-y-1.5">
            <p className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
              Awaiting its first explanation
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Share a clear walkthrough below to help {doubt.authorName} unblock this topic.
            </p>
          </div>
        ) : (
          <div className="space-y-4">{sortedAnswers.map(renderAnswerCard)}</div>
        )}
      </div>

      {/* 5. "WRITE AN EXPLANATION" COMPOSER */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5 sm:p-6 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <MessageSquarePlus className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                Contribute an Explanation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Publishing as{' '}
                <strong className="text-slate-800 dark:text-slate-200">{activePersona.postingIdentityLabel}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCodeInput((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                showCodeInput
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{showCodeInput ? 'Hide Code Snippet' : 'Add Code Snippet'}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setComposerAttachment((prev) =>
                  prev === 'Explanation_Diagram.png'
                    ? 'Reference_Notes.pdf'
                    : prev === 'Reference_Notes.pdf'
                      ? ''
                      : 'Explanation_Diagram.png'
                )
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                composerAttachment
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span>
                {composerAttachment
                  ? `Attached: ${composerAttachment}`
                  : 'Attach Supporting Note / Diagram'}
              </span>
            </button>
          </div>
        </div>

        <textarea
          required
          rows={4}
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          placeholder="Craft a clear, step-by-step walkthrough so classmates grasp both the fix and the reasoning..."
          className="w-full p-3.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
        />

        {showCodeInput && (
          <textarea
            rows={4}
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            placeholder="// Paste formatted C / DSA code snippet..."
            className="w-full p-3.5 text-xs font-mono bg-slate-900 dark:bg-slate-950 text-slate-100 border border-slate-800 rounded-lg placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        )}

        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          {activeRole === 'teacher' ? (
            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={verifyImmediately}
                onChange={(e) => setVerifyImmediately(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
              />
              <span>Mark as Teacher-Verified immediately</span>
            </label>
          ) : (
            <span />
          )}

          <button
            type="submit"
            disabled={!answerText.trim()}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed shadow-xs ${
              activeRole === 'teacher'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>
              {activeRole === 'teacher'
                ? 'Publish Official Faculty Answer'
                : 'Publish Explanation'}
            </span>
          </button>
        </div>
      </form>
    </section>
  );
}

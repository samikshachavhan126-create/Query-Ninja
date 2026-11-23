import { useState } from 'react';
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
} from 'lucide-react';
import { Answer, AnswerRatings, Doubt, Persona, UserRole } from '../types';
import { TrustBadges } from './TrustBadges';

interface DoubtDetailViewProps {
  doubt: Doubt;
  activeRole: UserRole;
  activePersona: Persona;
  onBack: () => void;
  onAddAnswer: (doubtId: string, content: string, codeBlock?: string) => void;
  onTogglePeerAccept: (doubtId: string, answerId: string) => void;
  onToggleTeacherVerify: (doubtId: string, answerId: string) => void;
  onToggleModeration: (doubtId: string, answerId: string, reason: string) => void;
  onRateAnswer: (
    doubtId: string,
    answerId: string,
    ratingKey: keyof AnswerRatings
  ) => void;
}

export function DoubtDetailView({
  doubt,
  activeRole,
  activePersona,
  onBack,
  onAddAnswer,
  onTogglePeerAccept,
  onToggleTeacherVerify,
  onToggleModeration,
  onRateAnswer,
}: DoubtDetailViewProps) {
  const [answerText, setAnswerText] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);

  const visibleAnswers = doubt.answers.filter((a) => !a.isHiddenByModerator);
  const hiddenAnswers = doubt.answers.filter((a) => a.isHiddenByModerator);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = answerText.trim();
    if (!trimmed) return;
    onAddAnswer(doubt.id, trimmed, codeSnippet.trim() || undefined);
    setAnswerText('');
    setCodeSnippet('');
    setShowCodeInput(false);
  };

  const renderAnswerCard = (answer: Answer) => {
    const isFlagged = answer.ratings.misleading >= 3;

    if (answer.isHiddenByModerator && activeRole !== 'teacher') {
      return (
        <div
          key={answer.id}
          className="bg-slate-100/80 border border-slate-200 rounded-xl p-4 flex items-center gap-3 text-xs text-slate-600"
        >
          <EyeOff className="w-4 h-4 text-rose-600 shrink-0" />
          <span>
            This answer was hidden by faculty moderation ({answer.moderationReason}).
          </span>
        </div>
      );
    }

    return (
      <div
        key={answer.id}
        className={`bg-white border rounded-xl shadow-xs p-5 transition-colors ${
          answer.isHiddenByModerator
            ? 'border-rose-300 bg-rose-50/30 opacity-85'
            : answer.isTeacherVerified
              ? 'border-blue-200'
              : answer.isPeerAccepted
                ? 'border-emerald-200'
                : isFlagged
                  ? 'border-amber-300'
                  : 'border-slate-200'
        }`}
      >
        {/* Answer Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-sm font-bold text-slate-900">
              {answer.authorName}
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
              {answer.authorBadge}
            </span>
            <span className="text-xs text-slate-500">{answer.authorRole}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {answer.isPeerAccepted && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Peer-Accepted
              </span>
            )}
            {answer.isTeacherVerified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                Teacher-Verified
              </span>
            )}
            {answer.isHiddenByModerator && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                <EyeOff className="w-3.5 h-3.5" />
                Hidden by Moderator
              </span>
            )}
          </div>
        </div>

        {/* Misleading Warning Banner */}
        {!answer.isHiddenByModerator && isFlagged && (
          <div className="mt-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Community Caution:</strong> Multiple peers flagged this answer as misleading ({answer.ratings.misleading} reports).
            </span>
          </div>
        )}

        {/* Answer Content */}
        <p className="text-sm text-slate-700 mt-3 leading-relaxed whitespace-pre-line">
          {answer.content}
        </p>

        {/* Optional Code Block */}
        {answer.codeBlock && (
          <pre className="mt-3.5 p-4 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
            <code>{answer.codeBlock}</code>
          </pre>
        )}

        {/* Ratings + Role-Based Action Controls */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          {/* Ratings */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onRateAnswer(doubt.id, answer.id, 'helpful')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 transition-colors tabular-nums"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Helpful ({answer.ratings.helpful})</span>
            </button>
            <button
              type="button"
              onClick={() => onRateAnswer(doubt.id, answer.id, 'notHelpful')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors tabular-nums"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              <span>Not Helpful ({answer.ratings.notHelpful})</span>
            </button>
            <button
              type="button"
              onClick={() => onRateAnswer(doubt.id, answer.id, 'misleading')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 transition-colors tabular-nums"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Misleading ({answer.ratings.misleading})</span>
            </button>
          </div>

          {/* Role Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {activeRole === 'asker' && !answer.isHiddenByModerator && (
              <button
                type="button"
                onClick={() => onTogglePeerAccept(doubt.id, answer.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  answer.isPeerAccepted
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{answer.isPeerAccepted ? 'Peer-Accepted ✓' : 'Accept Answer'}</span>
              </button>
            )}

            {activeRole === 'teacher' && (
              <>
                {!answer.isHiddenByModerator && (
                  <button
                    type="button"
                    onClick={() => onToggleTeacherVerify(doubt.id, answer.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      answer.isTeacherVerified
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>
                      {answer.isTeacherVerified ? 'Verified Shield ★' : 'Verify Answer'}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    onToggleModeration(
                      doubt.id,
                      answer.id,
                      'Factually incorrect explanation flagged by moderator'
                    )
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    answer.isHiddenByModerator
                      ? 'bg-slate-800 text-white hover:bg-slate-900'
                      : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  {answer.isHiddenByModerator ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Restore Answer</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hide Misleading</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="space-y-5">
      {/* Back Action */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Doubt Feed</span>
        </button>
      </div>

      {/* Main Doubt Question Card */}
      <article className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {doubt.subject}
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
              {doubt.topic}
            </span>
          </div>
          <TrustBadges doubt={doubt} />
        </div>

        <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
          {doubt.title}
        </h1>

        <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span>
            Asked by <strong className="font-semibold text-slate-700">{doubt.authorName}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{doubt.createdAt}</span>
        </div>

        <p className="mt-4 text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
          {doubt.description}
        </p>

        {doubt.attachments.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 mr-1">Attachments:</span>
            {doubt.attachments.map((file) => (
              <span
                key={file}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-mono"
              >
                <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                {file}
              </span>
            ))}
          </div>
        )}
      </article>

      {/* Answers Section */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-slate-900 tabular-nums">
            Answers ({visibleAnswers.length})
          </h2>
          {hiddenAnswers.length > 0 && (
            <span className="text-xs text-slate-500 tabular-nums">
              {hiddenAnswers.length} hidden by moderator
            </span>
          )}
        </div>

        {doubt.answers.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
            <p className="font-display text-base font-semibold text-slate-900">
              No answers yet — be the first to help {doubt.authorName}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Share a clear step-by-step explanation or a small code snippet below.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">{doubt.answers.map(renderAnswerCard)}</div>
        )}
      </div>

      {/* Submit Answer Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 sm:p-6 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">
              Write an Answer
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Posting as <strong className="text-slate-700">{activePersona.shortName}</strong> ({activePersona.roleTitle})
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCodeInput((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showCodeInput
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{showCodeInput ? 'Hide Code Block' : 'Attach Code Snippet'}</span>
          </button>
        </div>

        <textarea
          rows={4}
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          placeholder="Explain the root cause clearly and give an actionable fix..."
          className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
        />

        {showCodeInput && (
          <textarea
            rows={4}
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            placeholder="// Paste C or DSA code example here..."
            className="w-full p-3 text-xs font-mono bg-slate-900 text-slate-100 border border-slate-800 rounded-lg placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        )}

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={!answerText.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Post Answer</span>
          </button>
        </div>
      </form>
    </section>
  );
}

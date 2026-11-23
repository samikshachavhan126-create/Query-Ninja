import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Code2,
  FileText,
  Image as ImageIcon,
  Video,
  X,
  Radar,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Send,
  Paperclip,
  UserCheck,
} from 'lucide-react';
import { Doubt, DoubtAttachment, Persona } from '../types';
import { findSimilarDoubts } from '../utils/similarity';
import { TrustBadges } from './TrustBadges';

interface AskDoubtViewProps {
  doubts: Doubt[];
  activePersona: Persona;
  onCancel: () => void;
  onSelectDoubt: (doubtId: string) => void;
  onCreateDoubt: (payload: {
    title: string;
    subject: string;
    topic: string;
    description: string;
    attachment: DoubtAttachment | null;
  }) => void;
}

const SUBJECT_OPTIONS = [
  'C Programming',
  'Data Structures',
  'Algorithms',
  'Engineering Mathematics',
];

const QUICK_TOPICS = [
  'Pointers & Memory',
  'Input / Output',
  'Linked Lists',
  'Recursion',
  'Sorting',
];

type AttachmentChoice = 'none' | 'code' | 'pdf' | 'image' | 'video';

const SAMPLE_PRESETS: Record<
  Exclude<AttachmentChoice, 'none' | 'code'>,
  { buttonLabel: string; sampleFile: string; sampleContent: string }
> = {
  pdf: {
    buttonLabel: 'Attach Lecture_Notes_Unit4.pdf',
    sampleFile: 'Lecture_Notes_Unit4.pdf',
    sampleContent: 'Referenced slide 14 — Dynamic Memory Allocation & Pointer Arithmetic',
  },
  image: {
    buttonLabel: 'Attach Pointer_Memory_Diagram.png',
    sampleFile: 'Pointer_Memory_Diagram.png',
    sampleContent: 'Stack vs Heap pointer reference sketch showing node links',
  },
  video: {
    buttonLabel: 'Attach Screen_Recording_Bug.mp4',
    sampleFile: 'Screen_Recording_Bug.mp4',
    sampleContent: '18s terminal capture reproducing runtime crash during input loop',
  },
};

export function AskDoubtView({
  doubts,
  activePersona,
  onCancel,
  onSelectDoubt,
  onCreateDoubt,
}: AskDoubtViewProps) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('C Programming');
  const [topic, setTopic] = useState('Pointers & Memory');
  const [description, setDescription] = useState('');

  const [attachmentType, setAttachmentType] = useState<AttachmentChoice>('none');
  const [attachmentLabel, setAttachmentLabel] = useState('');
  const [attachmentContent, setAttachmentContent] = useState('');

  const [duplicateAvoidedBanner, setDuplicateAvoidedBanner] = useState(false);

  const combinedLength = (title.trim() + description.trim()).length;

  const matches = useMemo(
    () => findSimilarDoubts(title, description, doubts),
    [title, description, doubts]
  );

  const handleSelectAttachmentType = (choice: AttachmentChoice) => {
    setAttachmentType(choice);
    if (choice === 'none') {
      setAttachmentLabel('');
      setAttachmentContent('');
    } else if (choice === 'code') {
      setAttachmentLabel('snippet.c');
      setAttachmentContent('');
    } else {
      setAttachmentLabel('');
      setAttachmentContent('');
    }
  };

  const resetForm = () => {
    setTitle('');
    setSubject('C Programming');
    setTopic('Pointers & Memory');
    setDescription('');
    setAttachmentType('none');
    setAttachmentLabel('');
    setAttachmentContent('');
  };

  const handleDuplicateSolved = () => {
    resetForm();
    setDuplicateAvoidedBanner(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    let finalAttachment: DoubtAttachment | null = null;
    if (attachmentType !== 'none') {
      const fallbackLabel =
        attachmentType === 'code'
          ? 'snippet.c'
          : SAMPLE_PRESETS[attachmentType].sampleFile;
      finalAttachment = {
        type: attachmentType,
        label: attachmentLabel.trim() || fallbackLabel,
        content: attachmentContent.trim(),
      };
    }

    onCreateDoubt({
      title: title.trim(),
      subject,
      topic: topic.trim() || 'General',
      description: description.trim(),
      attachment: finalAttachment,
    });

    resetForm();
  };

  const getBestAnswerPreview = (doubt: Doubt): string | null => {
    const visible = doubt.answers.filter((a) => !a.isHiddenByModerator);
    const preferred =
      visible.find((a) => a.isTeacherVerified) ??
      visible.find((a) => a.isPeerAccepted) ??
      visible[0];
    return preferred ? preferred.content : null;
  };

  return (
    <section className="space-y-5">
      {/* Top Breadcrumb & Page Heading */}
      <div>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 mb-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Doubt Feed</span>
        </button>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Ask a Doubt
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Real-time duplicate detection checks verified peer solutions as you type.
        </p>
      </div>

      {/* Celebratory Banner when an existing solution solved the user's doubt */}
      {duplicateAvoidedBanner && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-emerald-800 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Duplicate avoided! Glad an existing solution helped.</span>
          </div>
          <button
            type="button"
            onClick={() => setDuplicateAvoidedBanner(false)}
            aria-label="Dismiss banner"
            className="text-emerald-700 hover:text-emerald-900 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2-Column Responsive Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (lg:col-span-7): Structured Post a New Doubt Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-6 space-y-5"
        >
          {/* Active Posting Identity Banner */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4" />
              </span>
              <div>
                <h2 className="font-display text-base font-bold text-slate-900">
                  Post a New Doubt
                </h2>
                <p className="text-xs text-slate-600">
                  Posting as:{' '}
                  <strong className="font-semibold text-slate-900">
                    {activePersona.postingIdentityLabel}
                  </strong>
                </p>
              </div>
            </div>
          </div>

          {/* 1. Doubt Title */}
          <div>
            <label
              htmlFor="doubt-title"
              className="block text-sm font-semibold text-slate-900 mb-1.5"
            >
              Doubt Title <span className="text-rose-600">*</span>
            </label>
            <input
              id="doubt-title"
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (duplicateAvoidedBanner) setDuplicateAvoidedBanner(false);
              }}
              placeholder="e.g., Why does scanf() skip character input or how to fix segfault in pointers?"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
            />
          </div>

          {/* 2. Subject & Topic Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="doubt-subject"
                className="block text-sm font-semibold text-slate-900 mb-1.5"
              >
                Subject
              </label>
              <select
                id="doubt-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
              >
                {SUBJECT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="doubt-topic"
                className="block text-sm font-semibold text-slate-900 mb-1.5"
              >
                Topic Tag
              </label>
              <input
                id="doubt-topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Type or select a topic tag"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Quick-Fill Topic Tag Chips */}
          <div className="-mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500 mr-1">Quick topics:</span>
            {QUICK_TOPICS.map((chip) => {
              const isActive = topic.trim().toLowerCase() === chip.toLowerCase();
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setTopic(chip)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>

          {/* 3. Detailed Description */}
          <div>
            <label
              htmlFor="doubt-description"
              className="block text-sm font-semibold text-slate-900 mb-1.5"
            >
              Detailed Description <span className="text-rose-600">*</span>
            </label>
            <textarea
              id="doubt-description"
              required
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (duplicateAvoidedBanner) setDuplicateAvoidedBanner(false);
              }}
              placeholder="Describe what you tried, the exact error message, or where you got stuck..."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
            />
          </div>

          {/* 4. Supporting Material Attachment (Optional) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900">
                Supporting Material <span className="text-xs font-normal text-slate-500">(Optional)</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectAttachmentType('code')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap ${
                  attachmentType === 'code'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>+ Code Snippet</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectAttachmentType('pdf')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap ${
                  attachmentType === 'pdf'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>+ Notes PDF</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectAttachmentType('image')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap ${
                  attachmentType === 'image'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>+ Diagram Image</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectAttachmentType('video')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap ${
                  attachmentType === 'video'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>+ Short Video</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectAttachmentType('none')}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
                  attachmentType === 'none'
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>None</span>
              </button>
            </div>

            {/* Inline Attachment Form */}
            {attachmentType === 'code' && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label
                    htmlFor="code-filename"
                    className="text-xs font-semibold text-slate-700 whitespace-nowrap"
                  >
                    Filename:
                  </label>
                  <input
                    id="code-filename"
                    type="text"
                    value={attachmentLabel}
                    onChange={(e) => setAttachmentLabel(e.target.value)}
                    placeholder="snippet.c"
                    className="flex-1 px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <textarea
                  rows={5}
                  value={attachmentContent}
                  onChange={(e) => setAttachmentContent(e.target.value)}
                  placeholder="// Paste your C / C++ / DSA code snippet here..."
                  className="w-full p-3 text-xs font-mono bg-slate-900 text-slate-100 border border-slate-800 rounded-lg placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {attachmentType !== 'none' && attachmentType !== 'code' && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-700">
                    1-Click Demo Attachment:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const preset = SAMPLE_PRESETS[attachmentType];
                      setAttachmentLabel(preset.sampleFile);
                      setAttachmentContent(preset.sampleContent);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>{SAMPLE_PRESETS[attachmentType].buttonLabel}</span>
                  </button>
                </div>

                <div>
                  <label
                    htmlFor="attachment-custom-label"
                    className="block text-xs font-medium text-slate-600 mb-1"
                  >
                    File Label
                  </label>
                  <input
                    id="attachment-custom-label"
                    type="text"
                    value={attachmentLabel}
                    onChange={(e) => setAttachmentLabel(e.target.value)}
                    placeholder={SAMPLE_PRESETS[attachmentType].sampleFile}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="attachment-note"
                    className="block text-xs font-medium text-slate-600 mb-1"
                  >
                    Context / Caption (Optional)
                  </label>
                  <input
                    id="attachment-note"
                    type="text"
                    value={attachmentContent}
                    onChange={(e) => setAttachmentContent(e.target.value)}
                    placeholder={SAMPLE_PRESETS[attachmentType].sampleContent}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Footer */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!title.trim() || !description.trim()}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors shadow-xs disabled:bg-slate-300 disabled:cursor-not-allowed ${
                matches.length > 0
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>
                {matches.length > 0
                  ? 'Post Anyway as New Doubt'
                  : 'Post Doubt to Community'}
              </span>
            </button>
          </div>
        </form>

        {/* RIGHT COLUMN (lg:col-span-5): Sticky Similar Questions Radar */}
        <aside className="lg:col-span-5 lg:sticky lg:top-28 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Radar className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900">
                    Similar Questions Radar
                  </h2>
                  <p className="text-xs text-slate-500">
                    Live duplicate scan across {doubts.length} existing threads
                  </p>
                </div>
              </div>
            </div>

            {/* State 1: Empty State (< 3 chars typed) */}
            {combinedLength < 3 && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-sm text-slate-600 leading-relaxed">
                Start typing your doubt title or error—Query Ninja scans existing
                peer-accepted and teacher-verified solutions in real time to prevent
                repeat questions.
              </div>
            )}

            {/* State 2: Duplicates Found (matches.length > 0) */}
            {combinedLength >= 3 && matches.length > 0 && (
              <div className="space-y-3.5">
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-amber-900 text-xs font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="tabular-nums">
                      Similar Questions Found ({matches.length})
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                    Keyword + Semantic Match
                  </span>
                </div>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-0.5">
                  {matches.map(({ doubt, score, matchedKeywords }) => {
                    const answerPreview = getBestAnswerPreview(doubt);
                    return (
                      <div
                        key={doubt.id}
                        className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-600 text-white tabular-nums">
                            {score}% Match
                          </span>
                          <TrustBadges doubt={doubt} />
                        </div>

                        <h3 className="font-display text-sm font-bold text-slate-900 leading-snug">
                          {doubt.title}
                        </h3>

                        {answerPreview ? (
                          <p className="text-xs text-slate-600 line-clamp-2 bg-white p-2.5 rounded-lg border border-slate-200/80">
                            <strong className="text-emerald-700">Solution preview:</strong>{' '}
                            {answerPreview}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-500 italic">
                            Currently awaiting first peer solution.
                          </p>
                        )}

                        <div className="flex flex-wrap gap-1">
                          {matchedKeywords.map((kw) => (
                            <span
                              key={kw}
                              className="px-2 py-0.5 rounded text-[11px] font-mono bg-white border border-slate-200 text-slate-600"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>

                        <div className="pt-1 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onSelectDoubt(doubt.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>View Existing Solution</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleDuplicateSolved}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>This Solved My Doubt</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* State 3: Unseen Doubt Confirmed */}
            {combinedLength >= 3 && matches.length === 0 && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-emerald-900 leading-relaxed">
                  No existing matches found — this looks like a brand-new unseen doubt!
                  Ready to post to the community.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

import { useState } from 'react';
import { ArrowLeft, Paperclip, Plus, Send } from 'lucide-react';
import { Persona } from '../types';

interface AskDoubtViewProps {
  activePersona: Persona;
  onCancel: () => void;
  onCreateDoubt: (payload: {
    title: string;
    subject: string;
    topic: string;
    description: string;
    attachments: string[];
  }) => void;
}

const SUBJECT_OPTIONS = ['C Programming', 'Data Structures', 'Discrete Mathematics', 'Digital Logic'];
const TOPIC_OPTIONS = ['Input/Output', 'Pointers & Memory', 'Sorting', 'Recursion', 'Trees & Graphs'];

export function AskDoubtView({ activePersona, onCancel, onCreateDoubt }: AskDoubtViewProps) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('C Programming');
  const [topic, setTopic] = useState('Pointers & Memory');
  const [description, setDescription] = useState('');
  const [attachmentInput, setAttachmentInput] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);

  const handleAddAttachment = () => {
    const clean = attachmentInput.trim();
    if (!clean || attachments.includes(clean)) return;
    setAttachments((prev) => [...prev, clean]);
    setAttachmentInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    onCreateDoubt({
      title: title.trim(),
      subject,
      topic,
      description: description.trim(),
      attachments,
    });
  };

  return (
    <section className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Doubt Feed</span>
          </button>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Ask a Doubt
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Posting as <strong className="text-slate-900">{activePersona.shortName}</strong> — clear context helps peer solvers verify faster.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 sm:p-6 space-y-5"
      >
        <div>
          <label htmlFor="doubt-title" className="block text-sm font-semibold text-slate-900 mb-1.5">
            Question Title
          </label>
          <input
            id="doubt-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Why does freeing a pointer twice cause a double-free error in C?"
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="doubt-subject" className="block text-sm font-semibold text-slate-900 mb-1.5">
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
            <label htmlFor="doubt-topic" className="block text-sm font-semibold text-slate-900 mb-1.5">
              Topic Tag
            </label>
            <select
              id="doubt-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
            >
              {TOPIC_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="doubt-desc" className="block text-sm font-semibold text-slate-900 mb-1.5">
            What have you tried so far?
          </label>
          <textarea
            id="doubt-desc"
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the expected behavior, actual output, compiler warning, or dry-run step where you got stuck..."
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
          />
        </div>

        <div>
          <label htmlFor="doubt-attachment" className="block text-sm font-semibold text-slate-900 mb-1.5">
            Attach Reference File (Optional)
          </label>
          <div className="flex gap-2">
            <input
              id="doubt-attachment"
              type="text"
              value={attachmentInput}
              onChange={(e) => setAttachmentInput(e.target.value)}
              placeholder="e.g., lab4_linked_list.c or stack_trace.png"
              className="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddAttachment}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Attach</span>
            </button>
          </div>
          {attachments.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-2">
              {attachments.map((file) => (
                <span
                  key={file}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-mono"
                >
                  <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                  <span>{file}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setAttachments((prev) => prev.filter((item) => item !== file))
                    }
                    className="ml-1 text-slate-400 hover:text-rose-600"
                    aria-label={`Remove ${file}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
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
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white transition-colors shadow-xs"
          >
            <Send className="w-4 h-4" />
            <span>Publish Doubt</span>
          </button>
        </div>
      </form>
    </section>
  );
}

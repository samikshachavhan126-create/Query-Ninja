import { useState } from 'react';
import {
  Bot,
  Send,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  SendToBack,
} from 'lucide-react';
import { Answer, Doubt, Persona } from '../types';
import { findSimilarDoubts } from '../utils/similarity';

interface AiFriendViewProps {
  doubts: Doubt[];
  activePersona: Persona;
  onSelectDoubt: (doubtId: string) => void;
  onEscalateDoubt: (questionText: string) => Doubt;
}

interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  matchedDoubtId?: string;
  matchedDoubtTitle?: string;
  trustLabel?: 'Teacher-Verified' | 'Peer-Accepted' | 'Both';
  codeBlock?: string;
  needsEscalation?: boolean;
  escalationQuery?: string;
  escalatedDoubtId?: string;
}

const SAMPLE_CHIPS = [
  'Why does scanf skip my char input?',
  'Difference between malloc and calloc?',
  'How do I write inline assembly in a kernel driver?',
];

function getGroundedAnswer(doubt: Doubt): Answer | null {
  const visible = doubt.answers.filter((a) => !a.isHiddenByModerator);
  return (
    visible.find((a) => a.isTeacherVerified && a.isPeerAccepted) ??
    visible.find((a) => a.isTeacherVerified) ??
    visible.find((a) => a.isPeerAccepted) ??
    null
  );
}

export function AiFriendView({
  doubts,
  activePersona,
  onSelectDoubt,
  onEscalateDoubt,
}: AiFriendViewProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Hey ${activePersona.shortName}! Burning the midnight oil? Ask me anything from C Programming or Data Structures. I answer strictly using Peer-Accepted and Teacher-Verified campus threads—and if a topic is uncharted, I can escalate it straight to Prof. Kulkarni and our top peer solvers.`,
    },
  ]);

  const handleSendQuery = (rawText: string) => {
    const query = rawText.trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
    };

    // Grounded search strictly over doubts that have a Teacher-Verified or Peer-Accepted answer
    const candidates = findSimilarDoubts(query, '', doubts);
    const verifiedMatch = candidates.find((c) => getGroundedAnswer(c.doubt) !== null);

    let botMsg: ChatMessage;

    if (verifiedMatch) {
      const groundedAns = getGroundedAnswer(verifiedMatch.doubt)!;
      const trustLabel =
        groundedAns.isTeacherVerified && groundedAns.isPeerAccepted
          ? 'Both'
          : groundedAns.isTeacherVerified
            ? 'Teacher-Verified'
            : 'Peer-Accepted';

      botMsg = {
        id: `bot-${Date.now() + 1}`,
        sender: 'assistant',
        text: groundedAns.content,
        codeBlock: groundedAns.codeBlock,
        matchedDoubtId: verifiedMatch.doubt.id,
        matchedDoubtTitle: verifiedMatch.doubt.title,
        trustLabel,
      };
    } else {
      botMsg = {
        id: `bot-${Date.now() + 1}`,
        sender: 'assistant',
        text: `I couldn’t find a Teacher-Verified or Peer-Accepted campus solution for "${query}" yet. Rather than guessing, let’s route this directly to our faculty and peer solver queue so you get a rock-solid answer.`,
        needsEscalation: true,
        escalationQuery: query,
      };
    }

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
  };

  const handleEscalateClick = (messageId: string, questionText: string) => {
    const createdDoubt = onEscalateDoubt(questionText);
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? {
              ...m,
              needsEscalation: false,
              escalatedDoubtId: createdDoubt.id,
            }
          : m
      )
    );
  };

  return (
    <section className="max-w-4xl mx-auto space-y-5">
      {/* Header Banner */}
      <div className="bg-indigo-600 text-white rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
            <Bot className="w-6 h-6" />
          </span>
          <div>
            <h1 className="font-display text-lg sm:text-xl font-bold">
              24×7 AI Study Friend
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100">
              Grounded exclusively in Peer-Accepted &amp; Teacher-Verified campus threads
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white whitespace-nowrap self-start sm:self-auto">
          Zero-Hallucination Grounding
        </span>
      </div>

      {/* Chat Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col overflow-hidden">
        {/* Sample Prompt Chips */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 space-y-2">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Try a verified campus lookup or test an uncharted escalation:
          </p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleSendQuery(chip)}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/50 transition-colors text-left"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Messages Feed */}
        <div className="p-5 space-y-4 max-h-[54vh] overflow-y-auto">
          {messages.map((msg) =>
            msg.sender === 'user' ? (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-xl bg-indigo-600 text-white px-4 py-2.5 rounded-2xl rounded-br-sm text-sm leading-relaxed shadow-xs">
                  {msg.text}
                </div>
              </div>
            ) : (
              <div key={msg.id} className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/80 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </span>

                <div className="max-w-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm p-4 space-y-3">
                  {/* Grounded Match Header */}
                  {msg.matchedDoubtTitle && (
                    <div className="space-y-1.5 pb-2.5 border-b border-slate-200/80 dark:border-slate-700">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {(msg.trustLabel === 'Peer-Accepted' ||
                          msg.trustLabel === 'Both') && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
                            <CheckCircle2 className="w-3 h-3" />
                            Peer-Accepted Source
                          </span>
                        )}
                        {(msg.trustLabel === 'Teacher-Verified' ||
                          msg.trustLabel === 'Both') && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80">
                            <ShieldCheck className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                            Teacher-Verified Source
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        Matched Thread: {msg.matchedDoubtTitle}
                      </p>
                    </div>
                  )}

                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                    {msg.text}
                  </p>

                  {msg.codeBlock && (
                    <pre className="p-3.5 rounded-lg bg-slate-900 dark:bg-slate-950 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
                      <code>{msg.codeBlock}</code>
                    </pre>
                  )}

                  {msg.matchedDoubtId && (
                    <div>
                      <button
                        type="button"
                        onClick={() => onSelectDoubt(msg.matchedDoubtId!)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Full Verified Thread</span>
                      </button>
                    </div>
                  )}

                  {/* Escalation CTA when no verified match exists */}
                  {msg.needsEscalation && msg.escalationQuery && (
                    <div className="pt-1 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleEscalateClick(msg.id, msg.escalationQuery!)
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors shadow-xs"
                      >
                        <SendToBack className="w-3.5 h-3.5" />
                        <span>Escalate to Faculty &amp; Solver Queue</span>
                      </button>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        Routes straight to Unresolved Tracker
                      </span>
                    </div>
                  )}

                  {msg.escalatedDoubtId && (
                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        Escalated to Doubt Feed &amp; Unresolved Tracker!
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelectDoubt(msg.escalatedDoubtId!)}
                        className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:underline"
                      >
                        View Escalated Doubt →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>

        {/* Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery(input);
          }}
          className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2.5"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a late-night question (e.g., Why does scanf skip char input?)..."
            className="flex-1 px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 text-white transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Ask</span>
          </button>
        </form>
      </div>
    </section>
  );
}

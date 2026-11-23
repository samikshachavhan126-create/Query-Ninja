import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { INITIAL_DOUBTS, PERSONAS } from './data/seedData';
import {
  Answer,
  AnswerRatings,
  Doubt,
  DoubtAttachment,
  DoubtStatus,
  NavTab,
  UserRole,
} from './types';
import { TopNav } from './components/TopNav';
import { DoubtFeedView } from './components/DoubtFeedView';
import { DoubtDetailView } from './components/DoubtDetailView';
import { AskDoubtView } from './components/AskDoubtView';
import { UnresolvedTrackerView } from './components/UnresolvedTrackerView';
import { AiFriendView } from './components/AiFriendView';
import { RatraaPlannerView } from './components/RatraaPlannerView';
import { getDoubtTrustState } from './components/TrustBadges';

function recomputeDoubtStatus(answers: Answer[]): DoubtStatus {
  const visible = answers.filter((a) => !a.isHiddenByModerator);
  if (visible.some((a) => a.isTeacherVerified)) return 'teacher_verified';
  if (visible.some((a) => a.isPeerAccepted)) return 'peer_accepted';
  return 'unresolved';
}

export default function App() {
  const [doubts, setDoubts] = useState<Doubt[]>(INITIAL_DOUBTS);
  const [activeTab, setActiveTab] = useState<NavTab>('feed');
  const [selectedDoubtId, setSelectedDoubtId] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole>('asker');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 5000);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const activePersona = useMemo(
    () => PERSONAS.find((p) => p.id === activeRole) ?? PERSONAS[0],
    [activeRole]
  );

  const unresolvedCount = useMemo(
    () => doubts.filter((d) => getDoubtTrustState(d).isUnresolved).length,
    [doubts]
  );

  const selectedDoubt = useMemo(
    () => doubts.find((d) => d.id === selectedDoubtId) ?? null,
    [doubts, selectedDoubtId]
  );

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    setSelectedDoubtId(null);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (q.trim() && activeTab !== 'feed') {
      setActiveTab('feed');
      setSelectedDoubtId(null);
    } else if (q.trim() && selectedDoubtId !== null) {
      setSelectedDoubtId(null);
    }
  };

  const handleSelectDoubt = (doubtId: string) => {
    setSelectedDoubtId(doubtId);
  };

  const handleCreateDoubt = (payload: {
    title: string;
    subject: string;
    topic: string;
    description: string;
    attachment: DoubtAttachment | null;
  }) => {
    const authorNameByRole: Record<UserRole, string> = {
      asker: 'Aarav Sharma',
      peer: 'Priya Deshmukh',
      teacher: 'Prof. R. K. Kulkarni',
    };

    const newDoubt: Doubt = {
      id: Date.now().toString(),
      title: payload.title,
      description: payload.description,
      subject: payload.subject,
      topic: payload.topic,
      authorName: authorNameByRole[activeRole],
      createdAt: 'Just now',
      waitingHours: 0,
      status: 'unresolved',
      attachments: payload.attachment ? [payload.attachment.label] : [],
      attachment: payload.attachment,
      answers: [],
    };
    setDoubts((prev) => [newDoubt, ...prev]);
    setSelectedDoubtId(null);
    setActiveTab('feed');
    setToastMessage('Doubt posted! Visible in Doubt Feed & Unresolved Tracker.');
  };

  const handleAddAnswer = (
    doubtId: string,
    payload: {
      content: string;
      codeBlock?: string;
      attachmentLabel?: string;
      verifyImmediately?: boolean;
    }
  ) => {
    const roleLabelByRole: Record<UserRole, string> = {
      asker: '1st Year • Student',
      peer: '2nd Year • Top Solver',
      teacher: 'Faculty • Computer Engineering',
    };
    const badgeByRole: Record<UserRole, string> = {
      asker: 'Classmate',
      peer: 'Ninja Solver',
      teacher: 'Faculty',
    };

    const isVerified = activeRole === 'teacher' && Boolean(payload.verifyImmediately);

    const newAnswer: Answer = {
      id: `ans-${Date.now()}`,
      authorName: activePersona.fullName,
      authorRole: roleLabelByRole[activeRole],
      authorBadge: badgeByRole[activeRole],
      createdAt: 'Just now',
      content: payload.content,
      codeBlock: payload.codeBlock,
      attachmentLabel: payload.attachmentLabel,
      facultyNote: isVerified
        ? 'Verified: Official faculty explanation.'
        : undefined,
      isPeerAccepted: false,
      isTeacherVerified: isVerified,
      isHiddenByModerator: false,
      moderationReason: '',
      ratings: {
        helpful: 0,
        notHelpful: 0,
        misleading: 0,
      },
    };

    setDoubts((prev) =>
      prev.map((d) => {
        if (d.id !== doubtId) return d;
        const updatedAnswers = [...d.answers, newAnswer];
        return {
          ...d,
          answers: updatedAnswers,
          status: recomputeDoubtStatus(updatedAnswers),
        };
      })
    );
  };

  const handleTogglePeerAccept = (doubtId: string, answerId: string) => {
    setDoubts((prev) =>
      prev.map((d) => {
        if (d.id !== doubtId) return d;
        const updatedAnswers = d.answers.map((a) =>
          a.id === answerId ? { ...a, isPeerAccepted: !a.isPeerAccepted } : a
        );
        return {
          ...d,
          answers: updatedAnswers,
          status: recomputeDoubtStatus(updatedAnswers),
        };
      })
    );
  };

  const handleToggleTeacherVerify = (
    doubtId: string,
    answerId: string,
    defaultNote?: string
  ) => {
    setDoubts((prev) =>
      prev.map((d) => {
        if (d.id !== doubtId) return d;
        const updatedAnswers = d.answers.map((a) => {
          if (a.id !== answerId) return a;
          const nextVerified = !a.isTeacherVerified;
          return {
            ...a,
            isTeacherVerified: nextVerified,
            facultyNote: nextVerified ? a.facultyNote || defaultNote : a.facultyNote,
          };
        });
        return {
          ...d,
          answers: updatedAnswers,
          status: recomputeDoubtStatus(updatedAnswers),
        };
      })
    );
  };

  const handleUpdateFacultyNote = (
    doubtId: string,
    answerId: string,
    facultyNote: string
  ) => {
    setDoubts((prev) =>
      prev.map((d) => {
        if (d.id !== doubtId) return d;
        const updatedAnswers = d.answers.map((a) =>
          a.id === answerId ? { ...a, facultyNote } : a
        );
        return { ...d, answers: updatedAnswers };
      })
    );
  };

  const handleToggleModeration = (doubtId: string, answerId: string, reason: string) => {
    setDoubts((prev) =>
      prev.map((d) => {
        if (d.id !== doubtId) return d;
        const updatedAnswers = d.answers.map((a) => {
          if (a.id !== answerId) return a;
          const nextHidden = !a.isHiddenByModerator;
          return {
            ...a,
            isHiddenByModerator: nextHidden,
            moderationReason: nextHidden ? reason : '',
            isPeerAccepted: nextHidden ? false : a.isPeerAccepted,
            isTeacherVerified: nextHidden ? false : a.isTeacherVerified,
          };
        });
        return {
          ...d,
          answers: updatedAnswers,
          status: recomputeDoubtStatus(updatedAnswers),
        };
      })
    );
  };

  const handleRateAnswer = (
    doubtId: string,
    answerId: string,
    ratingKey: keyof AnswerRatings
  ) => {
    setDoubts((prev) =>
      prev.map((d) => {
        if (d.id !== doubtId) return d;
        const updatedAnswers = d.answers.map((a) => {
          if (a.id !== answerId) return a;
          return {
            ...a,
            ratings: {
              ...a.ratings,
              [ratingKey]: a.ratings[ratingKey] + 1,
            },
          };
        });
        return { ...d, answers: updatedAnswers };
      })
    );
  };

  const handleEscalateFromAiFriend = (questionText: string): Doubt => {
    const authorNameByRole: Record<UserRole, string> = {
      asker: 'Aarav Sharma',
      peer: 'Priya Deshmukh',
      teacher: 'Prof. R. K. Kulkarni',
    };

    const newDoubt: Doubt = {
      id: Date.now().toString(),
      title: questionText,
      description: `Escalated from 24×7 AI Study Friend because no Teacher-Verified or Peer-Accepted campus solution existed yet.`,
      subject: 'C Programming',
      topic: 'General',
      authorName: authorNameByRole[activeRole],
      createdAt: 'Just now',
      waitingHours: 0,
      status: 'unresolved',
      attachments: [],
      answers: [],
    };
    setDoubts((prev) => [newDoubt, ...prev]);
    setToastMessage('Escalated to Doubt Feed & Unresolved Tracker!');
    return newDoubt;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <TopNav
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        totalDoubtsCount={doubts.length}
        unresolvedCount={unresolvedCount}
        personas={PERSONAS}
        activeRole={activeRole}
        onRoleChange={setActiveRole}
      />

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 max-w-md bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss notification"
            className="text-slate-400 hover:text-white p-0.5 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {selectedDoubt ? (
          <DoubtDetailView
            doubt={selectedDoubt}
            activeRole={activeRole}
            activePersona={activePersona}
            onBack={() => setSelectedDoubtId(null)}
            onAddAnswer={handleAddAnswer}
            onTogglePeerAccept={handleTogglePeerAccept}
            onToggleTeacherVerify={handleToggleTeacherVerify}
            onUpdateFacultyNote={handleUpdateFacultyNote}
            onToggleModeration={handleToggleModeration}
            onRateAnswer={handleRateAnswer}
          />
        ) : activeTab === 'feed' ? (
          <DoubtFeedView
            doubts={doubts}
            searchQuery={searchQuery}
            onClearSearch={() => setSearchQuery('')}
            onSelectDoubt={handleSelectDoubt}
            onOpenAskDoubt={() => handleSelectTab('ask')}
            activeRole={activeRole}
          />
        ) : activeTab === 'ask' ? (
          <AskDoubtView
            doubts={doubts}
            activePersona={activePersona}
            onCancel={() => handleSelectTab('feed')}
            onSelectDoubt={handleSelectDoubt}
            onCreateDoubt={handleCreateDoubt}
          />
        ) : activeTab === 'unresolved' ? (
          <UnresolvedTrackerView
            doubts={doubts}
            onSelectDoubt={handleSelectDoubt}
          />
        ) : activeTab === 'ai_friend' ? (
          <AiFriendView
            doubts={doubts}
            activePersona={activePersona}
            onSelectDoubt={handleSelectDoubt}
            onEscalateDoubt={handleEscalateFromAiFriend}
          />
        ) : (
          <RatraaPlannerView
            doubts={doubts}
            activePersona={activePersona}
            onSelectDoubt={handleSelectDoubt}
          />
        )}
      </main>
    </div>
  );
}

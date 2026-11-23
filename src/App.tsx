import { useMemo, useState } from 'react';
import { INITIAL_DOUBTS, PERSONAS } from './data/seedData';
import { Answer, AnswerRatings, Doubt, DoubtStatus, NavTab, UserRole } from './types';
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
    attachments: string[];
  }) => {
    const newDoubt: Doubt = {
      id: `doubt-${Date.now()}`,
      title: payload.title,
      description: payload.description,
      subject: payload.subject,
      topic: payload.topic,
      authorName: activePersona.shortName,
      createdAt: 'Just now',
      waitingHours: 0.05,
      status: 'unresolved',
      attachments: payload.attachments,
      answers: [],
    };
    setDoubts((prev) => [newDoubt, ...prev]);
    setActiveTab('feed');
    setSelectedDoubtId(newDoubt.id);
  };

  const handleAddAnswer = (doubtId: string, content: string, codeBlock?: string) => {
    const badgeByRole: Record<UserRole, string> = {
      asker: 'Student',
      peer: 'Ninja Solver',
      teacher: 'Faculty',
    };

    const newAnswer: Answer = {
      id: `ans-${Date.now()}`,
      authorName: activePersona.shortName,
      authorRole: activePersona.roleTitle,
      authorBadge: badgeByRole[activeRole],
      content,
      codeBlock,
      isPeerAccepted: false,
      isTeacherVerified: activeRole === 'teacher',
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

  const handleToggleTeacherVerify = (doubtId: string, answerId: string) => {
    setDoubts((prev) =>
      prev.map((d) => {
        if (d.id !== doubtId) return d;
        const updatedAnswers = d.answers.map((a) =>
          a.id === answerId ? { ...a, isTeacherVerified: !a.isTeacherVerified } : a
        );
        return {
          ...d,
          answers: updatedAnswers,
          status: recomputeDoubtStatus(updatedAnswers),
        };
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
            activePersona={activePersona}
            onCancel={() => handleSelectTab('feed')}
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
            onSelectDoubt={handleSelectDoubt}
          />
        ) : (
          <RatraaPlannerView />
        )}
      </main>
    </div>
  );
}

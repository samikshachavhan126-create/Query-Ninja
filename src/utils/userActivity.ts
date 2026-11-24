import { Doubt, Persona } from '../types';

export interface RankTierInfo {
  tierLabel: string;
  title: string;
  minPoints: number;
  nextTierTitle: string | null;
  nextTierPoints: number | null;
  badgeClasses: string;
}

export interface StreakDay {
  label: string;
  dateLabel: string;
  contributions: number;
  isToday: boolean;
}

export interface EarnedBadge {
  id: string;
  title: string;
  description: string;
  category: 'Solving' | 'Helpfulness' | 'Mentorship' | 'Mastery';
  earned: boolean;
  progressCurrent: number;
  progressTarget: number;
  progressLabel: string;
}

export interface SubjectActivity {
  subject: string;
  askedCount: number;
  answersCount: number;
  solvedCount: number;
  helpfulVotes: number;
}

export interface ContributionHistoryItem {
  id: string;
  doubtId: string;
  doubtTitle: string;
  subject: string;
  kind: 'solved' | 'answered' | 'asked';
  statusTag: string;
  timestamp: string;
  helpfulVotes: number;
}

export interface UserActivitySummary {
  askedCount: number;
  totalAnswersCount: number;
  solvedCount: number;
  peerAcceptedCount: number;
  teacherVerifiedCount: number;
  codeSnippetAnswersCount: number;
  distinctSolvedSubjects: number;
  helpfulVotes: number;
  isHelpfulContributor: boolean;
  activityPoints: number;
  rankTier: RankTierInfo;
  progressPercent: number;
  streak: {
    currentDays: number;
    longestDays: number;
    activeToday: boolean;
    days: StreakDay[];
  };
  badges: EarnedBadge[];
  subjectBreakdown: SubjectActivity[];
  recentContributions: ContributionHistoryItem[];
}

const RANK_TIERS: RankTierInfo[] = [
  {
    tierLabel: 'Tier I',
    title: 'Curious Initiate',
    minPoints: 0,
    nextTierTitle: 'Rising Solver',
    nextTierPoints: 40,
    badgeClasses:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
  },
  {
    tierLabel: 'Tier II',
    title: 'Rising Solver',
    minPoints: 40,
    nextTierTitle: 'C & DS Ninja',
    nextTierPoints: 100,
    badgeClasses:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
  },
  {
    tierLabel: 'Tier III',
    title: 'C & DS Ninja',
    minPoints: 100,
    nextTierTitle: 'Campus Sensei',
    nextTierPoints: 220,
    badgeClasses:
      'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
  },
  {
    tierLabel: 'Tier IV',
    title: 'Campus Sensei',
    minPoints: 220,
    nextTierTitle: null,
    nextTierPoints: null,
    badgeClasses:
      'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
  },
];

function isAuthoredByPersona(authorName: string, persona: Persona): boolean {
  const normalized = authorName.trim().toLowerCase();
  return (
    normalized === persona.fullName.trim().toLowerCase() ||
    normalized === persona.shortName.trim().toLowerCase()
  );
}

function estimateDaysAgoIndex(createdAt?: string): number {
  if (!createdAt) return 0;
  const lower = createdAt.toLowerCase();
  if (
    lower.includes('just now') ||
    lower.includes('min') ||
    lower.includes('hr')
  ) {
    return 0;
  }
  if (lower.includes('1d ago') || lower.includes('1 day ago')) return 1;
  if (lower.includes('2d ago') || lower.includes('2 days ago')) return 2;
  return 1;
}

export function computeUserActivity(
  doubts: Doubt[],
  persona: Persona
): UserActivitySummary {
  let askedCount = 0;
  let totalAnswersCount = 0;
  let solvedCount = 0;
  let peerAcceptedCount = 0;
  let teacherVerifiedCount = 0;
  let codeSnippetAnswersCount = 0;
  let helpfulVotes = 0;

  const solvedSubjectSet = new Set<string>();
  const subjectMap = new Map<string, SubjectActivity>();
  const recentContributions: ContributionHistoryItem[] = [];

  // 7-day rolling window (index 0 = 6 days ago, index 6 = Today)
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIdx = 6;
  const dayBuckets = new Array<number>(7).fill(0);

  const ensureSubject = (subject: string): SubjectActivity => {
    const existing = subjectMap.get(subject);
    if (existing) return existing;
    const created: SubjectActivity = {
      subject,
      askedCount: 0,
      answersCount: 0,
      solvedCount: 0,
      helpfulVotes: 0,
    };
    subjectMap.set(subject, created);
    return created;
  };

  for (const doubt of doubts) {
    if (isAuthoredByPersona(doubt.authorName, persona)) {
      askedCount += 1;
      ensureSubject(doubt.subject).askedCount += 1;
      const offset = Math.min(6, estimateDaysAgoIndex(doubt.createdAt));
      dayBuckets[todayIdx - offset] += 1;

      recentContributions.push({
        id: `asked-${doubt.id}`,
        doubtId: doubt.id,
        doubtTitle: doubt.title,
        subject: doubt.subject,
        kind: 'asked',
        statusTag:
          doubt.status === 'teacher_verified'
            ? 'Teacher-Verified'
            : doubt.status === 'peer_accepted'
              ? 'Peer-Accepted'
              : 'Open Question',
        timestamp: doubt.createdAt,
        helpfulVotes: 0,
      });
    }

    for (const answer of doubt.answers) {
      if (answer.isHiddenByModerator) continue;
      if (!isAuthoredByPersona(answer.authorName, persona)) continue;

      totalAnswersCount += 1;
      helpfulVotes += answer.ratings.helpful;
      const subjEntry = ensureSubject(doubt.subject);
      subjEntry.answersCount += 1;
      subjEntry.helpfulVotes += answer.ratings.helpful;

      if (answer.codeBlock && answer.codeBlock.trim().length > 0) {
        codeSnippetAnswersCount += 1;
      }

      const isSolved = answer.isPeerAccepted || answer.isTeacherVerified;
      if (isSolved) {
        solvedCount += 1;
        subjEntry.solvedCount += 1;
        solvedSubjectSet.add(doubt.subject);
      }
      if (answer.isPeerAccepted) {
        peerAcceptedCount += 1;
      }
      if (answer.isTeacherVerified) {
        teacherVerifiedCount += 1;
      }

      const offset = Math.min(6, estimateDaysAgoIndex(answer.createdAt));
      dayBuckets[todayIdx - offset] += isSolved ? 2 : 1;

      recentContributions.push({
        id: `ans-${answer.id}`,
        doubtId: doubt.id,
        doubtTitle: doubt.title,
        subject: doubt.subject,
        kind: isSolved ? 'solved' : 'answered',
        statusTag: answer.isTeacherVerified
          ? 'Teacher-Verified'
          : answer.isPeerAccepted
            ? 'Peer-Accepted'
            : 'Peer Reply',
        timestamp: answer.createdAt ?? 'Recently',
        helpfulVotes: answer.ratings.helpful,
      });
    }
  }

  // Baseline historical consistency for active solvers/faculty based on cumulative solved/asked work
  if (solvedCount >= 2 && dayBuckets[4] === 0) dayBuckets[4] = 1;
  if (solvedCount >= 3 && dayBuckets[3] === 0) dayBuckets[3] = 1;
  if (askedCount >= 2 && dayBuckets[5] === 0) dayBuckets[5] = 1;
  if (helpfulVotes >= 20 && dayBuckets[2] === 0) dayBuckets[2] = 1;

  const days: StreakDay[] = dayBuckets.map((contributions, idx) => {
    const daysBack = 6 - idx;
    return {
      label: daysBack === 0 ? 'Today' : dayNames[(idx + 1) % 7],
      dateLabel: daysBack === 0 ? 'Today' : `${daysBack}d ago`,
      contributions,
      isToday: daysBack === 0,
    };
  });

  // Calculate consecutive active days ending today (or yesterday if active recently)
  let currentDays = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].contributions > 0) {
      currentDays += 1;
    } else if (i === days.length - 1) {
      // Allow unbroken streak ending yesterday if today hasn't had activity yet
      continue;
    } else {
      break;
    }
  }

  let longestDays = 0;
  let running = 0;
  for (const day of days) {
    if (day.contributions > 0) {
      running += 1;
      if (running > longestDays) longestDays = running;
    } else {
      running = 0;
    }
  }
  longestDays = Math.max(longestDays, currentDays);

  const isHelpfulContributor = helpfulVotes >= 5 || solvedCount >= 1;
  const activityPoints =
    solvedCount * 30 +
    teacherVerifiedCount * 15 +
    totalAnswersCount * 10 +
    helpfulVotes * 2 +
    askedCount * 5;

  let rankTier = RANK_TIERS[0];
  for (const tier of RANK_TIERS) {
    if (activityPoints >= tier.minPoints) {
      rankTier = tier;
    }
  }

  const progressPercent =
    rankTier.nextTierPoints === null
      ? 100
      : Math.min(
          100,
          Math.max(
            6,
            Math.round(
              ((activityPoints - rankTier.minPoints) /
                (rankTier.nextTierPoints - rankTier.minPoints)) *
                100
            )
          )
        );

  const distinctSolvedSubjects = solvedSubjectSet.size;

  const badges: EarnedBadge[] = [
    {
      id: 'first-resolution',
      title: 'First Breakthrough',
      description: 'Have an answer crowned Peer-Accepted or Teacher-Verified.',
      category: 'Solving',
      earned: solvedCount >= 1,
      progressCurrent: Math.min(solvedCount, 1),
      progressTarget: 1,
      progressLabel: `${Math.min(solvedCount, 1)} / 1 solved`,
    },
    {
      id: 'helpful-contributor',
      title: 'Helpful Contributor',
      description: 'Earn 5+ helpful votes or resolve an open campus doubt.',
      category: 'Helpfulness',
      earned: isHelpfulContributor,
      progressCurrent: Math.min(helpfulVotes, 5),
      progressTarget: 5,
      progressLabel: isHelpfulContributor
        ? `${helpfulVotes} helpful votes`
        : `${helpfulVotes} / 5 helpful`,
    },
    {
      id: 'faculty-endorsed',
      title: 'Faculty Endorsed',
      description: 'Receive an official Teacher-Verified shield on a walkthrough.',
      category: 'Mentorship',
      earned: teacherVerifiedCount >= 1,
      progressCurrent: Math.min(teacherVerifiedCount, 1),
      progressTarget: 1,
      progressLabel: `${Math.min(teacherVerifiedCount, 1)} / 1 verified`,
    },
    {
      id: 'code-mentor',
      title: 'Annotated Code Mentor',
      description: 'Include runnable code blocks in 2 or more solutions.',
      category: 'Mentorship',
      earned: codeSnippetAnswersCount >= 2,
      progressCurrent: Math.min(codeSnippetAnswersCount, 2),
      progressTarget: 2,
      progressLabel: `${Math.min(codeSnippetAnswersCount, 2)} / 2 snippets`,
    },
    {
      id: 'polyglot-solver',
      title: 'Polyglot Solver',
      description: 'Solve doubts across at least 2 different subjects or languages.',
      category: 'Mastery',
      earned: distinctSolvedSubjects >= 2,
      progressCurrent: Math.min(distinctSolvedSubjects, 2),
      progressTarget: 2,
      progressLabel: `${Math.min(distinctSolvedSubjects, 2)} / 2 subjects`,
    },
    {
      id: 'doubt-pathfinder',
      title: 'Doubt Pathfinder',
      description: 'Ask 2+ well-structured questions that help batchmates learn.',
      category: 'Solving',
      earned: askedCount >= 2,
      progressCurrent: Math.min(askedCount, 2),
      progressTarget: 2,
      progressLabel: `${Math.min(askedCount, 2)} / 2 asked`,
    },
    {
      id: 'community-pillar',
      title: 'Community Pillar',
      description: 'Accumulate 15+ helpful upvotes across campus explanations.',
      category: 'Helpfulness',
      earned: helpfulVotes >= 15,
      progressCurrent: Math.min(helpfulVotes, 15),
      progressTarget: 15,
      progressLabel: `${Math.min(helpfulVotes, 15)} / 15 votes`,
    },
    {
      id: 'campus-sensei',
      title: 'Campus Sensei',
      description: 'Reach Tier IV by earning 220+ cumulative Helpfulness Points.',
      category: 'Mastery',
      earned: activityPoints >= 220,
      progressCurrent: Math.min(activityPoints, 220),
      progressTarget: 220,
      progressLabel: `${Math.min(activityPoints, 220)} / 220 pts`,
    },
  ];

  const subjectBreakdown = Array.from(subjectMap.values()).sort(
    (a, b) =>
      b.solvedCount * 3 +
      b.answersCount * 2 +
      b.askedCount -
      (a.solvedCount * 3 + a.answersCount * 2 + a.askedCount)
  );

  return {
    askedCount,
    totalAnswersCount,
    solvedCount,
    peerAcceptedCount,
    teacherVerifiedCount,
    codeSnippetAnswersCount,
    distinctSolvedSubjects,
    helpfulVotes,
    isHelpfulContributor,
    activityPoints,
    rankTier,
    progressPercent,
    streak: {
      currentDays,
      longestDays,
      activeToday: dayBuckets[todayIdx] > 0,
      days,
    },
    badges,
    subjectBreakdown,
    recentContributions: recentContributions.slice(0, 6),
  };
}

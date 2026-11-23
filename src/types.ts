export type UserRole = 'asker' | 'peer' | 'teacher';

export type NavTab =
  | 'feed'
  | 'ask'
  | 'unresolved'
  | 'ai_friend'
  | 'ratraa';

export type DoubtStatus = 'unresolved' | 'peer_accepted' | 'teacher_verified';

export interface Persona {
  id: UserRole;
  dropdownLabel: string;
  shortName: string;
  roleTitle: string;
  metaText: string;
  permissionSummary: string;
  accentClass: string;
}

export interface AnswerRatings {
  helpful: number;
  notHelpful: number;
  misleading: number;
}

export interface Answer {
  id: string;
  authorName: string;
  authorRole: string;
  authorBadge: string;
  content: string;
  codeBlock?: string;
  isPeerAccepted: boolean;
  isTeacherVerified: boolean;
  isHiddenByModerator: boolean;
  moderationReason: string;
  ratings: AnswerRatings;
}

export interface Doubt {
  id: string;
  title: string;
  description: string;
  subject: string;
  topic: string;
  authorName: string;
  createdAt: string;
  waitingHours: number;
  status: DoubtStatus;
  attachments: string[];
  answers: Answer[];
}

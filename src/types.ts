export type UserRole = 'asker' | 'peer' | 'teacher';

export type NavTab =
  | 'feed'
  | 'ask'
  | 'unresolved'
  | 'ai_friend'
  | 'ratraa'
  | 'profile';

export type DoubtStatus = 'unresolved' | 'peer_accepted' | 'teacher_verified';

export interface Persona {
  id: UserRole;
  dropdownLabel: string;
  shortName: string;
  fullName: string;
  postingIdentityLabel: string;
  roleTitle: string;
  metaText: string;
  permissionSummary: string;
  accentClass: string;
}

export interface DoubtAttachment {
  type: 'code' | 'pdf' | 'image' | 'video';
  label: string;
  content: string;
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
  createdAt?: string;
  content: string;
  codeBlock?: string;
  attachmentLabel?: string;
  facultyNote?: string;
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
  attachment?: DoubtAttachment | null;
  answers: Answer[];
}

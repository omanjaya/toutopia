export interface ChildProfile {
  id: string;
  name: string;
  avatar: string | null;
  email: string;
  profile: {
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string | null;
    targetExam: string | null;
    school: string | null;
  } | null;
}

export interface ChildAttempt {
  packageTitle: string;
  category: string;
  score: number | null;
  totalCorrect: number | null;
  totalQuestions: number;
  finishedAt: string | null;
}

export interface ChildBadge {
  name: string;
  icon: string;
  earnedAt: string;
}

export interface ChildData {
  child: ChildProfile;
  stats: {
    totalAttempts: number;
    avgScore: number;
    lastActive: string | null;
  };
  recentAttempts: ChildAttempt[];
  badges: ChildBadge[];
}

export interface PendingInvite {
  id: string;
  child: { name: string; email: string };
}

export interface ParentData {
  children: ChildData[];
  pendingInvites: PendingInvite[];
}

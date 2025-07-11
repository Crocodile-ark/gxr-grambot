export interface User {
  id: number;
  telegramId: string;
  username?: string;
  points?: number;
  lastClaim?: Date;
  wallet?: string;
  referralCode?: string;
  referredBy?: string;
  totalReferrals?: number;
  refApplied?: boolean;
  isAdmin?: boolean;
  createdAt?: Date;
}

export interface UserStats {
  user: User;
  evolName: string;
  evolLevel: number;
  globalRank: number;
  nextEvolTarget: number;
  progressPercentage: number;
  canClaim: boolean;
  timeUntilNextClaim: number;
  dailyEarnings: number;
  totalClaims: number;
}

export interface Task {
  id: number;
  name: string;
  category: string;
  reward: number;
  description?: string;
  link?: string;
  isActive?: boolean;
}

export interface TaskWithCompletion extends Task {
  completed: boolean;
  completedAt?: Date;
}

export interface LeaderboardEntry {
  user: User;
  evolName: string;
  rank: number;
}

export interface AdminStats {
  totalUsers: number;
  totalDistributed: number;
  poolUsagePercentage: number;
  evolPools: Array<{
    id: number;
    evolLevel: number;
    totalPool: number;
    usedPool: number;
  }>;
}

export interface NotificationData {
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  requirements: AchievementRequirements;
  isActive: boolean;
  createdAt: string;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  achievement?: Achievement;
  unlockedAt: string;
  progress?: number;
  maxProgress?: number;
}

export type AchievementCategory = "social" | "proof" | "engagement" | "milestone";

export type AchievementRarity = "common" | "rare" | "epic" | "legendary";

export interface AchievementRequirements {
  type: "count" | "streak" | "condition";
  target?: number;
  condition?: string;
  metadata?: Record<string, any>;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  requirements: TaskRequirements;
  reward: number;
  isActive: boolean;
  difficulty: TaskDifficulty;
  timeLimit?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserTask {
  id: string;
  userId: string;
  taskId: string;
  task?: Task;
  status: TaskStatus;
  progress: number;
  maxProgress: number;
  zkProofHash?: string;
  completedAt?: string;
  createdAt: string;
}

export type TaskType = "engagement" | "proof_generation" | "social" | "milestone";

export type TaskStatus = "pending" | "active" | "completed" | "verified" | "failed";

export type TaskDifficulty = "easy" | "medium" | "hard";

export interface TaskRequirements {
  action: string;
  parameters: Record<string, any>;
  verification: TaskVerification;
}

export interface TaskVerification {
  method: "automatic" | "manual" | "zkproof";
  criteria: Record<string, any>;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  category: BadgeCategory;
  unlockConditions: BadgeConditions;
  isVisible: boolean;
  createdAt: string;
}

export type BadgeRarity = "bronze" | "silver" | "gold" | "platinum" | "diamond";

export type BadgeCategory = "newcomer" | "contributor" | "expert" | "legend";

export interface BadgeConditions {
  requirements: Array<{
    type: string;
    value: number;
    operator: "gte" | "eq" | "lte";
  }>;
}

export interface UserProgress {
  userId: string;
  level: number;
  xp: number;
  nextLevelXP: number;
  totalProofs: number;
  completedTasks: number;
  unlockedAchievements: number;
  streak: {
    current: number;
    longest: number;
    lastActivity: string;
  };
  stats: UserStats;
}

export interface UserStats {
  dailyActive: boolean;
  weeklyActive: boolean;
  monthlyActive: boolean;
  engagementScore: number;
  proofSuccessRate: number;
  avgProofTime: number;
  favoriteTaskTypes: TaskType[];
  strongestCategories: AchievementCategory[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  user: {
    username: string;
    twitterUsername?: string;
    profileImage?: string;
    level: number;
  };
  score: number;
  metric: LeaderboardMetric;
  change: number; // Position change from last period
}

export type LeaderboardMetric = "xp" | "proofs" | "tasks" | "achievements" | "engagement";

export interface Leaderboard {
  timeframe: LeaderboardTimeframe;
  metric: LeaderboardMetric;
  entries: LeaderboardEntry[];
  totalParticipants: number;
  lastUpdated: string;
}

export type LeaderboardTimeframe = "daily" | "weekly" | "monthly" | "all-time";

export interface GamificationEvent {
  id: string;
  type: GamificationEventType;
  userId: string;
  data: Record<string, any>;
  timestamp: string;
}

export type GamificationEventType = 
  | "task_completed"
  | "achievement_unlocked" 
  | "level_up"
  | "proof_verified"
  | "streak_achieved"
  | "milestone_reached";

export interface RewardSystem {
  baseXP: number;
  multipliers: {
    difficulty: Record<TaskDifficulty, number>;
    rarity: Record<AchievementRarity, number>;
    streak: Array<{ threshold: number; multiplier: number }>;
  };
  bonuses: {
    firstCompletion: number;
    perfectScore: number;
    dailyStreak: number;
  };
}

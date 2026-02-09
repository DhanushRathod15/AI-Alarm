// Core Type Definitions

export type ExamType = 'CAT' | 'GATE' | 'CODING' | 'JEE' | 'NEET';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type FocusMode = 'balanced' | 'weakness' | 'random' | 'progressive';
export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
export type AlarmStatus = 'scheduled' | 'ringing' | 'snoozed' | 'dismissed' | 'missed';
export type SessionStatus = 'active' | 'completed' | 'failed' | 'snoozed';
export type DismissedBy = 'correct' | 'timeout' | 'manual' | 'escape';
export type Trend = 'improving' | 'stable' | 'declining';

// Alarm Model
export interface Alarm {
  id: string;
  userId: string;
  
  // Basic settings
  time: string;              // HH:MM format (24-hour)
  days: DayOfWeek[];
  enabled: boolean;
  label?: string;
  
  // Question settings
  exam: ExamType;
  subjects: string[];
  topics: string[];
  difficultyMin: Difficulty;
  difficultyMax: Difficulty;
  focusMode: FocusMode;
  maxSolveTime: number;      // seconds
  
  // Advanced settings
  allowSkip: boolean;
  maxRetries: number;
  requireMultipleQuestions: boolean;
  questionsRequired: number;
  
  // Anti-escape settings
  preventAppClose: boolean;
  escalateSoundVolume: boolean;
  requireVerification: boolean;
  maxSnoozeCount: number;
  snoozeDuration: number;    // minutes
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastTriggered?: Date;
  nextTrigger?: Date;
  
  // Stats
  totalRings: number;
  successfulDismisses: number;
  failedDismisses: number;
  snoozeCount: number;
  averageTimeToSolve: number;  // seconds
}

// Question Model
export interface Question {
  id: string;
  
  // Classification
  exam: ExamType;
  subject: string;
  topic: string;
  difficulty: Difficulty;
  tags: string[];
  
  // Content
  question: string;
  options: string[];
  correctAnswer: number;      // index of correct option
  explanation: string;
  source?: string;
  imageUrl?: string;
  
  // Metadata
  expectedSolveTime: number;  // seconds
  globalAttempts: number;
  globalCorrectAttempts: number;
  globalAverageSolveTime: number;
  
  // Version control
  version: number;
  createdAt: Date;
  updatedAt: Date;
  
  // User-specific (computed)
  userAttempts?: number;
  userCorrect?: boolean;
  lastAttempted?: Date;
}

// User Profile Model
export interface UserProfile {
  id: string;
  
  // Basic info
  primaryExam: ExamType;
  targetExams: ExamType[];
  timezone: string;
  
  // Preferences
  preferredDifficulty: Difficulty;
  preferredSubjects: string[];
  focusMode: FocusMode;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  
  // Performance analytics
  overallAccuracy: number;
  subjectPerformance: Record<string, SubjectStats>;
  difficultyPerformance: Record<Difficulty, DifficultyStats>;
  topicMastery: Record<string, number>;  // 0-100
  
  // Engagement
  currentStreak: number;
  longestStreak: number;
  lastAlarmDate?: Date;
  totalXP: number;
  level: number;
  xpToNextLevel: number;
  achievements: Achievement[];
  
  // Learning metrics
  questionsAnswered: number;
  correctAnswers: number;
  averageSolveTime: number;
  weakAreas: string[];       // subjects/topics
  strongAreas: string[];     // subjects/topics
  
  // Behavioral
  frustrationLevel: number;  // 0-10
  bestPerformanceTimeOfDay: string;  // 'morning' | 'afternoon' | 'evening' | 'night'
  averageRetryCount: number;
  
  // Settings
  notificationsEnabled: boolean;
  darkMode: boolean;
  
  // Metadata
  createdAt: Date;
  lastActive: Date;
  onboardingCompleted: boolean;
}

// Subject Stats
export interface SubjectStats {
  subject: string;
  totalAttempts: number;
  correctAnswers: number;
  accuracy: number;           // percentage
  averageSolveTime: number;
  lastPracticed?: Date;
  proficiencyLevel: number;   // 0-100
  trend: Trend;
  recentQuestions: string[];  // last N question IDs
}

// Difficulty Stats
export interface DifficultyStats {
  difficulty: Difficulty;
  totalAttempts: number;
  correctAnswers: number;
  accuracy: number;
  averageSolveTime: number;
  successRate: number;
}

// Performance Trend
export interface PerformanceTrend {
  date: Date;
  accuracy: number;
  questionsAnswered: number;
  averageTime: number;
  xpEarned: number;
  streak: number;
}

// Alarm Session
export interface AlarmSession {
  id: string;
  alarmId: string;
  userId: string;
  
  // Timing
  triggeredAt: Date;
  dismissedAt?: Date;
  duration: number;
  
  // Question data
  questions: QuestionAttempt[];
  currentQuestionIndex: number;
  totalQuestionsRequired: number;
  
  // Performance
  totalAttempts: number;
  correctAnswers: number;
  accuracy: number;
  
  // Behavior
  snoozeCount: number;
  appCloseAttempts: number;
  escapeAttempts: number;
  hintsUsed: number;
  
  // Outcome
  status: SessionStatus;
  dismissedBy: DismissedBy;
  
  // XP & Rewards
  xpEarned: number;
  streakMaintained: boolean;
  achievementsUnlocked: string[];
  
  // Metadata
  completedAt?: Date;
}

// Question Attempt
export interface QuestionAttempt {
  questionId: string;
  question: Question;
  
  // Timing
  startTime: Date;
  endTime?: Date;
  timeSpent: number;         // seconds
  
  // Response
  selectedAnswer?: number;
  isCorrect: boolean;
  attempts: number;
  submittedAnswers: number[];  // history of attempts
  
  // Context
  difficultyAtAttempt: Difficulty;
  frustrationAtAttempt: number;
  streakAtAttempt: number;
  
  // Behavior
  hintUsed: boolean;
  skipped: boolean;
}

// Achievement
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp: number;
  unlockedAt?: Date;
  progress?: number;         // for progressive achievements
  target?: number;
}

// XP Config
export interface XPConfig {
  baseXP: number;
  difficultyMultiplier: Record<Difficulty, number>;
  speedBonusThreshold: number;  // ratio of expected time
  speedBonus: number;
  streakMultiplier: number;
  firstAttemptBonus: number;
  perfectSessionBonus: number;
}

// Selection Criteria
export interface SelectionCriteria {
  exam: ExamType;
  subjects?: string[];
  topics?: string[];
  difficultyMin: Difficulty;
  difficultyMax: Difficulty;
  maxSolveTime: number;
  excludeRecent: number;      // days
  excludeIds: string[];       // session question IDs
  focusMode: FocusMode;
  userProfile: UserProfile;
}

// Scoring Weights
export interface ScoringWeights {
  weakAreaBoost: number;      // 0-100
  unseenConceptBonus: number;
  varietyBonus: number;
  abilityLevelMatch: number;
  frustrationGuard: number;
  timeOfDayMatch: number;
}

// Scored Question (internal)
export interface ScoredQuestion {
  question: Question;
  score: number;
  rank: number;
  breakdown?: {              // for debugging
    weakAreaScore: number;
    unseenBonus: number;
    varietyScore: number;
    abilityScore: number;
    frustrationScore: number;
    timeScore: number;
  };
}

// Analytics Event
export interface AnalyticsEvent {
  type: 'alarm_created' | 'alarm_triggered' | 'alarm_dismissed' | 'alarm_snoozed' | 
        'question_answered' | 'question_skipped' | 'achievement_unlocked' | 
        'level_up' | 'streak_broken' | 'app_opened' | 'app_closed';
  timestamp: Date;
  userId: string;
  metadata?: Record<string, any>;
}

// Time Range
export interface TimeRange {
  start: string;  // HH:MM
  end: string;    // HH:MM
}

// Notification Config
export interface NotificationConfig {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  vibrate?: number[];
  sound?: string;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  tag?: string;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

// App Config
export interface AppConfig {
  version: string;
  minPasswordLength: number;
  maxAlarms: number;
  defaultSnoozeDuration: number;
  defaultMaxSolveTime: number;
  maxSnoozeCount: number;
  questionPoolSize: number;
  cacheExpiryDays: number;
  syncIntervalMinutes: number;
  
  xp: XPConfig;
  scoring: ScoringWeights;
}

import { AppConfig, XPConfig, ScoringWeights, Achievement } from '../data/models/types';

// XP System Configuration
export const XP_CONFIG: XPConfig = {
  baseXP: 10,
  difficultyMultiplier: {
    easy: 1,
    medium: 1.5,
    hard: 2.5,
  },
  speedBonusThreshold: 0.7,  // 70% of expected time
  speedBonus: 5,
  streakMultiplier: 1.05,    // 5% per day (capped at 30 days)
  firstAttemptBonus: 10,
  perfectSessionBonus: 50,
};

// Question Selection Scoring Weights
export const SCORING_WEIGHTS: ScoringWeights = {
  weakAreaBoost: 40,
  unseenConceptBonus: 30,
  varietyBonus: 20,
  abilityLevelMatch: 50,
  frustrationGuard: 35,
  timeOfDayMatch: 15,
};

// App Configuration
export const APP_CONFIG: AppConfig = {
  version: '1.0.0',
  minPasswordLength: 6,
  maxAlarms: 20,
  defaultSnoozeDuration: 5,       // minutes
  defaultMaxSolveTime: 120,       // seconds
  maxSnoozeCount: 3,
  questionPoolSize: 100,
  cacheExpiryDays: 7,
  syncIntervalMinutes: 30,
  
  xp: XP_CONFIG,
  scoring: SCORING_WEIGHTS,
};

// Level System
export const LEVEL_CONFIG = {
  baseXP: 100,
  multiplier: 1.5,
};

export function getXPForLevel(level: number): number {
  return Math.floor(LEVEL_CONFIG.baseXP * Math.pow(LEVEL_CONFIG.multiplier, level - 1));
}

export function getLevelFromXP(xp: number): { level: number; xpToNext: number } {
  let level = 1;
  let totalXP = 0;
  
  while (totalXP + getXPForLevel(level) <= xp) {
    totalXP += getXPForLevel(level);
    level++;
  }
  
  const xpToNext = getXPForLevel(level) - (xp - totalXP);
  
  return { level, xpToNext };
}

// Achievements
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_alarm',
    name: 'Rise and Shine',
    description: 'Complete your first alarm',
    icon: '🌅',
    xp: 50,
  },
  {
    id: 'streak_3',
    name: 'Getting Started',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    xp: 100,
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '⚡',
    xp: 300,
  },
  {
    id: 'streak_14',
    name: 'Fortnight Champion',
    description: 'Maintain a 14-day streak',
    icon: '💪',
    xp: 700,
  },
  {
    id: 'streak_30',
    name: 'Month Master',
    description: 'Maintain a 30-day streak',
    icon: '👑',
    xp: 2000,
  },
  {
    id: 'streak_100',
    name: 'Century Legend',
    description: 'Maintain a 100-day streak',
    icon: '🏆',
    xp: 10000,
  },
  {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: '100% accuracy for 7 days',
    icon: '🎯',
    xp: 500,
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Solve 10 questions under time',
    icon: '⚡',
    xp: 200,
  },
  {
    id: 'no_snooze',
    name: 'No Snooze Legend',
    description: 'Complete 30 alarms without snoozing',
    icon: '🚫',
    xp: 1000,
  },
  {
    id: 'subject_master_cat',
    name: 'CAT Master',
    description: '90% accuracy in all CAT subjects',
    icon: '🐱',
    xp: 1500,
  },
  {
    id: 'subject_master_gate',
    name: 'GATE Master',
    description: '90% accuracy in all GATE subjects',
    icon: '🚪',
    xp: 1500,
  },
  {
    id: 'subject_master_coding',
    name: 'Coding Master',
    description: '90% accuracy in all Coding subjects',
    icon: '💻',
    xp: 1500,
  },
  {
    id: 'hard_mode',
    name: 'Hard Mode Hero',
    description: 'Complete 50 hard questions',
    icon: '🔥',
    xp: 1000,
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete 20 alarms before 6 AM',
    icon: '🐦',
    xp: 500,
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete 20 alarms after 10 PM',
    icon: '🦉',
    xp: 500,
  },
  {
    id: 'first_try',
    name: 'First Try Expert',
    description: 'Get 50 questions right on first attempt',
    icon: '🎖️',
    xp: 800,
  },
  {
    id: 'comeback_king',
    name: 'Comeback King',
    description: 'Recover from 10+ streak break',
    icon: '👑',
    xp: 1000,
  },
  {
    id: 'knowledge_seeker',
    name: 'Knowledge Seeker',
    description: 'Answer 1000 questions',
    icon: '📚',
    xp: 3000,
  },
  {
    id: 'level_10',
    name: 'Rising Star',
    description: 'Reach level 10',
    icon: '⭐',
    xp: 500,
  },
  {
    id: 'level_25',
    name: 'Expert Learner',
    description: 'Reach level 25',
    icon: '🌟',
    xp: 2000,
  },
  {
    id: 'level_50',
    name: 'Master Scholar',
    description: 'Reach level 50',
    icon: '💫',
    xp: 5000,
  },
];

// Difficulty Order (for comparisons)
export const DIFFICULTY_ORDER = ['easy', 'medium', 'hard'] as const;

export function getDifficultyIndex(difficulty: string): number {
  return DIFFICULTY_ORDER.indexOf(difficulty as any);
}

export function compareDifficulty(d1: string, d2: string): number {
  return getDifficultyIndex(d1) - getDifficultyIndex(d2);
}

// Time of Day Mapping
export const TIME_OF_DAY = {
  morning: { start: '05:00', end: '11:59' },
  afternoon: { start: '12:00', end: '16:59' },
  evening: { start: '17:00', end: '20:59' },
  night: { start: '21:00', end: '04:59' },
};

export function getTimeOfDay(time: string): string {
  const [hours] = time.split(':').map(Number);
  
  if (hours >= 5 && hours < 12) return 'morning';
  if (hours >= 12 && hours < 17) return 'afternoon';
  if (hours >= 17 && hours < 21) return 'evening';
  return 'night';
}

// Sound Configuration
export const SOUND_CONFIG = {
  alarmSoundPath: '/sounds/alarm.mp3',
  successSoundPath: '/sounds/success.mp3',
  failureSoundPath: '/sounds/failure.mp3',
  defaultVolume: 0.7,
  maxVolume: 1.0,
  volumeEscalationInterval: 5000,  // 5 seconds
  volumeEscalationStep: 0.1,
};

// Vibration Patterns
export const VIBRATION_PATTERNS = {
  alarm: [200, 100, 200, 100, 400],
  success: [100, 50, 100],
  failure: [500],
  notification: [100],
};

// Storage Keys
export const STORAGE_KEYS = {
  USER_PROFILE: 'user_profile',
  ALARMS: 'alarms',
  SESSIONS: 'sessions',
  ANALYTICS: 'analytics',
  CACHE: 'cache',
  PENDING_ALARM: 'pending_alarm',
  HAS_SEEN_WELCOME: 'has_seen_welcome',
  THEME: 'theme',
  LAST_SYNC: 'last_sync',
};

// Colors
export const COLORS = {
  difficulty: {
    easy: '#10b981',      // green
    medium: '#f59e0b',    // orange
    hard: '#ef4444',      // red
  },
  exam: {
    CAT: '#3b82f6',       // blue
    GATE: '#8b5cf6',      // purple
    CODING: '#10b981',    // green
    JEE: '#f59e0b',       // orange
    NEET: '#ec4899',      // pink
  },
  status: {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
};

// Animation Durations (ms)
export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
  success: 1000,
};

// Default User Profile
export const DEFAULT_USER_PROFILE = {
  primaryExam: 'CAT' as const,
  targetExams: ['CAT' as const],
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  preferredDifficulty: 'medium' as const,
  preferredSubjects: [],
  focusMode: 'balanced' as const,
  soundEnabled: true,
  vibrationEnabled: true,
  overallAccuracy: 0,
  subjectPerformance: {},
  difficultyPerformance: {
    easy: { difficulty: 'easy' as const, totalAttempts: 0, correctAnswers: 0, accuracy: 0, averageSolveTime: 0, successRate: 0 },
    medium: { difficulty: 'medium' as const, totalAttempts: 0, correctAnswers: 0, accuracy: 0, averageSolveTime: 0, successRate: 0 },
    hard: { difficulty: 'hard' as const, totalAttempts: 0, correctAnswers: 0, accuracy: 0, averageSolveTime: 0, successRate: 0 },
  },
  topicMastery: {},
  currentStreak: 0,
  longestStreak: 0,
  totalXP: 0,
  level: 1,
  xpToNextLevel: getXPForLevel(1),
  achievements: [],
  questionsAnswered: 0,
  correctAnswers: 0,
  averageSolveTime: 0,
  weakAreas: [],
  strongAreas: [],
  frustrationLevel: 0,
  bestPerformanceTimeOfDay: 'morning',
  averageRetryCount: 0,
  notificationsEnabled: true,
  darkMode: false,
  onboardingCompleted: false,
};

// Default Alarm Settings
export const DEFAULT_ALARM_SETTINGS = {
  days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const,
  difficultyMin: 'easy' as const,
  difficultyMax: 'hard' as const,
  focusMode: 'balanced' as const,
  maxSolveTime: 120,
  allowSkip: false,
  maxRetries: 3,
  requireMultipleQuestions: false,
  questionsRequired: 1,
  preventAppClose: true,
  escalateSoundVolume: true,
  requireVerification: false,
  maxSnoozeCount: 3,
  snoozeDuration: 5,
};

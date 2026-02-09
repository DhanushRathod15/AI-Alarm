import { useState, useCallback } from 'react';
import { UserProfile, QuestionAttempt, AlarmSession, Achievement } from '../data/models/types';
import { ProgressManager } from '../core/gamification/ProgressManager';
import { StreakManager } from '../core/gamification/StreakManager';

/**
 * Hook for managing user progress, XP, and achievements
 */
export function useProgress() {
  const [progressManager] = useState(() => new ProgressManager());
  const [streakManager] = useState(() => new StreakManager());

  /**
   * Process a completed question and award XP
   */
  const processQuestionCompletion = useCallback((
    user: UserProfile,
    attempt: QuestionAttempt,
    onUpdate?: (user: UserProfile) => void
  ): { xp: number; leveledUp: boolean; newLevel: number } => {
    if (!attempt.isCorrect) {
      return { xp: 0, leveledUp: false, newLevel: user.level };
    }

    // Calculate XP
    const xp = progressManager.calculateXP(attempt, user.currentStreak);

    // Add XP and check for level up
    const { leveledUp, newLevel } = progressManager.addXP(user, xp);

    if (onUpdate) {
      onUpdate(user);
    }

    return { xp, leveledUp, newLevel };
  }, [progressManager]);

  /**
   * Process a completed alarm session
   */
  const processSessionCompletion = useCallback((
    user: UserProfile,
    session: AlarmSession,
    onUpdate?: (user: UserProfile) => void
  ): {
    totalXP: number;
    sessionBonus: number;
    achievements: Achievement[];
    leveledUp: boolean;
    streakInfo: { maintained: boolean; broken: boolean };
  } => {
    // Calculate session bonus
    const sessionBonus = progressManager.calculateSessionBonus(session);
    const totalXP = session.xpEarned + sessionBonus;

    // Add bonus XP
    if (sessionBonus > 0) {
      progressManager.addXP(user, sessionBonus);
    }

    // Update streak
    const streakInfo = streakManager.updateStreak(user, session.dismissedAt || new Date());
    session.streakMaintained = streakInfo.maintained;

    // Check achievements
    const achievements = progressManager.checkAchievements(user, session);
    session.achievementsUnlocked = achievements.map(a => a.id);

    // Check for level up (might have happened from achievement XP)
    const leveledUp = user.level > (user.level - 1);

    if (onUpdate) {
      onUpdate(user);
    }

    return {
      totalXP,
      sessionBonus,
      achievements,
      leveledUp,
      streakInfo,
    };
  }, [progressManager, streakManager]);

  /**
   * Get progress summary
   */
  const getProgressSummary = useCallback((user: UserProfile) => {
    return progressManager.getProgressSummary(user);
  }, [progressManager]);

  /**
   * Get streak status
   */
  const getStreakStatus = useCallback((user: UserProfile) => {
    return streakManager.getStreakStatus(user);
  }, [streakManager]);

  /**
   * Get streak message
   */
  const getStreakMessage = useCallback((streak: number) => {
    return streakManager.getStreakMessage(streak);
  }, [streakManager]);

  /**
   * Get next achievements
   */
  const getNextAchievements = useCallback((user: UserProfile) => {
    return progressManager.getNextAchievements(user);
  }, [progressManager]);

  /**
   * Get celebration message
   */
  const getCelebrationMessage = useCallback((
    xpEarned: number,
    leveledUp: boolean,
    achievements: Achievement[]
  ) => {
    return progressManager.getCelebrationMessage(xpEarned, leveledUp, achievements);
  }, [progressManager]);

  /**
   * Check if streak is at risk
   */
  const isStreakAtRisk = useCallback((user: UserProfile) => {
    return streakManager.isStreakAtRisk(user);
  }, [streakManager]);

  /**
   * Has completed today
   */
  const hasCompletedToday = useCallback((user: UserProfile) => {
    return streakManager.hasCompletedToday(user);
  }, [streakManager]);

  return {
    processQuestionCompletion,
    processSessionCompletion,
    getProgressSummary,
    getStreakStatus,
    getStreakMessage,
    getNextAchievements,
    getCelebrationMessage,
    isStreakAtRisk,
    hasCompletedToday,
    progressManager,
    streakManager,
  };
}

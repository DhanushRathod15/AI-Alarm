import {
  UserProfile,
  QuestionAttempt,
  Achievement,
  AlarmSession,
} from '../../data/models/types';
import { XP_CONFIG, ACHIEVEMENTS, getLevelFromXP, getXPForLevel } from '../../constants/config';

/**
 * PROGRESS MANAGER
 * 
 * Handles XP, levels, achievements, and rewards
 */
export class ProgressManager {
  /**
   * Calculate XP earned from a question attempt
   */
  calculateXP(attempt: QuestionAttempt, currentStreak: number): number {
    let xp = XP_CONFIG.baseXP;

    // Difficulty multiplier
    const diffMultiplier = XP_CONFIG.difficultyMultiplier[attempt.question.difficulty];
    xp *= diffMultiplier;

    // Speed bonus
    const timeRatio = attempt.timeSpent / attempt.question.expectedSolveTime;
    if (timeRatio < XP_CONFIG.speedBonusThreshold) {
      xp += XP_CONFIG.speedBonus;
    }

    // Streak multiplier (capped at 30 days)
    const effectiveStreak = Math.min(currentStreak, 30);
    xp *= Math.pow(XP_CONFIG.streakMultiplier, effectiveStreak);

    // First attempt bonus
    if (attempt.isCorrect && attempt.attempts === 1) {
      xp += XP_CONFIG.firstAttemptBonus;
    }

    return Math.floor(xp);
  }

  /**
   * Calculate bonus XP for perfect session (all questions correct)
   */
  calculateSessionBonus(session: AlarmSession): number {
    if (session.accuracy === 100) {
      return XP_CONFIG.perfectSessionBonus;
    }
    return 0;
  }

  /**
   * Add XP to user and update level
   */
  addXP(user: UserProfile, xp: number): { leveledUp: boolean; newLevel: number } {
    const oldLevel = user.level;
    
    user.totalXP += xp;
    
    const { level, xpToNext } = getLevelFromXP(user.totalXP);
    user.level = level;
    user.xpToNextLevel = xpToNext;

    const leveledUp = level > oldLevel;

    return { leveledUp, newLevel: level };
  }

  /**
   * Check and unlock achievements
   */
  checkAchievements(user: UserProfile, session: AlarmSession): Achievement[] {
    const unlocked: Achievement[] = [];

    for (const achievement of ACHIEVEMENTS) {
      // Skip if already unlocked
      if (user.achievements.some(a => a.id === achievement.id)) {
        continue;
      }

      // Check achievement criteria
      if (this.isAchievementEarned(achievement, user, session)) {
        const unlockedAchievement = {
          ...achievement,
          unlockedAt: new Date(),
        };
        
        user.achievements.push(unlockedAchievement);
        unlocked.push(unlockedAchievement);
        
        // Award XP
        user.totalXP += achievement.xp;
      }
    }

    return unlocked;
  }

  /**
   * Check if a specific achievement is earned
   */
  private isAchievementEarned(
    achievement: Achievement,
    user: UserProfile,
    session: AlarmSession
  ): boolean {
    switch (achievement.id) {
      case 'first_alarm':
        return user.questionsAnswered >= 1;

      case 'streak_3':
        return user.currentStreak >= 3;

      case 'streak_7':
        return user.currentStreak >= 7;

      case 'streak_14':
        return user.currentStreak >= 14;

      case 'streak_30':
        return user.currentStreak >= 30;

      case 'streak_100':
        return user.currentStreak >= 100;

      case 'perfect_week':
        return this.checkPerfectWeek(user);

      case 'speed_demon':
        return this.countSpeedySolves(user) >= 10;

      case 'hard_mode':
        return user.difficultyPerformance.hard?.totalAttempts >= 50;

      case 'first_try':
        return this.countFirstTryCorrect(user) >= 50;

      case 'knowledge_seeker':
        return user.questionsAnswered >= 1000;

      case 'level_10':
        return user.level >= 10;

      case 'level_25':
        return user.level >= 25;

      case 'level_50':
        return user.level >= 50;

      default:
        return false;
    }
  }

  /**
   * Check if user has maintained 100% accuracy for 7 days
   */
  private checkPerfectWeek(user: UserProfile): boolean {
    // Simplified check - in production, track daily accuracy
    return user.currentStreak >= 7 && user.overallAccuracy === 100;
  }

  /**
   * Count number of questions solved under expected time
   */
  private countSpeedySolves(user: UserProfile): number {
    // Simplified - in production, track this explicitly
    return user.questionsAnswered > 0 && user.averageSolveTime < 60 
      ? Math.floor(user.questionsAnswered * 0.3) 
      : 0;
  }

  /**
   * Count first-attempt correct answers
   */
  private countFirstTryCorrect(user: UserProfile): number {
    // Simplified - in production, track this explicitly
    return Math.floor(user.correctAnswers * 0.7); // Estimate
  }

  /**
   * Get progress summary
   */
  getProgressSummary(user: UserProfile) {
    const currentLevelXP = user.totalXP - this.getTotalXPForLevel(user.level - 1);
    const levelRequirement = getXPForLevel(user.level);
    const progressPercent = (currentLevelXP / levelRequirement) * 100;

    return {
      level: user.level,
      totalXP: user.totalXP,
      xpToNextLevel: user.xpToNextLevel,
      progressPercent: Math.round(progressPercent),
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      achievementsUnlocked: user.achievements.length,
      totalAchievements: ACHIEVEMENTS.length,
    };
  }

  /**
   * Calculate total XP required to reach a level
   */
  private getTotalXPForLevel(level: number): number {
    let total = 0;
    for (let i = 1; i < level; i++) {
      total += getXPForLevel(i);
    }
    return total;
  }

  /**
   * Get next achievement progress
   */
  getNextAchievements(user: UserProfile): Array<{
    achievement: Achievement;
    progress: number;
    target: number;
  }> {
    const upcoming = ACHIEVEMENTS
      .filter(a => !user.achievements.some(ua => ua.id === a.id))
      .slice(0, 3);

    return upcoming.map(achievement => ({
      achievement,
      progress: this.getAchievementProgress(achievement, user),
      target: this.getAchievementTarget(achievement),
    }));
  }

  /**
   * Get achievement progress
   */
  private getAchievementProgress(achievement: Achievement, user: UserProfile): number {
    switch (achievement.id) {
      case 'streak_3':
      case 'streak_7':
      case 'streak_14':
      case 'streak_30':
      case 'streak_100':
        return user.currentStreak;

      case 'hard_mode':
        return user.difficultyPerformance.hard?.totalAttempts || 0;

      case 'knowledge_seeker':
        return user.questionsAnswered;

      case 'level_10':
      case 'level_25':
      case 'level_50':
        return user.level;

      default:
        return 0;
    }
  }

  /**
   * Get achievement target
   */
  private getAchievementTarget(achievement: Achievement): number {
    const match = achievement.id.match(/\d+/);
    return match ? parseInt(match[0]) : 1;
  }

  /**
   * Generate celebration message
   */
  getCelebrationMessage(xpEarned: number, leveledUp: boolean, achievements: Achievement[]): string {
    if (leveledUp) {
      return '🎉 Level Up! You\'re getting stronger!';
    }

    if (achievements.length > 0) {
      return `🏆 Achievement Unlocked: ${achievements[0].name}!`;
    }

    if (xpEarned > 50) {
      return '⚡ Amazing! Big XP boost!';
    }

    if (xpEarned > 30) {
      return '💪 Great job! Keep it up!';
    }

    return '✨ Well done!';
  }
}

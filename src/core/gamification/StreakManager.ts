import { UserProfile } from '../../data/models/types';

/**
 * STREAK MANAGER
 * 
 * Manages user streaks and streak-related logic
 */
export class StreakManager {
  /**
   * Update streak after completing an alarm
   */
  updateStreak(user: UserProfile, completedAt: Date): { maintained: boolean; broken: boolean } {
    const lastAlarmDate = user.lastAlarmDate ? new Date(user.lastAlarmDate) : null;
    const today = this.stripTime(new Date(completedAt));

    if (!lastAlarmDate) {
      // First alarm ever
      user.currentStreak = 1;
      user.lastAlarmDate = today;
      return { maintained: true, broken: false };
    }

    const lastAlarm = this.stripTime(lastAlarmDate);
    const daysDiff = this.getDaysDifference(lastAlarm, today);

    if (daysDiff === 0) {
      // Same day - streak unchanged
      return { maintained: true, broken: false };
    } else if (daysDiff === 1) {
      // Consecutive day - streak continues
      user.currentStreak++;
      user.lastAlarmDate = today;
      
      // Update longest streak
      if (user.currentStreak > user.longestStreak) {
        user.longestStreak = user.currentStreak;
      }
      
      return { maintained: true, broken: false };
    } else {
      // Streak broken
      user.currentStreak = 1;
      user.lastAlarmDate = today;
      return { maintained: false, broken: true };
    }
  }

  /**
   * Check if streak is at risk (no alarm today yet)
   */
  isStreakAtRisk(user: UserProfile): boolean {
    if (!user.lastAlarmDate) return false;

    const lastAlarm = this.stripTime(new Date(user.lastAlarmDate));
    const today = this.stripTime(new Date());
    const daysDiff = this.getDaysDifference(lastAlarm, today);

    // At risk if last alarm was yesterday or earlier
    return daysDiff >= 1;
  }

  /**
   * Get streak status
   */
  getStreakStatus(user: UserProfile): {
    current: number;
    longest: number;
    atRisk: boolean;
    daysUntilBreak: number;
  } {
    const atRisk = this.isStreakAtRisk(user);
    
    let daysUntilBreak = 0;
    if (user.lastAlarmDate) {
      const lastAlarm = this.stripTime(new Date(user.lastAlarmDate));
      const today = this.stripTime(new Date());
      const daysDiff = this.getDaysDifference(lastAlarm, today);
      daysUntilBreak = Math.max(0, 1 - daysDiff);
    }

    return {
      current: user.currentStreak,
      longest: user.longestStreak,
      atRisk,
      daysUntilBreak,
    };
  }

  /**
   * Get streak display message
   */
  getStreakMessage(streak: number): string {
    if (streak === 0) return 'Start your streak!';
    if (streak === 1) return '🔥 1 day streak';
    if (streak < 7) return `🔥 ${streak} days - Keep going!`;
    if (streak < 30) return `🔥🔥 ${streak} days - You\'re on fire!`;
    if (streak < 100) return `🔥🔥🔥 ${streak} days - Unstoppable!`;
    return `🏆 ${streak} days - LEGENDARY!`;
  }

  /**
   * Get streak emoji based on length
   */
  getStreakEmoji(streak: number): string {
    if (streak === 0) return '⭐';
    if (streak < 7) return '🔥';
    if (streak < 30) return '🔥🔥';
    if (streak < 100) return '🔥🔥🔥';
    return '🏆';
  }

  /**
   * Calculate streak percentage to next milestone
   */
  getStreakProgress(streak: number): { milestone: number; progress: number } {
    const milestones = [3, 7, 14, 30, 50, 100];
    
    for (const milestone of milestones) {
      if (streak < milestone) {
        const previousMilestone = milestones[milestones.indexOf(milestone) - 1] || 0;
        const range = milestone - previousMilestone;
        const progress = ((streak - previousMilestone) / range) * 100;
        
        return { milestone, progress: Math.round(progress) };
      }
    }

    return { milestone: 100, progress: 100 };
  }

  /**
   * Strip time from date (get date only)
   */
  private stripTime(date: Date): Date {
    const stripped = new Date(date);
    stripped.setHours(0, 0, 0, 0);
    return stripped;
  }

  /**
   * Get difference in days between two dates
   */
  private getDaysDifference(date1: Date, date2: Date): number {
    const diffTime = date2.getTime() - date1.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Check if user completed alarm today
   */
  hasCompletedToday(user: UserProfile): boolean {
    if (!user.lastAlarmDate) return false;

    const lastAlarm = this.stripTime(new Date(user.lastAlarmDate));
    const today = this.stripTime(new Date());

    return lastAlarm.getTime() === today.getTime();
  }

  /**
   * Get recovery bonus (for coming back after break)
   */
  getRecoveryBonus(daysSinceLastAlarm: number): number {
    if (daysSinceLastAlarm <= 1) return 0;
    if (daysSinceLastAlarm <= 7) return 5;
    if (daysSinceLastAlarm <= 30) return 10;
    return 20;
  }
}

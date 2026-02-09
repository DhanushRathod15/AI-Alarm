import {
  UserProfile,
  Question,
  QuestionAttempt,
  SubjectStats,
  DifficultyStats,
  Trend,
} from '../../data/models/types';

/**
 * PERFORMANCE TRACKER
 * 
 * Tracks and updates user performance metrics after each question
 */
export class PerformanceTracker {
  /**
   * Update user profile after a question attempt
   */
  updatePerformance(
    user: UserProfile,
    question: Question,
    attempt: QuestionAttempt
  ): UserProfile {
    const updated = { ...user };

    // Update subject performance
    this.updateSubjectStats(updated, question, attempt);

    // Update difficulty performance
    this.updateDifficultyStats(updated, question.difficulty, attempt);

    // Update topic mastery
    this.updateTopicMastery(updated, question.topic, attempt);

    // Update overall stats
    this.updateOverallStats(updated, attempt);

    // Update frustration level
    this.updateFrustrationLevel(updated, attempt);

    // Update weak/strong areas
    this.updateWeakStrongAreas(updated);

    // Update best performance time
    this.updateBestPerformanceTime(updated);

    return updated;
  }

  /**
   * Update subject-specific statistics
   */
  private updateSubjectStats(
    user: UserProfile,
    question: Question,
    attempt: QuestionAttempt
  ): void {
    const subject = question.subject;
    
    if (!user.subjectPerformance[subject]) {
      user.subjectPerformance[subject] = {
        subject,
        totalAttempts: 0,
        correctAnswers: 0,
        accuracy: 0,
        averageSolveTime: 0,
        lastPracticed: new Date(),
        proficiencyLevel: 0,
        trend: 'stable',
        recentQuestions: [],
      };
    }

    const stats = user.subjectPerformance[subject];
    
    // Update counts
    stats.totalAttempts++;
    if (attempt.isCorrect) {
      stats.correctAnswers++;
    }

    // Update accuracy
    stats.accuracy = (stats.correctAnswers / stats.totalAttempts) * 100;

    // Update average solve time
    stats.averageSolveTime = 
      (stats.averageSolveTime * (stats.totalAttempts - 1) + attempt.timeSpent) / 
      stats.totalAttempts;

    // Update last practiced
    stats.lastPracticed = new Date();

    // Update proficiency level (0-100)
    stats.proficiencyLevel = this.calculateProficiency(stats);

    // Update trend
    stats.trend = this.calculateTrend(stats);

    // Track recent questions (keep last 10)
    stats.recentQuestions.push(question.id);
    if (stats.recentQuestions.length > 10) {
      stats.recentQuestions.shift();
    }
  }

  /**
   * Update difficulty-specific statistics
   */
  private updateDifficultyStats(
    user: UserProfile,
    difficulty: string,
    attempt: QuestionAttempt
  ): void {
    const stats = user.difficultyPerformance[difficulty as keyof typeof user.difficultyPerformance];
    
    if (!stats) return;

    stats.totalAttempts++;
    if (attempt.isCorrect) {
      stats.correctAnswers++;
    }

    stats.accuracy = (stats.correctAnswers / stats.totalAttempts) * 100;
    
    stats.averageSolveTime = 
      (stats.averageSolveTime * (stats.totalAttempts - 1) + attempt.timeSpent) / 
      stats.totalAttempts;

    stats.successRate = stats.accuracy;
  }

  /**
   * Update topic mastery (0-100 scale)
   */
  private updateTopicMastery(
    user: UserProfile,
    topic: string,
    attempt: QuestionAttempt
  ): void {
    const currentMastery = user.topicMastery[topic] || 0;
    
    // Correct answer: +5 points (max 100)
    // Wrong answer: -2 points (min 0)
    const delta = attempt.isCorrect ? 5 : -2;
    
    // Bonus for first-attempt correct
    const bonus = attempt.isCorrect && attempt.attempts === 1 ? 2 : 0;
    
    user.topicMastery[topic] = Math.max(
      0,
      Math.min(100, currentMastery + delta + bonus)
    );
  }

  /**
   * Update overall user statistics
   */
  private updateOverallStats(
    user: UserProfile,
    attempt: QuestionAttempt
  ): void {
    user.questionsAnswered++;
    
    if (attempt.isCorrect) {
      user.correctAnswers++;
    }

    user.overallAccuracy = (user.correctAnswers / user.questionsAnswered) * 100;

    user.averageSolveTime = 
      (user.averageSolveTime * (user.questionsAnswered - 1) + attempt.timeSpent) / 
      user.questionsAnswered;

    user.averageRetryCount = 
      (user.averageRetryCount * (user.questionsAnswered - 1) + attempt.attempts) / 
      user.questionsAnswered;
  }

  /**
   * Update frustration level (0-10 scale)
   */
  private updateFrustrationLevel(
    user: UserProfile,
    attempt: QuestionAttempt
  ): void {
    if (!attempt.isCorrect) {
      // Increase frustration
      user.frustrationLevel = Math.min(10, user.frustrationLevel + 1);
      
      // Extra frustration for multiple attempts
      if (attempt.attempts > 2) {
        user.frustrationLevel = Math.min(10, user.frustrationLevel + 0.5);
      }
    } else {
      // Decrease frustration
      if (attempt.attempts === 1) {
        // Big decrease for first-attempt correct
        user.frustrationLevel = Math.max(0, user.frustrationLevel - 2);
      } else {
        // Small decrease
        user.frustrationLevel = Math.max(0, user.frustrationLevel - 0.5);
      }
    }
  }

  /**
   * Identify weak and strong areas
   */
  private updateWeakStrongAreas(user: UserProfile): void {
    const subjects = Object.values(user.subjectPerformance);
    
    // Filter subjects with sufficient data
    const relevantSubjects = subjects.filter(s => s.totalAttempts >= 5);
    
    if (relevantSubjects.length === 0) {
      user.weakAreas = [];
      user.strongAreas = [];
      return;
    }

    // Sort by accuracy
    const sorted = [...relevantSubjects].sort((a, b) => a.accuracy - b.accuracy);

    // Weak areas: bottom 30%, accuracy < 60%
    user.weakAreas = sorted
      .filter(s => s.accuracy < 60)
      .slice(0, Math.ceil(sorted.length * 0.3))
      .map(s => s.subject);

    // Strong areas: top 30%, accuracy > 80%
    user.strongAreas = sorted
      .filter(s => s.accuracy > 80)
      .slice(-Math.ceil(sorted.length * 0.3))
      .map(s => s.subject);
  }

  /**
   * Update best performance time of day
   */
  private updateBestPerformanceTime(user: UserProfile): void {
    const now = new Date();
    const hour = now.getHours();
    
    let timeOfDay: string;
    if (hour >= 5 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
    else timeOfDay = 'night';

    // Simple heuristic: if recent accuracy is high, update best time
    if (user.overallAccuracy > 70) {
      user.bestPerformanceTimeOfDay = timeOfDay;
    }
  }

  /**
   * Calculate proficiency level (0-100)
   */
  private calculateProficiency(stats: SubjectStats): number {
    // Factors:
    // - Accuracy (60%)
    // - Consistency (20%) - based on recent performance
    // - Speed (20%) - compared to expected time

    const accuracyScore = stats.accuracy * 0.6;
    
    // Consistency: less variation = higher score
    const consistencyScore = Math.min(20, stats.totalAttempts * 2);
    
    // Speed: faster = higher score (assuming correct answers)
    const speedScore = 20; // Simplified for now

    return Math.min(100, accuracyScore + consistencyScore + speedScore);
  }

  /**
   * Calculate performance trend
   */
  private calculateTrend(stats: SubjectStats): Trend {
    // Simplified trend calculation
    // In production, this would analyze recent performance history
    
    if (stats.totalAttempts < 5) {
      return 'stable';
    }

    if (stats.accuracy > 75) {
      return 'improving';
    } else if (stats.accuracy < 50) {
      return 'declining';
    }

    return 'stable';
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(user: UserProfile) {
    return {
      overallAccuracy: user.overallAccuracy.toFixed(1),
      questionsAnswered: user.questionsAnswered,
      currentStreak: user.currentStreak,
      level: user.level,
      totalXP: user.totalXP,
      weakAreas: user.weakAreas,
      strongAreas: user.strongAreas,
      subjectCount: Object.keys(user.subjectPerformance).length,
      topicsMastered: Object.values(user.topicMastery).filter(m => m > 80).length,
    };
  }
}

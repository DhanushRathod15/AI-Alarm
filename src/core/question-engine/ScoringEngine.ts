import { 
  Question, 
  UserProfile, 
  ScoredQuestion,
  SubjectStats,
} from '../../data/models/types';
import { SCORING_WEIGHTS, DIFFICULTY_ORDER, getTimeOfDay } from '../../constants/config';

/**
 * SCORING ENGINE - Phase 2 of AI Selection Pipeline
 * 
 * Applies SOFT preferences and calculates scores
 */
export class ScoringEngine {
  /**
   * Score all questions based on user profile and preferences
   */
  scoreQuestions(questions: Question[], userProfile: UserProfile): ScoredQuestion[] {
    return questions.map(question => {
      const score = this.calculateScore(question, userProfile);
      const breakdown = this.getScoreBreakdown(question, userProfile);

      return {
        question,
        score,
        rank: 0,  // Will be assigned by RankingEngine
        breakdown,
      };
    });
  }

  /**
   * Calculate total score for a question
   */
  private calculateScore(question: Question, user: UserProfile): number {
    let score = 0;

    // 1. Weak Area Boost
    score += this.calculateWeakAreaScore(question, user);

    // 2. Unseen Concept Bonus
    score += this.calculateUnseenBonus(question, user);

    // 3. Variety Bonus
    score += this.calculateVarietyScore(question, user);

    // 4. Ability Level Match
    score += this.calculateAbilityScore(question, user);

    // 5. Frustration Guard
    score += this.calculateFrustrationScore(question, user);

    // 6. Time of Day Match
    score += this.calculateTimeScore(question, user);

    return score;
  }

  /**
   * Get detailed breakdown of score components
   */
  private getScoreBreakdown(question: Question, user: UserProfile) {
    return {
      weakAreaScore: this.calculateWeakAreaScore(question, user),
      unseenBonus: this.calculateUnseenBonus(question, user),
      varietyScore: this.calculateVarietyScore(question, user),
      abilityScore: this.calculateAbilityScore(question, user),
      frustrationScore: this.calculateFrustrationScore(question, user),
      timeScore: this.calculateTimeScore(question, user),
    };
  }

  /**
   * 1. WEAK AREA BOOST
   * Prioritize subjects/topics where user has low accuracy
   */
  private calculateWeakAreaScore(question: Question, user: UserProfile): number {
    const subjectStats = user.subjectPerformance[question.subject];
    
    if (!subjectStats || subjectStats.totalAttempts < 5) {
      // Not enough data, give moderate score
      return SCORING_WEIGHTS.weakAreaBoost * 0.5;
    }

    // Lower accuracy = higher score
    const accuracyFactor = 1 - (subjectStats.accuracy / 100);
    
    // Boost if accuracy is below 60%
    const boostMultiplier = subjectStats.accuracy < 60 ? 1.5 : 1.0;

    return SCORING_WEIGHTS.weakAreaBoost * accuracyFactor * boostMultiplier;
  }

  /**
   * 2. UNSEEN CONCEPT BONUS
   * Bonus for topics the user hasn't encountered
   */
  private calculateUnseenBonus(question: Question, user: UserProfile): number {
    const topicMastery = user.topicMastery[question.topic];

    if (topicMastery === undefined || topicMastery === 0) {
      // Never seen this topic
      return SCORING_WEIGHTS.unseenConceptBonus;
    }

    // Slightly bonus for low mastery
    if (topicMastery < 30) {
      return SCORING_WEIGHTS.unseenConceptBonus * 0.5;
    }

    return 0;
  }

  /**
   * 3. VARIETY BONUS
   * Prefer subjects not practiced recently
   */
  private calculateVarietyScore(question: Question, user: UserProfile): number {
    const subjectStats = user.subjectPerformance[question.subject];

    if (!subjectStats || !subjectStats.lastPracticed) {
      return SCORING_WEIGHTS.varietyBonus;
    }

    const daysSincePractice = this.getDaysSince(subjectStats.lastPracticed);

    if (daysSincePractice > 7) {
      return SCORING_WEIGHTS.varietyBonus;
    } else if (daysSincePractice > 3) {
      return SCORING_WEIGHTS.varietyBonus * 0.6;
    } else if (daysSincePractice > 1) {
      return SCORING_WEIGHTS.varietyBonus * 0.3;
    }

    return 0;
  }

  /**
   * 4. ABILITY LEVEL MATCH
   * Prefer questions near user's current ability level
   */
  private calculateAbilityScore(question: Question, user: UserProfile): number {
    const userDifficultyIndex = DIFFICULTY_ORDER.indexOf(user.preferredDifficulty as any);
    const questionDifficultyIndex = DIFFICULTY_ORDER.indexOf(question.difficulty as any);

    const difference = Math.abs(userDifficultyIndex - questionDifficultyIndex);

    // Perfect match
    if (difference === 0) {
      return SCORING_WEIGHTS.abilityLevelMatch;
    }

    // One level off
    if (difference === 1) {
      return SCORING_WEIGHTS.abilityLevelMatch * 0.7;
    }

    // Two levels off
    return SCORING_WEIGHTS.abilityLevelMatch * 0.3;
  }

  /**
   * 5. FRUSTRATION GUARD
   * Adjust difficulty based on frustration level
   */
  private calculateFrustrationScore(question: Question, user: UserProfile): number {
    // High frustration (>7): prefer easier questions
    if (user.frustrationLevel > 7) {
      if (question.difficulty === 'easy') {
        return SCORING_WEIGHTS.frustrationGuard;
      }
      if (question.difficulty === 'medium') {
        return SCORING_WEIGHTS.frustrationGuard * 0.5;
      }
      return 0;
    }

    // Low frustration (<3): can challenge with harder questions
    if (user.frustrationLevel < 3) {
      if (question.difficulty === 'hard') {
        return SCORING_WEIGHTS.frustrationGuard * 0.5;
      }
    }

    // Normal frustration: no adjustment
    return SCORING_WEIGHTS.frustrationGuard * 0.3;
  }

  /**
   * 6. TIME OF DAY MATCH
   * Some subjects might be better at certain times
   */
  private calculateTimeScore(question: Question, user: UserProfile): number {
    const currentTime = new Date();
    const currentTimeOfDay = getTimeOfDay(
      `${currentTime.getHours()}:${currentTime.getMinutes()}`
    );

    // If user performs best at current time of day, give bonus
    if (currentTimeOfDay === user.bestPerformanceTimeOfDay) {
      return SCORING_WEIGHTS.timeOfDayMatch;
    }

    // Moderate bonus for adjacent times
    return SCORING_WEIGHTS.timeOfDayMatch * 0.5;
  }

  /**
   * Helper: Calculate days since a date
   */
  private getDaysSince(date: Date | string): number {
    const past = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - past.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Apply focus mode adjustments
   */
  applyFocusMode(
    scoredQuestions: ScoredQuestion[],
    focusMode: string
  ): ScoredQuestion[] {
    switch (focusMode) {
      case 'weakness':
        // Amplify weak area scores
        return scoredQuestions.map(sq => ({
          ...sq,
          score: sq.score + (sq.breakdown?.weakAreaScore || 0) * 0.5,
        }));

      case 'progressive':
        // Favor easier questions slightly
        return scoredQuestions.map(sq => {
          const diffIndex = DIFFICULTY_ORDER.indexOf(sq.question.difficulty as any);
          const progressiveBonus = (2 - diffIndex) * 10;
          return {
            ...sq,
            score: sq.score + progressiveBonus,
          };
        });

      case 'random':
        // Add randomness
        return scoredQuestions.map(sq => ({
          ...sq,
          score: sq.score + Math.random() * 30,
        }));

      case 'balanced':
      default:
        // No adjustment
        return scoredQuestions;
    }
  }
}

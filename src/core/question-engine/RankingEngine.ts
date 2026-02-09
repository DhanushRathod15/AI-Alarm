import { ScoredQuestion } from '../../data/models/types';

/**
 * RANKING ENGINE - Phase 3 of AI Selection Pipeline
 * 
 * Orders questions by their calculated scores
 */
export class RankingEngine {
  /**
   * Rank questions by score (descending)
   */
  rankQuestions(scoredQuestions: ScoredQuestion[]): ScoredQuestion[] {
    // Sort by score (highest first)
    const sorted = [...scoredQuestions].sort((a, b) => b.score - a.score);

    // Assign ranks
    sorted.forEach((question, index) => {
      question.rank = index + 1;
    });

    return sorted;
  }

  /**
   * Get top N questions
   */
  getTopN(rankedQuestions: ScoredQuestion[], n: number): ScoredQuestion[] {
    return rankedQuestions.slice(0, n);
  }

  /**
   * Get questions above a certain score threshold
   */
  getAboveThreshold(
    rankedQuestions: ScoredQuestion[],
    threshold: number
  ): ScoredQuestion[] {
    return rankedQuestions.filter(q => q.score >= threshold);
  }

  /**
   * Get ranking statistics
   */
  getRankingStats(rankedQuestions: ScoredQuestion[]) {
    if (rankedQuestions.length === 0) {
      return {
        min: 0,
        max: 0,
        avg: 0,
        median: 0,
        count: 0,
      };
    }

    const scores = rankedQuestions.map(q => q.score);
    const sorted = [...scores].sort((a, b) => a - b);

    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: scores.reduce((sum, s) => sum + s, 0) / scores.length,
      median: sorted[Math.floor(sorted.length / 2)],
      count: rankedQuestions.length,
    };
  }

  /**
   * Group questions by difficulty while maintaining ranks
   */
  groupByDifficulty(rankedQuestions: ScoredQuestion[]) {
    return {
      easy: rankedQuestions.filter(q => q.question.difficulty === 'easy'),
      medium: rankedQuestions.filter(q => q.question.difficulty === 'medium'),
      hard: rankedQuestions.filter(q => q.question.difficulty === 'hard'),
    };
  }

  /**
   * Group questions by subject while maintaining ranks
   */
  groupBySubject(rankedQuestions: ScoredQuestion[]): Record<string, ScoredQuestion[]> {
    const grouped: Record<string, ScoredQuestion[]> = {};

    rankedQuestions.forEach(q => {
      const subject = q.question.subject;
      if (!grouped[subject]) {
        grouped[subject] = [];
      }
      grouped[subject].push(q);
    });

    return grouped;
  }
}

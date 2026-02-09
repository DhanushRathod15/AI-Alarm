import { Question, SelectionCriteria } from '../../data/models/types';
import { DIFFICULTY_ORDER } from '../../constants/config';

/**
 * FILTER ENGINE - Phase 1 of AI Selection Pipeline
 * 
 * Applies HARD constraints that must be satisfied
 */
export class FilterEngine {
  /**
   * Filter questions based on hard constraints
   */
  filter(questions: Question[], criteria: SelectionCriteria): Question[] {
    let filtered = [...questions];

    // 1. Filter by exam (MUST match)
    filtered = this.filterByExam(filtered, criteria.exam);

    // 2. Filter by subjects (if specified)
    if (criteria.subjects && criteria.subjects.length > 0) {
      filtered = this.filterBySubjects(filtered, criteria.subjects);
    }

    // 3. Filter by topics (if specified)
    if (criteria.topics && criteria.topics.length > 0) {
      filtered = this.filterByTopics(filtered, criteria.topics);
    }

    // 4. Filter by difficulty range
    filtered = this.filterByDifficultyRange(
      filtered,
      criteria.difficultyMin,
      criteria.difficultyMax
    );

    // 5. Filter by time constraint
    filtered = this.filterByTime(filtered, criteria.maxSolveTime);

    // 6. Exclude recently asked questions
    if (criteria.excludeRecent > 0) {
      filtered = this.filterRecentQuestions(filtered, criteria.excludeRecent);
    }

    // 7. Exclude specific question IDs (from current session)
    if (criteria.excludeIds.length > 0) {
      filtered = this.filterExcludedIds(filtered, criteria.excludeIds);
    }

    return filtered;
  }

  private filterByExam(questions: Question[], exam: string): Question[] {
    return questions.filter(q => q.exam === exam);
  }

  private filterBySubjects(questions: Question[], subjects: string[]): Question[] {
    return questions.filter(q => subjects.includes(q.subject));
  }

  private filterByTopics(questions: Question[], topics: string[]): Question[] {
    return questions.filter(q => topics.includes(q.topic));
  }

  private filterByDifficultyRange(
    questions: Question[],
    min: string,
    max: string
  ): Question[] {
    const minIndex = DIFFICULTY_ORDER.indexOf(min as any);
    const maxIndex = DIFFICULTY_ORDER.indexOf(max as any);

    return questions.filter(q => {
      const qIndex = DIFFICULTY_ORDER.indexOf(q.difficulty as any);
      return qIndex >= minIndex && qIndex <= maxIndex;
    });
  }

  private filterByTime(questions: Question[], maxTime: number): Question[] {
    return questions.filter(q => q.expectedSolveTime <= maxTime);
  }

  private filterRecentQuestions(questions: Question[], excludeDays: number): Question[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - excludeDays);

    return questions.filter(q => {
      if (!q.lastAttempted) return true;
      return new Date(q.lastAttempted) < cutoffDate;
    });
  }

  private filterExcludedIds(questions: Question[], excludeIds: string[]): Question[] {
    const excludeSet = new Set(excludeIds);
    return questions.filter(q => !excludeSet.has(q.id));
  }

  /**
   * Check if any questions pass filters
   */
  hasValidQuestions(questions: Question[], criteria: SelectionCriteria): boolean {
    return this.filter(questions, criteria).length > 0;
  }

  /**
   * Get filter statistics
   */
  getFilterStats(
    questions: Question[],
    criteria: SelectionCriteria
  ): Record<string, number> {
    const initial = questions.length;
    const afterExam = this.filterByExam(questions, criteria.exam).length;
    const afterSubjects = criteria.subjects && criteria.subjects.length > 0
      ? this.filterBySubjects(questions, criteria.subjects).length
      : afterExam;
    const afterDifficulty = this.filterByDifficultyRange(
      questions,
      criteria.difficultyMin,
      criteria.difficultyMax
    ).length;
    const final = this.filter(questions, criteria).length;

    return {
      initial,
      afterExam,
      afterSubjects,
      afterDifficulty,
      final,
    };
  }
}

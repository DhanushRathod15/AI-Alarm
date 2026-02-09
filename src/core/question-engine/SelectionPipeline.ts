import { 
  Question, 
  UserProfile, 
  SelectionCriteria, 
  ScoredQuestion,
  Difficulty,
} from '../../data/models/types';
import { FilterEngine } from './FilterEngine';
import { ScoringEngine } from './ScoringEngine';
import { RankingEngine } from './RankingEngine';

/**
 * AI Question Selection Pipeline
 * 
 * FILTER → SCORE → RANK → PICK
 * 
 * This is the core intelligence of the app that selects
 * the optimal question for each user at each alarm.
 */
export class SelectionPipeline {
  private filterEngine: FilterEngine;
  private scoringEngine: ScoringEngine;
  private rankingEngine: RankingEngine;

  constructor() {
    this.filterEngine = new FilterEngine();
    this.scoringEngine = new ScoringEngine();
    this.rankingEngine = new RankingEngine();
  }

  /**
   * Main selection method - orchestrates the entire pipeline
   */
  async selectQuestion(
    questionBank: Question[],
    criteria: SelectionCriteria
  ): Promise<Question> {
    // PHASE 1: FILTER - Apply hard constraints
    const filtered = this.filterEngine.filter(questionBank, criteria);

    if (filtered.length === 0) {
      throw new Error('No questions match the criteria. Please adjust your settings.');
    }

    // PHASE 2: SCORE - Apply soft preferences
    const scored = this.scoringEngine.scoreQuestions(filtered, criteria.userProfile);

    // PHASE 3: RANK - Order by score
    const ranked = this.rankingEngine.rankQuestions(scored);

    // PHASE 4: PICK - Weighted random from top candidates
    const selected = this.pickQuestion(ranked);

    return selected;
  }

  /**
   * PHASE 4: PICK - Weighted random selection from top candidates
   * 
   * Uses exponential decay to favor higher-ranked questions
   * but still allows variety
   */
  private pickQuestion(
    rankedQuestions: ScoredQuestion[],
    topN: number = 5
  ): Question {
    // Take top N candidates
    const candidates = rankedQuestions.slice(0, Math.min(topN, rankedQuestions.length));

    if (candidates.length === 1) {
      return candidates[0].question;
    }

    // Calculate weights using exponential decay
    // First place gets highest weight, decays exponentially
    const weights = candidates.map((_, index) => 
      Math.exp(-index * 0.5)
    );

    // Weighted random selection
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < candidates.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return candidates[i].question;
      }
    }

    // Fallback (shouldn't reach here)
    return candidates[0].question;
  }

  /**
   * Quick selection without full AI pipeline (for testing/fallback)
   */
  quickSelect(
    questionBank: Question[],
    exam: string,
    difficulty: Difficulty
  ): Question {
    const filtered = questionBank.filter(
      q => q.exam === exam && q.difficulty === difficulty
    );

    if (filtered.length === 0) {
      // Fallback to any question of that exam
      const examQuestions = questionBank.filter(q => q.exam === exam);
      if (examQuestions.length === 0) {
        throw new Error(`No questions found for exam: ${exam}`);
      }
      return examQuestions[Math.floor(Math.random() * examQuestions.length)];
    }

    return filtered[Math.floor(Math.random() * filtered.length)];
  }

  /**
   * Select multiple questions for a session
   */
  async selectMultipleQuestions(
    questionBank: Question[],
    criteria: SelectionCriteria,
    count: number
  ): Promise<Question[]> {
    const selected: Question[] = [];
    const excludeIds = [...criteria.excludeIds];

    for (let i = 0; i < count; i++) {
      const question = await this.selectQuestion(questionBank, {
        ...criteria,
        excludeIds,
      });

      selected.push(question);
      excludeIds.push(question.id);
    }

    return selected;
  }

  /**
   * Get selection explanation (for debugging/analytics)
   */
  explainSelection(
    question: Question,
    userProfile: UserProfile
  ): string {
    const scored = this.scoringEngine.scoreQuestions([question], userProfile);
    
    if (scored.length === 0) return 'No scoring available';

    const breakdown = scored[0].breakdown;
    if (!breakdown) return 'No breakdown available';

    return `
Selection Breakdown:
- Weak Area Score: ${breakdown.weakAreaScore.toFixed(1)}
- Unseen Bonus: ${breakdown.unseenBonus.toFixed(1)}
- Variety Score: ${breakdown.varietyScore.toFixed(1)}
- Ability Match: ${breakdown.abilityScore.toFixed(1)}
- Frustration Adjustment: ${breakdown.frustrationScore.toFixed(1)}
- Time of Day Match: ${breakdown.timeScore.toFixed(1)}
Total Score: ${scored[0].score.toFixed(1)}
    `.trim();
  }
}

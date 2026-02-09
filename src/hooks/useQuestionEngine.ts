import { useState, useCallback, useEffect } from 'react';
import { Question, UserProfile, SelectionCriteria, QuestionAttempt } from '../data/models/types';
import { SelectionPipeline } from '../core/question-engine/SelectionPipeline';
import { PerformanceTracker } from '../core/question-engine/PerformanceTracker';
import { questionBank } from '../data/questions';

/**
 * Hook for question selection and tracking
 */
export function useQuestionEngine(userProfile: UserProfile | null) {
  const [pipeline] = useState(() => new SelectionPipeline());
  const [tracker] = useState(() => new PerformanceTracker());
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionHistory, setQuestionHistory] = useState<QuestionAttempt[]>([]);

  /**
   * Select a question based on criteria
   */
  const selectQuestion = useCallback(async (criteria: SelectionCriteria): Promise<Question> => {
    if (!userProfile) {
      throw new Error('User profile required for question selection');
    }

    const question = await pipeline.selectQuestion(questionBank, criteria);
    setCurrentQuestion(question);
    return question;
  }, [pipeline, userProfile]);

  /**
   * Validate an answer
   */
  const validateAnswer = useCallback((
    question: Question,
    selectedAnswer: number
  ): boolean => {
    return selectedAnswer === question.correctAnswer;
  }, []);

  /**
   * Record a question attempt
   */
  const recordAttempt = useCallback((
    question: Question,
    attempt: QuestionAttempt,
    onProfileUpdate?: (profile: UserProfile) => void
  ): void => {
    // Add to history
    setQuestionHistory(prev => [...prev, attempt]);

    // Update user profile if provided
    if (userProfile && onProfileUpdate) {
      const updated = tracker.updatePerformance(userProfile, question, attempt);
      onProfileUpdate(updated);
    }
  }, [tracker, userProfile]);

  /**
   * Start a question attempt
   */
  const startAttempt = useCallback((question: Question): QuestionAttempt => {
    return {
      questionId: question.id,
      question,
      startTime: new Date(),
      timeSpent: 0,
      isCorrect: false,
      attempts: 0,
      submittedAnswers: [],
      difficultyAtAttempt: question.difficulty,
      frustrationAtAttempt: userProfile?.frustrationLevel || 0,
      streakAtAttempt: userProfile?.currentStreak || 0,
      hintUsed: false,
      skipped: false,
    };
  }, [userProfile]);

  /**
   * Submit an answer for current attempt
   */
  const submitAnswer = useCallback((
    attempt: QuestionAttempt,
    selectedAnswer: number
  ): QuestionAttempt => {
    const isCorrect = validateAnswer(attempt.question, selectedAnswer);
    const now = new Date();

    const updated: QuestionAttempt = {
      ...attempt,
      selectedAnswer,
      isCorrect,
      attempts: attempt.attempts + 1,
      submittedAnswers: [...attempt.submittedAnswers, selectedAnswer],
      endTime: now,
      timeSpent: Math.floor((now.getTime() - attempt.startTime.getTime()) / 1000),
    };

    return updated;
  }, [validateAnswer]);

  /**
   * Get explanation for a question
   */
  const getExplanation = useCallback((question: Question): string => {
    return question.explanation;
  }, []);

  /**
   * Get performance summary
   */
  const getPerformanceSummary = useCallback(() => {
    if (!userProfile) return null;
    return tracker.getPerformanceSummary(userProfile);
  }, [tracker, userProfile]);

  /**
   * Clear history
   */
  const clearHistory = useCallback(() => {
    setQuestionHistory([]);
  }, []);

  return {
    currentQuestion,
    questionHistory,
    selectQuestion,
    validateAnswer,
    recordAttempt,
    startAttempt,
    submitAnswer,
    getExplanation,
    getPerformanceSummary,
    clearHistory,
    pipeline,
    tracker,
  };
}

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Brain, CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';
import { Alarm, Question } from '../App';
import { getRandomQuestion, getQuestionWithFilters } from '../data/questions';

export default function SolveQuestion() {
  const navigate = useNavigate();
  const { alarmId } = useParams();
  const [alarm, setAlarm] = useState<Alarm | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('alarms');
    if (stored) {
      const alarms: Alarm[] = JSON.parse(stored);
      const foundAlarm = alarms.find(a => a.id === alarmId);
      if (foundAlarm) {
        setAlarm(foundAlarm);
        
        // Get question based on advanced settings
        let q: Question;
        if (foundAlarm.subjects || foundAlarm.topics || foundAlarm.difficultyMin || foundAlarm.focusMode) {
          q = getQuestionWithFilters(foundAlarm.goal, {
            subjects: foundAlarm.subjects,
            topics: foundAlarm.topics,
            difficultyMin: foundAlarm.difficultyMin,
            difficultyMax: foundAlarm.difficultyMax,
            focusMode: foundAlarm.focusMode,
          });
        } else {
          q = getRandomQuestion(foundAlarm.goal, foundAlarm.difficulty);
        }
        
        setQuestion(q);
        
        // Set timer if maxSolveTime is configured
        if (foundAlarm.maxSolveTime) {
          setTimeRemaining(foundAlarm.maxSolveTime);
        }
      }
    }
  }, [alarmId]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && !showFeedback) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    } else if (timeRemaining === 0 && !showFeedback) {
      // Time's up - treat as incorrect
      handleTimeout();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeRemaining, showFeedback]);

  const handleTimeout = () => {
    setShowFeedback(true);
    setIsCorrect(false);
    setAttempts(attempts + 1);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    const correct = selectedAnswer === question!.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);
    setAttempts(attempts + 1);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (correct) {
      // Update progress
      const progressData = JSON.parse(localStorage.getItem('progress') || '{}');
      const newProgress = {
        totalAlarmsCompleted: (progressData.totalAlarmsCompleted || 0) + 1,
        questionsAnswered: (progressData.questionsAnswered || 0) + 1,
        currentStreak: (progressData.currentStreak || 0) + 1,
        longestStreak: Math.max(progressData.longestStreak || 0, (progressData.currentStreak || 0) + 1),
        goalBreakdown: {
          ...(progressData.goalBreakdown || {}),
          [alarm!.goal]: ((progressData.goalBreakdown || {})[alarm!.goal] || 0) + 1,
        },
      };
      localStorage.setItem('progress', JSON.stringify(newProgress));

      // Navigate to success screen after short delay
      setTimeout(() => {
        navigate(`/success/${alarmId}`);
      }, 2000);
    }
  };

  const handleTryAgain = () => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    
    // Generate new question on wrong answer
    if (alarm) {
      let q: Question;
      if (alarm.subjects || alarm.topics || alarm.difficultyMin || alarm.focusMode) {
        q = getQuestionWithFilters(alarm.goal, {
          subjects: alarm.subjects,
          topics: alarm.topics,
          difficultyMin: alarm.difficultyMin,
          difficultyMax: alarm.difficultyMax,
          focusMode: alarm.focusMode,
        });
      } else {
        q = getRandomQuestion(alarm.goal, alarm.difficulty);
      }
      setQuestion(q);
      
      // Reset timer
      if (alarm.maxSolveTime) {
        setTimeRemaining(alarm.maxSolveTime);
      }
    }
  };

  if (!alarm || !question) {
    return null;
  }

  const getTimerColor = () => {
    if (timeRemaining === null) return 'text-white';
    const percentage = (timeRemaining / (alarm.maxSolveTime || 120)) * 100;
    if (percentage > 50) return 'text-white';
    if (percentage > 20) return 'text-yellow-300';
    return 'text-red-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center text-white mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm mb-4">
            <Brain className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">Solve to Stop Alarm</h1>
          <div className="flex items-center justify-center gap-3 text-white/80">
            <span>{alarm.goal}</span>
            {question.subject && (
              <>
                <span>·</span>
                <span>{question.subject}</span>
              </>
            )}
            {question.topic && (
              <>
                <span>·</span>
                <span>{question.topic}</span>
              </>
            )}
          </div>
          {attempts > 0 && (
            <p className="text-sm text-white/60 mt-2">Attempts: {attempts}</p>
          )}
          
          {/* Timer */}
          {timeRemaining !== null && (
            <div className={`mt-4 flex items-center justify-center gap-2 text-lg font-semibold ${getTimerColor()}`}>
              <Clock className="w-5 h-5" />
              <span>
                {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
              </span>
            </div>
          )}
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl mb-6">{question.question}</h2>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => !showFeedback && setSelectedAnswer(index)}
                disabled={showFeedback}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  selectedAnswer === index
                    ? showFeedback
                      ? index === question.correctAnswer
                        ? 'bg-green-100 border-2 border-green-500'
                        : 'bg-red-100 border-2 border-red-500'
                      : 'bg-indigo-100 border-2 border-indigo-500'
                    : showFeedback && index === question.correctAnswer
                    ? 'bg-green-100 border-2 border-green-500'
                    : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-semibold text-sm">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1">{option}</span>
                  {showFeedback && index === question.correctAnswer && (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  )}
                  {showFeedback && selectedAnswer === index && index !== question.correctAnswer && (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div
              className={`mt-6 p-4 rounded-xl ${
                isCorrect ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'
              }`}
            >
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold mb-2">
                    {isCorrect 
                      ? 'Correct! Well done!' 
                      : timeRemaining === 0 
                        ? "Time's up! Try again." 
                        : 'Incorrect. Try again!'}
                  </p>
                  <p className="text-sm">{question.explanation}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!showFeedback ? (
            <button
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
              className="w-full mt-6 bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Answer
            </button>
          ) : !isCorrect ? (
            <button
              onClick={handleTryAgain}
              className="w-full mt-6 bg-red-600 text-white py-4 rounded-xl font-semibold hover:bg-red-700 transition-colors"
            >
              Try New Question
            </button>
          ) : (
            <div className="mt-6 text-center text-green-600 font-semibold">
              Redirecting to dashboard...
            </div>
          )}
        </div>

        <p className="text-center text-white/70 text-sm mt-6">
          You must answer correctly to dismiss the alarm
        </p>
      </div>
    </div>
  );
}

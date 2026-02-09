import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, TrendingUp, CheckCircle, Award, Calendar } from 'lucide-react';
import { ProgressData, Goal } from '../App';

const GOAL_COLORS: Record<Goal, string> = {
  CAT: 'bg-blue-500',
  GATE: 'bg-green-500',
  CODING: 'bg-purple-500',
  JEE: 'bg-orange-500',
  NEET: 'bg-pink-500',
};

export default function ProgressOverview() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<ProgressData>({
    totalAlarmsCompleted: 0,
    questionsAnswered: 0,
    currentStreak: 0,
    longestStreak: 0,
    goalBreakdown: {} as Record<Goal, number>,
  });

  useEffect(() => {
    const stored = localStorage.getItem('progress');
    if (stored) {
      setProgress(JSON.parse(stored));
    }
  }, []);

  const totalGoalQuestions = Object.values(progress.goalBreakdown).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold">Your Progress</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-4">
              <Target className="w-6 h-6 text-indigo-600" />
            </div>
            <p className="text-gray-600 text-sm mb-1">Alarms Completed</p>
            <p className="text-3xl font-semibold">{progress.totalAlarmsCompleted}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-gray-600 text-sm mb-1">Questions Answered</p>
            <p className="text-3xl font-semibold">{progress.questionsAnswered}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-4">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-gray-600 text-sm mb-1">Current Streak</p>
            <p className="text-3xl font-semibold">{progress.currentStreak}</p>
            <p className="text-xs text-gray-500 mt-1">days</p>
          </div>

          <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-gray-600 text-sm mb-1">Longest Streak</p>
            <p className="text-3xl font-semibold">{progress.longestStreak}</p>
            <p className="text-xs text-gray-500 mt-1">days</p>
          </div>
        </div>

        {/* Goal Breakdown */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Questions by Goal
          </h2>

          {totalGoalQuestions === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No questions answered yet. Complete your first alarm!
            </p>
          ) : (
            <div className="space-y-4">
              {Object.entries(progress.goalBreakdown)
                .filter(([_, count]) => count > 0)
                .sort(([_, a], [__, b]) => b - a)
                .map(([goal, count]) => {
                  const percentage = (count / totalGoalQuestions) * 100;
                  return (
                    <div key={goal}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{goal}</span>
                        <span className="text-gray-600">{count} questions</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full ${GOAL_COLORS[goal as Goal]} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Motivational Message */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
          <h3 className="font-semibold text-lg mb-2">Keep Going! 💪</h3>
          <p className="text-white/90">
            {progress.currentStreak === 0
              ? "Start your journey today! Complete an alarm to begin your streak."
              : progress.currentStreak < 7
              ? `You're building momentum! ${7 - progress.currentStreak} more days to reach a week streak.`
              : progress.currentStreak < 30
              ? `Amazing! You're on a ${progress.currentStreak} day streak. Keep it up!`
              : `Incredible ${progress.currentStreak} day streak! You're a champion! 🏆`}
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full bg-indigo-600 text-white py-4 rounded-xl hover:bg-indigo-700 transition-colors font-medium"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

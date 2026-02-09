import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, TrendingUp, Target } from 'lucide-react';
import { ProgressData } from '../App';

export default function SuccessScreen() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<ProgressData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('progress');
    if (stored) {
      setProgress(JSON.parse(stored));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center text-white">
        <div className="mb-8 inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full backdrop-blur-sm animate-bounce">
          <CheckCircle className="w-12 h-12" />
        </div>

        <h1 className="text-4xl font-semibold mb-4">Alarm Dismissed!</h1>
        <p className="text-xl mb-12 text-white/90">
          Great job! You solved the question correctly.
        </p>

        {/* Stats */}
        {progress && (
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5" />
                <span>Alarms Completed</span>
              </div>
              <span className="font-semibold text-xl">{progress.totalAlarmsCompleted}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5" />
                <span>Current Streak</span>
              </div>
              <span className="font-semibold text-xl">{progress.currentStreak} days</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5" />
                <span>Questions Answered</span>
              </div>
              <span className="font-semibold text-xl">{progress.questionsAnswered}</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-white text-green-600 py-4 rounded-xl font-semibold hover:bg-white/90 transition-colors"
          >
            Back to Dashboard
          </button>

          <button
            onClick={() => navigate('/progress')}
            className="w-full bg-white/20 backdrop-blur-sm text-white py-4 rounded-xl font-semibold hover:bg-white/30 transition-colors"
          >
            View Progress
          </button>
        </div>

        <p className="text-sm text-white/70 mt-8">
          Keep up the great work! Consistency is key to success.
        </p>
      </div>
    </div>
  );
}

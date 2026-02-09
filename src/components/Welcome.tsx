import { AlarmClock, Target, TrendingUp } from 'lucide-react';

interface WelcomeProps {
  onComplete: () => void;
}

export default function Welcome({ onComplete }: WelcomeProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="max-w-md w-full text-center text-white">
        <div className="mb-8 inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full backdrop-blur-sm">
          <AlarmClock className="w-12 h-12" />
        </div>
        
        <h1 className="text-4xl mb-4">Smart Alarm</h1>
        <p className="text-xl mb-12 text-white/90">
          Wake up smarter. Stop your alarm by solving questions related to your goals.
        </p>

        <div className="space-y-6 mb-12 text-left">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
              <AlarmClock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Wake Up Effectively</h3>
              <p className="text-white/80 text-sm">No more snoozing. Engage your brain to stop the alarm.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Goal-Oriented Learning</h3>
              <p className="text-white/80 text-sm">Practice questions for CAT, GATE, JEE, NEET, or coding interviews.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Build Consistency</h3>
              <p className="text-white/80 text-sm">Track your progress and maintain daily study streaks.</p>
            </div>
          </div>
        </div>

        <button
          onClick={onComplete}
          className="w-full bg-white text-purple-600 py-4 rounded-xl font-semibold hover:bg-white/90 transition-colors"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

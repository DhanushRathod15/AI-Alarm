import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlarmClock } from 'lucide-react';
import { Alarm } from '../App';

export default function AlarmRinging() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [alarm, setAlarm] = useState<Alarm | null>(null);
  const [isShaking, setIsShaking] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('alarms');
    if (stored) {
      const alarms: Alarm[] = JSON.parse(stored);
      const foundAlarm = alarms.find(a => a.id === id);
      setAlarm(foundAlarm || null);
    }

    // Shake animation interval
    const interval = setInterval(() => {
      setIsShaking(prev => !prev);
    }, 500);

    return () => clearInterval(interval);
  }, [id]);

  const handleStopAlarm = () => {
    navigate(`/solve-question/${id}`);
  };

  if (!alarm) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center text-white">
        <div
          className={`mb-8 inline-flex items-center justify-center w-32 h-32 bg-white/20 rounded-full backdrop-blur-sm transition-transform ${
            isShaking ? 'scale-110' : 'scale-100'
          }`}
        >
          <AlarmClock className="w-16 h-16" />
        </div>

        <h1 className="text-6xl font-semibold mb-4">{alarm.time}</h1>
        
        {alarm.label && (
          <p className="text-2xl mb-8">{alarm.label}</p>
        )}

        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-8">
          <p className="text-lg mb-4">
            Wake up! It's time to activate your brain.
          </p>
          {alarm.subjects || alarm.topics || alarm.difficultyMin || alarm.focusMode || alarm.maxSolveTime ? (
            <div className="space-y-2 text-sm text-white/80">
              <p>
                Solve a {alarm.goal} question to stop this alarm
              </p>
              {alarm.subjects && alarm.subjects.length > 0 && alarm.subjects.length < 5 && (
                <p>📚 Subjects: {alarm.subjects.join(', ')}</p>
              )}
              {alarm.difficultyMin && alarm.difficultyMax && (
                <p>📊 Difficulty: {alarm.difficultyMin} - {alarm.difficultyMax}</p>
              )}
              {alarm.focusMode && alarm.focusMode !== 'balanced' && (
                <p>🎯 Focus: {alarm.focusMode}</p>
              )}
              {alarm.maxSolveTime && (
                <p>⏱️ Time limit: {Math.floor(alarm.maxSolveTime / 60)}:{String(alarm.maxSolveTime % 60).padStart(2, '0')}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-white/80">
              Solve a {alarm.difficulty} {alarm.goal} question to stop this alarm
            </p>
          )}
        </div>

        <button
          onClick={handleStopAlarm}
          className="w-full bg-white text-red-600 py-5 rounded-xl font-semibold text-lg hover:bg-white/90 transition-colors animate-pulse"
        >
          Stop Alarm - Solve Question
        </button>

        <p className="text-sm text-white/70 mt-6">
          You must answer correctly to dismiss the alarm
        </p>
      </div>
    </div>
  );
}
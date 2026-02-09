import { useState, useEffect } from 'react';
import { Plus, Settings, TrendingUp, Clock, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Alarm, Goal } from '../App';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Dashboard() {
  const navigate = useNavigate();
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [userGoal, setUserGoal] = useState<Goal | null>(null);

  useEffect(() => {
    const goal = localStorage.getItem('userGoal') as Goal;
    setUserGoal(goal);
    loadAlarms();

    // Check for alarms that should ring
    const interval = setInterval(checkAlarms, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadAlarms = () => {
    const stored = localStorage.getItem('alarms');
    if (stored) {
      setAlarms(JSON.parse(stored));
    }
  };

  const checkAlarms = () => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const currentDay = DAYS[now.getDay() === 0 ? 6 : now.getDay() - 1];

    const stored = localStorage.getItem('alarms');
    if (!stored) return;

    const alarms: Alarm[] = JSON.parse(stored);
    const ringingAlarm = alarms.find(
      alarm => alarm.enabled && alarm.time === currentTime && alarm.days.includes(currentDay)
    );

    if (ringingAlarm) {
      // Check if we've already triggered this alarm in the last minute
      const lastTriggered = localStorage.getItem(`lastTriggered_${ringingAlarm.id}`);
      if (lastTriggered && Date.now() - parseInt(lastTriggered) < 60000) {
        return;
      }
      
      localStorage.setItem(`lastTriggered_${ringingAlarm.id}`, Date.now().toString());
      navigate(`/alarm-ringing/${ringingAlarm.id}`);
    }
  };

  const toggleAlarm = (id: string) => {
    const updated = alarms.map(alarm =>
      alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
    );
    setAlarms(updated);
    localStorage.setItem('alarms', JSON.stringify(updated));
  };

  const deleteAlarm = (id: string) => {
    const updated = alarms.filter(alarm => alarm.id !== id);
    setAlarms(updated);
    localStorage.setItem('alarms', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Smart Alarm</h1>
            <p className="text-sm text-gray-600">Goal: {userGoal}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/progress')}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              <TrendingUp className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={() => navigate('/goal-selection')}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        {alarms.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl mb-2">No Alarms Set</h2>
            <p className="text-gray-600 mb-8">Create your first smart alarm to get started</p>
            <button
              onClick={() => navigate('/create-alarm')}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Alarm
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {alarms.map(alarm => (
              <div
                key={alarm.id}
                className={`bg-white rounded-xl p-6 border-2 transition-all ${
                  alarm.enabled ? 'border-indigo-200' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-4xl font-semibold">{alarm.time}</span>
                      <span className="text-sm text-gray-500 uppercase">{alarm.goal}</span>
                    </div>
                    {alarm.label && (
                      <p className="text-gray-700 mb-2">{alarm.label}</p>
                    )}
                    <div className="flex gap-2 mb-2">
                      {DAYS.map(day => (
                        <span
                          key={day}
                          className={`text-xs px-2 py-1 rounded ${
                            alarm.days.includes(day)
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                    
                    {/* Show advanced settings if configured */}
                    {(alarm.subjects || alarm.topics || alarm.focusMode || alarm.maxSolveTime) ? (
                      <div className="space-y-1 text-xs text-gray-600 mt-3 bg-gray-50 p-3 rounded-lg">
                        {alarm.subjects && alarm.subjects.length > 0 && alarm.subjects.length < 5 && (
                          <p>📚 {alarm.subjects.join(', ')}</p>
                        )}
                        {alarm.subjects && alarm.subjects.length >= 5 && (
                          <p>📚 {alarm.subjects.length} subjects selected</p>
                        )}
                        {alarm.difficultyMin && alarm.difficultyMax && (
                          <p>📊 Difficulty: {alarm.difficultyMin} - {alarm.difficultyMax}</p>
                        )}
                        {alarm.focusMode && alarm.focusMode !== 'balanced' && (
                          <p>🎯 Mode: {alarm.focusMode}</p>
                        )}
                        {alarm.maxSolveTime && (
                          <p>⏱️ Time limit: {Math.floor(alarm.maxSolveTime / 60)}:{String(alarm.maxSolveTime % 60).padStart(2, '0')}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500 capitalize">
                        Difficulty: {alarm.difficulty}
                      </span>
                    )}
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alarm.enabled}
                      onChange={() => toggleAlarm(alarm.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/edit-alarm/${alarm.id}`)}
                    className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteAlarm(alarm.id)}
                    className="flex-1 py-2 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {alarms.length > 0 && (
          <button
            onClick={() => navigate('/create-alarm')}
            className="w-full mt-6 bg-indigo-600 text-white py-4 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Another Alarm
          </button>
        )}
      </div>
    </div>
  );
}
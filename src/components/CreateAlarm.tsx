import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { Alarm, Goal, FocusMode } from '../App';
import { getSubjects, getTopics } from '../data/curriculum';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

const FOCUS_MODES: { value: FocusMode; label: string; description: string }[] = [
  {
    value: 'balanced',
    label: 'Balanced',
    description: 'Even mix of all topics',
  },
  {
    value: 'weakness',
    label: 'Weakness',
    description: 'Focus on topics you struggle with',
  },
  {
    value: 'random',
    label: 'Random',
    description: 'Completely random selection',
  },
  {
    value: 'progressive',
    label: 'Progressive',
    description: 'Start easy, get harder over time',
  },
];

export default function CreateAlarm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [userGoal, setUserGoal] = useState<Goal | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Basic settings
  const [time, setTime] = useState('07:00');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [label, setLabel] = useState('');

  // Advanced settings
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [difficultyMin, setDifficultyMin] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [difficultyMax, setDifficultyMax] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [focusMode, setFocusMode] = useState<FocusMode>('balanced');
  const [maxSolveTime, setMaxSolveTime] = useState(120); // 2 minutes default

  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());

  useEffect(() => {
    const goal = localStorage.getItem('userGoal') as Goal;
    setUserGoal(goal);

    if (goal) {
      const subjects = getSubjects(goal);
      setAvailableSubjects(subjects);
      setSelectedSubjects(subjects); // Default: all subjects
    }

    if (isEditing) {
      const stored = localStorage.getItem('alarms');
      if (stored) {
        const alarms: Alarm[] = JSON.parse(stored);
        const alarm = alarms.find(a => a.id === id);
        if (alarm) {
          setTime(alarm.time);
          setSelectedDays(alarm.days);
          setLabel(alarm.label || '');
          
          // Load advanced settings if they exist
          if (alarm.subjects || alarm.topics || alarm.difficultyMin || alarm.focusMode || alarm.maxSolveTime) {
            setShowAdvanced(true);
          }
          
          if (alarm.subjects) setSelectedSubjects(alarm.subjects);
          if (alarm.topics) setSelectedTopics(alarm.topics);
          if (alarm.difficultyMin) setDifficultyMin(alarm.difficultyMin);
          if (alarm.difficultyMax) setDifficultyMax(alarm.difficultyMax);
          if (alarm.focusMode) setFocusMode(alarm.focusMode);
          if (alarm.maxSolveTime) setMaxSolveTime(alarm.maxSolveTime);
        }
      }
    }
  }, [id, isEditing]);

  // Update available topics when subjects change
  useEffect(() => {
    if (userGoal && selectedSubjects.length > 0) {
      const topics = selectedSubjects.flatMap(subject => getTopics(userGoal, subject));
      setAvailableTopics(topics);
      
      // If no topics selected or previous topics are invalid, select all
      if (selectedTopics.length === 0 || !selectedTopics.some(t => topics.includes(t))) {
        setSelectedTopics(topics);
      }
    }
  }, [selectedSubjects, userGoal]);

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev => {
      const isRemoving = prev.includes(subject);
      if (isRemoving && prev.length === 1) {
        // Don't allow removing the last subject
        return prev;
      }
      return isRemoving ? prev.filter(s => s !== subject) : [...prev, subject];
    });
  };

  const toggleAllSubjects = () => {
    setSelectedSubjects(
      selectedSubjects.length === availableSubjects.length ? [availableSubjects[0]] : availableSubjects
    );
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => {
      const isRemoving = prev.includes(topic);
      if (isRemoving && prev.length === 1) {
        // Don't allow removing the last topic
        return prev;
      }
      return isRemoving ? prev.filter(t => t !== topic) : [...prev, topic];
    });
  };

  const toggleSubjectTopics = (subject: string) => {
    if (!userGoal) return;
    const subjectTopics = getTopics(userGoal, subject);
    const allSelected = subjectTopics.every(t => selectedTopics.includes(t));
    
    if (allSelected) {
      // Deselect all topics from this subject (but keep at least one topic total)
      const remaining = selectedTopics.filter(t => !subjectTopics.includes(t));
      if (remaining.length > 0) {
        setSelectedTopics(remaining);
      }
    } else {
      // Select all topics from this subject
      setSelectedTopics([...new Set([...selectedTopics, ...subjectTopics])]);
    }
  };

  const toggleSubjectExpand = (subject: string) => {
    setExpandedSubjects(prev => {
      const next = new Set(prev);
      if (next.has(subject)) {
        next.delete(subject);
      } else {
        next.add(subject);
      }
      return next;
    });
  };

  const handleSave = () => {
    if (selectedDays.length === 0) {
      alert('Please select at least one day');
      return;
    }

    if (showAdvanced && selectedSubjects.length === 0) {
      alert('Please select at least one subject');
      return;
    }

    if (showAdvanced && selectedTopics.length === 0) {
      alert('Please select at least one topic');
      return;
    }

    // Get legacy difficulty (use max for backward compatibility)
    const legacyDifficulty = difficultyMax;

    const alarm: Alarm = {
      id: isEditing ? id! : Date.now().toString(),
      time,
      days: selectedDays,
      goal: userGoal!,
      difficulty: legacyDifficulty,
      enabled: true,
      label: label.trim() || undefined,
      ...(showAdvanced && {
        subjects: selectedSubjects,
        topics: selectedTopics,
        difficultyMin,
        difficultyMax,
        focusMode,
        maxSolveTime,
      }),
    };

    const stored = localStorage.getItem('alarms');
    const alarms: Alarm[] = stored ? JSON.parse(stored) : [];

    if (isEditing) {
      const index = alarms.findIndex(a => a.id === id);
      alarms[index] = alarm;
    } else {
      alarms.push(alarm);
    }

    localStorage.setItem('alarms', JSON.stringify(alarms));
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold">
            {isEditing ? 'Edit Alarm' : 'Create Alarm'}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl p-6 space-y-8">
          {/* Time Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Alarm Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full text-4xl font-semibold text-center py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Label (Optional)
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Morning study session"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Days Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Repeat
            </label>
            <div className="grid grid-cols-7 gap-2">
              {DAYS.map(day => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`py-3 rounded-lg font-medium transition-colors ${
                    selectedDays.includes(day)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Goal Display */}
          <div className="bg-indigo-50 p-4 rounded-lg">
            <p className="text-sm text-indigo-900">
              <span className="font-medium">Exam:</span> {userGoal}
            </p>
          </div>
        </div>

        {/* Advanced Settings Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full mt-6 bg-white border-2 border-gray-200 py-4 px-6 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-gray-600" />
            <div className="text-left">
              <span className="font-medium block">Advanced Settings</span>
              <span className="text-xs text-gray-500">Customize subjects, topics, difficulty & more</span>
            </div>
          </div>
          {showAdvanced ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* Advanced Settings Panel */}
        {showAdvanced && (
          <div className="mt-6 bg-white rounded-xl p-6 space-y-8 border-2 border-indigo-100">
            {/* Subjects */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">
                  Subjects ({selectedSubjects.length}/{availableSubjects.length})
                </label>
                <button
                  onClick={toggleAllSubjects}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  {selectedSubjects.length === availableSubjects.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {availableSubjects.map(subject => (
                  <button
                    key={subject}
                    onClick={() => toggleSubject(subject)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors text-left ${
                      selectedSubjects.includes(subject)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>

            {/* Topics */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Topics ({selectedTopics.length}/{availableTopics.length})
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto border-2 border-gray-200 rounded-xl p-3">
                {selectedSubjects.map(subject => {
                  if (!userGoal) return null;
                  const topics = getTopics(userGoal, subject);
                  const isExpanded = expandedSubjects.has(subject);
                  const allTopicsSelected = topics.every(t => selectedTopics.includes(t));

                  return (
                    <div key={subject} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                      <div className="flex items-center justify-between py-2">
                        <button
                          onClick={() => toggleSubjectExpand(subject)}
                          className="flex items-center gap-2 flex-1 text-left"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          )}
                          <span className="text-sm font-medium text-gray-700">{subject}</span>
                          <span className="text-xs text-gray-500">
                            ({topics.filter(t => selectedTopics.includes(t)).length}/{topics.length})
                          </span>
                        </button>
                        <button
                          onClick={() => toggleSubjectTopics(subject)}
                          className="text-xs text-indigo-600 hover:text-indigo-700 px-2"
                        >
                          {allTopicsSelected ? 'None' : 'All'}
                        </button>
                      </div>
                      {isExpanded && (
                        <div className="pl-6 space-y-1 mt-2">
                          {topics.map(topic => (
                            <button
                              key={topic}
                              onClick={() => toggleTopic(topic)}
                              className={`w-full py-1.5 px-3 rounded text-xs text-left transition-colors ${
                                selectedTopics.includes(topic)
                                  ? 'bg-indigo-50 text-indigo-700'
                                  : 'text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              {topic}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Difficulty Range
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Minimum</label>
                  <div className="flex gap-2">
                    {DIFFICULTIES.map(level => (
                      <button
                        key={level}
                        onClick={() => {
                          setDifficultyMin(level);
                          // Auto-adjust max if needed
                          const diffIndex = DIFFICULTIES.indexOf(level);
                          const maxIndex = DIFFICULTIES.indexOf(difficultyMax);
                          if (diffIndex > maxIndex) {
                            setDifficultyMax(level);
                          }
                        }}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                          difficultyMin === level
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Maximum</label>
                  <div className="flex gap-2">
                    {DIFFICULTIES.map(level => (
                      <button
                        key={level}
                        onClick={() => {
                          setDifficultyMax(level);
                          // Auto-adjust min if needed
                          const diffIndex = DIFFICULTIES.indexOf(level);
                          const minIndex = DIFFICULTIES.indexOf(difficultyMin);
                          if (diffIndex < minIndex) {
                            setDifficultyMin(level);
                          }
                        }}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                          difficultyMax === level
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Questions will range from {difficultyMin} to {difficultyMax}
              </p>
            </div>

            {/* Focus Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Focus Mode
              </label>
              <div className="space-y-2">
                {FOCUS_MODES.map(mode => (
                  <button
                    key={mode.value}
                    onClick={() => setFocusMode(mode.value)}
                    className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                      focusMode === mode.value
                        ? 'bg-indigo-50 border-indigo-500'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{mode.label}</span>
                      {focusMode === mode.value && (
                        <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{mode.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Max Solve Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Max Solve Time: {Math.floor(maxSolveTime / 60)}:{String(maxSolveTime % 60).padStart(2, '0')}
              </label>
              <div className="space-y-3">
                <input
                  type="range"
                  min="30"
                  max="600"
                  step="30"
                  value={maxSolveTime}
                  onChange={(e) => setMaxSolveTime(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>30s</span>
                  <span>2m</span>
                  <span>5m</span>
                  <span>10m</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Alarm will auto-snooze if not answered within this time
              </p>
            </div>
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full mt-6 bg-indigo-600 text-white py-4 rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-lg"
        >
          {isEditing ? 'Save Changes' : 'Create Alarm'}
        </button>
      </div>
    </div>
  );
}
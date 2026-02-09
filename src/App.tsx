import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './components/Welcome';
import GoalSelection from './components/GoalSelection';
import Dashboard from './components/Dashboard';
import CreateAlarm from './components/CreateAlarm';
import AlarmRinging from './components/AlarmRinging';
import SolveQuestion from './components/SolveQuestion';
import SuccessScreen from './components/SuccessScreen';
import ProgressOverview from './components/ProgressOverview';

export type Goal = 'CAT' | 'GATE' | 'CODING' | 'JEE' | 'NEET';

export type FocusMode = 'balanced' | 'weakness' | 'random' | 'progressive';

export interface Alarm {
  id: string;
  time: string;
  days: string[];
  goal: Goal;
  difficulty: 'easy' | 'medium' | 'hard';
  enabled: boolean;
  label?: string;
  // Advanced settings
  subjects?: string[];
  topics?: string[];
  difficultyMin?: 'easy' | 'medium' | 'hard';
  difficultyMax?: 'easy' | 'medium' | 'hard';
  focusMode?: FocusMode;
  maxSolveTime?: number; // in seconds
}

export interface Question {
  id: string;
  goal: Goal;
  difficulty: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject?: string;
  topic?: string;
}

export interface ProgressData {
  totalAlarmsCompleted: number;
  questionsAnswered: number;
  currentStreak: number;
  longestStreak: number;
  goalBreakdown: Record<Goal, number>;
}

function App() {
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  const [userGoal, setUserGoal] = useState<Goal | null>(null);

  useEffect(() => {
    const seen = localStorage.getItem('hasSeenWelcome');
    const goal = localStorage.getItem('userGoal') as Goal;
    if (seen) setHasSeenWelcome(true);
    if (goal) setUserGoal(goal);
  }, []);

  const handleWelcomeComplete = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setHasSeenWelcome(true);
  };

  const handleGoalSelect = (goal: Goal) => {
    localStorage.setItem('userGoal', goal);
    setUserGoal(goal);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route 
            path="/" 
            element={
              !hasSeenWelcome ? (
                <Welcome onComplete={handleWelcomeComplete} />
              ) : !userGoal ? (
                <GoalSelection onSelectGoal={handleGoalSelect} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } 
          />
          <Route 
            path="/goal-selection" 
            element={<GoalSelection onSelectGoal={handleGoalSelect} />} 
          />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-alarm" element={<CreateAlarm />} />
          <Route path="/edit-alarm/:id" element={<CreateAlarm />} />
          <Route path="/alarm-ringing/:id" element={<AlarmRinging />} />
          <Route path="/solve-question/:alarmId" element={<SolveQuestion />} />
          <Route path="/success/:alarmId" element={<SuccessScreen />} />
          <Route path="/progress" element={<ProgressOverview />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
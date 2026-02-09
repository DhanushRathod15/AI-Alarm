import { Code, BookOpen, Microscope, Calculator, Brain } from 'lucide-react';
import { Goal } from '../App';

interface GoalSelectionProps {
  onSelectGoal: (goal: Goal) => void;
}

const goals = [
  {
    id: 'CAT' as Goal,
    name: 'CAT',
    description: 'Common Admission Test - MBA entrance',
    icon: Brain,
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'GATE' as Goal,
    name: 'GATE',
    description: 'Graduate Aptitude Test in Engineering',
    icon: Calculator,
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'CODING' as Goal,
    name: 'Coding Interviews',
    description: 'Data structures & algorithms',
    icon: Code,
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'JEE' as Goal,
    name: 'JEE',
    description: 'Joint Entrance Examination',
    icon: BookOpen,
    color: 'from-orange-500 to-orange-600',
  },
  {
    id: 'NEET' as Goal,
    name: 'NEET',
    description: 'Medical entrance examination',
    icon: Microscope,
    color: 'from-pink-500 to-pink-600',
  },
];

export default function GoalSelection({ onSelectGoal }: GoalSelectionProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-3xl mb-3">Choose Your Goal</h1>
          <p className="text-gray-600">
            Select what you're preparing for. You can change this later.
          </p>
        </div>

        <div className="grid gap-4">
          {goals.map((goal) => {
            const Icon = goal.icon;
            return (
              <button
                key={goal.id}
                onClick={() => onSelectGoal(goal.id)}
                className="flex items-center gap-4 p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all hover:shadow-md text-left"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${goal.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{goal.name}</h3>
                  <p className="text-gray-600 text-sm">{goal.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

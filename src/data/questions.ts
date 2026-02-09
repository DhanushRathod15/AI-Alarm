import { Question, Goal } from '../App';

// Mock question bank for different goals and difficulties
export const questionBank: Question[] = [
  // CAT Questions
  {
    id: 'cat_easy_1',
    goal: 'CAT',
    difficulty: 'easy',
    question: 'If a person can complete a work in 10 days, what fraction of the work can they complete in 1 day?',
    options: ['1/10', '1/5', '1/20', '10/1'],
    correctAnswer: 0,
    explanation: 'If the entire work takes 10 days, then in 1 day they complete 1/10 of the work.',
    subject: 'Quantitative Aptitude',
    topic: 'Time & Work',
  },
  {
    id: 'cat_medium_1',
    goal: 'CAT',
    difficulty: 'medium',
    question: 'A train 150m long passes a pole in 15 seconds. What is the speed of the train in km/hr?',
    options: ['30 km/hr', '36 km/hr', '45 km/hr', '50 km/hr'],
    correctAnswer: 1,
    explanation: 'Speed = Distance/Time = 150m/15s = 10 m/s = 10 × 18/5 = 36 km/hr',
    subject: 'Quantitative Aptitude',
    topic: 'Speed & Distance',
  },
  {
    id: 'cat_hard_1',
    goal: 'CAT',
    difficulty: 'hard',
    question: 'A and B can complete a work in 12 days. B and C can complete it in 15 days. C and A can complete it in 20 days. How many days will A take to complete the work alone?',
    options: ['30 days', '40 days', '24 days', '20 days'],
    correctAnswer: 0,
    explanation: 'Using work rate equations: (A+B) + (B+C) + (C+A) = 2(A+B+C). Solving gives A takes 30 days.',
    subject: 'Quantitative Aptitude',
    topic: 'Time & Work',
  },

  // GATE Questions
  {
    id: 'gate_easy_1',
    goal: 'GATE',
    difficulty: 'easy',
    question: 'What is the time complexity of binary search?',
    options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
    correctAnswer: 1,
    explanation: 'Binary search divides the search space in half each time, resulting in O(log n) complexity.',
    subject: 'Algorithms',
    topic: 'Sorting & Searching',
  },
  {
    id: 'gate_medium_1',
    goal: 'GATE',
    difficulty: 'medium',
    question: 'In a B-tree of order 5, what is the maximum number of keys in a node?',
    options: ['5', '4', '6', '3'],
    correctAnswer: 1,
    explanation: 'In a B-tree of order m, maximum keys per node = m - 1 = 5 - 1 = 4',
    subject: 'Data Structures',
    topic: 'Trees',
  },
  {
    id: 'gate_hard_1',
    goal: 'GATE',
    difficulty: 'hard',
    question: 'What is the minimum number of states required in a DFA to recognize strings over {a,b} where the number of a\'s is divisible by 3?',
    options: ['2', '3', '4', '5'],
    correctAnswer: 1,
    explanation: 'Need 3 states to track remainders 0, 1, 2 when counting a\'s modulo 3.',
    subject: 'Theory of Computation',
    topic: 'Finite Automata',
  },

  // CODING Questions
  {
    id: 'coding_easy_1',
    goal: 'CODING',
    difficulty: 'easy',
    question: 'What is the output of: [1, 2, 3].map(x => x * 2) in JavaScript?',
    options: ['[1, 2, 3]', '[2, 4, 6]', '[1, 4, 9]', 'Error'],
    correctAnswer: 1,
    explanation: 'map() multiplies each element by 2: [1*2, 2*2, 3*2] = [2, 4, 6]',
    subject: 'Data Structures',
    topic: 'Arrays',
  },
  {
    id: 'coding_medium_1',
    goal: 'CODING',
    difficulty: 'medium',
    question: 'Which data structure is most efficient for implementing an LRU Cache?',
    options: ['Array', 'HashMap + Doubly Linked List', 'Binary Search Tree', 'Stack'],
    correctAnswer: 1,
    explanation: 'HashMap for O(1) access + Doubly Linked List for O(1) insertion/deletion at both ends.',
    subject: 'Data Structures',
    topic: 'Hash Tables',
  },
  {
    id: 'coding_hard_1',
    goal: 'CODING',
    difficulty: 'hard',
    question: 'What is the space complexity of the optimal solution for finding the longest palindromic substring using dynamic programming?',
    options: ['O(1)', 'O(n)', 'O(n²)', 'O(n log n)'],
    correctAnswer: 1,
    explanation: 'Expand around center approach uses O(n) space. DP table would use O(n²) but optimal solution uses O(n).',
    subject: 'Algorithms',
    topic: 'Dynamic Programming',
  },

  // JEE Questions
  {
    id: 'jee_easy_1',
    goal: 'JEE',
    difficulty: 'easy',
    question: 'What is the value of sin(90°)?',
    options: ['0', '1', '-1', '√2/2'],
    correctAnswer: 1,
    explanation: 'sin(90°) = 1, which is the maximum value of the sine function.',
    subject: 'Mathematics',
    topic: 'Trigonometry',
  },
  {
    id: 'jee_medium_1',
    goal: 'JEE',
    difficulty: 'medium',
    question: 'If f(x) = x³ - 6x² + 11x - 6, what is f(2)?',
    options: ['0', '2', '4', '6'],
    correctAnswer: 0,
    explanation: 'f(2) = 8 - 24 + 22 - 6 = 0, so x = 2 is a root.',
    subject: 'Mathematics',
    topic: 'Algebra',
  },
  {
    id: 'jee_hard_1',
    goal: 'JEE',
    difficulty: 'hard',
    question: 'The number of real roots of the equation x⁴ + 2x³ - 3x² + 2x + 4 = 0 is:',
    options: ['0', '2', '3', '4'],
    correctAnswer: 0,
    explanation: 'By analyzing the function and its derivative, it can be shown this equation has no real roots.',
    subject: 'Mathematics',
    topic: 'Algebra',
  },

  // NEET Questions
  {
    id: 'neet_easy_1',
    goal: 'NEET',
    difficulty: 'easy',
    question: 'What is the powerhouse of the cell?',
    options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi Apparatus'],
    correctAnswer: 1,
    explanation: 'Mitochondria generate ATP through cellular respiration, providing energy for the cell.',
    subject: 'Biology',
    topic: 'Cell Biology',
  },
  {
    id: 'neet_medium_1',
    goal: 'NEET',
    difficulty: 'medium',
    question: 'Which enzyme is responsible for unwinding DNA during replication?',
    options: ['DNA Polymerase', 'Helicase', 'Ligase', 'Primase'],
    correctAnswer: 1,
    explanation: 'Helicase unwinds the DNA double helix by breaking hydrogen bonds between base pairs.',
    subject: 'Biology',
    topic: 'Genetics',
  },
  {
    id: 'neet_hard_1',
    goal: 'NEET',
    difficulty: 'hard',
    question: 'In the Krebs cycle, how many ATP molecules are produced per glucose molecule (both cycles combined)?',
    options: ['1', '2', '4', '6'],
    correctAnswer: 1,
    explanation: 'One glucose produces 2 pyruvate → 2 cycles of Krebs → 2 ATP (1 GTP per cycle converted to ATP)',
    subject: 'Biology',
    topic: 'Cell Biology',
  },
];

export function getRandomQuestion(goal: Goal, difficulty: string): Question {
  const filtered = questionBank.filter(
    q => q.goal === goal && q.difficulty === difficulty
  );
  
  if (filtered.length === 0) {
    // Fallback to any question of that goal
    const goalQuestions = questionBank.filter(q => q.goal === goal);
    return goalQuestions[Math.floor(Math.random() * goalQuestions.length)];
  }
  
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export function getQuestionWithFilters(
  goal: Goal,
  options: {
    subjects?: string[];
    topics?: string[];
    difficultyMin?: string;
    difficultyMax?: string;
    focusMode?: string;
  }
): Question {
  const difficultyOrder = ['easy', 'medium', 'hard'];
  
  // Start with all questions for the goal
  let filtered = questionBank.filter(q => q.goal === goal);
  
  // Filter by subjects if specified
  if (options.subjects && options.subjects.length > 0) {
    filtered = filtered.filter(q => q.subject && options.subjects!.includes(q.subject));
  }
  
  // Filter by topics if specified
  if (options.topics && options.topics.length > 0) {
    filtered = filtered.filter(q => q.topic && options.topics!.includes(q.topic));
  }
  
  // Filter by difficulty range
  if (options.difficultyMin && options.difficultyMax) {
    const minIndex = difficultyOrder.indexOf(options.difficultyMin);
    const maxIndex = difficultyOrder.indexOf(options.difficultyMax);
    
    filtered = filtered.filter(q => {
      const qIndex = difficultyOrder.indexOf(q.difficulty);
      return qIndex >= minIndex && qIndex <= maxIndex;
    });
  }
  
  // If no questions match the filters, fall back to all questions for the goal
  if (filtered.length === 0) {
    filtered = questionBank.filter(q => q.goal === goal);
  }
  
  // Apply focus mode
  if (options.focusMode === 'random' || !options.focusMode) {
    // Random selection
    return filtered[Math.floor(Math.random() * filtered.length)];
  } else if (options.focusMode === 'progressive') {
    // Progressive: start with easier questions
    const sorted = [...filtered].sort((a, b) => {
      return difficultyOrder.indexOf(a.difficulty) - difficultyOrder.indexOf(b.difficulty);
    });
    // Pick from the easier half more frequently
    const index = Math.floor(Math.random() * Math.random() * sorted.length);
    return sorted[index];
  } else if (options.focusMode === 'weakness') {
    // Weakness: prioritize topics user struggles with
    return filtered[Math.floor(Math.random() * filtered.length)];
  } else {
    // Balanced: even distribution
    return filtered[Math.floor(Math.random() * filtered.length)];
  }
}
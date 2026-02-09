import { Goal } from '../App';

export interface CurriculumData {
  [key: string]: {
    subjects: {
      [subject: string]: string[];
    };
  };
}

export const curriculum: CurriculumData = {
  CAT: {
    subjects: {
      'Quantitative Aptitude': [
        'Arithmetic',
        'Algebra',
        'Geometry',
        'Number Systems',
        'Time & Work',
        'Speed & Distance',
        'Profit & Loss',
      ],
      'Verbal Ability': [
        'Reading Comprehension',
        'Para Jumbles',
        'Sentence Correction',
        'Vocabulary',
        'Critical Reasoning',
      ],
      'Logical Reasoning': [
        'Seating Arrangement',
        'Blood Relations',
        'Syllogisms',
        'Puzzles',
        'Data Interpretation',
      ],
      'Data Interpretation': [
        'Tables',
        'Bar Graphs',
        'Pie Charts',
        'Line Graphs',
        'Caselets',
      ],
    },
  },
  GATE: {
    subjects: {
      'Engineering Mathematics': [
        'Linear Algebra',
        'Calculus',
        'Probability',
        'Differential Equations',
      ],
      'Data Structures': [
        'Arrays & Strings',
        'Linked Lists',
        'Stacks & Queues',
        'Trees',
        'Graphs',
        'Hashing',
      ],
      'Algorithms': [
        'Sorting & Searching',
        'Greedy',
        'Dynamic Programming',
        'Divide & Conquer',
        'Graph Algorithms',
      ],
      'Database Systems': [
        'SQL',
        'Normalization',
        'Transactions',
        'Indexing',
      ],
      'Operating Systems': [
        'Process Management',
        'Memory Management',
        'File Systems',
        'Deadlocks',
      ],
      'Computer Networks': [
        'OSI Model',
        'TCP/IP',
        'Routing',
        'Network Security',
      ],
    },
  },
  CODING: {
    subjects: {
      'Data Structures': [
        'Arrays',
        'Linked Lists',
        'Stacks & Queues',
        'Trees',
        'Graphs',
        'Heaps',
        'Hash Tables',
        'Tries',
      ],
      'Algorithms': [
        'Two Pointers',
        'Sliding Window',
        'Binary Search',
        'DFS & BFS',
        'Dynamic Programming',
        'Greedy',
        'Backtracking',
        'Sorting',
      ],
      'System Design': [
        'Scalability',
        'Database Design',
        'Caching',
        'Load Balancing',
        'Microservices',
      ],
      'Problem Solving': [
        'String Manipulation',
        'Bit Manipulation',
        'Math & Logic',
        'Recursion',
      ],
    },
  },
  JEE: {
    subjects: {
      'Physics': [
        'Mechanics',
        'Thermodynamics',
        'Electromagnetism',
        'Optics',
        'Modern Physics',
        'Waves',
      ],
      'Chemistry': [
        'Physical Chemistry',
        'Organic Chemistry',
        'Inorganic Chemistry',
        'Chemical Bonding',
        'Equilibrium',
      ],
      'Mathematics': [
        'Algebra',
        'Calculus',
        'Trigonometry',
        'Coordinate Geometry',
        'Vectors',
        'Probability',
      ],
    },
  },
  NEET: {
    subjects: {
      'Physics': [
        'Mechanics',
        'Thermodynamics',
        'Electrodynamics',
        'Optics',
        'Modern Physics',
      ],
      'Chemistry': [
        'Physical Chemistry',
        'Organic Chemistry',
        'Inorganic Chemistry',
      ],
      'Biology': [
        'Cell Biology',
        'Genetics',
        'Ecology',
        'Human Physiology',
        'Plant Physiology',
        'Evolution',
        'Biotechnology',
      ],
    },
  },
};

export function getSubjects(goal: Goal): string[] {
  return Object.keys(curriculum[goal]?.subjects || {});
}

export function getTopics(goal: Goal, subject: string): string[] {
  return curriculum[goal]?.subjects[subject] || [];
}

export function getAllTopics(goal: Goal, subjects?: string[]): string[] {
  if (!subjects || subjects.length === 0) {
    // Return all topics for all subjects
    return Object.values(curriculum[goal]?.subjects || {}).flat();
  }
  
  // Return topics for selected subjects
  return subjects.flatMap(subject => curriculum[goal]?.subjects[subject] || []);
}

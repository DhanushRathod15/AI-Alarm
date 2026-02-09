# 🚀 AI Question Alarm

A production-grade, mobile-first adaptive learning alarm app that wakes you up by challenging you with personalized exam questions.

## 🎯 Core Mission

Wake users up through **adaptive, intelligent question selection** that helps them learn while ensuring they actually get out of bed.

---

## ✨ Key Features

### 🤖 AI-Powered Question Selection
- **FILTER → SCORE → RANK → PICK** pipeline
- Adaptive difficulty based on user performance
- Weakness-focused learning
- Topic variety management
- Time-of-day optimization

### ⏰ Reliable Alarm System
- Background execution support
- Sound escalation
- Persistent notifications
- Anti-escape mechanisms
- Snooze limits

### 📊 Progress Tracking
- XP & leveling system
- Streak tracking
- Subject mastery metrics
- Performance analytics
- Achievement system

### 🎮 Gamification
- 20+ achievements
- Streak milestones
- Level progression
- Celebration moments
- Weekly insights

---

## 🏗️ Architecture

```
Frontend (React + TypeScript)
├── Core Engines
│   ├── Alarm Engine      (Scheduling, Triggering, Escalation)
│   ├── Question Engine   (AI Selection, Performance Tracking)
│   └── Gamification      (XP, Levels, Achievements, Streaks)
├── State Management
│   └── React Context + Custom Hooks
├── Storage Layer
│   └── localStorage + IndexedDB ready
└── UI Components
    └── shadcn/ui + Custom Mobile Components
```

### Core Engines

#### 1. **Alarm Engine**
- `AlarmScheduler`: Calculate next triggers, manage timing
- `AlarmTrigger`: Handle ringing, sound, vibration
- `BackgroundService`: Keep alarms running (PWA ready)
- `AntiEscapeGuard`: Prevent easy dismissal

#### 2. **Question Engine**
- `SelectionPipeline`: Main AI orchestrator
- `FilterEngine`: Apply hard constraints (PHASE 1)
- `ScoringEngine`: Calculate soft preferences (PHASE 2)
- `RankingEngine`: Order by score (PHASE 3)
- `PerformanceTracker`: Track user performance
- `AdaptiveEngine`: Learn and adapt over time

#### 3. **Gamification Engine**
- `ProgressManager`: XP, levels, achievements
- `StreakManager`: Daily streak tracking
- `RewardSystem`: Celebrations and feedback

---

## 📂 Project Structure

```
src/
├── core/                           # Core business logic
│   ├── alarm-engine/
│   │   ├── AlarmScheduler.ts      ✅ IMPLEMENTED
│   │   ├── AlarmTrigger.ts        ✅ IMPLEMENTED
│   │   ├── BackgroundService.ts   📝 TODO
│   │   └── AntiEscapeGuard.ts     📝 TODO
│   │
│   ├── question-engine/
│   │   ├── SelectionPipeline.ts   ✅ IMPLEMENTED
│   │   ├── FilterEngine.ts        ✅ IMPLEMENTED
│   │   ├── ScoringEngine.ts       ✅ IMPLEMENTED
│   │   ├── RankingEngine.ts       ✅ IMPLEMENTED
│   │   ├── PerformanceTracker.ts  ✅ IMPLEMENTED
│   │   └── QuestionPool.ts        📝 TODO
│   │
│   └── gamification/
│       ├── ProgressManager.ts     ✅ IMPLEMENTED
│       ├── StreakManager.ts       ✅ IMPLEMENTED
│       └── RewardSystem.ts        📝 TODO
│
├── data/
│   ├── models/
│   │   └── types.ts               ✅ IMPLEMENTED
│   ├── stores/
│   │   └── StorageManager.ts      ✅ IMPLEMENTED
│   ├── questions.ts               ⚠️  NEEDS EXPANSION
│   └── curriculum.ts              ✅ EXISTS
│
├── hooks/
│   ├── useAlarmEngine.ts          ✅ IMPLEMENTED
│   ├── useQuestionEngine.ts       ✅ IMPLEMENTED
│   ├── useProgress.ts             ✅ IMPLEMENTED
│   ├── useBackground.ts           📝 TODO
│   └── useNotification.ts         📝 TODO
│
├── components/                     ⚠️  NEEDS UPDATE TO USE NEW ENGINES
│   ├── Welcome.tsx
│   ├── GoalSelection.tsx
│   ├── Dashboard.tsx
│   ├── CreateAlarm.tsx
│   ├── AlarmRinging.tsx
│   ├── SolveQuestion.tsx
│   ├── SuccessScreen.tsx
│   └── ProgressOverview.tsx
│
├── constants/
│   └── config.ts                  ✅ IMPLEMENTED
│
└── utils/                          📝 TODO
    ├── time.ts
    ├── sound.ts
    ├── vibration.ts
    └── notification.ts
```

---

## 🎮 User Flow

```
1. Onboarding
   ├── Welcome Screen
   ├── Goal Selection (CAT/GATE/CODING/JEE/NEET)
   └── Permissions (Notifications, Sound)

2. Dashboard
   ├── Next Alarm Display
   ├── Current Streak
   ├── Quick Stats
   ├── Alarm List
   └── Create Alarm Button

3. Alarm Creation
   ├── Time Selection
   ├── Days Selection
   ├── Exam & Subjects
   ├── Difficulty Range
   ├── Advanced Settings
   └── Save

4. Alarm Rings
   ├── Question Appears
   ├── Timer Starts
   ├── User Solves
   ├── Validate Answer
   └── Show Explanation

5. Success Flow
   ├── XP Earned Animation
   ├── Streak Updated
   ├── Achievement Unlock
   └── Return to Dashboard

6. Progress View
   ├── XP & Level
   ├── Streak Calendar
   ├── Subject Breakdown
   ├── Achievements
   └── Analytics Charts
```

---

## 🔑 Key Algorithms

### AI Question Selection

```typescript
FILTER → SCORE → RANK → PICK

1. FILTER (Hard Constraints)
   - Exam type MUST match
   - Subject MUST be in allowed list
   - Topic MUST be in allowed list
   - Difficulty MUST be in range
   - Time MUST be under limit
   - NOT recently asked

2. SCORE (Soft Preferences)
   score = 
     + weakAreaBoost * (1 - accuracy)
     + unseenConceptBonus
     + varietyBonus * daysSincePractice
     + abilityLevelMatch
     + frustrationGuard
     + timeOfDayMatch

3. RANK
   Sort by score descending

4. PICK
   Weighted random from top 5
   weights[i] = exp(-i * 0.5)
```

### XP Calculation

```typescript
xp = baseXP * difficultyMultiplier
   + speedBonus (if fast)
   + firstAttemptBonus
   * streakMultiplier^(min(streak, 30))
```

### Streak Logic

```typescript
if (lastAlarm === today):
  streak unchanged
else if (lastAlarm === yesterday):
  streak++
else:
  streak = 1 (broken)
```

---

## 📱 Mobile-First Design Principles

1. **Large Touch Targets** - Minimum 44x44px
2. **High Contrast** - WCAG AAA compliance
3. **Readable Typography** - Minimum 16px
4. **Single-Hand Usability** - Key actions at bottom
5. **Fast Load** - Under 3s First Contentful Paint
6. **Smooth Animations** - 60fps, hardware accelerated
7. **Offline Support** - PWA with ServiceWorker

---

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Configuration

Edit `src/constants/config.ts` to adjust:
- XP multipliers
- Scoring weights
- Achievement criteria
- Sound settings
- Animation durations

---

## 📊 Data Models

### Alarm
```typescript
interface Alarm {
  id: string;
  time: string;              // HH:MM
  days: DayOfWeek[];
  exam: ExamType;
  subjects: string[];
  difficultyMin/Max: Difficulty;
  focusMode: FocusMode;
  // ... + anti-cheat settings
}
```

### Question
```typescript
interface Question {
  id: string;
  exam: ExamType;
  subject: string;
  topic: string;
  difficulty: Difficulty;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  expectedSolveTime: number;
}
```

### UserProfile
```typescript
interface UserProfile {
  primaryExam: ExamType;
  overallAccuracy: number;
  subjectPerformance: Record<string, SubjectStats>;
  currentStreak: number;
  totalXP: number;
  level: number;
  achievements: Achievement[];
  // ... + analytics
}
```

---

## 🎯 Key Metrics

Track these metrics for success:

1. **Alarm Success Rate** - % dismissed correctly
2. **User Retention** - 7-day, 30-day
3. **Streak Maintenance** - Avg streak length
4. **Learning Progress** - Accuracy improvement
5. **Time to Solve** - Speed trend
6. **Frustration Level** - App close attempts

---

## 🔮 Future Enhancements

### Phase 1 (Core Completion)
- [ ] Background service for alarms
- [ ] Anti-escape guards
- [ ] Notification system
- [ ] Sound & vibration utilities
- [ ] Expand question bank (1000+ questions)

### Phase 2 (PWA)
- [ ] Service Worker
- [ ] Offline support
- [ ] Install prompt
- [ ] Push notifications
- [ ] Background sync

### Phase 3 (Advanced Features)
- [ ] Custom question import
- [ ] Voice reading questions
- [ ] Multiple languages
- [ ] Social features (leaderboard)
- [ ] Study mode (practice without alarm)

### Phase 4 (ML Integration)
- [ ] Question difficulty estimation
- [ ] Personalized calibration
- [ ] Predictive weak area detection
- [ ] Optimal wake time suggestion
- [ ] Content recommendation

### Phase 5 (Monetization)
- [ ] Premium features
- [ ] Subscription tiers
- [ ] Premium question packs
- [ ] Expert explanations
- [ ] Video solutions

---

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Storage**: localStorage (IndexedDB ready)
- **Audio**: Web Audio API + HTML5 Audio
- **PWA**: Service Worker (planned)
- **Charts**: Recharts

---

## 📝 Development Guidelines

### Code Style
- Use TypeScript for type safety
- Functional components + hooks
- Clear separation of concerns
- Comprehensive JSDoc comments
- Descriptive variable names

### Performance
- Lazy load routes
- Memoize expensive calculations
- Debounce user inputs
- Optimize re-renders
- Code splitting

### Testing
- Unit tests for core engines
- Integration tests for flows
- E2E tests for critical paths
- Performance benchmarks

---

## 📄 License

Proprietary - All rights reserved

---

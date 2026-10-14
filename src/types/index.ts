export type SubjectType = 'Physics' | 'Chemistry' | 'Botany' | 'Zoology' | 'General' | 'Other';

export type Weightage = 'High Yield' | 'Medium' | 'Standard';

export type MasteryLevel = 1 | 2 | 3 | 4 | 5;

export interface TopicItem {
  id: string;
  subject: SubjectType;
  unit: string;
  name: string;
  weightage: Weightage;
  masteryLevel: MasteryLevel;
  perceivedConfidence: MasteryLevel; // User's subjective feeling
  verifiedAccuracy: number; // 0 to 100% from practice logs
  lastStudiedDate: string; // ISO date string
  nextReviewDate: string;
  retentionDecayDays: number;
  notesCount: number;
  cardsCount: number;
  totalQuestionsPracticed: number;
  isHighYield: boolean;
  neetUnit?: string;
}

export interface Flashcard {
  id: string;
  topicId: string;
  topicName: string;
  subject: SubjectType;
  front: string;
  back: string;
  mnemonic?: string;
  highYieldFact?: string;
  // SM-2 Spaced Repetition attributes
  interval: number; // days
  repetition: number;
  easeFactor: number; // default 2.5
  dueDate: string; // YYYY-MM-DD
  lastReviewedDate?: string;
  history: Array<{
    date: string;
    grade: number; // 1: Again, 2: Hard, 3: Good, 4: Easy
  }>;
}

export type ErrorType = 
  | 'conceptual_gap' 
  | 'memory_slip' 
  | 'calculation_error' 
  | 'misread_question' 
  | 'time_panic';

export interface PracticeLog {
  id: string;
  date: string; // YYYY-MM-DD
  topicId: string;
  topicName: string;
  subject: SubjectType;
  questionsAttempted: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  timeSpentMinutes: number;
  difficulty: 'Foundational' | 'Moderate' | 'Challenging' | 'Past NEET Paper';
  source?: string; // e.g. "NCERT Exemplar", "PYQ 2023", "Allen Test"
  errorsLog: Array<{
    questionSummary: string;
    errorType: ErrorType;
    correctionTakeaway: string;
  }>;
}

export interface MockTestSubjectScore {
  attempted: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  marksObtained: number; // e.g. correct * 4 - incorrect * 1
  maxMarks: number; // e.g. 180 for physics
  errorBreakdown: Record<ErrorType, number>;
}

export interface MockTest {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  examFormat: 'NEET_720' | 'CUSTOM';
  totalMarks: number;
  score: number;
  percentile?: number;
  accuracy: number;
  timeTakenMinutes: number;
  subjects: {
    Physics?: MockTestSubjectScore;
    Chemistry?: MockTestSubjectScore;
    Botany?: MockTestSubjectScore;
    Zoology?: MockTestSubjectScore;
    General?: MockTestSubjectScore;
  };
  totalNegativeMarks: number;
  analysisNotes: string;
  priorityFixForNextTest: string;
}

export interface DailyHabit {
  id: string;
  name: string;
  category: 'focus' | 'practice' | 'revision' | 'wellness';
  targetPerWeek: number; // e.g. 6 or 7
  completedDates: string[]; // ['2026-10-14', ...]
  iconName?: string;
}

export interface FocusSession {
  id: string;
  date: string;
  subject: SubjectType;
  topicName?: string;
  durationMinutes: number;
  mode: 'pomodoro' | 'stopwatch';
  notes?: string;
  completedAt: string;
}

export interface KnowledgeNote {
  id: string;
  title: string;
  subject: SubjectType;
  topicId?: string;
  content: string;
  highYieldTags: string[];
  formulaList: string[];
  mnemonics: string[];
  updatedAt: string;
}

export interface DailyPlanItem {
  id: string;
  timeSlot: string; // e.g. "06:30 - 08:30"
  task: string;
  subject: SubjectType;
  type: 'concept_study' | 'active_recall' | 'mcq_drill' | 'test_analysis' | 'revision';
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  estimatedMinutes: number;
  actualMinutes?: number;
}

export interface DayReflection {
  date: string; // YYYY-MM-DD
  focusMinutesTotal: number;
  questionsSolvedTotal: number;
  whatWentWell: string;
  whatToChangeTomorrow: string;
  energyLevel: 1 | 2 | 3 | 4 | 5;
}

export interface UserSettings {
  userName: string;
  targetExam: 'NEET' | 'CUSTOM';
  targetScore: number;
  examDate: string; // e.g. '2026-05-03'
  dailyFocusTargetHours: number;
  pomodoroWorkMinutes: number;
  pomodoroBreakMinutes: number;
  audioChimesEnabled: boolean;
  lastBackupDate?: string;
  showPrivacyNotice: boolean;
}

export interface AppState {
  version: number;
  settings: UserSettings;
  topics: TopicItem[];
  flashcards: Flashcard[];
  practiceLogs: PracticeLog[];
  mockTests: MockTest[];
  habits: DailyHabit[];
  focusSessions: FocusSession[];
  notes: KnowledgeNote[];
  dailyPlans: Record<string, DailyPlanItem[]>; // Keyed by YYYY-MM-DD
  reflections: Record<string, DayReflection>;
  userXP: number;
}

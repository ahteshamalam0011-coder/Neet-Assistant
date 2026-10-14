import { AppState, TopicItem, Flashcard, MockTest, PracticeLog } from '../types';

export interface PriorityRecommendation {
  topic: TopicItem;
  priorityScore: number;
  reason: string;
  recommendedAction: 'Solve 30 MCQs' | 'Active Flashcard Drill' | 'Deep Concept Study' | 'Formula Derivation Check';
  expectedMarksGain: number; // e.g. +8 to +16 marks in NEET
}

export interface FamiliarityTrapTopic {
  topic: TopicItem;
  gap: number; // perceivedConfidence vs verifiedAccuracy/mastery gap
  diagnosis: string;
  prescription: string;
}

export interface NegativeMarksDiagnosis {
  totalLostMarks: number;
  primaryCulprit: string;
  percentageByReason: Record<string, number>;
  subjectMostVulnerable: string;
  actionableRemedy: string;
}

export interface DailyOSAnswers {
  // Question 1: What should I study next?
  studyNextRecommendations: PriorityRecommendation[];

  // Question 2: Which topics do I genuinely understand, and which only feel familiar?
  familiarityTraps: FamiliarityTrapTopic[];
  genuineMasteredTopics: TopicItem[];

  // Question 3: What am I forgetting?
  dueFlashcards: Flashcard[];
  decayingTopics: TopicItem[];

  // Question 4: Where am I losing marks, and why?
  negativeMarksDiagnosis: NegativeMarksDiagnosis;

  // Question 5: Which tasks provide greatest improvement for time invested?
  highestRoiTasks: Array<{
    title: string;
    roiScore: number;
    estimatedMinutes: number;
    potentialMarksImpact: string;
    why: string;
  }>;

  // Question 6: How much focused work am I completing?
  focusStats: {
    todayMinutes: number;
    last7DaysMinutes: number;
    dailyAverageHours: number;
    targetHours: number;
    targetCompletionPercent: number;
  };

  // Question 7: Am I improving compared with previous performance?
  improvementMetrics: {
    scoreDeltaLastTwoMocks: number;
    accuracyTrend: number; // e.g. +4.1%
    totalQuestionsLogged: number;
    masteryLevelDistribution: Record<number, number>;
    consistencyScorePercent: number;
  };

  // Question 8: What should I change about tomorrow's plan?
  adaptiveSuggestions: string[];
}

export function computeDailyOSAnswers(
  state: AppState,
  today: string = new Date().toISOString().split('T')[0]
): DailyOSAnswers {
  const { topics, flashcards, mockTests, practiceLogs, focusSessions, settings, habits } = state;

  // 1. WHAT SHOULD I STUDY NEXT?
  // Priority formula:
  // Weightage Multiplier: High Yield = 3.0, Medium = 2.0, Standard = 1.0
  // Mastery Gap: (5 - masteryLevel) * 2
  // Accuracy Deficit: Math.max(0, 85 - verifiedAccuracy) / 10
  // Recency Decay: days since last study / 5
  const priorityList: PriorityRecommendation[] = topics.map(topic => {
    const weightageMult = topic.weightage === 'High Yield' ? 3.0 : topic.weightage === 'Medium' ? 2.0 : 1.0;
    const masteryDeficit = (5 - topic.masteryLevel) * 2.5;
    const accuracyDeficit = Math.max(0, 85 - topic.verifiedAccuracy) * 0.15;

    const daysSince = getDaysBetween(topic.lastStudiedDate, today);
    const decayFactor = Math.min(daysSince * 0.4, 6);

    // Negative marks penalty from mock tests if found
    const subjectMocks = mockTests.length > 0 ? mockTests[0].subjects : {};
    let mockDeficitPenalty = 0;
    if (topic.subject === 'Physics' && subjectMocks.Physics && subjectMocks.Physics.errorBreakdown.calculation_error > 3) {
      mockDeficitPenalty += 2;
    }

    const priorityScore = (weightageMult * 3.5) + masteryDeficit + accuracyDeficit + decayFactor + mockDeficitPenalty;

    let reason = `${topic.weightage} unit with ${topic.verifiedAccuracy}% practice accuracy.`;
    let action: PriorityRecommendation['recommendedAction'] = 'Solve 30 MCQs';
    let expectedMarks = 8;

    if (topic.masteryLevel <= 2) {
      action = 'Deep Concept Study';
      reason = `Foundational gap: Current mastery is Level ${topic.masteryLevel}/5. Unlocks direct 4-mark questions.`;
      expectedMarks = 12;
    } else if (topic.verifiedAccuracy < 65) {
      action = 'Solve 30 MCQs';
      reason = `Practice accuracy is low (${topic.verifiedAccuracy}%). Needs timed application drill to eradicate negative marks.`;
      expectedMarks = 8;
    } else if (daysSince > 7) {
      action = 'Active Flashcard Drill';
      reason = `Retention decay alert: Last reviewed ${daysSince} days ago. Forgetting curve threshold reached.`;
      expectedMarks = 4;
    } else {
      action = 'Formula Derivation Check';
      reason = `High-yield topic at ${topic.verifiedAccuracy}% recall. Polish edge cases for perfection.`;
      expectedMarks = 4;
    }

    return {
      topic,
      priorityScore: Number(priorityScore.toFixed(1)),
      reason,
      recommendedAction: action,
      expectedMarksGain: expectedMarks,
    };
  }).sort((a, b) => b.priorityScore - a.priorityScore);

  // 2. FAMILIARITY TRAPS (Perceived confidence high vs verified practice accuracy low)
  const familiarityTraps: FamiliarityTrapTopic[] = topics
    .filter(t => t.perceivedConfidence >= 3 && (t.perceivedConfidence - t.masteryLevel >= 1 || t.verifiedAccuracy < 68))
    .map(t => {
      const gap = (t.perceivedConfidence * 20) - t.verifiedAccuracy;
      return {
        topic: t,
        gap,
        diagnosis: `You self-rated this ${t.perceivedConfidence}/5 in confidence, but recent accuracy is only ${t.verifiedAccuracy}%. Passive reading creates the false feeling of knowing.`,
        prescription: `Stop re-reading notes. Switch to closed-book Feynman technique or solve 20 blind questions without formula sheets.`,
      };
    })
    .sort((a, b) => b.gap - a.gap);

  const genuineMasteredTopics = topics.filter(t => t.masteryLevel >= 4 && t.verifiedAccuracy >= 85);

  // 3. WHAT AM I FORGETTING?
  const dueFlashcards = flashcards.filter(c => c.dueDate <= today);
  const decayingTopics = topics
    .filter(t => getDaysBetween(t.lastStudiedDate, today) >= 7)
    .sort((a, b) => getDaysBetween(b.lastStudiedDate, today) - getDaysBetween(a.lastStudiedDate, today));

  // 4. WHERE AM I LOSING MARKS AND WHY?
  const negativeMarksDiagnosis: NegativeMarksDiagnosis = computeMockTestDiagnosis(mockTests);

  // 5. HIGHEST ROI TASKS (Marks gained per hour invested)
  const highestRoiTasks = priorityList.slice(0, 3).map(p => ({
    title: `${p.recommendedAction} in ${p.topic.name}`,
    roiScore: Number((p.expectedMarksGain / (p.recommendedAction === 'Deep Concept Study' ? 1.5 : 1.0)).toFixed(1)),
    estimatedMinutes: p.recommendedAction === 'Deep Concept Study' ? 90 : 60,
    potentialMarksImpact: `+${p.expectedMarksGain} Marks`,
    why: p.reason,
  }));

  // 6. HOW MUCH FOCUSED WORK AM I COMPLETING?
  const todaySessions = focusSessions.filter(s => s.date === today);
  const todayMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

  const recentSessions = focusSessions.filter(s => s.date >= sevenDaysAgoStr && s.date <= today);
  const last7DaysMinutes = recentSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const dailyAverageHours = Number(((last7DaysMinutes / 7) / 60).toFixed(1));
  const targetMinutes = (settings.dailyFocusTargetHours || 6) * 60;
  const targetCompletionPercent = Math.min(100, Math.round((todayMinutes / targetMinutes) * 100));

  // 7. AM I IMPROVING COMPARED WITH PREVIOUS PERFORMANCE?
  let scoreDeltaLastTwoMocks = 0;
  if (mockTests.length >= 2) {
    scoreDeltaLastTwoMocks = mockTests[0].score - mockTests[1].score;
  }
  const totalQuestionsLogged = practiceLogs.reduce((acc, l) => acc + l.questionsAttempted, 0);
  const overallCorrect = practiceLogs.reduce((acc, l) => acc + l.correctCount, 0);
  const accuracyTrend = totalQuestionsLogged > 0 ? Math.round((overallCorrect / totalQuestionsLogged) * 100) : 80;

  const masteryDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  topics.forEach(t => {
    masteryDist[t.masteryLevel] = (masteryDist[t.masteryLevel] || 0) + 1;
  });

  // Consistency Score based on habit completion in last 7 days
  let totalHabitSlots = habits.length * 7;
  let habitsCompleted = 0;
  habits.forEach(h => {
    h.completedDates.forEach(d => {
      if (d >= sevenDaysAgoStr && d <= today) habitsCompleted++;
    });
  });
  const consistencyScorePercent = totalHabitSlots > 0 ? Math.min(100, Math.round((habitsCompleted / totalHabitSlots) * 100)) : 85;

  // 8. WHAT SHOULD I CHANGE ABOUT TOMORROW'S PLAN?
  const adaptiveSuggestions: string[] = [];
  if (familiarityTraps.length > 0) {
    adaptiveSuggestions.push(`Replace passive reading of "${familiarityTraps[0].topic.name}" with 25 closed-book test questions to break the familiarity illusion.`);
  }
  if (dueFlashcards.length > 0) {
    adaptiveSuggestions.push(`Complete the ${dueFlashcards.length} due spaced-repetition cards first thing in the morning before starting new theory.`);
  }
  if (negativeMarksDiagnosis.primaryCulprit === 'Calculation Errors') {
    adaptiveSuggestions.push(`In Physics drills tomorrow, write step-by-step scratchpad calculations with explicit metric units to eliminate calculation slips.`);
  } else if (negativeMarksDiagnosis.primaryCulprit === 'Memory Slips') {
    adaptiveSuggestions.push(`Schedule a 30-minute high-yield exception review for Chemistry and Biology before dinner.`);
  }
  if (todayMinutes < targetMinutes * 0.7) {
    adaptiveSuggestions.push(`Split tomorrow into three 90-minute Pomodoro blocks with protected phone-free time to hit the ${settings.dailyFocusTargetHours}h focus goal.`);
  } else {
    adaptiveSuggestions.push(`Strong focus maintained today (${Math.round(todayMinutes / 60)}h). Ensure 7+ hours of sleep tonight for memory consolidation.`);
  }

  return {
    studyNextRecommendations: priorityList.slice(0, 5),
    familiarityTraps: familiarityTraps.slice(0, 4),
    genuineMasteredTopics,
    dueFlashcards,
    decayingTopics: decayingTopics.slice(0, 5),
    negativeMarksDiagnosis,
    highestRoiTasks,
    focusStats: {
      todayMinutes,
      last7DaysMinutes,
      dailyAverageHours,
      targetHours: settings.dailyFocusTargetHours || 6,
      targetCompletionPercent,
    },
    improvementMetrics: {
      scoreDeltaLastTwoMocks,
      accuracyTrend,
      totalQuestionsLogged,
      masteryLevelDistribution: masteryDist,
      consistencyScorePercent,
    },
    adaptiveSuggestions,
  };
}

function computeMockTestDiagnosis(mockTests: MockTest[]): NegativeMarksDiagnosis {
  if (mockTests.length === 0) {
    return {
      totalLostMarks: 0,
      primaryCulprit: 'No mock tests logged yet',
      percentageByReason: {},
      subjectMostVulnerable: 'None',
      actionableRemedy: 'Log your first full-length or sectional mock test to uncover negative marking patterns.',
    };
  }

  const latest = mockTests[0];
  const totalCounts: Record<string, number> = {
    'Conceptual Gaps': 0,
    'Memory Slips': 0,
    'Calculation Errors': 0,
    'Misread Questions': 0,
    'Time Panic': 0,
  };

  let maxSubjectLoss = 0;
  let subjectMostVulnerable = 'Physics';

  Object.entries(latest.subjects || {}).forEach(([subj, data]) => {
    if (!data) return;
    const errors = data.errorBreakdown;
    totalCounts['Conceptual Gaps'] += errors.conceptual_gap || 0;
    totalCounts['Memory Slips'] += errors.memory_slip || 0;
    totalCounts['Calculation Errors'] += errors.calculation_error || 0;
    totalCounts['Misread Questions'] += errors.misread_question || 0;
    totalCounts['Time Panic'] += errors.time_panic || 0;

    const lostInSubject = (data.incorrect || 0) * 5; // NEET: 4 marks missed + 1 negative mark = 5 mark opportunity loss!
    if (lostInSubject > maxSubjectLoss) {
      maxSubjectLoss = lostInSubject;
      subjectMostVulnerable = subj;
    }
  });

  const totalErrors = Object.values(totalCounts).reduce((a, b) => a + b, 0);
  const percentageByReason: Record<string, number> = {};

  let primaryCulprit = 'Calculation Errors';
  let highestCount = -1;

  Object.entries(totalCounts).forEach(([reason, count]) => {
    percentageByReason[reason] = totalErrors > 0 ? Math.round((count / totalErrors) * 100) : 0;
    if (count > highestCount) {
      highestCount = count;
      primaryCulprit = reason;
    }
  });

  let remedy = `Allocate dedicated scratchpad practice for ${subjectMostVulnerable}. Do not rush multi-step algebra.`;
  if (primaryCulprit === 'Conceptual Gaps') {
    remedy = `Review primary textbooks and NCERT line-by-line for weak topics in ${subjectMostVulnerable} before taking another test.`;
  } else if (primaryCulprit === 'Misread Questions') {
    remedy = `Underline words like 'NOT', 'EXCEPT', 'INCORRECT' during the first pass; do not assume question asks for correct statements.`;
  } else if (primaryCulprit === 'Time Panic') {
    remedy = `Follow the 2-Round Test Strategy: Complete all direct Biology & Chemistry recall in Round 1 (80 mins), leaving 90 mins for Physics.`;
  }

  return {
    totalLostMarks: latest.totalNegativeMarks,
    primaryCulprit,
    percentageByReason,
    subjectMostVulnerable,
    actionableRemedy: remedy,
  };
}

function getDaysBetween(d1Str: string, d2Str: string): number {
  try {
    const t1 = new Date(d1Str).getTime();
    const t2 = new Date(d2Str).getTime();
    const diff = Math.floor(Math.abs(t2 - t1) / (1000 * 60 * 60 * 24));
    return isNaN(diff) ? 0 : diff;
  } catch {
    return 0;
  }
}

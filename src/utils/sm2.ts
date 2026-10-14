import { Flashcard } from '../types';

/**
 * SuperMemo SM-2 Spaced Repetition Scheduling Algorithm
 * Grades:
 * 1 = Again (Complete blackout / Fail)
 * 2 = Hard (Struggled, remembered with difficulty)
 * 3 = Good (Accurate recall with slight effort)
 * 4 = Easy (Instant, effortless recall)
 */
export function calculateSM2(
  card: Flashcard,
  grade: 1 | 2 | 3 | 4,
  currentDate: string = new Date().toISOString().split('T')[0]
): Flashcard {
  let { repetition, interval, easeFactor } = card;

  // Grade 1: Failed recall
  if (grade === 1) {
    repetition = 0;
    interval = 1;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  } else {
    // Quality map: grade 2 -> 3, grade 3 -> 4, grade 4 -> 5 on standard SM-2 0-5 scale
    const q = grade === 2 ? 3 : grade === 3 ? 4 : 5;
    
    // Ease factor adjustment
    easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    if (grade === 2) {
      // Hard
      interval = Math.max(1, Math.round(interval * 1.2));
      repetition += 1;
    } else if (repetition === 0) {
      interval = 1;
      repetition = 1;
    } else if (repetition === 1) {
      interval = 6;
      repetition = 2;
    } else {
      const bonus = grade === 4 ? 1.3 : 1.0;
      interval = Math.round(interval * easeFactor * bonus);
      repetition += 1;
    }
  }

  // Calculate next due date
  const now = new Date(currentDate);
  now.setDate(now.getDate() + interval);
  const nextDueDate = now.toISOString().split('T')[0];

  const history = [
    ...(card.history || []),
    {
      date: currentDate,
      grade,
    },
  ];

  return {
    ...card,
    repetition,
    interval,
    easeFactor: Number(easeFactor.toFixed(2)),
    dueDate: nextDueDate,
    lastReviewedDate: currentDate,
    history,
  };
}

export function isCardDue(card: Flashcard, today: string = new Date().toISOString().split('T')[0]): boolean {
  return card.dueDate <= today;
}

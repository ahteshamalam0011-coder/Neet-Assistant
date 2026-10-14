import { AppState, UserSettings } from '../types';
import {
  INITIAL_NEET_TOPICS,
  INITIAL_FLASHCARDS,
  INITIAL_MOCK_TESTS,
  INITIAL_HABITS,
  INITIAL_NOTES,
} from '../data/defaultSyllabus';

const STORAGE_KEY = 'neet_assistant_os_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  userName: 'Scholar',
  targetExam: 'NEET',
  targetScore: 685,
  examDate: '2026-05-03',
  dailyFocusTargetHours: 6.0,
  pomodoroWorkMinutes: 50,
  pomodoroBreakMinutes: 10,
  audioChimesEnabled: true,
  lastBackupDate: undefined,
  showPrivacyNotice: true,
};

export const INITIAL_STATE: AppState = {
  version: 1,
  settings: DEFAULT_SETTINGS,
  topics: INITIAL_NEET_TOPICS,
  flashcards: INITIAL_FLASHCARDS,
  practiceLogs: [
    {
      id: 'log-1',
      date: '2026-10-13',
      topicId: 'bio-genetics-1',
      topicName: 'Principles of Inheritance & Variation',
      subject: 'Botany',
      questionsAttempted: 40,
      correctCount: 36,
      incorrectCount: 4,
      unattemptedCount: 0,
      timeSpentMinutes: 38,
      difficulty: 'Moderate',
      source: 'NEET 10-Yr PYQs',
      errorsLog: [
        {
          questionSummary: 'Test cross ratio with incomplete dominance in Antirrhinum majus',
          errorType: 'conceptual_gap',
          correctionTakeaway: 'Incomplete dominance F2 phenotypic and genotypic ratio is both 1:2:1 (Pink is heterozygous).',
        },
      ],
    },
    {
      id: 'log-2',
      date: '2026-10-12',
      topicId: 'phy-mech-1',
      topicName: 'Rotational Motion',
      subject: 'Physics',
      questionsAttempted: 30,
      correctCount: 16,
      incorrectCount: 12,
      unattemptedCount: 2,
      timeSpentMinutes: 55,
      difficulty: 'Challenging',
      source: 'H.C. Verma + Exemplar',
      errorsLog: [
        {
          questionSummary: 'Torque calculation about instantaneous axis of rotation on inclined plane',
          errorType: 'calculation_error',
          correctionTakeaway: 'Always write torque equation about contact point: τ = I_contact × α = (I_cm + MR²) α.',
        },
        {
          questionSummary: 'Direction of angular momentum in precession',
          errorType: 'memory_slip',
          correctionTakeaway: 'Right hand curl rule for L = r × p; double check vector order.',
        },
      ],
    },
  ],
  mockTests: INITIAL_MOCK_TESTS,
  habits: INITIAL_HABITS,
  focusSessions: [
    {
      id: 'sess-1',
      date: '2026-10-13',
      subject: 'Botany',
      topicName: 'Principles of Inheritance & Variation',
      durationMinutes: 110,
      mode: 'pomodoro',
      notes: 'Reviewed dihybrid cross, epistasis exceptions, linked genes recombination frequency.',
      completedAt: '2026-10-13T11:45:00Z',
    },
    {
      id: 'sess-2',
      date: '2026-10-13',
      subject: 'Physics',
      topicName: 'Modern Physics',
      durationMinutes: 75,
      mode: 'stopwatch',
      notes: 'Photoelectric effect cut-off frequency, Einstein equation and de-Broglie wavelength.',
      completedAt: '2026-10-13T17:30:00Z',
    },
  ],
  notes: INITIAL_NOTES,
  dailyPlans: {
    '2026-10-14': [
      {
        id: 'plan-1',
        timeSlot: '06:30 - 08:00',
        task: 'Active Recall & Spaced Repetition Flashcards (Due queue)',
        subject: 'General',
        type: 'active_recall',
        completed: false,
        priority: 'high',
        estimatedMinutes: 90,
      },
      {
        id: 'plan-2',
        timeSlot: '09:00 - 11:30',
        task: 'High ROI Study: Rotational Motion (Rolling & Moment of Inertia)',
        subject: 'Physics',
        type: 'concept_study',
        completed: false,
        priority: 'high',
        estimatedMinutes: 150,
      },
      {
        id: 'plan-3',
        timeSlot: '14:00 - 16:00',
        task: '50 MCQ Timed Drill: Aldehydes & Ketones Named Reactions',
        subject: 'Chemistry',
        type: 'mcq_drill',
        completed: false,
        priority: 'high',
        estimatedMinutes: 120,
      },
      {
        id: 'plan-4',
        timeSlot: '17:00 - 18:30',
        task: 'Molecular Basis of Inheritance (Overcome Familiarity Trap)',
        subject: 'Botany',
        type: 'concept_study',
        completed: false,
        priority: 'medium',
        estimatedMinutes: 90,
      },
      {
        id: 'plan-5',
        timeSlot: '20:30 - 21:30',
        task: 'Daily Debrief & Error Notebook Reflection',
        subject: 'General',
        type: 'revision',
        completed: false,
        priority: 'low',
        estimatedMinutes: 60,
      },
    ],
  },
  reflections: {
    '2026-10-13': {
      date: '2026-10-13',
      focusMinutesTotal: 185,
      questionsSolvedTotal: 70,
      whatWentWell: 'Completely locked in during Botany morning block; solved 36/40 genetics questions with deep confidence.',
      whatToChangeTomorrow: 'Do not dive straight into difficult Physics numericals without first reviewing the formula sheet and units.',
      energyLevel: 4,
    },
  },
  userXP: 2450,
};

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_STATE,
      ...parsed,
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
      topics: parsed.topics?.length ? parsed.topics : INITIAL_NEET_TOPICS,
      flashcards: parsed.flashcards?.length ? parsed.flashcards : INITIAL_FLASHCARDS,
      mockTests: parsed.mockTests?.length ? parsed.mockTests : INITIAL_MOCK_TESTS,
      habits: parsed.habits?.length ? parsed.habits : INITIAL_HABITS,
    };
  } catch (err) {
    console.error('Failed to parse local state, falling back to default:', err);
    return INITIAL_STATE;
  }
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save local state:', err);
  }
}

export function exportPlainJsonBackup(state: AppState): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `neet_assistant_backup_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Encrypted export using standard Web Crypto API (AES-GCM with PBKDF2 key derivation)
 */
export async function exportEncryptedBackup(state: AppState, passphrase: string): Promise<void> {
  const enc = new TextEncoder();
  const rawData = enc.encode(JSON.stringify(state));
  
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const key = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const encryptedContent = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    rawData
  );

  const payload = {
    version: 1,
    type: 'NEET_ASSISTANT_ENCRYPTED_BACKUP',
    createdAt: new Date().toISOString(),
    salt: Array.from(salt),
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(encryptedContent)),
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `neet_assistant_vault_${dateStr}.enc.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Decrypts an encrypted backup using user's passphrase
 */
export async function decryptBackup(jsonString: string, passphrase: string): Promise<AppState> {
  const payload = JSON.parse(jsonString);
  if (payload.type !== 'NEET_ASSISTANT_ENCRYPTED_BACKUP') {
    throw new Error('Invalid encrypted backup file format.');
  }

  const enc = new TextEncoder();
  const salt = new Uint8Array(payload.salt);
  const iv = new Uint8Array(payload.iv);
  const ciphertext = new Uint8Array(payload.data);

  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const key = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  const dec = new TextDecoder();
  const plainText = dec.decode(decrypted);
  return JSON.parse(plainText) as AppState;
}

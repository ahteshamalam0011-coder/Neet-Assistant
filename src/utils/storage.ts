import { AppState, UserSettings } from '../types';

const STORAGE_KEY = 'neet_assistant_os_v2';

export const DEFAULT_SETTINGS: UserSettings = {
  userName: 'Scholar',
  targetExam: 'NEET',
  targetScore: 680,
  examDate: '2026-05-03',
  dailyFocusTargetHours: 6.0,
  pomodoroWorkMinutes: 50,
  pomodoroBreakMinutes: 10,
  audioChimesEnabled: true,
  lastBackupDate: undefined,
  showPrivacyNotice: true,
};

export const FRESH_INITIAL_STATE: AppState = {
  version: 2,
  settings: DEFAULT_SETTINGS,
  topics: [],
  flashcards: [],
  practiceLogs: [],
  mockTests: [],
  habits: [
    {
      id: 'habit-1',
      name: 'Deep Focus Work (≥ 4.5 hrs)',
      category: 'focus',
      targetPerWeek: 6,
      completedDates: [],
    },
    {
      id: 'habit-2',
      name: 'Active Recall / Flashcards',
      category: 'revision',
      targetPerWeek: 7,
      completedDates: [],
    },
    {
      id: 'habit-3',
      name: '50+ High-Yield Questions Solved',
      category: 'practice',
      targetPerWeek: 6,
      completedDates: [],
    },
    {
      id: 'habit-4',
      name: 'Error Notebook Review',
      category: 'revision',
      targetPerWeek: 6,
      completedDates: [],
    },
    {
      id: 'habit-5',
      name: 'Restorative Sleep (≥ 7 hrs)',
      category: 'wellness',
      targetPerWeek: 7,
      completedDates: [],
    },
  ],
  focusSessions: [],
  notes: [],
  dailyPlans: {},
  reflections: {},
  userXP: 0,
};

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Clear out any old v1 demo state from previous sessions to ensure a completely fresh start
      localStorage.removeItem('neet_assistant_os_v1');
      return FRESH_INITIAL_STATE;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.version || parsed.version < 2) {
      return FRESH_INITIAL_STATE;
    }
    return {
      ...FRESH_INITIAL_STATE,
      ...parsed,
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
      topics: parsed.topics || [],
      flashcards: parsed.flashcards || [],
      practiceLogs: parsed.practiceLogs || [],
      mockTests: parsed.mockTests || [],
      habits: parsed.habits || FRESH_INITIAL_STATE.habits,
      focusSessions: parsed.focusSessions || [],
      notes: parsed.notes || [],
      dailyPlans: parsed.dailyPlans || {},
      reflections: parsed.reflections || {},
      userXP: typeof parsed.userXP === 'number' ? parsed.userXP : 0,
    };
  } catch (err) {
    console.error('Failed to parse local state, falling back to fresh state:', err);
    return FRESH_INITIAL_STATE;
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
    version: 2,
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

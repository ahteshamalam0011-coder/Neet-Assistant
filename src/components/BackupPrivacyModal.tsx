import React, { useState } from 'react';
import { AppState } from '../types';
import {
  exportPlainJsonBackup,
  exportEncryptedBackup,
  decryptBackup,
  FRESH_INITIAL_STATE,
} from '../utils/storage';
import { INITIAL_NEET_TOPICS } from '../data/defaultSyllabus';
import {
  ShieldCheck,
  Download,
  Upload,
  Lock,
  AlertTriangle,
  X,
  FileCheck,
  Check,
  RefreshCw,
} from 'lucide-react';

interface BackupPrivacyModalProps {
  state: AppState;
  isOpen: boolean;
  onClose: () => void;
  onRestoreState: (restored: AppState) => void;
}

export const BackupPrivacyModal: React.FC<BackupPrivacyModalProps> = ({
  state,
  isOpen,
  onClose,
  onRestoreState,
}) => {
  const [encryptPassphrase, setEncryptPassphrase] = useState('');
  const [decryptPassphrase, setDecryptPassphrase] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [isExportingEncrypted, setIsExportingEncrypted] = useState(false);

  if (!isOpen) return null;

  const handlePlainExport = () => {
    try {
      exportPlainJsonBackup(state);
      setStatusMessage({ text: 'Plain JSON backup downloaded successfully.' });
    } catch (err: any) {
      setStatusMessage({ text: `Export failed: ${err.message}`, error: true });
    }
  };

  const handleEncryptedExport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!encryptPassphrase || encryptPassphrase.length < 6) {
      setStatusMessage({ text: 'Passphrase must be at least 6 characters long.', error: true });
      return;
    }
    try {
      setIsExportingEncrypted(true);
      await exportEncryptedBackup(state, encryptPassphrase);
      setStatusMessage({ text: 'AES-GCM 256-bit encrypted backup vault downloaded.' });
      setEncryptPassphrase('');
    } catch (err: any) {
      setStatusMessage({ text: `Encryption failed: ${err.message}`, error: true });
    } finally {
      setIsExportingEncrypted(false);
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (parsed.type === 'NEET_ASSISTANT_ENCRYPTED_BACKUP') {
          if (!decryptPassphrase) {
            setStatusMessage({
              text: 'This file is encrypted. Enter your passphrase in the field below before selecting the file.',
              error: true,
            });
            return;
          }
          const decrypted = await decryptBackup(text, decryptPassphrase);
          onRestoreState(decrypted);
          setStatusMessage({ text: 'Encrypted backup verified & restored into local database!' });
          setDecryptPassphrase('');
        } else if (parsed.topics && parsed.settings) {
          onRestoreState(parsed);
          setStatusMessage({ text: 'Plain backup restored successfully!' });
        } else {
          throw new Error('Unrecognized backup format.');
        }
      } catch (err: any) {
        setStatusMessage({ text: `Import error: ${err.message}`, error: true });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetToFresh = () => {
    if (window.confirm('Clear all local data and start completely fresh? This cannot be undone unless you have a backup.')) {
      onRestoreState(FRESH_INITIAL_STATE);
      setStatusMessage({ text: 'All data cleared. Starting fresh canvas!' });
    }
  };

  const handleLoadNeetTemplate = () => {
    if (window.confirm('Populate syllabus with standard NEET UG topics (Physics, Chemistry, Botany, Zoology)?')) {
      onRestoreState({
        ...state,
        topics: INITIAL_NEET_TOPICS,
      });
      setStatusMessage({ text: 'NEET UG Syllabus topics loaded into your study OS.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Local Vault & Privacy Assurance</h3>
              <div className="text-[11px] text-emerald-400 font-mono">100% Client-Side · Zero Telemetry</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status notice */}
        {statusMessage && (
          <div
            className={`p-3 rounded-lg text-xs font-mono flex items-center gap-2 ${
              statusMessage.error
                ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {statusMessage.error ? <AlertTriangle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Privacy Reality Notice */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Important Data Storage Notice</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Your records live purely inside this browser's local sandbox. No company, cloud, or third-party ever receives your notes, test scores, or study schedules.
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
            ⚠️ Clearing browser data, using private/incognito windows, or device crashes can wipe browser storage. Export a periodic backup to your drive to guarantee safety.
          </p>
        </div>

        {/* Export Options */}
        <div className="space-y-4">
          <h4 className="text-xs font-mono uppercase text-slate-400 font-semibold tracking-wider">
            Backup & Export
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Plain JSON Export */}
            <button
              onClick={handlePlainExport}
              className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 transition-colors text-left space-y-1.5 group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                  Plain JSON Export
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Human-readable complete study snapshot. Easily inspected in text editors.
              </p>
            </button>

            {/* Encrypted Export Form */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>AES-GCM Encrypted Vault</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Encrypted via Web Crypto API with your private passphrase.
              </p>
              <form onSubmit={handleEncryptedExport} className="space-y-2 pt-1">
                <input
                  type="password"
                  placeholder="Secret passphrase (≥6 chars)"
                  value={encryptPassphrase}
                  onChange={(e) => setEncryptPassphrase(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={isExportingEncrypted}
                  className="w-full py-1 text-[11px] font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded transition-colors disabled:opacity-50"
                >
                  {isExportingEncrypted ? 'Encrypting...' : 'Export Encrypted'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Restore Section */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <h4 className="text-xs font-mono uppercase text-slate-400 font-semibold tracking-wider">
            Restore / Import Data
          </h4>

          <div className="space-y-2">
            <input
              type="password"
              placeholder="Passphrase (only if importing .enc.json)"
              value={decryptPassphrase}
              onChange={(e) => setDecryptPassphrase(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />

            <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-700 hover:border-emerald-400 cursor-pointer bg-slate-950 transition-colors text-xs text-slate-300">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Select Backup File (.json or .enc.json)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Danger zone / Reset default */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <button
              onClick={handleResetToFresh}
              className="text-slate-500 hover:text-rose-400 flex items-center gap-1.5 transition-colors font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear All & Start Fresh</span>
            </button>

            <button
              onClick={handleLoadNeetTemplate}
              className="text-slate-400 hover:text-emerald-400 flex items-center gap-1.5 transition-colors font-medium"
            >
              <span>Load NEET Syllabus</span>
            </button>
          </div>

          <span className="font-mono text-[11px]">Version 2.0.0 · Local-First</span>
        </div>
      </div>
    </div>
  );
};

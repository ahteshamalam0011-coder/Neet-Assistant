import React, { useState, useEffect } from 'react';
import { FocusSession, SubjectType } from '../types';
import { playChime } from '../utils/audio';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface FocusTimerProps {
  onSaveSession: (session: FocusSession) => void;
  onAddXP: (xp: number) => void;
  soundEnabled: boolean;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
  onSaveSession,
  onAddXP,
  soundEnabled,
}) => {
  const [mode, setMode] = useState<'pomodoro' | 'stopwatch'>('pomodoro');
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectType>('Physics');
  const [topicName, setTopicName] = useState('');
  const [workMinutes, setWorkMinutes] = useState(50);
  const [secondsRemaining, setSecondsRemaining] = useState(50 * 60);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionNotes, setSessionNotes] = useState('');
  const [audioOn, setAudioOn] = useState(soundEnabled);

  // Timer interval effect
  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        if (mode === 'pomodoro') {
          setSecondsRemaining((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              setIsRunning(false);
              if (audioOn) playChime('focus_complete');
              handleFinishSession(workMinutes);
              return 0;
            }
            return prev - 1;
          });
        } else {
          setElapsedSeconds((prev) => prev + 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, mode, workMinutes, audioOn]);

  const handleStart = () => {
    if (!isRunning && audioOn) playChime('focus_start');
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (mode === 'pomodoro') {
      setSecondsRemaining(workMinutes * 60);
    } else {
      setElapsedSeconds(0);
    }
  };

  const handleFinishSession = (durationMins?: number) => {
    const mins = durationMins || Math.max(1, Math.round(elapsedSeconds / 60));
    const session: FocusSession = {
      id: `session-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      subject: selectedSubject,
      topicName: topicName.trim() || undefined,
      durationMinutes: mins,
      mode,
      notes: sessionNotes.trim() || undefined,
      completedAt: new Date().toISOString(),
    };

    onSaveSession(session);
    // +10 XP per 15 min
    const xpReward = Math.round((mins / 15) * 10);
    onAddXP(Math.max(10, xpReward));

    setIsRunning(false);
    setElapsedSeconds(0);
    if (mode === 'pomodoro') {
      setSecondsRemaining(workMinutes * 60);
    }
    setTopicName('');
    setSessionNotes('');
  };

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const displayTime = mode === 'pomodoro' ? formatTime(secondsRemaining) : formatTime(elapsedSeconds);
  const pomodoroProgress = mode === 'pomodoro' ? Math.round(((workMinutes * 60 - secondsRemaining) / (workMinutes * 60)) * 100) : 100;

  return (
    <div className="bg-slate-900/40 rounded-xl border border-slate-800 p-6 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Deep Work Focus Engine</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Single-tasking environment without distractions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode switch */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => {
                setIsRunning(false);
                setMode('pomodoro');
                setSecondsRemaining(workMinutes * 60);
              }}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                mode === 'pomodoro' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pomodoro
            </button>
            <button
              onClick={() => {
                setIsRunning(false);
                setMode('stopwatch');
                setElapsedSeconds(0);
              }}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                mode === 'stopwatch' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Stopwatch
            </button>
          </div>

          <button
            onClick={() => setAudioOn(!audioOn)}
            className="p-1.5 text-slate-400 hover:text-white rounded border border-slate-800"
            title={audioOn ? 'Mute Chimes' : 'Enable Chimes'}
          >
            {audioOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Target Subject & Topic Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Subject Focus</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value as SubjectType)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Botany">Botany</option>
            <option value="Zoology">Zoology</option>
            <option value="General">General Review</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Topic / Drill Name</label>
          <input
            type="text"
            placeholder="e.g. Ray Optics Numerical Problems"
            value={topicName}
            onChange={(e) => setTopicName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Large Digital Display */}
      <div className="py-8 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center justify-center space-y-4 relative overflow-hidden">
        {mode === 'pomodoro' && (
          <div
            className="absolute bottom-0 left-0 h-1 bg-emerald-500 transition-all duration-300"
            style={{ width: `${pomodoroProgress}%` }}
          />
        )}

        <div className="text-5xl sm:text-7xl font-bold font-mono tracking-tight text-white tabular-nums">
          {displayTime}
        </div>

        <div className="text-xs text-slate-400 font-mono">
          {mode === 'pomodoro' ? `${workMinutes} min Focus Interval` : 'Open Stopwatch Session'}
        </div>

        {/* Timer Controls */}
        <div className="flex items-center gap-3 pt-2">
          {isRunning ? (
            <button
              onClick={handlePause}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <Pause className="w-4 h-4" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Flow</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-800"
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {(mode === 'stopwatch' || secondsRemaining < workMinutes * 60) && (
            <button
              onClick={() => handleFinishSession()}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 border border-slate-700"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Log Session</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

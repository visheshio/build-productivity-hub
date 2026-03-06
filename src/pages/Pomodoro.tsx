import { useState, useEffect, useRef, useCallback } from 'react';
import { Timer, Play, Pause, RotateCcw, Coffee, Brain, Clock, Flame, Volume2, VolumeX, Trash2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';

type TimerMode = 'work' | 'break';
type TimerState = 'idle' | 'running' | 'paused';

const PRESETS = [
  { label: '25 / 5', work: 25, break: 5 },
  { label: '50 / 10', work: 50, break: 10 },
  { label: '90 / 20', work: 90, break: 20 },
];

export function Pomodoro() {
  const { theme } = useTheme();
  const { state, dispatch } = useApp();
  const isDark = theme === 'dark';

  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [mode, setMode] = useState<TimerMode>('work');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const totalSeconds = mode === 'work' ? workMinutes * 60 : breakMinutes * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  const todaySessions = state.pomodoroSessions.filter(
    (s) => s.type === 'work' && format(new Date(s.completedAt), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );
  const todayFocusMinutes = todaySessions.reduce((sum, s) => sum + Math.round(s.duration / 60), 0);

  const stopNoise = useCallback(() => {
    if (noiseNodeRef.current) {
      try { noiseNodeRef.current.stop(); } catch {}
      noiseNodeRef.current = null;
    }
  }, []);

  const startNoise = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = audioContextRef.current || new AudioContext();
      audioContextRef.current = ctx;
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      // Brown noise for ambient sound
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }
      stopNoise();
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const gain = ctx.createGain();
      gain.gain.value = 0.15;
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start();
      noiseNodeRef.current = source;
    } catch {}
  }, [soundEnabled, stopNoise]);

  useEffect(() => {
    if (timerState === 'running' && soundEnabled) {
      startNoise();
    } else {
      stopNoise();
    }
    return () => stopNoise();
  }, [timerState, soundEnabled, startNoise, stopNoise]);

  useEffect(() => {
    if (timerState === 'running') {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer completed
            if (intervalRef.current) clearInterval(intervalRef.current);
            const selectedTask = state.todos.find((t) => t.id === selectedTaskId);
            dispatch({
              type: 'ADD_POMODORO_SESSION',
              payload: {
                taskId: selectedTaskId,
                taskTitle: selectedTask?.title || 'Free Focus',
                duration: mode === 'work' ? workMinutes * 60 : breakMinutes * 60,
                breakDuration: breakMinutes * 60,
                completedAt: new Date(),
                type: mode,
              },
            });
            // Play completion sound
            try {
              const ctx = audioContextRef.current || new AudioContext();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.value = 800;
              gain.gain.value = 0.3;
              gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 0.5);
            } catch {}
            // Switch mode
            const nextMode = mode === 'work' ? 'break' : 'work';
            setMode(nextMode);
            setTimerState('idle');
            return nextMode === 'work' ? workMinutes * 60 : breakMinutes * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerState, mode, workMinutes, breakMinutes, selectedTaskId, state.todos, dispatch]);

  const handleStart = () => setTimerState('running');
  const handlePause = () => setTimerState('paused');
  const handleReset = () => {
    setTimerState('idle');
    setTimeLeft(mode === 'work' ? workMinutes * 60 : breakMinutes * 60);
    stopNoise();
  };

  const applyPreset = (work: number, br: number) => {
    if (timerState !== 'idle') return;
    setWorkMinutes(work);
    setBreakMinutes(br);
    setTimeLeft(mode === 'work' ? work * 60 : br * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const cardBg = isDark ? 'bg-gray-900/60 border-gray-800' : 'bg-white/80 border-slate-200';
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-slate-500';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${textPrimary}`}>Pomodoro Timer</h1>
          <p className={`text-sm mt-1 ${textSecondary}`}>Stay focused with timed work sessions</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isDark ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
            <Flame className="h-4 w-4" />
            <span className="text-sm font-semibold">{todaySessions.length} sessions</span>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isDark ? 'bg-violet-500/10 text-violet-400' : 'bg-violet-50 text-violet-600'}`}>
            <Clock className="h-4 w-4" />
            <span className="text-sm font-semibold">{todayFocusMinutes} min focus</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer */}
        <div className="lg:col-span-2">
          <div className={`rounded-2xl border p-8 ${cardBg} backdrop-blur-sm`}>
            {/* Mode tabs */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <button
                onClick={() => { if (timerState === 'idle') { setMode('work'); setTimeLeft(workMinutes * 60); } }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  mode === 'work'
                    ? 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg'
                    : isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Brain className="h-4 w-4" />
                Focus
              </button>
              <button
                onClick={() => { if (timerState === 'idle') { setMode('break'); setTimeLeft(breakMinutes * 60); } }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  mode === 'break'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                    : isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Coffee className="h-4 w-4" />
                Break
              </button>
            </div>

            {/* Circular timer */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <svg width="280" height="280" className="transform -rotate-90">
                  <circle cx="140" cy="140" r="120" stroke={isDark ? '#1f2937' : '#e2e8f0'} strokeWidth="8" fill="none" />
                  <circle
                    cx="140" cy="140" r="120"
                    stroke={mode === 'work' ? '#8b5cf6' : '#10b981'}
                    strokeWidth="8" fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-5xl font-bold font-mono ${textPrimary}`}>
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </span>
                  <span className={`text-sm mt-2 font-medium ${textSecondary}`}>
                    {mode === 'work' ? 'Focus Time' : 'Break Time'}
                  </span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              {timerState === 'running' ? (
                <button onClick={handlePause} className="h-14 w-14 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <Pause className="h-6 w-6" />
                </button>
              ) : (
                <button onClick={handleStart} className={`h-14 w-14 rounded-full text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 ${
                  mode === 'work' ? 'bg-gradient-to-r from-violet-500 to-indigo-600' : 'bg-gradient-to-r from-emerald-500 to-teal-600'
                }`}>
                  <Play className="h-6 w-6 ml-0.5" />
                </button>
              )}
              <button onClick={handleReset} className={`h-12 w-12 rounded-full flex items-center justify-center transition-all hover:scale-105 ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                <RotateCcw className="h-5 w-5" />
              </button>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`h-12 w-12 rounded-full flex items-center justify-center transition-all hover:scale-105 ${
                  soundEnabled
                    ? 'bg-violet-500/20 text-violet-400'
                    : isDark ? 'bg-gray-800 text-gray-500 hover:bg-gray-700' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}
              >
                {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </button>
            </div>

            {/* Presets */}
            <div className={`mt-6 pt-6 border-t ${isDark ? 'border-gray-800' : 'border-slate-100'}`}>
              <p className={`text-xs font-semibold uppercase tracking-wider mb-3 text-center ${textSecondary}`}>Presets</p>
              <div className="flex justify-center gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => applyPreset(p.work, p.break)}
                    disabled={timerState !== 'idle'}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      workMinutes === p.work && breakMinutes === p.break
                        ? 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-md'
                        : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Task selector */}
            <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-800' : 'border-slate-100'}`}>
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 text-center ${textSecondary}`}>Link to Task</label>
              <select
                value={selectedTaskId || ''}
                onChange={(e) => setSelectedTaskId(e.target.value || null)}
                disabled={timerState !== 'idle'}
                className={`w-full max-w-xs mx-auto block px-3 py-2 rounded-lg text-sm border transition-colors ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-gray-200'
                    : 'bg-white border-slate-200 text-slate-700'
                } disabled:opacity-50`}
              >
                <option value="">Free Focus (no task)</option>
                {state.todos.filter((t) => t.status !== 'completed').map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Session History */}
        <div className="space-y-4">
          <div className={`rounded-2xl border p-5 ${cardBg} backdrop-blur-sm`}>
            <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${textSecondary}`}>Today's Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-xl ${isDark ? 'bg-violet-500/10' : 'bg-violet-50'}`}>
                <p className={`text-2xl font-bold ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>{todaySessions.length}</p>
                <p className={`text-xs ${textSecondary}`}>Sessions</p>
              </div>
              <div className={`p-3 rounded-xl ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                <p className={`text-2xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{todayFocusMinutes}</p>
                <p className={`text-xs ${textSecondary}`}>Minutes</p>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl border p-5 ${cardBg} backdrop-blur-sm`}>
            <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${textSecondary}`}>Recent Sessions</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {state.pomodoroSessions.length === 0 ? (
                <p className={`text-sm text-center py-4 ${textSecondary}`}>No sessions yet. Start your first focus session!</p>
              ) : (
                [...state.pomodoroSessions].reverse().slice(0, 10).map((session) => (
                  <div key={session.id} className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-slate-50'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                        session.type === 'work'
                          ? isDark ? 'bg-violet-500/20 text-violet-400' : 'bg-violet-100 text-violet-600'
                          : isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        {session.type === 'work' ? <Brain className="h-4 w-4" /> : <Coffee className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${textPrimary}`}>{session.taskTitle}</p>
                        <p className={`text-xs ${textSecondary}`}>{format(new Date(session.completedAt), 'MMM d, h:mm a')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono ${textSecondary}`}>{Math.round(session.duration / 60)}m</span>
                      <button
                        onClick={() => dispatch({ type: 'DELETE_POMODORO_SESSION', payload: session.id })}
                        className={`p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'hover:bg-gray-700 text-gray-500' : 'hover:bg-slate-200 text-slate-400'}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pomodoro;

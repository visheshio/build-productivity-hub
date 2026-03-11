import { useEffect } from 'react';
import { Lock, Star } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ACHIEVEMENT_CHECKERS: Record<string, (state: any) => boolean> = {
  streak_master: (s) => s.habits.some((h: any) => h.streakCount >= 30),
  task_crusher: (s) => s.todos.filter((t: any) => t.status === 'completed').length >= 100,
  budget_pro: () => false, // complex - simplified
  early_bird: () => false, // needs time check history
  note_taker: (s) => s.notes.length >= 50,
  focus_champion: (s) => s.pomodoroSessions.filter((p: any) => p.type === 'work').length >= 50,
  goal_setter: (s) => s.goals.filter((g: any) => g.progress >= 100).length >= 5,
  journal_keeper: (s) => s.journalEntries.length >= 30,
};

export function Achievements() {
  const { theme } = useTheme();
  const { state, dispatch } = useApp();
  const isDark = theme === 'dark';

  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-slate-500';
  const cardBg = isDark ? 'bg-gray-900/60 border-gray-800' : 'bg-white/80 border-slate-200';

  // Check achievements
  useEffect(() => {
    state.achievements.forEach((ach) => {
      if (ach.unlockedAt) return;
      const checker = ACHIEVEMENT_CHECKERS[ach.type];
      if (checker && checker(state)) {
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: ach.type });
        toast.success(`🏆 Achievement Unlocked: ${ach.title}!`, { duration: 5000 });
      }
    });
  }, [state.todos, state.notes, state.habits, state.pomodoroSessions, state.goals, state.journalEntries]);

  const unlocked = state.achievements.filter((a) => a.unlockedAt);
  const locked = state.achievements.filter((a) => !a.unlockedAt);

  // Progress for each achievement
  const getProgress = (type: string): { current: number; target: number } => {
    switch (type) {
      case 'streak_master': return { current: Math.max(0, ...state.habits.map((h) => h.streakCount)), target: 30 };
      case 'task_crusher': return { current: state.todos.filter((t) => t.status === 'completed').length, target: 100 };
      case 'budget_pro': return { current: 0, target: 3 };
      case 'early_bird': return { current: 0, target: 5 };
      case 'note_taker': return { current: state.notes.length, target: 50 };
      case 'focus_champion': return { current: state.pomodoroSessions.filter((p) => p.type === 'work').length, target: 50 };
      case 'goal_setter': return { current: state.goals.filter((g) => g.progress >= 100).length, target: 5 };
      case 'journal_keeper': return { current: state.journalEntries.length, target: 30 };
      default: return { current: 0, target: 1 };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${textPrimary}`}>Achievements</h1>
        <p className={`text-sm mt-1 ${textSecondary}`}>Track your milestones and unlock badges</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className={`rounded-2xl border p-4 ${cardBg} backdrop-blur-sm`}>
          <p className={`text-xs font-semibold uppercase ${textSecondary}`}>Unlocked</p>
          <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{unlocked.length}</p>
        </div>
        <div className={`rounded-2xl border p-4 ${cardBg} backdrop-blur-sm`}>
          <p className={`text-xs font-semibold uppercase ${textSecondary}`}>Locked</p>
          <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>{locked.length}</p>
        </div>
        <div className={`rounded-2xl border p-4 ${cardBg} backdrop-blur-sm`}>
          <p className={`text-xs font-semibold uppercase ${textSecondary}`}>Completion</p>
          <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>
            {state.achievements.length > 0 ? Math.round((unlocked.length / state.achievements.length) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Unlocked */}
      {unlocked.length > 0 && (
        <div>
          <h2 className={`text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 ${textSecondary}`}>
            <Star className="h-4 w-4 text-amber-500" /> Unlocked
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {unlocked.map((ach) => (
              <div key={ach.id} className={`rounded-2xl border p-5 ${cardBg} backdrop-blur-sm relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full" />
                <span className="text-4xl mb-3 block">{ach.icon}</span>
                <h3 className={`text-base font-bold ${textPrimary}`}>{ach.title}</h3>
                <p className={`text-sm mt-1 ${textSecondary}`}>{ach.description}</p>
                <p className={`text-xs mt-2 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                  🏆 Unlocked {ach.unlockedAt ? format(new Date(ach.unlockedAt), 'MMM d, yyyy') : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <div>
          <h2 className={`text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 ${textSecondary}`}>
            <Lock className="h-4 w-4" /> Locked
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {locked.map((ach) => {
              const prog = getProgress(ach.type);
              const percent = Math.min(100, Math.round((prog.current / prog.target) * 100));
              return (
                <div key={ach.id} className={`rounded-2xl border p-5 ${cardBg} backdrop-blur-sm opacity-70 hover:opacity-100 transition-opacity`}>
                  <span className="text-4xl mb-3 block grayscale">{ach.icon}</span>
                  <h3 className={`text-base font-bold ${textPrimary}`}>{ach.title}</h3>
                  <p className={`text-sm mt-1 ${textSecondary}`}>{ach.description}</p>
                  <p className={`text-xs mt-1 ${textSecondary}`}>{ach.criteria}</p>
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs ${textSecondary}`}>{prog.current} / {prog.target}</span>
                      <span className={`text-xs font-bold ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>{percent}%</span>
                    </div>
                    <div className={`h-1.5 rounded-full ${isDark ? 'bg-gray-800' : 'bg-slate-100'}`}>
                      <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 transition-all" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Achievements;

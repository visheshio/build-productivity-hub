import { useEffect } from 'react';
import { 
  Lock, ArrowRight, CheckCircle2, RefreshCw, Check, Sparkles 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
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
  const { state, dispatch } = useApp();

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
  
  const dailyChallenges = state.dailyChallenges || [];

  // Determine user level based on XP (mock calculation for UI)
  const totalTasks = state.todos.filter((t) => t.status === 'completed').length;
  const userXP = totalTasks * 50; 
  const currentLevel = Math.floor(userXP / 1000) + 1;
  const xpCurrentLevel = userXP % 1000;
  const xpRequiredForNext = 1000;
  const levelProgress = Math.min(100, (xpCurrentLevel / xpRequiredForNext) * 100);

  return (
    <div className="bg-surface text-on-surface selection:bg-primary-container selection:text-on-primary">
      <main className="py-2 space-y-16">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-surface-container-low p-8 md:p-12 shadow-sm border border-white/50">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-secondary-container/20 rounded-full blur-3xl"></div>
          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            
            <div className="order-2 md:order-1">
              <span className="label-md uppercase tracking-[0.2em] text-primary font-bold text-xs mb-4 block">Current Ranking</span>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-on-surface mb-6">
                Level {currentLevel}
              </h1>
              <p className="text-on-surface-variant text-lg leading-relaxed mb-8 max-w-md">
                You're making great progress! Keep completing tasks, habits, and sessions to unlock more titles and rewards.
              </p>
              
              {/* Focus Glass Widget / Progress */}
              <div className="glass-card beveled-glass rounded-3xl p-6 shadow-xl shadow-blue-900/5 bg-white/70 backdrop-blur-xl">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Progress to Level {currentLevel + 1}</p>
                    <p className="text-2xl font-bold text-on-surface">{xpCurrentLevel} / {xpRequiredForNext} XP</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{Math.round(levelProgress)}% Complete</span>
                  </div>
                </div>
                <div className="h-4 w-full bg-surface-container rounded-full overflow-hidden p-1">
                  <div className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full relative overflow-hidden transition-all duration-1000" style={{ width: `${levelProgress}%` }}>
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2 flex justify-center items-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 blur-[100px] group-hover:bg-primary/30 transition-colors duration-500"></div>
                <img 
                  alt="3D Gold Trophy" 
                  className="w-64 h-64 md:w-80 md:h-80 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKJVu8qSDkPyELEnOa078hnm8gzcsCkFZGwGYyfkVk5BLgZeCrUVIReZc_3q7UWjWv-n53i95-nindOm_wbb_RyUgAHXgmlVzobTKbzpCP-EvcB5adokf-gwpz2S0cAZtO0dBnJVxsE8CiPc4GtTVIoKQzQE5rZYsE-2O9Ev8D0998rTJ59t4xP2pKSgojiLUpFkFQAu-1g85_L13OAjN7IrJ2g3snBYzwdXi69ce2xreEKIxVWuS6oagT2VV9ULOZmjWC1dZxqppi"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Achievements Bento Grid */}
        <section>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-on-surface">Achievements</h2>
              <p className="text-on-surface-variant mt-1">Milestones on your journey to peak productivity.</p>
            </div>
            <button className="text-primary font-bold text-sm flex items-center group">
              View All Gallery 
              <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Unlocked Achievements */}
            {unlocked.map((ach) => (
              <div key={ach.id} className="glass-card bg-white/70 backdrop-blur-xl beveled-glass p-8 rounded-3xl flex flex-col items-center text-center shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-20 h-20 mb-6 relative flex justify-center items-center">
                  <div className="absolute inset-0 bg-blue-400/20 blur-xl rounded-full"></div>
                  <span className="text-5xl drop-shadow-lg z-10 inline-block">{ach.icon}</span>
                </div>
                <h3 className="font-bold text-on-surface text-lg">{ach.title}</h3>
                <p className="text-xs text-on-surface-variant mt-2">{ach.description}</p>
                <div className="mt-4 text-[10px] font-bold text-primary uppercase bg-primary/10 px-3 py-1 rounded-full">
                  Unlocked
                </div>
              </div>
            ))}

            {/* Locked Achievements */}
            {locked.slice(0, Math.max(0, 8 - unlocked.length)).map((ach) => (
              <div key={ach.id} className="bg-surface-container-low p-8 rounded-3xl flex flex-col items-center text-center opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                <div className="w-20 h-20 mb-6 relative flex justify-center items-center">
                  <Lock className="text-slate-400 h-10 w-10 absolute z-0 opacity-20" />
                  <span className="text-5xl drop-shadow-sm z-10 inline-block">{ach.icon}</span>
                </div>
                <h3 className="font-bold text-on-surface text-lg">{ach.title}</h3>
                <p className="text-xs text-on-surface-variant mt-2">{ach.description}</p>
                <div className="mt-4 text-[10px] font-medium text-slate-500 uppercase">
                  Locked
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Daily Challenges */}
        <section>
          <div className="mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-on-surface">Daily Challenges</h2>
            <p className="text-on-surface-variant mt-1">Complete these to earn bonus XP today.</p>
          </div>
          
          <div className="space-y-4">
            {dailyChallenges.length > 0 ? dailyChallenges.map((challenge: any) => (
              <div key={challenge.id} className={`glass-card bg-white/70 backdrop-blur-xl rounded-2xl p-6 flex items-center justify-between group transition-all hover:bg-white border-l-4 ${challenge.completed ? 'border-green-500' : 'border-primary'}`}>
                <div className="flex items-center space-x-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${challenge.completed ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-primary'}`}>
                    {challenge.completed ? <CheckCircle2 className="h-6 w-6" /> : <RefreshCw className="h-6 w-6" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">{challenge.title}</h4>
                    <p className="text-sm text-on-surface-variant">{challenge.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="hidden md:block text-right">
                    <p className={`text-xs font-bold uppercase tracking-widest ${challenge.completed ? 'text-green-600' : 'text-primary'}`}>
                      {challenge.completed ? 'Completed' : 'In Progress'}
                    </p>
                    <p className="text-sm font-medium text-on-surface-variant">+{challenge.points} XP</p>
                  </div>
                  {challenge.completed ? (
                    <Check className="text-green-600 h-8 w-8" />
                  ) : (
                    <div className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {challenge.currentCount} / {challenge.targetCount}
                    </div>
                  )}
                </div>
              </div>
            )) : (
               <div className="glass-card rounded-2xl p-6 text-center text-on-surface-variant bg-white/50 backdrop-blur-xl">
                 No challenges available today. Check back tomorrow!
               </div>
            )}
          </div>
        </section>

        {/* Floating Action Chip (Visual Only) */}
        {!locked.length && (
          <div className="fixed bottom-32 right-8 z-40">
            <div className="glass-card beveled-glass rounded-full px-6 py-3 shadow-2xl flex items-center space-x-3 text-primary animate-bounce bg-white/90">
              <Sparkles className="h-5 w-5" />
              <span className="font-bold text-sm">All Rewards Unlocked!</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Achievements;

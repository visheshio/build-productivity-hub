import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { format, isToday, isBefore, startOfDay, subDays } from 'date-fns';
import {
  PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import {
  CheckCircle2, Clock, Target, IndianRupee, Flame, TrendingUp,
  AlertTriangle, Lightbulb, StickyNote, Calendar, Timer, BookOpen,
  Trophy, Zap, Eye, EyeOff,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Link } from 'react-router-dom';
import { staggerContainer, staggerItem } from '../utils/animations';
import { AnimatedNumber } from '../components/common/AnimatedNumber';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
const MOOD_EMOJIS = ['😢', '😕', '😐', '🙂', '😄'];

const DEFAULT_WIDGETS = [
  { id: 'stats', title: 'Quick Stats', visible: true, order: 0 },
  { id: 'score', title: 'Productivity Score', visible: true, order: 1 },
  { id: 'pomodoro', title: 'Pomodoro Focus', visible: true, order: 2 },
  { id: 'goals', title: 'Goals Progress', visible: true, order: 3 },
  { id: 'charts', title: 'Charts', visible: true, order: 4 },
  { id: 'mood', title: 'Mood Tracker', visible: true, order: 5 },
  { id: 'challenges', title: 'Daily Challenges', visible: true, order: 6 },
  { id: 'pending', title: 'Pending Items', visible: true, order: 7 },
  { id: 'suggestions', title: 'Suggestions', visible: true, order: 8 },
  { id: 'bottom_stats', title: 'Bottom Stats', visible: true, order: 9 },
];

function generateDailyChallenges(state: any): any[] {
  const today = format(new Date(), 'yyyy-MM-dd');
  const challenges = [
    { title: 'Complete 3 tasks', description: 'Finish 3 tasks from your to-do list', category: 'tasks', targetCount: 3, points: 50 },
    { title: 'Write in your journal', description: 'Add a journal entry today', category: 'journal', targetCount: 1, points: 30 },
    { title: 'Complete all habits', description: 'Check off all your daily habits', category: 'habits', targetCount: state.habits.filter((h: any) => h.frequency === 'daily').length || 1, points: 40 },
    { title: 'Focus for 25 minutes', description: 'Complete a Pomodoro session', category: 'pomodoro', targetCount: 1, points: 35 },
    { title: 'Add a new note', description: 'Capture an idea or thought', category: 'notes', targetCount: 1, points: 20 },
  ];
  // Pick 3 unique random challenges
  const shuffled = [...challenges].sort(() => 0.5 - Math.random());
  const selected = [];
  const usedTitles = new Set();
  for (const c of shuffled) {
    if (!usedTitles.has(c.title) && selected.length < 3) {
      selected.push(c);
      usedTitles.add(c.title);
    }
  }
  return selected.map((c) => ({
    id: uuidv4(), ...c, currentCount: 0, completed: false, date: today,
  }));
}

export function Dashboard() {
  const { state, dispatch } = useApp();
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';

  const [widgets, setWidgets] = useState(() => {
    const saved = localStorage.getItem('ph-dashboard-widgets');
    return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
  });
  const [showWidgetConfig, setShowWidgetConfig] = useState(false);

  useEffect(() => {
    localStorage.setItem('ph-dashboard-widgets', JSON.stringify(widgets));
  }, [widgets]);

  const toggleWidget = (id: string) => {
    setWidgets((prev: typeof DEFAULT_WIDGETS) => prev.map((w) => w.id === id ? { ...w, visible: !w.visible } : w));
  };
  const isVisible = (id: string) => widgets.find((w: any) => w.id === id)?.visible !== false;

  // Generate daily challenges if needed
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    if (state.dailyChallenges.length === 0 || state.dailyChallenges[0]?.date !== today) {
      dispatch({ type: 'SET_DAILY_CHALLENGES', payload: generateDailyChallenges(state) });
    }
  }, []);

  // Update challenge progress
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    state.dailyChallenges.forEach((challenge) => {
      if (challenge.date !== today || challenge.completed) return;
      let count = 0;
      switch (challenge.category) {
        case 'tasks':
          count = state.todos.filter((t) => t.status === 'completed').length;
          break;
        case 'journal':
          count = state.journalEntries.filter((j) => format(new Date(j.date), 'yyyy-MM-dd') === today).length;
          break;
        case 'habits':
          count = state.habits.filter((h) => h.completedDates.includes(today)).length;
          break;
        case 'pomodoro':
          count = state.pomodoroSessions.filter((p) => p.type === 'work' && format(new Date(p.completedAt), 'yyyy-MM-dd') === today).length;
          break;
        case 'notes':
          count = state.notes.filter((n) => format(new Date(n.createdAt), 'yyyy-MM-dd') === today).length;
          break;
      }
      if (count !== challenge.currentCount) {
        dispatch({ type: 'UPDATE_CHALLENGE_PROGRESS', payload: { id: challenge.id, currentCount: count } });
      }
    });
  }, [state.todos, state.journalEntries, state.habits, state.pomodoroSessions, state.notes]);


  const subText = 'text-[var(--color-text-secondary)]';
  const tooltipStyle = {
    backgroundColor: 'var(--color-surface-primary)',
    border: '1px solid var(--color-border-primary)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-text-primary)',
    boxShadow: 'var(--shadow-lg)',
    backdropFilter: 'blur(12px)',
  };
  const axisColor = 'var(--color-text-tertiary)';

  // Stats
  const completedTasks = state.todos.filter((t) => t.status === 'completed').length;
  const totalTasks = state.todos.length;
  const pendingTasks = state.todos.filter((t) => t.status === 'pending').length;
  const overdueTasks = state.todos.filter(
    (t) => t.dueDate && isBefore(new Date(t.dueDate), startOfDay(new Date())) && t.status !== 'completed'
  ).length;

  const totalIncome = state.expenses.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const totalExpenses = state.expenses.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0);

  const habitStreakAvg = state.habits.length > 0
    ? state.habits.reduce((s, h) => s + h.streakCount, 0) / state.habits.length : 0;
  const todaysHabits = state.habits.filter((h) => h.completedDates.includes(format(new Date(), 'yyyy-MM-dd'))).length;
  const upcomingEvents = state.events.filter((e) => new Date(e.startTime) >= new Date()).length;
  const todaysEvents = state.events.filter((e) => isToday(new Date(e.startTime))).length;

  // Pomodoro today stats
  const todaySessions = state.pomodoroSessions.filter(
    (s) => s.type === 'work' && format(new Date(s.completedAt), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );
  const todayFocusMinutes = todaySessions.reduce((sum, s) => sum + Math.round(s.duration / 60), 0);

  // Goals
  const activeGoals = state.goals.filter((g) => g.progress < 100);
  const completedGoals = state.goals.filter((g) => g.progress >= 100);

  // Journal / mood
  const todayJournal = state.journalEntries.find((j) => format(new Date(j.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'));
  const last7Moods = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const entry = state.journalEntries.find((j) => format(new Date(j.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
    return { day: format(date, 'EEE'), mood: entry?.moodRating || null };
  });

  // Productivity score
  const taskScore = totalTasks > 0 ? (completedTasks / totalTasks) * 30 : 0;
  const habitScore = state.habits.length > 0 
    ? ((todaysHabits / state.habits.length) * 15) + Math.min((habitStreakAvg / 7) * 10, 10) 
    : 0;
  const eventScore = Math.min(state.events.length * 5, 20);
  const noteScore = Math.min(state.notes.length * 3, 15);
  const budgetScore = (totalIncome > 0 || totalExpenses > 0) ? (totalExpenses <= totalIncome ? 10 : 0) : 0;
  const productivityScore = Math.round(taskScore + habitScore + eventScore + noteScore + budgetScore);

  const expensesByCategory = state.expenses.filter((e) => e.type === 'expense').reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);
  const expensePieData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const completed = state.todos.filter(
      (t) => t.status === 'completed' && format(new Date(t.createdAt), 'yyyy-MM-dd') === dateStr
    ).length;
    return { date: format(date, 'EEE'), completed };
  });

  const habitCompletionData = state.habits.slice(0, 5).map((h) => ({
    name: h.name.length > 12 ? h.name.substring(0, 12) + '…' : h.name,
    streak: h.streakCount,
  }));

  const suggestions: string[] = [];
  if (overdueTasks > 0) suggestions.push(`You have ${overdueTasks} overdue task${overdueTasks > 1 ? 's' : ''}. Try to complete them today!`);
  if (habitStreakAvg < 3) suggestions.push('Build stronger habits by completing them daily to increase your streak!');
  if (totalExpenses > totalIncome) suggestions.push('Your expenses exceed income. Consider reviewing your budget.');
  if (state.notes.length === 0) suggestions.push('Start taking notes to capture your ideas and thoughts!');
  if (pendingTasks > 5) suggestions.push('You have many pending tasks. Try breaking them into smaller chunks.');
  if (todaySessions.length === 0) suggestions.push('Start a Pomodoro session to boost your focus today! 🍅');
  if (!todayJournal) suggestions.push('Take a moment to write in your journal and reflect on your day. 📓');
  if (suggestions.length === 0) suggestions.push("Great job! You're staying on top of everything! 🎉");

  const firstName = user?.name?.split(' ')[0] || 'there';

  // Achievements unlocked count
  const unlockedCount = state.achievements.filter((a: any) => a.unlockedAt).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
            Dashboard
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Welcome back, {firstName}! Here's your productivity overview.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowWidgetConfig(!showWidgetConfig)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium smooth-transition"
          style={{ background: 'var(--color-surface-secondary)', color: 'var(--color-text-secondary)' }}>
          {showWidgetConfig ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          Widgets
        </motion.button>
      </motion.div>

      {/* Widget config panel */}
      {showWidgetConfig && (
        <div className="rounded-2xl p-4 apple-card">
          <p className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--color-text-tertiary)' }}>Show / Hide Widgets</p>
          <div className="flex flex-wrap gap-2">
            {widgets.map((w: any) => (
              <button key={w.id} onClick={() => toggleWidget(w.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium smooth-transition"
                style={w.visible
                  ? { background: 'var(--color-accent)', color: '#ffffff', boxShadow: 'var(--shadow-sm)' }
                  : { background: 'var(--color-surface-secondary)', color: 'var(--color-text-tertiary)' }
                }>
                {w.visible ? <Eye className="h-3 w-3 inline mr-1" /> : <EyeOff className="h-3 w-3 inline mr-1" />}
                {w.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {isVisible('stats') && (
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {[
            { icon: CheckCircle2, color: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600', value: `${completedTasks}/${totalTasks}`, label: 'Tasks Done' },
            { icon: Flame, color: 'bg-orange-100 dark:bg-orange-900/30', iconColor: 'text-orange-500', value: `${todaysHabits}/${state.habits.length}`, label: 'Habits Today' },
            { icon: IndianRupee, color: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600', value: `₹${(totalIncome - totalExpenses).toLocaleString()}`, label: 'Net Balance' },
            { icon: Calendar, color: 'bg-cyan-100 dark:bg-cyan-900/30', iconColor: 'text-cyan-600', value: String(todaysEvents), label: 'Events Today' },
          ].map(({ icon: Icon, color, iconColor, value, label }) => (
            <motion.div
              key={label}
              variants={staggerItem}
              whileHover={{ y: -4, transition: { duration: 0.15 } }}
              className="rounded-2xl p-4 lg:p-5 cursor-default apple-card"
            >
              <div className="flex items-center gap-3">
                <div className={`h-11 w-11 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
                  <p className={`text-xs ${subText}`}>{label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Productivity Score */}
      {isVisible('score') && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-2xl p-6 text-white"
          style={{
            background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-gradient-to))',
            boxShadow: isDark ? '0 8px 32px rgba(41, 151, 255, 0.25)' : '0 8px 32px rgba(0, 113, 227, 0.2)',
          }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm font-medium text-white/80">Productivity Score</span>
              </div>
              <div className="text-6xl font-extrabold">
                <AnimatedNumber value={productivityScore} duration={900} />
              </div>
              <p className="text-white/70 mt-1 text-sm">out of 100 points</p>
            </div>
            <div className="flex-1 max-w-sm space-y-2.5 text-sm">
              {[
                { label: 'Tasks', score: taskScore, max: 30 },
                { label: 'Habits', score: habitScore, max: 25 },
                { label: 'Events', score: eventScore, max: 20 },
                { label: 'Notes', score: noteScore, max: 15 },
                { label: 'Budget', score: budgetScore, max: 10 },
              ].map(({ label, score, max }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="w-14 shrink-0">{label} <span className="opacity-70">({Math.round(score)}/{max})</span></span>
                  <div className="flex-1 bg-white/20 rounded-full h-2">
                    <div className="bg-white rounded-full h-2 transition-all duration-700" style={{ width: `${(score / max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}


      {/* New widgets row: Pomodoro + Goals + Mood */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Pomodoro widget */}
        {isVisible('pomodoro') && (
          <Link to="/pomodoro" className="rounded-2xl p-5 apple-card hover:shadow-[var(--shadow-lg)] group">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-9 w-9 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                <Timer className="h-5 w-5 text-rose-500" />
              </div>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>Focus Today</h3>
            </div>
            <div className="flex items-end gap-4">
              <div>
                <p className="text-3xl font-bold text-rose-500">{todayFocusMinutes}</p>
                <p className={`text-xs ${subText}`}>minutes focused</p>
              </div>
              <div className="ml-auto px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: 'var(--color-error-bg)', color: 'var(--color-rose)' }}>
                {todaySessions.length} sessions
              </div>
            </div>
          </Link>
        )}

        {/* Goals widget */}
        {isVisible('goals') && (
          <Link to="/goals" className="rounded-2xl p-5 apple-card hover:shadow-[var(--shadow-lg)] group">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Target className="h-5 w-5 text-blue-500" />
              </div>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>Goals</h3>
            </div>
            <div className="flex items-end gap-4">
              <div>
                <p className="text-3xl font-bold" style={{ color: 'var(--color-accent)' }}>{activeGoals.length}</p>
                <p className={`text-xs ${subText}`}>active goals</p>
              </div>
              <div className="ml-auto px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                {completedGoals.length} completed
              </div>
            </div>
          </Link>
        )}

        {/* Mood widget */}
        {isVisible('mood') && (
          <Link to="/journal" className="rounded-2xl p-5 apple-card hover:shadow-[var(--shadow-lg)] group">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-9 w-9 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-pink-500" />
              </div>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>Mood Today</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{todayJournal ? MOOD_EMOJIS[todayJournal.moodRating - 1] : '—'}</span>
              <div className="flex-1 flex items-center gap-1">
                {last7Moods.map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className={`h-1 w-full rounded-full ${m.mood ? 'bg-gradient-to-r from-[var(--color-accent)] to-pink-400' : ''}`}
                      style={{ opacity: m.mood ? m.mood / 5 : 0.2, background: m.mood ? undefined : 'var(--color-bg-tertiary)' }} />
                    <span className={`text-[10px] ${subText}`}>{m.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Daily Challenges */}
      {isVisible('challenges') && state.dailyChallenges.length > 0 && (
        <div className="rounded-2xl p-6" style={{ background: 'var(--color-accent-subtle)', border: '1px solid var(--color-border-primary)' }}>
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <Zap className="h-5 w-5" style={{ color: 'var(--color-accent)' }} /> Daily Challenges
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {state.dailyChallenges.filter((challenge, index, self) => 
              self.findIndex(c => c.title === challenge.title) === index
            ).map((challenge) => (
              <div key={challenge.id} className="p-4 rounded-xl"
                style={challenge.completed
                  ? { background: 'var(--color-success-bg)', border: '1px solid var(--color-success)', borderColor: isDark ? 'rgba(48,209,88,0.3)' : 'rgba(52,199,89,0.3)' }
                  : { background: 'var(--color-surface-secondary)' }
                }>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold" style={{ color: challenge.completed ? 'var(--color-success)' : 'var(--color-text-primary)' }}>
                    {challenge.completed && '✅ '}{challenge.title}
                  </h4>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}>
                    +{challenge.points}pts
                  </span>
                </div>
                <p className={`text-xs mb-2 ${subText}`}>{challenge.description}</p>
                <div className="h-1.5 rounded-full" style={{ background: 'var(--color-bg-tertiary)' }}>
                  <div className="h-full rounded-full smooth-transition"
                    style={{ width: `${Math.min(100, (challenge.currentCount / challenge.targetCount) * 100)}%`, background: challenge.completed ? 'var(--color-success)' : 'var(--color-accent)' }} />
                </div>
                <p className={`text-xs mt-1 ${subText}`}>{challenge.currentCount}/{challenge.targetCount}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements mini */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Link to="/achievements" className="rounded-2xl p-4 apple-card flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>{unlockedCount}/{state.achievements.length}</p>
            <p className={`text-xs ${subText}`}>Achievements</p>
          </div>
        </Link>
        <Link to="/pomodoro" className="rounded-2xl p-4 apple-card flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
            <Timer className="h-5 w-5 text-rose-500" />
          </div>
          <div>
            <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>{state.pomodoroSessions.filter((s) => s.type === 'work').length}</p>
            <p className={`text-xs ${subText}`}>Total Sessions</p>
          </div>
        </Link>
        <Link to="/goals" className="rounded-2xl p-4 apple-card flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Target className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>{state.goals.length}</p>
            <p className={`text-xs ${subText}`}>Total Goals</p>
          </div>
        </Link>
        <Link to="/journal" className="rounded-2xl p-4 apple-card flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-pink-500" />
          </div>
          <div>
            <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>{state.journalEntries.length}</p>
            <p className={`text-xs ${subText}`}>Journal Entries</p>
          </div>
        </Link>
      </div>

      {/* Charts */}
      {isVisible('charts') && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-2xl p-6 apple-card">
            <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Task Completion (Last 7 Days)</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={last7Days}>
                  <defs>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0071e3" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0071e3" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="completed" stroke="#0071e3" strokeWidth={2.5} fill="url(#colorCompleted)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl p-6 apple-card">
            <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Expense Breakdown</h3>
            {expensePieData.length > 0 ? (
              <div className="h-48 flex items-center">
                <ResponsiveContainer width="50%" height="100%">
                  <PieChart>
                    <Pie data={expensePieData} cx="50%" cy="50%" innerRadius={38} outerRadius={68} paddingAngle={3} dataKey="value">
                      {expensePieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`₹${Number(v).toLocaleString()}`, 'Amount']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2 pl-2">
                  {expensePieData.slice(0, 5).map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className={`truncate ${subText}`}>{item.name}</span>
                      <span className="ml-auto font-semibold shrink-0" style={{ color: 'var(--color-text-primary)' }}>₹{item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400">No expense data yet</div>
            )}
          </div>
        </div>
      )}

      {/* Habits & Pending */}
      {isVisible('pending') && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-2xl p-6 apple-card">
            <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Habit Streaks</h3>
            {habitCompletionData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={habitCompletionData} layout="vertical">
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 11 }} width={90} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="streak" fill="#f59e0b" radius={[0, 5, 5, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400">No habits tracked yet</div>
            )}
          </div>

          <div className="rounded-2xl p-6 apple-card">
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
              <AlertTriangle className="h-5 w-5" style={{ color: 'var(--color-warning)' }} /> Pending Items
            </h3>
            <div className="space-y-3">
              {overdueTasks > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--color-error-bg)' }}>
                  <Clock className="h-5 w-5 shrink-0" style={{ color: 'var(--color-error)' }} />
                  <div>
                    <p className="font-medium text-sm" style={{ color: 'var(--color-error)' }}>{overdueTasks} overdue task{overdueTasks > 1 ? 's' : ''}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Needs immediate attention</p>
                  </div>
                </div>
              )}
              {pendingTasks > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--color-warning-bg)' }}>
                  <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: 'var(--color-warning)' }} />
                  <div>
                    <p className="font-medium text-sm" style={{ color: 'var(--color-warning)' }}>{pendingTasks} pending task{pendingTasks > 1 ? 's' : ''}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Waiting to be started</p>
                  </div>
                </div>
              )}
              {upcomingEvents > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--color-info-bg)' }}>
                  <Calendar className="h-5 w-5 shrink-0" style={{ color: 'var(--color-info)' }} />
                  <div>
                    <p className="font-medium text-sm" style={{ color: 'var(--color-accent)' }}>{upcomingEvents} upcoming event{upcomingEvents > 1 ? 's' : ''}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Scheduled for later</p>
                  </div>
                </div>
              )}
              {overdueTasks === 0 && pendingTasks === 0 && upcomingEvents === 0 && (
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--color-success-bg)' }}>
                  <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: 'var(--color-success)' }} />
                  <div>
                    <p className="font-medium text-sm" style={{ color: 'var(--color-success)' }}>All caught up! 🎉</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>No pending items</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Suggestions */}
      {isVisible('suggestions') && (
        <div className="rounded-2xl p-6" style={{ background: 'var(--color-warning-bg)', border: '1px solid var(--color-border-primary)' }}>
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <Lightbulb className="h-5 w-5" style={{ color: 'var(--color-warning)' }} /> Improvement Suggestions
          </h3>
          <div className="space-y-2">
            {suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-amber-500 shrink-0 mt-0.5">•</span>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{s}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {isVisible('bottom_stats') && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: StickyNote, color: 'text-violet-500', value: state.notes.length, label: 'Total Notes' },
            { icon: Target, color: 'text-orange-500', value: Math.round(habitStreakAvg), label: 'Avg Streak' },
            { icon: IndianRupee, color: 'text-emerald-500', value: `₹${totalIncome.toLocaleString()}`, label: 'Total Income' },
            { icon: Clock, color: 'text-red-500', value: `₹${totalExpenses.toLocaleString()}`, label: 'Total Expenses' },
          ].map(({ icon: Icon, color, value, label }) => (
            <div key={label} className="rounded-xl p-4 apple-card flex items-center gap-3">
              <Icon className={`h-7 w-7 ${color} shrink-0`} />
              <div className="min-w-0">
                <p className="text-lg font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
                <p className={`text-xs ${subText}`}>{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

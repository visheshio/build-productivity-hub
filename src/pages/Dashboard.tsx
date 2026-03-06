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
  AlertTriangle, Lightbulb, StickyNote, Calendar,
} from 'lucide-react';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export function Dashboard() {
  const { state } = useApp();
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';

  const card = isDark
    ? 'bg-gray-900 border-gray-800 text-white'
    : 'bg-white border-slate-200 text-slate-900';
  const subText = isDark ? 'text-gray-400' : 'text-slate-500';
  const tooltipStyle = {
    backgroundColor: isDark ? '#1e1b4b' : '#1e293b',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
  };
  const axisColor = isDark ? '#6b7280' : '#64748b';

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

  // Productivity score
  const taskScore = totalTasks > 0 ? (completedTasks / totalTasks) * 30 : 15;
  const habitScore = Math.min((habitStreakAvg / 30) * 25, 25);
  const eventScore = 20;
  const noteScore = Math.min(state.notes.length * 2, 15);
  const budgetScore = totalExpenses <= totalIncome ? 10 : 5;
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
  if (suggestions.length === 0) suggestions.push("Great job! You're staying on top of everything! 🎉");

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl lg:text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Dashboard
        </h1>
        <p className={subText}>Welcome back, {firstName}! Here's your productivity overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: CheckCircle2, color: 'bg-violet-100 dark:bg-violet-900/30', iconColor: 'text-violet-600', value: `${completedTasks}/${totalTasks}`, label: 'Tasks Done' },
          { icon: Flame, color: 'bg-orange-100 dark:bg-orange-900/30', iconColor: 'text-orange-500', value: `${todaysHabits}/${state.habits.length}`, label: 'Habits Today' },
          { icon: IndianRupee, color: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600', value: `₹${(totalIncome - totalExpenses).toLocaleString()}`, label: 'Net Balance' },
          { icon: Calendar, color: 'bg-cyan-100 dark:bg-cyan-900/30', iconColor: 'text-cyan-600', value: String(todaysEvents), label: 'Events Today' },
        ].map(({ icon: Icon, color, iconColor, value, label }) => (
          <div key={label} className={`rounded-2xl p-4 lg:p-5 shadow-sm border ${card} transition-colors duration-300`}>
            <div className="flex items-center gap-3">
              <div className={`h-11 w-11 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className={`text-xl font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</p>
                <p className={`text-xs ${subText}`}>{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Productivity Score */}
      <div className="bg-gradient-to-r from-violet-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200/40 dark:shadow-indigo-900/30">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm font-medium text-white/80">Productivity Score</span>
            </div>
            <div className="text-6xl font-extrabold">{productivityScore}</div>
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
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className={`rounded-2xl p-6 shadow-sm border ${card} transition-colors duration-300`}>
          <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Task Completion (Last 7 Days)</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7Days}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="completed" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#colorCompleted)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`rounded-2xl p-6 shadow-sm border ${card} transition-colors duration-300`}>
          <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Expense Breakdown</h3>
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
                    <span className={`ml-auto font-semibold shrink-0 ${isDark ? 'text-white' : 'text-slate-700'}`}>₹{item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400">No expense data yet</div>
          )}
        </div>
      </div>

      {/* Habits & Pending */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className={`rounded-2xl p-6 shadow-sm border ${card} transition-colors duration-300`}>
          <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Habit Streaks</h3>
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

        <div className={`rounded-2xl p-6 shadow-sm border ${card} transition-colors duration-300`}>
          <h3 className={`font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <AlertTriangle className="h-5 w-5 text-amber-500" /> Pending Items
          </h3>
          <div className="space-y-3">
            {overdueTasks > 0 && (
              <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-red-900/20 border border-red-800' : 'bg-red-50'}`}>
                <Clock className="h-5 w-5 text-red-500 shrink-0" />
                <div>
                  <p className={`font-medium text-sm ${isDark ? 'text-red-400' : 'text-red-700'}`}>{overdueTasks} overdue task{overdueTasks > 1 ? 's' : ''}</p>
                  <p className={`text-xs ${isDark ? 'text-red-500' : 'text-red-400'}`}>Needs immediate attention</p>
                </div>
              </div>
            )}
            {pendingTasks > 0 && (
              <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-amber-900/20 border border-amber-800' : 'bg-amber-50'}`}>
                <CheckCircle2 className="h-5 w-5 text-amber-500 shrink-0" />
                <div>
                  <p className={`font-medium text-sm ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>{pendingTasks} pending task{pendingTasks > 1 ? 's' : ''}</p>
                  <p className={`text-xs ${isDark ? 'text-amber-500' : 'text-amber-400'}`}>Waiting to be started</p>
                </div>
              </div>
            )}
            {upcomingEvents > 0 && (
              <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50'}`}>
                <Calendar className="h-5 w-5 text-blue-500 shrink-0" />
                <div>
                  <p className={`font-medium text-sm ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>{upcomingEvents} upcoming event{upcomingEvents > 1 ? 's' : ''}</p>
                  <p className={`text-xs ${isDark ? 'text-blue-500' : 'text-blue-400'}`}>Scheduled for later</p>
                </div>
              </div>
            )}
            {overdueTasks === 0 && pendingTasks === 0 && upcomingEvents === 0 && (
              <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-emerald-900/20 border border-emerald-800' : 'bg-emerald-50'}`}>
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                <div>
                  <p className={`font-medium text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>All caught up! 🎉</p>
                  <p className={`text-xs ${isDark ? 'text-emerald-500' : 'text-emerald-400'}`}>No pending items</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Suggestions */}
      <div className={`rounded-2xl p-6 border ${isDark ? 'bg-amber-900/10 border-amber-800/40' : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'} transition-colors duration-300`}>
        <h3 className={`font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-amber-300' : 'text-slate-900'}`}>
          <Lightbulb className="h-5 w-5 text-amber-500" /> Improvement Suggestions
        </h3>
        <div className="space-y-2">
          {suggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-amber-500 shrink-0 mt-0.5">•</span>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>{s}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: StickyNote, color: 'text-violet-500', value: state.notes.length, label: 'Total Notes' },
          { icon: Target, color: 'text-orange-500', value: Math.round(habitStreakAvg), label: 'Avg Streak' },
          { icon: IndianRupee, color: 'text-emerald-500', value: `₹${totalIncome.toLocaleString()}`, label: 'Total Income' },
          { icon: Clock, color: 'text-red-500', value: `₹${totalExpenses.toLocaleString()}`, label: 'Total Expenses' },
        ].map(({ icon: Icon, color, value, label }) => (
          <div key={label} className={`rounded-xl p-4 shadow-sm border ${card} flex items-center gap-3 transition-colors duration-300`}>
            <Icon className={`h-7 w-7 ${color} shrink-0`} />
            <div className="min-w-0">
              <p className={`text-lg font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</p>
              <p className={`text-xs ${subText}`}>{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

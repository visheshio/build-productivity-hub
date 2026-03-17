import React, { useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useApp } from '../context/AppContext';
import { useDarkMode } from '../hooks/useDarkMode';
import { Todo, Expense, Habit } from '../types';

const Analytics: React.FC = () => {
  const { state } = useApp();
  const { isDark } = useDarkMode();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  const { todos, expenses, habits, notes } = state;

  // Calculate productivity metrics
  const totalTasks = todos.length;
  const completedTasks = todos.filter((t: Todo) => t.status === 'completed').length;
  const inProgressTasks = todos.filter((t: Todo) => t.status === 'in-progress').length;
  const pendingTasks = todos.filter((t: Todo) => t.status === 'pending').length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Habit metrics
  const activeHabits = habits.filter((h: Habit) => h.streakCount > 0).length;
  const averageStreak = habits.length > 0 ? Math.round(habits.reduce((sum: number, h: Habit) => sum + h.streakCount, 0) / habits.length) : 0;

  // Expense metrics
  const totalExpenses = expenses.reduce((sum: number, e: Expense) => sum + (e.type === 'expense' ? e.amount : 0), 0);
  const totalIncome = expenses.reduce((sum: number, e: Expense) => sum + (e.type === 'income' ? e.amount : 0), 0);
  const netBalance = totalIncome - totalExpenses;

  // Notes metrics
  const totalNotes = notes.length;
  const pinnedNotes = notes.filter((n: any) => n.isPinned).length;

  // Task completion by priority
  const tasksByPriority = [
    {
      name: 'High',
      completed: todos.filter((t: Todo) => t.priority === 'high' && t.status === 'completed').length,
      pending: todos.filter((t: Todo) => t.priority === 'high' && t.status !== 'completed').length,
    },
    {
      name: 'Medium',
      completed: todos.filter((t: Todo) => t.priority === 'medium' && t.status === 'completed').length,
      pending: todos.filter((t: Todo) => t.priority === 'medium' && t.status !== 'completed').length,
    },
    {
      name: 'Low',
      completed: todos.filter((t: Todo) => t.priority === 'low' && t.status === 'completed').length,
      pending: todos.filter((t: Todo) => t.priority === 'low' && t.status !== 'completed').length,
    },
  ];

  // Expense breakdown by category
  const expenseByCategory = expenses.reduce((acc: any[], e: Expense) => {
    const existing = acc.find((item: any) => item.name === e.category);
    if (existing) {
      existing.value += e.type === 'expense' ? e.amount : 0;
    } else {
      acc.push({ name: e.category, value: e.type === 'expense' ? e.amount : 0 });
    }
    return acc;
  }, []);

  // Income breakdown by category
  const incomeByCategory = expenses.reduce((acc: any[], e: Expense) => {
    const existing = acc.find((item: any) => item.name === e.category);
    if (existing) {
      existing.value += e.type === 'income' ? e.amount : 0;
    } else {
      acc.push({ name: e.category, value: e.type === 'income' ? e.amount : 0 });
    }
    return acc;
  }, []);

  // Task completion trend (last 7 days simulated)
  const taskTrend = [
    { day: 'Mon', completed: Math.floor(completedTasks * 0.1), pending: Math.floor(pendingTasks * 0.2) },
    { day: 'Tue', completed: Math.floor(completedTasks * 0.15), pending: Math.floor(pendingTasks * 0.18) },
    { day: 'Wed', completed: Math.floor(completedTasks * 0.2), pending: Math.floor(pendingTasks * 0.15) },
    { day: 'Thu', completed: Math.floor(completedTasks * 0.18), pending: Math.floor(pendingTasks * 0.22) },
    { day: 'Fri', completed: Math.floor(completedTasks * 0.22), pending: Math.floor(pendingTasks * 0.1) },
    { day: 'Sat', completed: Math.floor(completedTasks * 0.12), pending: Math.floor(pendingTasks * 0.08) },
    { day: 'Sun', completed: Math.floor(completedTasks * 0.08), pending: Math.floor(pendingTasks * 0.07) },
  ];

  // Habit completion rate
  const habitCompletionData = habits.map((h: Habit) => ({
    name: h.name,
    completion: Math.round((h.streakCount / Math.max(h.streakCount + 5, 30)) * 100),
    streak: h.streakCount,
  }));

  // Calculate productivity score
  const productivityScore = Math.round(
    (taskCompletionRate * 0.3) +
    (activeHabits > 0 ? (averageStreak / 30) * 100 * 0.25 : 0) +
    (totalNotes > 0 ? Math.min((totalNotes / 10) * 100, 100) * 0.2 : 0) +
    (netBalance > 0 ? 25 : 15)
  );

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  const bgClass = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardClass = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const chartTextColor = isDark ? '#9ca3af' : '#4b5563';

  return (
    <div className={`p-6 min-h-screen ${bgClass}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold ${textClass} mb-2`}>Analytics Dashboard</h1>
          <p className={`${mutedTextClass}`}>Comprehensive analysis of all your activities</p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6 flex gap-3">
          {(['week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-500 text-white'
                  : isDark
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Productivity Score */}
          <div className={`border rounded-xl p-6 ${cardClass}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className={`font-semibold ${textClass}`}>Productivity Score</h3>
              <div className="text-2xl">🎯</div>
            </div>
            <p className={`text-4xl font-bold text-blue-500 mb-2`}>{productivityScore}</p>
            <p className={`text-sm ${mutedTextClass}`}>Out of 100</p>
          </div>

          {/* Task Completion */}
          <div className={`border rounded-xl p-6 ${cardClass}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className={`font-semibold ${textClass}`}>Task Completion</h3>
              <div className="text-2xl">✅</div>
            </div>
            <p className={`text-4xl font-bold text-green-500 mb-2`}>{taskCompletionRate}%</p>
            <p className={`text-sm ${mutedTextClass}`}>{completedTasks} of {totalTasks} tasks</p>
          </div>

          {/* Active Habits */}
          <div className={`border rounded-xl p-6 ${cardClass}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className={`font-semibold ${textClass}`}>Active Habits</h3>
              <div className="text-2xl">🔥</div>
            </div>
            <p className={`text-4xl font-bold text-orange-500 mb-2`}>{activeHabits}</p>
            <p className={`text-sm ${mutedTextClass}`}>Avg streak: {averageStreak} days</p>
          </div>

          {/* Financial Balance */}
          <div className={`border rounded-xl p-6 ${cardClass}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className={`font-semibold ${textClass}`}>Net Balance</h3>
              <div className="text-2xl">💰</div>
            </div>
            <p className={`text-4xl font-bold ${netBalance >= 0 ? 'text-green-500' : 'text-red-500'} mb-2`}>
              ₹{Math.abs(netBalance).toFixed(2)}
            </p>
            <p className={`text-sm ${mutedTextClass}`}>Income: ₹{totalIncome.toFixed(2)}</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Task Completion Trend */}
          <div className={`border rounded-xl p-6 ${cardClass}`}>
            <h3 className={`text-lg font-semibold ${textClass} mb-4`}>Task Completion Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={taskTrend}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#404040' : '#e5e7eb'} />
                <XAxis stroke={chartTextColor} />
                <YAxis stroke={chartTextColor} />
                <Tooltip 
                  contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', border: `1px solid ${isDark ? '#404040' : '#e5e7eb'}` }}
                  labelStyle={{ color: textClass }}
                />
                <Area type="monotone" dataKey="completed" stroke="#10b981" fillOpacity={1} fill="url(#colorCompleted)" name="Completed" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Tasks by Priority */}
          <div className={`border rounded-xl p-6 ${cardClass}`}>
            <h3 className={`text-lg font-semibold ${textClass} mb-4`}>Tasks by Priority</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tasksByPriority}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#404040' : '#e5e7eb'} />
                <XAxis stroke={chartTextColor} />
                <YAxis stroke={chartTextColor} />
                <Tooltip 
                  contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', border: `1px solid ${isDark ? '#404040' : '#e5e7eb'}` }}
                  labelStyle={{ color: textClass }}
                />
                <Legend />
                <Bar dataKey="completed" fill="#10b981" name="Completed" />
                <Bar dataKey="pending" fill="#ef4444" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Expense Breakdown */}
          <div className={`border rounded-xl p-6 ${cardClass}`}>
            <h3 className={`text-lg font-semibold ${textClass} mb-4`}>Expense Breakdown</h3>
            {expenseByCategory.length > 0 ? (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={expenseByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expenseByCategory.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', border: `1px solid ${isDark ? '#404040' : '#e5e7eb'}` }}
                      labelStyle={{ color: textClass }}
                      formatter={(value: any) => `₹${value}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-full space-y-2 mt-4 max-h-40 overflow-y-auto">
                  {expenseByCategory.map((item: any, index: number) => (
                    <div key={item.name} className="flex items-center justify-between gap-2 text-xs px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className={`truncate ${mutedTextClass}`}>{item.name}</span>
                      </div>
                      <span className={`font-medium flex-shrink-0 ${textClass}`}>₹{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className={`text-center ${mutedTextClass} py-12`}>No expense data available</p>
            )}
          </div>

          {/* Income Breakdown */}
          <div className={`border rounded-xl p-6 ${cardClass}`}>
            <h3 className={`text-lg font-semibold ${textClass} mb-4`}>Income Breakdown</h3>
            {incomeByCategory.length > 0 ? (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={incomeByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {incomeByCategory.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', border: `1px solid ${isDark ? '#404040' : '#e5e7eb'}` }}
                      labelStyle={{ color: textClass }}
                      formatter={(value: any) => `₹${value}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-full space-y-2 mt-4 max-h-40 overflow-y-auto">
                  {incomeByCategory.map((item: any, index: number) => (
                    <div key={item.name} className="flex items-center justify-between gap-2 text-xs px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: COLORS[(index + 1) % COLORS.length] }}
                        />
                        <span className={`truncate ${mutedTextClass}`}>{item.name}</span>
                      </div>
                      <span className={`font-medium flex-shrink-0 ${textClass}`}>₹{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className={`text-center ${mutedTextClass} py-12`}>No income data available</p>
            )}
          </div>
        </div>

        {/* Habit Performance */}
        {habitCompletionData.length > 0 && (
          <div className={`border rounded-xl p-6 ${cardClass} mb-8`}>
            <h3 className={`text-lg font-semibold ${textClass} mb-4`}>Habit Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={habitCompletionData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#404040' : '#e5e7eb'} />
                <XAxis stroke={chartTextColor} dataKey="name" />
                <YAxis stroke={chartTextColor} />
                <Tooltip 
                  contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', border: `1px solid ${isDark ? '#404040' : '#e5e7eb'}` }}
                  labelStyle={{ color: textClass }}
                />
                <Bar dataKey="completion" fill="#8b5cf6" name="Completion %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Detailed Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Task Statistics */}
          <div className={`border rounded-xl p-6 ${cardClass}`}>
            <h3 className={`text-lg font-semibold ${textClass} mb-4`}>Task Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={mutedTextClass}>Total Tasks</span>
                <span className={`font-bold ${textClass}`}>{totalTasks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={mutedTextClass}>Completed</span>
                <span className="font-bold text-green-500">{completedTasks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={mutedTextClass}>In Progress</span>
                <span className="font-bold text-blue-500">{inProgressTasks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={mutedTextClass}>Pending</span>
                <span className="font-bold text-red-500">{pendingTasks}</span>
              </div>
            </div>
          </div>

          {/* Notes Statistics */}
          <div className={`border rounded-xl p-6 ${cardClass}`}>
            <h3 className={`text-lg font-semibold ${textClass} mb-4`}>Notes Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={mutedTextClass}>Total Notes</span>
                <span className={`font-bold ${textClass}`}>{totalNotes}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={mutedTextClass}>Pinned Notes</span>
                <span className="font-bold text-yellow-500">{pinnedNotes}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={mutedTextClass}>Unpinned</span>
                <span className={`font-bold ${textClass}`}>{totalNotes - pinnedNotes}</span>
              </div>
            </div>
          </div>

          {/* Financial Statistics */}
          <div className={`border rounded-xl p-6 ${cardClass}`}>
            <h3 className={`text-lg font-semibold ${textClass} mb-4`}>Financial Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={mutedTextClass}>Total Income</span>
                <span className="font-bold text-green-500">₹{totalIncome.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={mutedTextClass}>Total Expenses</span>
                <span className="font-bold text-red-500">₹{totalExpenses.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={mutedTextClass}>Balance</span>
                <span className={`font-bold ${netBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ₹{netBalance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Insights Section */}
        <div className={`border rounded-xl p-6 mt-8 ${cardClass}`}>
          <h3 className={`text-lg font-semibold ${textClass} mb-4`}>💡 Insights & Recommendations</h3>
          <div className="space-y-3">
            {taskCompletionRate < 50 && (
              <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900' : 'bg-blue-50'} border ${isDark ? 'border-blue-700' : 'border-blue-200'}`}>
                <p className={isDark ? 'text-blue-200' : 'text-blue-800'}>
                  📌 Your task completion rate is below 50%. Try breaking down larger tasks into smaller, manageable steps.
                </p>
              </div>
            )}
            {activeHabits === 0 && (
              <div className={`p-3 rounded-lg ${isDark ? 'bg-orange-900' : 'bg-orange-50'} border ${isDark ? 'border-orange-700' : 'border-orange-200'}`}>
                <p className={isDark ? 'text-orange-200' : 'text-orange-800'}>
                  🔥 You don't have any active habits yet. Start building one today to boost your productivity!
                </p>
              </div>
            )}
            {netBalance > totalIncome * 0.5 && (
              <div className={`p-3 rounded-lg ${isDark ? 'bg-red-900' : 'bg-red-50'} border ${isDark ? 'border-red-700' : 'border-red-200'}`}>
                <p className={isDark ? 'text-red-200' : 'text-red-800'}>
                  💸 Your expenses are high relative to income. Consider reviewing your spending habits.
                </p>
              </div>
            )}
            {totalNotes < 5 && (
              <div className={`p-3 rounded-lg ${isDark ? 'bg-purple-900' : 'bg-purple-50'} border ${isDark ? 'border-purple-700' : 'border-purple-200'}`}>
                <p className={isDark ? 'text-purple-200' : 'text-purple-800'}>
                  📝 Consider taking more notes to capture your thoughts and ideas. Regular note-taking improves learning!
                </p>
              </div>
            )}
            {productivityScore >= 80 && (
              <div className={`p-3 rounded-lg ${isDark ? 'bg-green-900' : 'bg-green-50'} border ${isDark ? 'border-green-700' : 'border-green-200'}`}>
                <p className={isDark ? 'text-green-200' : 'text-green-800'}>
                  🌟 Excellent work! You're maintaining a high productivity score. Keep up the great momentum!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

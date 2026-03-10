import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Modal } from '../components/common/Modal';
import { ExportButton } from '../components/common/ExportButton';
import { exportHabits } from '../utils/csvExport';
import { format, subDays, eachDayOfInterval, startOfMonth, endOfMonth, isSameMonth, isToday } from 'date-fns';
import { Plus, Flame, Target, Trophy, ChevronLeft, ChevronRight, Trash2, Edit2 } from 'lucide-react';
import { Habit } from '../types';
import { staggerContainer, staggerItem } from '../utils/animations';
import toast from 'react-hot-toast';

const categoryColors = {
  health: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  productivity: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  learning: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  other: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

const categoryIcons = {
  health: '💪',
  productivity: '⚡',
  learning: '📚',
  other: '✨',
};

export function Habits() {
  const { state, dispatch } = useApp();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [viewMonth, setViewMonth] = useState(new Date());

  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [category, setCategory] = useState<'health' | 'productivity' | 'learning' | 'other'>('health');

  const today = format(new Date(), 'yyyy-MM-dd');

  const card = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200';
  const cardTitle = isDark ? 'text-white' : 'text-slate-900';
  const subText = isDark ? 'text-gray-400' : 'text-slate-500';
  const inputCls = isDark
    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500'
    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100';

  const openModal = (habit?: Habit) => {
    if (habit) {
      setEditingHabit(habit);
      setName(habit.name);
      setFrequency(habit.frequency);
      setCategory(habit.category);
    } else {
      setEditingHabit(null);
      setName('');
      setFrequency('daily');
      setCategory('health');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (editingHabit) {
      dispatch({ type: 'UPDATE_HABIT', payload: { ...editingHabit, name, frequency, category } });
    } else {
      dispatch({ type: 'ADD_HABIT', payload: { name, frequency, category } });
    }
    setIsModalOpen(false);
  };

  const toggleHabitForDate = (habitId: string, date: string) => {
    dispatch({ type: 'COMPLETE_HABIT', payload: { id: habitId, date } });
  };

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return {
      date: format(date, 'yyyy-MM-dd'),
      dayName: format(date, 'EEE'),
      dayNum: format(date, 'd'),
      isToday: isToday(date),
    };
  });

  const calendarDays = eachDayOfInterval({
    start: startOfMonth(viewMonth),
    end: endOfMonth(viewMonth),
  });

  const firstDayOfMonth = startOfMonth(viewMonth).getDay();
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const longestStreak = Math.max(...state.habits.map((h) => h.streakCount), 0);
  const habitsCompletedToday = state.habits.filter((h) => h.completedDates.includes(today)).length;
  const totalCompletions = state.habits.reduce((sum, h) => sum + h.completedDates.length, 0);

  const statCards = [
    {
      icon: Flame,
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      value: longestStreak,
      label: 'Longest Streak',
    },
    {
      icon: Target,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      value: `${habitsCompletedToday}/${state.habits.length}`,
      label: 'Done Today',
    },
    {
      icon: Trophy,
      iconBg: 'bg-violet-100 dark:bg-violet-900/30',
      iconColor: 'text-violet-600 dark:text-violet-400',
      value: totalCompletions,
      label: 'Total Completions',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className={`text-2xl lg:text-3xl font-bold ${cardTitle}`}>Habit Tracker</h1>
          <p className={`mt-1 ${subText}`}>Build good habits and track your progress</p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            onExport={() => { exportHabits(state.habits); toast.success('Habits exported!'); }}
            label="Export"
            disabled={state.habits.length === 0}
          />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-200/50 hover:shadow-xl transition-shadow"
          >
            <Plus className="h-5 w-5" />
            New Habit
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-3 gap-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {statCards.map(({ icon: Icon, iconBg, iconColor, value, label }) => (
          <motion.div
            key={label}
            variants={staggerItem}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            className={`rounded-2xl p-4 border shadow-sm text-center ${card} transition-colors`}
          >
            <div className={`h-10 w-10 rounded-xl ${iconBg} flex items-center justify-center mx-auto mb-2`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <p className={`text-2xl font-bold ${cardTitle}`}>{value}</p>
            <p className={`text-sm ${subText}`}>{label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Habits List */}
      {state.habits.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className={`rounded-2xl border shadow-sm overflow-hidden ${card}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDark ? 'border-gray-800' : 'border-slate-100'}`}>
                  <th className={`text-left p-4 font-medium ${subText}`}>Habit</th>
                  {last7Days.map((day) => (
                    <th
                      key={day.date}
                      className={`p-2 text-center min-w-[50px] ${day.isToday ? (isDark ? 'bg-violet-900/20' : 'bg-violet-50') : ''}`}
                    >
                      <div className={`text-xs ${subText}`}>{day.dayName}</div>
                      <div className={`text-sm font-medium ${day.isToday ? 'text-violet-500' : cardTitle}`}>
                        {day.dayNum}
                      </div>
                    </th>
                  ))}
                  <th className={`p-4 text-center font-medium ${subText}`}>Streak</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {state.habits.map((habit, idx) => (
                    <motion.tr
                      key={habit.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                      transition={{ duration: 0.3, delay: idx * 0.04 }}
                      className={`border-b transition-colors ${isDark ? 'border-gray-800/50 hover:bg-gray-800/40' : 'border-slate-50 hover:bg-slate-50'}`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{categoryIcons[habit.category]}</span>
                          <div>
                            <button
                              onClick={() => setSelectedHabit(habit)}
                              className={`font-medium hover:text-violet-500 transition-colors text-left ${cardTitle}`}
                            >
                              {habit.name}
                            </button>
                            <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${categoryColors[habit.category]}`}>
                              {habit.category}
                            </span>
                          </div>
                        </div>
                      </td>
                      {last7Days.map((day) => {
                        const isCompleted = habit.completedDates.includes(day.date);
                        return (
                          <td key={day.date} className={`p-2 text-center ${day.isToday ? (isDark ? 'bg-violet-900/10' : 'bg-violet-50') : ''}`}>
                            <motion.button
                              whileHover={{ scale: 1.12 }}
                              whileTap={{ scale: 0.82 }}
                              onClick={() => toggleHabitForDate(habit.id, day.date)}
                              className={`h-8 w-8 rounded-lg mx-auto flex items-center justify-center transition-colors ${isCompleted
                                ? 'bg-emerald-500 text-white shadow-sm'
                                : isDark
                                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-400'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-400'
                                }`}
                            >
                              {isCompleted && (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                >
                                  ✓
                                </motion.span>
                              )}
                            </motion.button>
                          </td>
                        );
                      })}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Flame className={`h-4 w-4 ${habit.streakCount > 0 ? 'text-orange-500' : isDark ? 'text-gray-600' : 'text-slate-300'}`} />
                          <span className={`font-bold ${habit.streakCount > 0 ? 'text-orange-500' : subText}`}>
                            {habit.streakCount}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openModal(habit)}
                            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-slate-100 text-slate-400'}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => dispatch({ type: 'DELETE_HABIT', payload: habit.id })}
                            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-red-900/30 text-gray-400 hover:text-red-400' : 'hover:bg-red-50 text-slate-400 hover:text-red-500'}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center py-12"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className={`h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-gray-800' : 'bg-slate-100'}`}
          >
            <Target className={`h-8 w-8 ${isDark ? 'text-gray-600' : 'text-slate-400'}`} />
          </motion.div>
          <h3 className={`text-lg font-medium mb-1 ${cardTitle}`}>No habits yet</h3>
          <p className={subText}>Create your first habit to start tracking</p>
        </motion.div>
      )}

      {/* Habit Calendar Modal */}
      {selectedHabit && (
        <Modal isOpen={!!selectedHabit} onClose={() => setSelectedHabit(null)} title={selectedHabit.name}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setViewMonth(new Date(viewMonth.setMonth(viewMonth.getMonth() - 1)))}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-slate-100'}`}
              >
                <ChevronLeft className="h-5 w-5" />
              </motion.button>
              <span className={`font-medium ${cardTitle}`}>{format(viewMonth, 'MMMM yyyy')}</span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setViewMonth(new Date(viewMonth.setMonth(viewMonth.getMonth() + 1)))}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-slate-100'}`}
              >
                <ChevronRight className="h-5 w-5" />
              </motion.button>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className={`text-center text-xs font-medium py-2 ${subText}`}>{day}</div>
              ))}
              {emptyDays.map((_, i) => <div key={`empty-${i}`} />)}
              {calendarDays.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const isCompleted = selectedHabit.completedDates.includes(dateStr);
                const isCurrent = isToday(day);
                const isCurrentMonth = isSameMonth(day, viewMonth);
                return (
                  <motion.button
                    key={dateStr}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleHabitForDate(selectedHabit.id, dateStr)}
                    className={`aspect-square rounded-lg flex items-center justify-center text-sm transition-colors ${isCompleted
                      ? 'bg-emerald-500 text-white font-medium'
                      : isCurrent
                        ? isDark ? 'bg-violet-900/40 text-violet-400 font-medium' : 'bg-violet-100 text-violet-700 font-medium'
                        : isCurrentMonth
                          ? isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-slate-100 text-slate-700'
                          : isDark ? 'text-gray-600' : 'text-slate-300'
                      }`}
                  >
                    {format(day, 'd')}
                  </motion.button>
                );
              })}
            </div>

            <div className={`flex items-center justify-between pt-4 border-t ${isDark ? 'border-gray-800' : 'border-slate-200'}`}>
              <div>
                <p className={`text-sm ${subText}`}>Current Streak</p>
                <p className="text-xl font-bold text-orange-500 flex items-center gap-1">
                  <Flame className="h-5 w-5" />
                  {selectedHabit.streakCount} days
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm ${subText}`}>Total Completions</p>
                <p className="text-xl font-bold text-emerald-500">{selectedHabit.completedDates.length}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add/Edit Habit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingHabit ? 'Edit Habit' : 'New Habit'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Habit Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Exercise, Read, Meditate..."
              className={`w-full px-3 py-2 border rounded-xl outline-none text-sm transition-all ${inputCls}`}
              required
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Category</label>
            <div className="grid grid-cols-2 gap-2">
              {(['health', 'productivity', 'learning', 'other'] as const).map((cat) => (
                <motion.button
                  key={cat}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setCategory(cat)}
                  className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${category === cat
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                    : isDark ? 'border-gray-700 hover:border-gray-600' : 'border-slate-200 hover:border-slate-300'
                    }`}
                >
                  <span className="text-xl">{categoryIcons[cat]}</span>
                  <span className={`capitalize text-sm font-medium ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>{cat}</span>
                </motion.button>
              ))}
            </div>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly' | 'custom')}
              className={`w-full px-3 py-2 border rounded-xl outline-none text-sm ${inputCls}`}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className={`flex-1 px-4 py-2 border rounded-xl text-sm font-medium transition-colors ${isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-shadow text-sm"
            >
              {editingHabit ? 'Update' : 'Create'}
            </motion.button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

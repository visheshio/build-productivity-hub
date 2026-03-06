import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/common/Modal';
import { format, subDays, eachDayOfInterval, startOfMonth, endOfMonth, isSameMonth, isToday } from 'date-fns';
import { Plus, Flame, Target, Trophy, ChevronLeft, ChevronRight, Trash2, Edit2 } from 'lucide-react';
import { Habit } from '../types';

const categoryColors = {
  health: 'bg-emerald-100 text-emerald-700',
  productivity: 'bg-blue-100 text-blue-700',
  learning: 'bg-purple-100 text-purple-700',
  other: 'bg-slate-100 text-slate-700',
};

const categoryIcons = {
  health: '💪',
  productivity: '⚡',
  learning: '📚',
  other: '✨',
};

export function Habits() {
  const { state, dispatch } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [viewMonth, setViewMonth] = useState(new Date());

  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [category, setCategory] = useState<'health' | 'productivity' | 'learning' | 'other'>('health');

  const today = format(new Date(), 'yyyy-MM-dd');

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
      dispatch({
        type: 'UPDATE_HABIT',
        payload: { ...editingHabit, name, frequency, category },
      });
    } else {
      dispatch({
        type: 'ADD_HABIT',
        payload: { name, frequency, category },
      });
    }
    setIsModalOpen(false);
  };

  const toggleHabitForDate = (habitId: string, date: string) => {
    dispatch({
      type: 'COMPLETE_HABIT',
      payload: { id: habitId, date },
    });
  };

  // Generate last 7 days for quick view
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return {
      date: format(date, 'yyyy-MM-dd'),
      dayName: format(date, 'EEE'),
      dayNum: format(date, 'd'),
      isToday: isToday(date),
    };
  });

  // Generate calendar days for selected habit
  const calendarDays = eachDayOfInterval({
    start: startOfMonth(viewMonth),
    end: endOfMonth(viewMonth),
  });

  const firstDayOfMonth = startOfMonth(viewMonth).getDay();
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  // Stats
  const longestStreak = Math.max(...state.habits.map((h) => h.streakCount), 0);
  const habitsCompletedToday = state.habits.filter((h) => h.completedDates.includes(today)).length;
  const totalCompletions = state.habits.reduce((sum, h) => sum + h.completedDates.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Habit Tracker</h1>
          <p className="text-slate-500 mt-1">Build good habits and track your progress</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 hover:shadow-xl transition-shadow"
        >
          <Plus className="h-5 w-5" />
          New Habit
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-center">
          <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center mx-auto mb-2">
            <Flame className="h-5 w-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{longestStreak}</p>
          <p className="text-sm text-slate-500">Longest Streak</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-center">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-2">
            <Target className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {habitsCompletedToday}/{state.habits.length}
          </p>
          <p className="text-sm text-slate-500">Done Today</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-center">
          <div className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center mx-auto mb-2">
            <Trophy className="h-5 w-5 text-violet-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalCompletions}</p>
          <p className="text-sm text-slate-500">Total Completions</p>
        </div>
      </div>

      {/* Habits List with Quick Check */}
      {state.habits.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left p-4 font-medium text-slate-700">Habit</th>
                  {last7Days.map((day) => (
                    <th
                      key={day.date}
                      className={`p-2 text-center min-w-[50px] ${day.isToday ? 'bg-violet-50' : ''}`}
                    >
                      <div className="text-xs text-slate-400">{day.dayName}</div>
                      <div className={`text-sm font-medium ${day.isToday ? 'text-violet-600' : 'text-slate-700'}`}>
                        {day.dayNum}
                      </div>
                    </th>
                  ))}
                  <th className="p-4 text-center font-medium text-slate-700">Streak</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {state.habits.map((habit) => (
                  <tr key={habit.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{categoryIcons[habit.category]}</span>
                        <div>
                          <button
                            onClick={() => setSelectedHabit(habit)}
                            className="font-medium text-slate-900 hover:text-violet-600 transition-colors text-left"
                          >
                            {habit.name}
                          </button>
                          <span
                            className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${categoryColors[habit.category]}`}
                          >
                            {habit.category}
                          </span>
                        </div>
                      </div>
                    </td>
                    {last7Days.map((day) => {
                      const isCompleted = habit.completedDates.includes(day.date);
                      return (
                        <td key={day.date} className={`p-2 text-center ${day.isToday ? 'bg-violet-50' : ''}`}>
                          <button
                            onClick={() => toggleHabitForDate(habit.id, day.date)}
                            className={`h-8 w-8 rounded-lg mx-auto flex items-center justify-center transition-all ${
                              isCompleted
                                ? 'bg-emerald-500 text-white shadow-sm'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-400'
                            }`}
                          >
                            {isCompleted ? '✓' : ''}
                          </button>
                        </td>
                      );
                    })}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Flame className={`h-4 w-4 ${habit.streakCount > 0 ? 'text-orange-500' : 'text-slate-300'}`} />
                        <span className={`font-bold ${habit.streakCount > 0 ? 'text-orange-500' : 'text-slate-400'}`}>
                          {habit.streakCount}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openModal(habit)}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => dispatch({ type: 'DELETE_HABIT', payload: habit.id })}
                          className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Target className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">No habits yet</h3>
          <p className="text-slate-500">Create your first habit to start tracking</p>
        </div>
      )}

      {/* Habit Calendar Modal */}
      {selectedHabit && (
        <Modal isOpen={!!selectedHabit} onClose={() => setSelectedHabit(null)} title={selectedHabit.name}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setViewMonth(new Date(viewMonth.setMonth(viewMonth.getMonth() - 1)))}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="font-medium text-slate-900">{format(viewMonth, 'MMMM yyyy')}</span>
              <button
                onClick={() => setViewMonth(new Date(viewMonth.setMonth(viewMonth.getMonth() + 1)))}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-slate-400 py-2">
                  {day}
                </div>
              ))}
              {emptyDays.map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {calendarDays.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const isCompleted = selectedHabit.completedDates.includes(dateStr);
                const isCurrent = isToday(day);
                const isCurrentMonth = isSameMonth(day, viewMonth);

                return (
                  <button
                    key={dateStr}
                    onClick={() => toggleHabitForDate(selectedHabit.id, dateStr)}
                    className={`aspect-square rounded-lg flex items-center justify-center text-sm transition-all ${
                      isCompleted
                        ? 'bg-emerald-500 text-white font-medium'
                        : isCurrent
                        ? 'bg-violet-100 text-violet-700 font-medium'
                        : isCurrentMonth
                        ? 'hover:bg-slate-100 text-slate-700'
                        : 'text-slate-300'
                    }`}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <div>
                <p className="text-sm text-slate-500">Current Streak</p>
                <p className="text-xl font-bold text-orange-500 flex items-center gap-1">
                  <Flame className="h-5 w-5" />
                  {selectedHabit.streakCount} days
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Total Completions</p>
                <p className="text-xl font-bold text-emerald-500">{selectedHabit.completedDates.length}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add/Edit Habit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingHabit ? 'Edit Habit' : 'New Habit'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Habit Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Exercise, Read, Meditate..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {(['health', 'productivity', 'learning', 'other'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                    category === cat
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl">{categoryIcons[cat]}</span>
                  <span className="capitalize text-sm font-medium">{cat}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly' | 'custom')}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
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
              className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
            >
              {editingHabit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

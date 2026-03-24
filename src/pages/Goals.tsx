import { useState } from 'react';
import { Target, Plus, Trash2, Edit3, CheckCircle2, Circle, Calendar, Link2, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { Goal } from '../types';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

const CATEGORY_COLORS: Record<string, { bg: string; text: string; darkBg: string; darkText: string; icon: string }> = {
  career: { bg: 'bg-blue-50', text: 'text-blue-600', darkBg: 'bg-blue-500/10', darkText: 'text-blue-400', icon: '💼' },
  health: { bg: 'bg-emerald-50', text: 'text-emerald-600', darkBg: 'bg-emerald-500/10', darkText: 'text-emerald-400', icon: '💪' },
  financial: { bg: 'bg-amber-50', text: 'text-amber-600', darkBg: 'bg-amber-500/10', darkText: 'text-amber-400', icon: '💰' },
  personal: { bg: 'bg-violet-50', text: 'text-violet-600', darkBg: 'bg-violet-500/10', darkText: 'text-violet-400', icon: '🌟' },
};

export function Goals() {
  const { theme } = useTheme();
  const { state, dispatch } = useApp();
  const isDark = theme === 'dark';

  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const [formData, setFormData] = useState({
    title: '', description: '', category: 'career' as Goal['category'],
    targetDate: '', milestones: [{ id: uuidv4(), title: '', completed: false }],
  });

  const cardBg = isDark ? 'bg-gray-900/60 border-gray-800' : 'bg-white/80 border-slate-200';
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-slate-500';
  const inputBg = isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-slate-200 text-slate-700';

  const resetForm = () => {
    setFormData({ title: '', description: '', category: 'career', targetDate: '', milestones: [{ id: uuidv4(), title: '', completed: false }] });
    setEditingGoal(null);
    setShowForm(false);
  };

  const openEdit = (goal: Goal) => {
    setFormData({
      title: goal.title, description: goal.description, category: goal.category,
      targetDate: goal.targetDate ? format(new Date(goal.targetDate), 'yyyy-MM-dd') : '',
      milestones: goal.milestones.length > 0 ? goal.milestones : [{ id: uuidv4(), title: '', completed: false }],
    });
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) return;
    const validMilestones = formData.milestones.filter((m) => m.title.trim());
    const completedCount = validMilestones.filter((m) => m.completed).length;
    const progress = validMilestones.length > 0 ? Math.round((completedCount / validMilestones.length) * 100) : 0;

    if (editingGoal) {
      dispatch({
        type: 'UPDATE_GOAL',
        payload: {
          ...editingGoal, title: formData.title, description: formData.description, category: formData.category,
          targetDate: formData.targetDate ? new Date(formData.targetDate) : null,
          milestones: validMilestones, progress,
        },
      });
    } else {
      dispatch({
        type: 'ADD_GOAL',
        payload: {
          title: formData.title, description: formData.description, category: formData.category,
          targetDate: formData.targetDate ? new Date(formData.targetDate) : null,
          milestones: validMilestones, progress, linkedTaskIds: [], linkedHabitIds: [],
        },
      });
    }
    resetForm();
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    const goal = state.goals.find((g) => g.id === goalId);
    if (!goal) return;
    const updatedMilestones = goal.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    const completedCount = updatedMilestones.filter((m) => m.completed).length;
    dispatch({
      type: 'UPDATE_GOAL',
      payload: { ...goal, milestones: updatedMilestones, progress: Math.round((completedCount / updatedMilestones.length) * 100) },
    });
  };

  const filteredGoals = filterCategory === 'all' ? state.goals : state.goals.filter((g) => g.category === filterCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="apple-title-large">Goals</h1>
          <p className="apple-subheadline mt-1">Set and track your short-term and long-term goals</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-accent)] text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <Plus className="h-4 w-4" /> New Goal
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'career', 'health', 'financial', 'personal'].map((cat) => (
          <button key={cat} onClick={() => setFilterCategory(cat)}
            className={`apple-pill ${filterCategory === cat ? 'apple-pill-active' : ''}`}>
            {cat === 'all' ? '🎯 All' : `${CATEGORY_COLORS[cat]?.icon} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`}
          </button>
        ))}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => resetForm()}>
          <div className={`w-full max-w-lg rounded-2xl border p-6 ${cardBg}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-bold ${textPrimary}`}>{editingGoal ? 'Edit Goal' : 'New Goal'}</h2>
              <button onClick={resetForm} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-slate-100'}`}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input placeholder="Goal title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${inputBg}`} />
              <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3} className={`w-full px-3 py-2 rounded-lg border text-sm resize-none ${inputBg}`} />
              <div className="grid grid-cols-2 gap-3">
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as Goal['category'] })}
                  className={`px-3 py-2 rounded-lg border text-sm ${inputBg}`}>
                  <option value="career">💼 Career</option>
                  <option value="health">💪 Health</option>
                  <option value="financial">💰 Financial</option>
                  <option value="personal">🌟 Personal</option>
                </select>
                <input type="date" value={formData.targetDate} onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className={`px-3 py-2 rounded-lg border text-sm ${inputBg}`} />
              </div>
              {/* Milestones */}
              <div>
                <p className={`text-xs font-semibold uppercase mb-2 ${textSecondary}`}>Milestones</p>
                {formData.milestones.map((m, i) => (
                  <div key={m.id} className="flex items-center gap-2 mb-2">
                    <input placeholder={`Milestone ${i + 1}`} value={m.title}
                      onChange={(e) => {
                        const updated = [...formData.milestones];
                        updated[i] = { ...updated[i], title: e.target.value };
                        setFormData({ ...formData, milestones: updated });
                      }}
                      className={`flex-1 px-3 py-1.5 rounded-lg border text-sm ${inputBg}`} />
                    <button onClick={() => setFormData({ ...formData, milestones: formData.milestones.filter((_, j) => j !== i) })}
                      className="text-red-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
                <button onClick={() => setFormData({ ...formData, milestones: [...formData.milestones, { id: uuidv4(), title: '', completed: false }] })}
                  className={`text-sm font-medium ${isDark ? 'text-violet-400' : 'text-violet-600'} hover:underline`}>+ Add milestone</button>
              </div>
              <button onClick={handleSubmit} className="w-full py-2.5 bg-[var(--color-accent)] text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl">
                {editingGoal ? 'Update Goal' : 'Create Goal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goal cards */}
      {filteredGoals.length === 0 ? (
        <div className={`text-center py-16 ${textSecondary}`}>
          <Target className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No goals yet</p>
          <p className="text-sm">Create your first goal to start tracking progress</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGoals.map((goal) => {
            const cat = CATEGORY_COLORS[goal.category] || CATEGORY_COLORS.personal;
            const isExpanded = expandedGoal === goal.id;
            return (
              <div key={goal.id} className={`rounded-2xl border p-5 ${cardBg} backdrop-blur-sm transition-all hover:shadow-lg`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${isDark ? cat.darkBg + ' ' + cat.darkText : cat.bg + ' ' + cat.text}`}>
                      {cat.icon} {goal.category}
                    </span>
                    {goal.targetDate && (
                      <span className={`flex items-center gap-1 text-xs ${textSecondary}`}>
                        <Calendar className="h-3 w-3" /> {format(new Date(goal.targetDate), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(goal)} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-800 text-gray-500' : 'hover:bg-slate-100 text-slate-400'}`}>
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => dispatch({ type: 'DELETE_GOAL', payload: goal.id })} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-800 text-red-500' : 'hover:bg-red-50 text-red-400'}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <h3 className={`text-lg font-bold mb-1 ${textPrimary}`}>{goal.title}</h3>
                {goal.description && <p className={`text-sm mb-3 line-clamp-2 ${textSecondary}`}>{goal.description}</p>}

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-semibold ${textSecondary}`}>Progress</span>
                    <span className={`text-xs font-bold ${goal.progress >= 100 ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-violet-400' : 'text-violet-600')}`}>{goal.progress}%</span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-slate-100'}`}>
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${goal.progress >= 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-[var(--color-accent)]'}`}
                      style={{ width: `${Math.min(goal.progress, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Milestones toggle */}
                {goal.milestones.length > 0 && (
                  <div>
                    <button onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
                      className={`flex items-center gap-1 text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-slate-500'} hover:underline`}>
                      {goal.milestones.filter((m) => m.completed).length}/{goal.milestones.length} milestones
                      {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                    {isExpanded && (
                      <div className="mt-2 space-y-1.5">
                        {goal.milestones.map((m) => (
                          <button key={m.id} onClick={() => toggleMilestone(goal.id, m.id)}
                            className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left text-sm transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-slate-50'}`}>
                            {m.completed ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> : <Circle className={`h-4 w-4 shrink-0 ${textSecondary}`} />}
                            <span className={`${m.completed ? 'line-through opacity-50' : ''} ${textPrimary}`}>{m.title}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Linked items */}
                {(goal.linkedTaskIds.length > 0 || goal.linkedHabitIds.length > 0) && (
                  <div className={`mt-3 pt-3 border-t ${isDark ? 'border-gray-800' : 'border-slate-100'}`}>
                    <div className={`flex items-center gap-1 text-xs ${textSecondary}`}>
                      <Link2 className="h-3 w-3" />
                      {goal.linkedTaskIds.length > 0 && <span>{goal.linkedTaskIds.length} tasks</span>}
                      {goal.linkedHabitIds.length > 0 && <span>{goal.linkedHabitIds.length} habits</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Goals;

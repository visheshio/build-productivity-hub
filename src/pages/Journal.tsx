import { useState } from 'react';
import { BookOpen, Plus, Trash2, Edit3, Smile, X, TrendingUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { JournalEntry } from '../types';
import { format, subDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const MOOD_EMOJIS = ['😢', '😕', '😐', '🙂', '😄'];
const MOOD_LABELS = ['Terrible', 'Bad', 'Okay', 'Good', 'Great'];
const MOOD_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];

const GRATITUDE_PROMPTS = [
  'What made you smile today?',
  'What are you thankful for right now?',
  'Who made a positive impact on your day?',
  'What small win did you have today?',
  'What is something beautiful you noticed today?',
];

export function Journal() {
  const { theme } = useTheme();
  const { state, dispatch } = useApp();
  const isDark = theme === 'dark';

  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [content, setContent] = useState('');
  const [moodRating, setMoodRating] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [gratitudeItems, setGratitudeItems] = useState<string[]>(['']);

  const cardBg = isDark ? 'bg-gray-900/60 border-gray-800' : 'bg-white/80 border-slate-200';
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-slate-500';
  const inputBg = isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-slate-200 text-slate-700';

  const randomPrompt = GRATITUDE_PROMPTS[Math.floor(Math.random() * GRATITUDE_PROMPTS.length)];

  const resetForm = () => {
    setContent('');
    setMoodRating(3);
    setGratitudeItems(['']);
    setEditingEntry(null);
    setShowForm(false);
  };

  const openEdit = (entry: JournalEntry) => {
    setContent(entry.content);
    setMoodRating(entry.moodRating);
    setGratitudeItems(entry.gratitude.length > 0 ? entry.gratitude : ['']);
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!content.trim()) return;
    const validGratitude = gratitudeItems.filter((g) => g.trim());
    if (editingEntry) {
      dispatch({
        type: 'UPDATE_JOURNAL_ENTRY',
        payload: { ...editingEntry, content, moodRating, gratitude: validGratitude, date: editingEntry.date },
      });
    } else {
      dispatch({
        type: 'ADD_JOURNAL_ENTRY',
        payload: { content, moodRating, gratitude: validGratitude, date: new Date() },
      });
    }
    resetForm();
  };

  // Weekly mood trend data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const entry = state.journalEntries.find((e) => format(new Date(e.date), 'yyyy-MM-dd') === dateStr);
    return { day: format(date, 'EEE'), mood: entry?.moodRating || null, date: dateStr };
  });

  const avgMood = state.journalEntries.length > 0
    ? (state.journalEntries.reduce((s, e) => s + e.moodRating, 0) / state.journalEntries.length).toFixed(1)
    : '—';

  const sortedEntries = [...state.journalEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className={`text-2xl font-bold ${textPrimary}`}>Daily Journal</h1>
          <p className={`text-sm mt-1 ${textSecondary}`}>Reflect on your day and track your mood</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <Plus className="h-4 w-4" /> New Entry
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className={`rounded-2xl border p-4 ${cardBg} backdrop-blur-sm`}>
          <p className={`text-xs font-semibold uppercase ${textSecondary}`}>Total Entries</p>
          <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>{state.journalEntries.length}</p>
        </div>
        <div className={`rounded-2xl border p-4 ${cardBg} backdrop-blur-sm`}>
          <p className={`text-xs font-semibold uppercase ${textSecondary}`}>Avg Mood</p>
          <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{avgMood}</p>
        </div>
        <div className={`rounded-2xl border p-4 ${cardBg} backdrop-blur-sm`}>
          <p className={`text-xs font-semibold uppercase ${textSecondary}`}>Today</p>
          <p className="text-2xl mt-1">
            {state.journalEntries.find((e) => format(new Date(e.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))
              ? MOOD_EMOJIS[(state.journalEntries.find((e) => format(new Date(e.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))?.moodRating || 3) - 1]
              : '—'}
          </p>
        </div>
        <div className={`rounded-2xl border p-4 ${cardBg} backdrop-blur-sm`}>
          <p className={`text-xs font-semibold uppercase ${textSecondary}`}>Gratitude Items</p>
          <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
            {state.journalEntries.reduce((s, e) => s + e.gratitude.length, 0)}
          </p>
        </div>
      </div>

      {/* Mood trend chart */}
      <div className={`rounded-2xl border p-5 ${cardBg} backdrop-blur-sm`}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className={`h-4 w-4 ${isDark ? 'text-violet-400' : 'text-violet-600'}`} />
          <h3 className={`text-sm font-semibold uppercase tracking-wider ${textSecondary}`}>Weekly Mood Trend</h3>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={last7Days}>
            <defs>
              <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: isDark ? '#9ca3af' : '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 12, fill: isDark ? '#9ca3af' : '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: isDark ? '#1f2937' : '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              formatter={(value: number) => [value ? `${MOOD_EMOJIS[value - 1]} ${MOOD_LABELS[value - 1]}` : 'No entry', 'Mood']}
            />
            <Area type="monotone" dataKey="mood" stroke="#8b5cf6" fill="url(#moodGradient)" strokeWidth={2} connectNulls dot={{ fill: '#8b5cf6', r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => resetForm()}>
          <div className={`w-full max-w-lg rounded-2xl border p-6 max-h-[90vh] overflow-y-auto ${cardBg}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-bold ${textPrimary}`}>{editingEntry ? 'Edit Entry' : 'New Journal Entry'}</h2>
              <button onClick={resetForm} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-slate-100'}`}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              {/* Mood selector */}
              <div>
                <p className={`text-xs font-semibold uppercase mb-2 ${textSecondary}`}>How are you feeling?</p>
                <div className="flex items-center justify-center gap-3">
                  {MOOD_EMOJIS.map((emoji, i) => (
                    <button key={i} onClick={() => setMoodRating((i + 1) as 1 | 2 | 3 | 4 | 5)}
                      className={`text-3xl p-2 rounded-xl transition-all ${moodRating === i + 1 ? 'scale-125 bg-violet-500/20 shadow-lg' : 'opacity-50 hover:opacity-80 hover:scale-110'}`}>
                      {emoji}
                    </button>
                  ))}
                </div>
                <p className={`text-center text-sm mt-1 font-medium`} style={{ color: MOOD_COLORS[moodRating - 1] }}>{MOOD_LABELS[moodRating - 1]}</p>
              </div>

              <textarea placeholder="How was your day? What's on your mind?" value={content} onChange={(e) => setContent(e.target.value)}
                rows={5} className={`w-full px-3 py-2 rounded-lg border text-sm resize-none ${inputBg}`} />

              {/* Gratitude */}
              <div>
                <p className={`text-xs font-semibold uppercase mb-1 ${textSecondary}`}>Gratitude</p>
                <p className={`text-xs mb-2 italic ${textSecondary}`}>{randomPrompt}</p>
                {gratitudeItems.map((g, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <span className="text-sm">🙏</span>
                    <input placeholder="I'm grateful for..." value={g}
                      onChange={(e) => { const u = [...gratitudeItems]; u[i] = e.target.value; setGratitudeItems(u); }}
                      className={`flex-1 px-3 py-1.5 rounded-lg border text-sm ${inputBg}`} />
                    {gratitudeItems.length > 1 && (
                      <button onClick={() => setGratitudeItems(gratitudeItems.filter((_, j) => j !== i))} className="text-red-400"><X className="h-4 w-4" /></button>
                    )}
                  </div>
                ))}
                <button onClick={() => setGratitudeItems([...gratitudeItems, ''])}
                  className={`text-sm font-medium ${isDark ? 'text-violet-400' : 'text-violet-600'} hover:underline`}>+ Add more</button>
              </div>

              <button onClick={handleSubmit} className="w-full py-2.5 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl text-sm font-semibold shadow-lg">
                {editingEntry ? 'Update Entry' : 'Save Entry'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Entries list */}
      {sortedEntries.length === 0 ? (
        <div className={`text-center py-16 ${textSecondary}`}>
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No journal entries yet</p>
          <p className="text-sm">Start reflecting on your day</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedEntries.map((entry) => (
            <div key={entry.id} className={`rounded-2xl border p-5 ${cardBg} backdrop-blur-sm transition-all hover:shadow-lg`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{MOOD_EMOJIS[entry.moodRating - 1]}</span>
                  <div>
                    <p className={`text-sm font-semibold ${textPrimary}`}>{format(new Date(entry.date), 'EEEE, MMMM d, yyyy')}</p>
                    <p className={`text-xs`} style={{ color: MOOD_COLORS[entry.moodRating - 1] }}>{MOOD_LABELS[entry.moodRating - 1]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(entry)} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-800 text-gray-500' : 'hover:bg-slate-100 text-slate-400'}`}>
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button onClick={() => dispatch({ type: 'DELETE_JOURNAL_ENTRY', payload: entry.id })} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-800 text-red-500' : 'hover:bg-red-50 text-red-400'}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className={`text-sm whitespace-pre-wrap mb-3 ${textPrimary}`}>{entry.content}</p>
              {entry.gratitude.length > 0 && (
                <div className={`pt-3 border-t ${isDark ? 'border-gray-800' : 'border-slate-100'}`}>
                  <p className={`text-xs font-semibold uppercase mb-1.5 ${textSecondary}`}>Gratitude</p>
                  {entry.gratitude.map((g, i) => (
                    <p key={i} className={`text-sm flex items-center gap-1.5 mb-0.5 ${textSecondary}`}>🙏 {g}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Journal;

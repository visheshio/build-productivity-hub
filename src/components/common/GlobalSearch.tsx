import { useState, useEffect, useRef } from 'react';
import { Search, X, StickyNote, CheckSquare, DollarSign, Calendar, Target, BookOpen, Clock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface SearchResult {
  id: string;
  type: 'note' | 'todo' | 'expense' | 'event' | 'goal' | 'journal';
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
}

const TYPE_ICONS = {
  note: <StickyNote className="h-4 w-4" />,
  todo: <CheckSquare className="h-4 w-4" />,
  expense: <DollarSign className="h-4 w-4" />,
  event: <Calendar className="h-4 w-4" />,
  goal: <Target className="h-4 w-4" />,
  journal: <BookOpen className="h-4 w-4" />,
};

const TYPE_COLORS: Record<string, string> = {
  note: 'text-amber-500',
  todo: 'text-emerald-500',
  expense: 'text-blue-500',
  event: 'text-cyan-500',
  goal: 'text-violet-500',
  journal: 'text-rose-500',
};

export function GlobalSearch({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { theme } = useTheme();
  const { state } = useApp();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const allResults: SearchResult[] = [];

  // Search notes
  state.notes.forEach((n) => {
    if (n.title.toLowerCase().includes(query.toLowerCase()) || n.content.toLowerCase().includes(query.toLowerCase())) {
      allResults.push({ id: n.id, type: 'note', title: n.title, description: n.content.slice(0, 80), icon: TYPE_ICONS.note, route: '/notes' });
    }
  });

  // Search todos
  state.todos.forEach((t) => {
    if (t.title.toLowerCase().includes(query.toLowerCase()) || t.description.toLowerCase().includes(query.toLowerCase())) {
      allResults.push({ id: t.id, type: 'todo', title: t.title, description: `${t.status} • ${t.priority} priority`, icon: TYPE_ICONS.todo, route: '/todos' });
    }
  });

  // Search expenses
  state.expenses.forEach((e) => {
    if (e.description.toLowerCase().includes(query.toLowerCase()) || e.category.toLowerCase().includes(query.toLowerCase())) {
      allResults.push({ id: e.id, type: 'expense', title: `${e.type === 'income' ? '+' : '-'}$${e.amount}`, description: `${e.category} • ${e.description}`, icon: TYPE_ICONS.expense, route: '/expenses' });
    }
  });

  // Search events
  state.events.forEach((ev) => {
    if (ev.title.toLowerCase().includes(query.toLowerCase()) || ev.description.toLowerCase().includes(query.toLowerCase())) {
      allResults.push({ id: ev.id, type: 'event', title: ev.title, description: format(new Date(ev.startTime), 'MMM d, h:mm a'), icon: TYPE_ICONS.event, route: '/scheduler' });
    }
  });

  // Search goals
  state.goals.forEach((g) => {
    if (g.title.toLowerCase().includes(query.toLowerCase()) || g.description.toLowerCase().includes(query.toLowerCase())) {
      allResults.push({ id: g.id, type: 'goal', title: g.title, description: `${g.progress}% complete • ${g.category}`, icon: TYPE_ICONS.goal, route: '/goals' });
    }
  });

  // Search journal
  state.journalEntries.forEach((j) => {
    if (j.content.toLowerCase().includes(query.toLowerCase())) {
      allResults.push({ id: j.id, type: 'journal', title: format(new Date(j.date), 'MMM d, yyyy'), description: j.content.slice(0, 80), icon: TYPE_ICONS.journal, route: '/journal' });
    }
  });

  const filtered = filterType === 'all' ? allResults : allResults.filter((r) => r.type === filterType);
  const displayResults = query.trim() ? filtered.slice(0, 20) : [];

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className={`relative w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-slate-200'}`}
        onClick={(e) => e.stopPropagation()}>
        {/* Input */}
        <div className={`flex items-center gap-3 px-4 py-3 border-b ${isDark ? 'border-gray-800' : 'border-slate-100'}`}>
          <Search className={`h-5 w-5 shrink-0 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} />
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across all modules..."
            className={`flex-1 bg-transparent outline-none text-sm ${isDark ? 'text-white placeholder:text-gray-500' : 'text-slate-900 placeholder:text-slate-400'}`} />
          <button onClick={onClose} className={`p-1 rounded-md ${isDark ? 'hover:bg-gray-800 text-gray-500' : 'hover:bg-slate-100 text-slate-400'}`}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Filter tabs */}
        <div className={`flex gap-1 px-3 py-2 border-b overflow-x-auto ${isDark ? 'border-gray-800' : 'border-slate-100'}`}>
          {['all', 'note', 'todo', 'expense', 'event', 'goal', 'journal'].map((t) => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                filterType === t
                  ? 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white'
                  : isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-slate-500 hover:bg-slate-100'
              }`}>
              {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1) + 's'}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-1.5">
          {!query.trim() ? (
            <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
              <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Start typing to search...</p>
            </div>
          ) : displayResults.length === 0 ? (
            <div className={`text-center py-8 text-sm ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>No results found</div>
          ) : (
            displayResults.map((result) => (
              <button key={`${result.type}-${result.id}`}
                onClick={() => { navigate(result.route); onClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-violet-50'}`}>
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${isDark ? 'bg-gray-800' : 'bg-slate-100'} ${TYPE_COLORS[result.type]}`}>
                  {result.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{result.title}</p>
                  <p className={`text-xs truncate ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>{result.description}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-md shrink-0 ${isDark ? 'bg-gray-800 text-gray-500' : 'bg-slate-100 text-slate-400'}`}>
                  {result.type}
                </span>
              </button>
            ))
          )}
        </div>

        <div className={`px-4 py-2 border-t text-xs ${isDark ? 'border-gray-800 text-gray-600' : 'border-slate-100 text-slate-400'}`}>
          {displayResults.length} results {filterType !== 'all' ? `in ${filterType}s` : ''}
        </div>
      </div>
    </div>
  );
}

export default GlobalSearch;

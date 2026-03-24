import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Command, StickyNote, CheckSquare, DollarSign, Timer, Target, BookOpen, BarChart3, Calendar, ArrowRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
}

export function CommandPalette() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const actions: QuickAction[] = [
    { id: 'nav-dashboard', label: 'Go to Dashboard', description: 'View your overview', icon: <BarChart3 className="h-4 w-4" />, action: () => navigate('/'), category: 'Navigate' },
    { id: 'nav-notes', label: 'Go to Notes', description: 'View all notes', icon: <StickyNote className="h-4 w-4" />, action: () => navigate('/notes'), category: 'Navigate' },
    { id: 'nav-todos', label: 'Go to To-Do List', description: 'Manage tasks', icon: <CheckSquare className="h-4 w-4" />, action: () => navigate('/todos'), category: 'Navigate' },
    { id: 'nav-expenses', label: 'Go to Expenses', description: 'Track finances', icon: <DollarSign className="h-4 w-4" />, action: () => navigate('/expenses'), category: 'Navigate' },
    { id: 'nav-pomodoro', label: 'Start Focus Session', description: 'Open Pomodoro timer', icon: <Timer className="h-4 w-4" />, action: () => navigate('/pomodoro'), category: 'Actions' },
    { id: 'nav-goals', label: 'Go to Goals', description: 'Track your goals', icon: <Target className="h-4 w-4" />, action: () => navigate('/goals'), category: 'Navigate' },
    { id: 'nav-journal', label: 'Go to Journal', description: 'Write a reflection', icon: <BookOpen className="h-4 w-4" />, action: () => navigate('/journal'), category: 'Navigate' },
    { id: 'nav-scheduler', label: 'Go to Scheduler', description: 'View calendar', icon: <Calendar className="h-4 w-4" />, action: () => navigate('/scheduler'), category: 'Navigate' },
    { id: 'nav-achievements', label: 'View Achievements', description: 'See your badges', icon: <Target className="h-4 w-4" />, action: () => navigate('/achievements'), category: 'Navigate' },
    { id: 'nav-analytics', label: 'View Analytics', description: 'See productivity stats', icon: <BarChart3 className="h-4 w-4" />, action: () => navigate('/analytics'), category: 'Navigate' },
  ];

  const filtered = query.trim()
    ? actions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()) || a.description.toLowerCase().includes(query.toLowerCase()))
    : actions;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
      setQuery('');
      setSelectedIndex(0);
    }
    if (e.key === 'Escape') setIsOpen(false);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen]);

  const handleSelect = (action: QuickAction) => {
    action.action();
    setIsOpen(false);
    setQuery('');
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      handleSelect(filtered[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh]" onClick={() => setIsOpen(false)}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />
      <div
        className={`relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isDark
            ? 'bg-gray-900/90 border-gray-700/60 backdrop-blur-xl'
            : 'bg-white/90 border-slate-200/60 backdrop-blur-xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className={`flex items-center gap-3 px-4 py-3.5 border-b ${isDark ? 'border-gray-800/60' : 'border-slate-100'}`}>
          <Search className={`h-5 w-5 shrink-0 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleInputKeyDown}
            placeholder="Type a command or search..."
            className={`flex-1 bg-transparent outline-none text-sm font-medium ${isDark ? 'text-white placeholder:text-gray-500' : 'text-slate-900 placeholder:text-slate-400'}`}
          />
          <kbd className={`hidden sm:inline-flex items-center gap-0.5 px-2 py-1 rounded-md text-[10px] font-semibold tracking-wider ${isDark ? 'bg-gray-800 text-gray-500 border border-gray-700' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-1.5">
          {filtered.length === 0 ? (
            <div className={`text-center py-10 text-sm ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
              <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            Object.entries(
              filtered.reduce((groups, action) => {
                const cat = action.category;
                if (!groups[cat]) groups[cat] = [];
                groups[cat].push(action);
                return groups;
              }, {} as Record<string, QuickAction[]>)
            ).map(([category, items]) => (
              <div key={category}>
                <div className={`px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-600' : 'text-slate-400'}`}>
                  {category}
                </div>
                {items.map((action) => {
                  const globalIdx = filtered.indexOf(action);
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleSelect(action)}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 ${
                        globalIdx === selectedIndex
                          ? isDark ? 'bg-gray-800/80' : 'bg-violet-50'
                          : isDark ? 'hover:bg-gray-800/40' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                        globalIdx === selectedIndex
                          ? 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md'
                          : isDark ? 'bg-gray-800 text-gray-400' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {action.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{action.label}</p>
                        <p className={`text-xs truncate ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>{action.description}</p>
                      </div>
                      {globalIdx === selectedIndex && <ArrowRight className={`h-4 w-4 shrink-0 ${isDark ? 'text-violet-400' : 'text-violet-500'}`} />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className={`px-4 py-2.5 border-t flex items-center justify-between ${isDark ? 'border-gray-800/60' : 'border-slate-100'}`}>
          <span className={`text-[10px] font-semibold flex items-center gap-1 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
            <Command className="h-3 w-3" />K to toggle
          </span>
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${isDark ? 'bg-gray-800 text-gray-500' : 'bg-slate-100 text-slate-400'}`}>↑↓ navigate</span>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${isDark ? 'bg-gray-800 text-gray-500' : 'bg-slate-100 text-slate-400'}`}>↵ select</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;

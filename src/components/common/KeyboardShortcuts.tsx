import { useState, useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const SHORTCUTS = [
  { keys: ['Ctrl', 'K'], action: 'Open Command Palette' },
  { keys: ['Ctrl', 'Shift', 'F'], action: 'Global Search' },
  { keys: ['Ctrl', '/'], action: 'Show Keyboard Shortcuts' },
  { keys: ['Ctrl', 'N'], action: 'New Note (on Notes page)' },
  { keys: ['Ctrl', 'T'], action: 'New Task (on Todos page)' },
  { keys: ['Esc'], action: 'Close dialogs / modals' },
];

export function KeyboardShortcuts() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className={`relative w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-slate-200'}`}
        onClick={(e) => e.stopPropagation()}>
        <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-gray-800' : 'border-slate-100'}`}>
          <div className="flex items-center gap-2">
            <Keyboard className={`h-5 w-5 ${isDark ? 'text-violet-400' : 'text-violet-600'}`} />
            <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Keyboard Shortcuts</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-800 text-gray-500' : 'hover:bg-slate-100 text-slate-400'}`}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4 space-y-1">
          {SHORTCUTS.map((s, i) => (
            <div key={i} className={`flex items-center justify-between px-3 py-2.5 rounded-lg ${isDark ? 'hover:bg-gray-800/50' : 'hover:bg-slate-50'}`}>
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>{s.action}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k, j) => (
                  <span key={j}>
                    <kbd className={`px-2 py-0.5 rounded text-xs font-mono font-semibold ${isDark ? 'bg-gray-800 text-gray-300 border border-gray-700' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                      {k}
                    </kbd>
                    {j < s.keys.length - 1 && <span className={`mx-0.5 text-xs ${isDark ? 'text-gray-600' : 'text-slate-400'}`}>+</span>}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className={`px-5 py-3 border-t text-center ${isDark ? 'border-gray-800' : 'border-slate-100'}`}>
          <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-slate-400'}`}>Press <kbd className={`px-1 rounded text-xs font-mono ${isDark ? 'bg-gray-800' : 'bg-slate-100'}`}>Ctrl /</kbd> to toggle</span>
        </div>
      </div>
    </div>
  );
}

export default KeyboardShortcuts;

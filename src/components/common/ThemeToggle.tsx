import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  compact?: boolean;
}

export function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className={`relative flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
          isDark
            ? 'bg-gray-800 text-amber-400 hover:bg-gray-700'
            : 'bg-slate-100 text-indigo-600 hover:bg-slate-200'
        }`}
      >
        {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        {isDark ? 'Light' : 'Dark'}
      </button>
    );
  }

  return (
    <div
      className={`relative flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 w-16 ${
        isDark ? 'bg-indigo-950 border border-indigo-800' : 'bg-slate-200 border border-slate-300'
      }`}
      onClick={toggleTheme}
      role="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Track icons */}
      <Sun className={`absolute left-1.5 h-3.5 w-3.5 transition-opacity duration-200 ${isDark ? 'opacity-30 text-amber-300' : 'opacity-0'}`} />
      <Moon className={`absolute right-1.5 h-3.5 w-3.5 transition-opacity duration-200 ${isDark ? 'opacity-0' : 'opacity-30 text-slate-500'}`} />

      {/* Thumb */}
      <div
        className={`relative z-10 w-6 h-6 rounded-full shadow-md flex items-center justify-center transition-all duration-300 ${
          isDark
            ? 'translate-x-8 bg-indigo-600 text-white'
            : 'translate-x-0 bg-white text-amber-500'
        }`}
      >
        {isDark ? (
          <Moon className="h-3 w-3" />
        ) : (
          <Sun className="h-3 w-3" />
        )}
      </div>
    </div>
  );
}

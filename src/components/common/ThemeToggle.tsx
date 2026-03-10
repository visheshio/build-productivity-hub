import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  compact?: boolean;
}

export function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  if (compact) {
    return (
      <motion.button
        onClick={toggleTheme}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className={`relative flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 ${isDark
            ? 'bg-gray-800 text-amber-400 hover:bg-gray-700'
            : 'bg-slate-100 text-indigo-600 hover:bg-slate-200'
          }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isDark ? 'sun' : 'moon'}
            initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 30, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.2 }}
          >
            {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </motion.span>
        </AnimatePresence>
        {isDark ? 'Light' : 'Dark'}
      </motion.button>
    );
  }

  return (
    <motion.div
      className={`relative flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 w-16 ${isDark ? 'bg-indigo-950 border border-indigo-800' : 'bg-slate-200 border border-slate-300'
        }`}
      onClick={toggleTheme}
      whileTap={{ scale: 0.95 }}
      role="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Track icons */}
      <Sun className={`absolute left-1.5 h-3.5 w-3.5 transition-opacity duration-200 ${isDark ? 'opacity-30 text-amber-300' : 'opacity-0'}`} />
      <Moon className={`absolute right-1.5 h-3.5 w-3.5 transition-opacity duration-200 ${isDark ? 'opacity-0' : 'opacity-30 text-slate-500'}`} />

      {/* Animated thumb with layoutId */}
      <motion.div
        layout
        layoutId="toggle-thumb"
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`relative z-10 w-6 h-6 rounded-full shadow-md flex items-center justify-center ${isDark ? 'translate-x-8 bg-indigo-600 text-white' : 'translate-x-0 bg-white text-amber-500'
          }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isDark ? 'moon' : 'sun'}
            initial={{ rotate: -60, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 60, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {isDark ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
          </motion.span>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

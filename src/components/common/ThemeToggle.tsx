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
        className="relative flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium smooth-transition"
        style={{
          background: 'var(--color-surface-secondary)',
          color: 'var(--color-accent)',
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isDark ? 'sun' : 'moon'}
            initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 30, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] }}
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
      className="relative flex items-center rounded-full p-1 cursor-pointer w-16"
      style={{
        background: 'var(--color-surface-secondary)',
        border: '1px solid var(--color-border-primary)',
        transition: 'all var(--duration-normal) var(--ease-apple)',
      }}
      onClick={toggleTheme}
      whileTap={{ scale: 0.95 }}
      role="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Track icons */}
      <Sun className={`absolute left-1.5 h-3.5 w-3.5 transition-opacity duration-200 ${isDark ? 'opacity-30' : 'opacity-0'}`}
        style={{ color: 'var(--color-warning)' }} />
      <Moon className={`absolute right-1.5 h-3.5 w-3.5 transition-opacity duration-200 ${isDark ? 'opacity-0' : 'opacity-30'}`}
        style={{ color: 'var(--color-text-tertiary)' }} />

      {/* Animated thumb */}
      <motion.div
        layout
        layoutId="toggle-thumb"
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center ${isDark ? 'translate-x-8' : 'translate-x-0'}`}
        style={{
          background: isDark ? 'var(--color-accent)' : 'var(--color-surface-primary)',
          color: isDark ? '#ffffff' : 'var(--color-warning)',
          boxShadow: 'var(--shadow-sm)',
        }}
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

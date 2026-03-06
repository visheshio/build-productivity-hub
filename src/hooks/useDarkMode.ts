import { useTheme } from '../context/ThemeContext';

/**
 * Returns a set of pre-computed class strings for common dark/light patterns.
 * Use these in page/component JSX to get instant dark mode support.
 */
export function useDarkMode() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return {
    isDark,
    // Page background
    pageBg: isDark ? 'bg-gray-950' : '',
    // Card (white panel)
    card: isDark
      ? 'bg-gray-900 border-gray-800'
      : 'bg-white border-slate-200',
    // Card text
    cardTitle: isDark ? 'text-white' : 'text-slate-900',
    subText: isDark ? 'text-gray-400' : 'text-slate-500',
    mutedText: isDark ? 'text-gray-500' : 'text-slate-400',
    // Input / form fields
    input: isDark
      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500'
      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent',
    // Select
    select: isDark
      ? 'bg-gray-800 border-gray-700 text-white'
      : 'bg-white border-slate-200 text-slate-900',
    // Label
    label: isDark ? 'text-gray-300' : 'text-slate-700',
    // Divider
    divider: isDark ? 'border-gray-800' : 'border-slate-100',
    // Badge/pill backgrounds
    badge: isDark ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-600',
    // Cancel button
    cancelBtn: isDark
      ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
      : 'border-slate-200 text-slate-700 hover:bg-slate-50',
    // Hover row / item
    hoverItem: isDark ? 'hover:bg-gray-800' : 'hover:bg-slate-50',
    // Active filter pill
    activeFilter: 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white',
    inactiveFilter: isDark
      ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
      : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
    // Empty state bg
    emptyBg: isDark ? 'bg-gray-800' : 'bg-slate-100',
    emptyIcon: isDark ? 'text-gray-600' : 'text-slate-400',
    // Tag color helper
    tagColor: (tag: string): string => {
      const map: Record<string, string> = {
        personal: isDark ? 'bg-pink-900/40 text-pink-300' : 'bg-pink-100 text-pink-700',
        work: isDark ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-700',
        ideas: isDark ? 'bg-purple-900/40 text-purple-300' : 'bg-purple-100 text-purple-700',
        important: isDark ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-700',
        learning: isDark ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-700',
        health: isDark ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-100 text-emerald-700',
        productivity: isDark ? 'bg-indigo-900/40 text-indigo-300' : 'bg-indigo-100 text-indigo-700',
      };
      return map[tag] || (isDark ? 'bg-gray-700 text-gray-300' : 'bg-slate-100 text-slate-600');
    },
  };
}

import { useTheme } from '../context/ThemeContext';

/**
 * Returns a set of pre-computed class strings for common dark/light patterns.
 * Updated to use CSS custom properties from the Apple Design Token system.
 * Most values are now theme-independent since CSS vars auto-switch.
 */
export function useDarkMode() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return {
    isDark,
    // Page background — driven by CSS var on html
    pageBg: '',
    // Card (white panel) — uses the apple-card utility
    card: 'apple-card',
    // Card text
    cardTitle: 'text-[var(--color-text-primary)]',
    subText: 'text-[var(--color-text-secondary)]',
    mutedText: 'text-[var(--color-text-tertiary)]',
    // Input / form fields
    input:
      'bg-[var(--color-surface-secondary)] border-[var(--color-border-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] focus:shadow-[var(--shadow-focus)]',
    // Select
    select:
      'bg-[var(--color-surface-secondary)] border-[var(--color-border-primary)] text-[var(--color-text-primary)]',
    // Label
    label: 'text-[var(--color-text-primary)]',
    // Divider
    divider: 'border-[var(--color-border-secondary)]',
    // Badge/pill backgrounds
    badge: 'bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]',
    // Cancel button
    cancelBtn:
      'border-[var(--color-border-primary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)]',
    // Hover row / item
    hoverItem: 'hover:bg-[var(--color-surface-secondary)]',
    // Active filter pill
    activeFilter:
      'bg-[var(--color-accent)] text-white shadow-sm',
    inactiveFilter:
      'bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]',
    // Empty state bg
    emptyBg: 'bg-[var(--color-surface-secondary)]',
    emptyIcon: 'text-[var(--color-text-tertiary)]',
    // Tag color helper — these semantic tag colors still use Tailwind w/ dark: variant
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

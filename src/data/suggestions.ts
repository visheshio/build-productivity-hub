// ─── Default Suggestion Data ─────────────────────────────────────────────────
// Used by SuggestionsContext as initial values before any user customisation.

export const defaultTags: string[] = [
    'Work',
    'Working',
    'Workout',
    'Personal',
    'Important',
    'Urgent',
    'Meeting',
    'Ideas',
    'Project',
    'Health',
    'Finance',
    'Learning',
    'Shopping',
    'Family',
    'Travel',
    'Goals',
    'Review',
    'Research',
    'Planning',
    'Creative',
];

export interface CategoryOption {
    label: string;
    emoji: string;
    color: string; // Tailwind bg+text pair, e.g. "bg-violet-100 text-violet-700"
}

export const defaultCategories: Record<string, CategoryOption[]> = {
    tasks: [
        { label: 'Work', emoji: '💼', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
        { label: 'Personal', emoji: '🏠', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' },
        { label: 'Health', emoji: '❤️', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
        { label: 'Finance', emoji: '💰', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
        { label: 'Learning', emoji: '📚', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
        { label: 'Home', emoji: '🏡', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
        { label: 'Shopping', emoji: '🛍️', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300' },
        { label: 'Other', emoji: '⚙️', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    ],
    expenses: [
        { label: 'Food', emoji: '🍔', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
        { label: 'Transport', emoji: '🚗', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
        { label: 'Entertainment', emoji: '🎬', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
        { label: 'Bills', emoji: '📋', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
        { label: 'Shopping', emoji: '🛍️', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300' },
        { label: 'Health', emoji: '❤️', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
        { label: 'Other', emoji: '⚙️', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    ],
    income: [
        { label: 'Salary', emoji: '💵', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
        { label: 'Freelance', emoji: '💻', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
        { label: 'Investment', emoji: '📈', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' },
        { label: 'Gift', emoji: '🎁', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300' },
        { label: 'Other', emoji: '⚙️', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    ],
    habits: [
        { label: 'Health', emoji: '❤️', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
        { label: 'Productivity', emoji: '⚡', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
        { label: 'Learning', emoji: '📚', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
        { label: 'Fitness', emoji: '🏋️', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
        { label: 'Mindfulness', emoji: '🧘', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' },
    ],
};

export const defaultRecentSearches: string[] = [];

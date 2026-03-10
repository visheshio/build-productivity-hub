import { useCallback, useMemo, useState, ReactNode } from 'react';
import { Clock, FileText, CheckSquare, DollarSign, ArrowRight } from 'lucide-react';
import { AutoSuggest, SuggestionItem } from './AutoSuggest';
import { useRecentSearches } from '../../context/SuggestionsContext';
import { useApp } from '../../context/AppContext';

// ─── Types ───────────────────────────────────────────────────────────────────

export type SearchResultType = 'note' | 'task' | 'expense' | 'habit';

export interface SearchResult {
    id: string;
    label: string;
    type: SearchResultType;
    subtitle?: string;
}

export interface SearchAutoSuggestProps {
    onSelect: (result: SearchResult) => void;
    onClose?: () => void;
    placeholder?: string;
    className?: string;
    maxResults?: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TYPE_META: Record<
    SearchResultType,
    { label: string; icon: ReactNode; color: string }
> = {
    note: {
        label: 'Note',
        icon: <FileText className="h-4 w-4" />,
        color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400',
    },
    task: {
        label: 'Task',
        icon: <CheckSquare className="h-4 w-4" />,
        color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
    },
    expense: {
        label: 'Expense',
        icon: <DollarSign className="h-4 w-4" />,
        color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
    },
    habit: {
        label: 'Habit',
        icon: <ArrowRight className="h-4 w-4" />,
        color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
    },
};

// ─── Component ───────────────────────────────────────────────────────────────

export function SearchAutoSuggest({
    onSelect,
    placeholder = 'Search notes, tasks, expenses, habits...',
    className = '',
    maxResults = 12,
}: SearchAutoSuggestProps) {
    const { state } = useApp();
    const { recentSearches, addRecentSearch, clearRecentSearches } = useRecentSearches();

    // Build search results from app state
    const buildResults = useCallback(
        (query: string): SuggestionItem[] => {
            if (!query.trim()) return [];
            const q = query.toLowerCase();

            const notes: SuggestionItem[] = state.notes
                .filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
                .slice(0, 4)
                .map((n) => ({
                    id: `note-${n.id}`,
                    label: n.title,
                    category: 'Note',
                    icon: <span className={`inline-flex items-center justify-center rounded p-0.5 ${TYPE_META.note.color}`}>{TYPE_META.note.icon}</span>,
                    metadata: { type: 'note', originalId: n.id },
                }));

            const tasks: SuggestionItem[] = state.todos
                .filter((t) => t.title.toLowerCase().includes(q) || (t.description ?? '').toLowerCase().includes(q))
                .slice(0, 4)
                .map((t) => ({
                    id: `task-${t.id}`,
                    label: t.title,
                    category: 'Task',
                    icon: <span className={`inline-flex items-center justify-center rounded p-0.5 ${TYPE_META.task.color}`}>{TYPE_META.task.icon}</span>,
                    metadata: { type: 'task', originalId: t.id },
                }));

            const expenses: SuggestionItem[] = state.expenses
                .filter((e) => e.category.toLowerCase().includes(q) || (e.description ?? '').toLowerCase().includes(q))
                .slice(0, 4)
                .map((e) => ({
                    id: `expense-${e.id}`,
                    label: e.description || e.category,
                    category: 'Expense',
                    icon: <span className={`inline-flex items-center justify-center rounded p-0.5 ${TYPE_META.expense.color}`}>{TYPE_META.expense.icon}</span>,
                    metadata: { type: 'expense', originalId: e.id },
                }));

            const habits: SuggestionItem[] = state.habits
                .filter((h) => h.name.toLowerCase().includes(q))
                .slice(0, 4)
                .map((h) => ({
                    id: `habit-${h.id}`,
                    label: h.name,
                    category: 'Habit',
                    icon: <span className={`inline-flex items-center justify-center rounded p-0.5 ${TYPE_META.habit.color}`}>{TYPE_META.habit.icon}</span>,
                    metadata: { type: 'habit', originalId: h.id },
                }));

            return [...notes, ...tasks, ...expenses, ...habits].slice(0, maxResults);
        },
        [state, maxResults],
    );

    // Memoised recent-search items (shown when input is empty)
    const recentItems: SuggestionItem[] = useMemo(
        () =>
            recentSearches.map((s) => ({
                id: `recent-${s}`,
                label: s,
                category: 'Recent',
                icon: <Clock className="h-3.5 w-3.5 text-slate-400 dark:text-gray-500" />,
                metadata: { type: 'recent' },
            })),
        [recentSearches],
    );

    // We derive the suggestions dynamically — but AutoSuggest filters internally,
    // so we pass the full merged list and rely on its filtering.
    // For empty input we show recent searches; for non-empty we show results.
    const [query, setQuery] = useState('');

    const suggestions: SuggestionItem[] = useMemo(() => {
        return query.trim() ? buildResults(query) : recentItems;
    }, [query, buildResults, recentItems]);

    const handleSelect = useCallback(
        (value: string | SuggestionItem) => {
            const item = typeof value === 'string' ? null : (value as SuggestionItem);
            const label = item?.label ?? (value as string);

            addRecentSearch(label);

            if (item && item.metadata?.type !== 'recent') {
                onSelect({
                    id: item.metadata?.originalId as string,
                    label: item.label,
                    type: item.metadata?.type as SearchResultType,
                });
            } else {
                // For recent searches or plain strings, treat as a text search
                onSelect({ id: label, label, type: 'note' });
            }
        },
        [addRecentSearch, onSelect],
    );

    return (
        <div className={`relative ${className}`}>
            <AutoSuggest
                suggestions={suggestions}
                value={query}
                onChange={setQuery}
                onSelect={handleSelect}
                placeholder={placeholder}
                showIcon
                allowCustomValue
                glass
                minChars={0}
                maxSuggestions={maxResults}
                groupBy="category"
                renderSuggestion={(item, isActive) => (
                    <div className="flex items-center gap-2.5 w-full py-0.5">
                        <span className="flex-shrink-0">{item.icon}</span>
                        <span
                            className={`flex-1 text-sm truncate ${isActive
                                ? 'text-violet-700 dark:text-violet-300'
                                : 'text-slate-700 dark:text-gray-200'
                                }`}
                        >
                            {item.label}
                        </span>
                        {item.category && (
                            <span className="text-xs text-slate-400 dark:text-gray-500 flex-shrink-0">
                                {item.category}
                            </span>
                        )}
                    </div>
                )}
            />

            {/* Recent searches footer */}
            {!query && recentSearches.length > 0 && (
                <div className="flex justify-between items-center mt-1 px-1">
                    <span className="text-xs text-slate-400 dark:text-gray-500">Recent searches</span>
                    <button
                        type="button"
                        onClick={clearRecentSearches}
                        className="text-xs text-violet-500 hover:text-violet-700 dark:text-violet-400 transition-colors"
                    >
                        Clear
                    </button>
                </div>
            )}
        </div>
    );
}

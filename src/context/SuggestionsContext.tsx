import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { defaultTags, defaultCategories, defaultRecentSearches, CategoryOption } from '../data/suggestions';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SuggestionsState {
    tags: string[];
    categories: Record<string, CategoryOption[]>;
    recentSearches: string[];
}

interface SuggestionsContextType {
    tags: string[];
    recentSearches: string[];
    getCategories: (type: string) => CategoryOption[];
    addTag: (tag: string) => void;
    addRecentSearch: (query: string) => void;
    clearRecentSearches: () => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const SuggestionsContext = createContext<SuggestionsContextType | undefined>(undefined);

const STORAGE_KEY = 'productivityHubSuggestions';
const MAX_RECENT_SEARCHES = 10;

function loadFromStorage(): SuggestionsState {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw) as Partial<SuggestionsState>;
            return {
                tags: parsed.tags ?? defaultTags,
                categories: parsed.categories ?? defaultCategories,
                recentSearches: parsed.recentSearches ?? defaultRecentSearches,
            };
        }
    } catch {
        // fall through to defaults
    }
    return {
        tags: defaultTags,
        categories: defaultCategories,
        recentSearches: defaultRecentSearches,
    };
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function SuggestionsProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<SuggestionsState>(loadFromStorage);

    // Persist whenever state changes
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch {
            // storage quota exceeded — silently ignore
        }
    }, [state]);

    const addTag = useCallback((tag: string) => {
        const normalised = tag.trim();
        if (!normalised) return;
        setState((prev) => {
            if (prev.tags.some((t) => t.toLowerCase() === normalised.toLowerCase())) return prev;
            return { ...prev, tags: [...prev.tags, normalised] };
        });
    }, []);

    const getCategories = useCallback(
        (type: string): CategoryOption[] => state.categories[type] ?? [],
        [state.categories],
    );

    const addRecentSearch = useCallback((query: string) => {
        const trimmed = query.trim();
        if (!trimmed) return;
        setState((prev) => {
            const filtered = prev.recentSearches.filter(
                (s) => s.toLowerCase() !== trimmed.toLowerCase(),
            );
            return {
                ...prev,
                recentSearches: [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES),
            };
        });
    }, []);

    const clearRecentSearches = useCallback(() => {
        setState((prev) => ({ ...prev, recentSearches: [] }));
    }, []);

    const value: SuggestionsContextType = {
        tags: state.tags,
        recentSearches: state.recentSearches,
        getCategories,
        addTag,
        addRecentSearch,
        clearRecentSearches,
    };

    return (
        <SuggestionsContext.Provider value={value}>
            {children}
        </SuggestionsContext.Provider>
    );
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useSuggestions(): SuggestionsContextType {
    const ctx = useContext(SuggestionsContext);
    if (!ctx) throw new Error('useSuggestions must be used within <SuggestionsProvider>');
    return ctx;
}

export function useTags() {
    const { tags, addTag } = useSuggestions();
    return { tags, addTag };
}

export function useCategories(type: string) {
    const { getCategories } = useSuggestions();
    return getCategories(type);
}

export function useRecentSearches() {
    const { recentSearches, addRecentSearch, clearRecentSearches } = useSuggestions();
    return { recentSearches, addRecentSearch, clearRecentSearches };
}

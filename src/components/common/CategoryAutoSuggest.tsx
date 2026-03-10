import { useCallback, useMemo } from 'react';
import { AutoSuggest, SuggestionItem } from './AutoSuggest';
import { CategoryOption } from '../../data/suggestions';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CategoryAutoSuggestProps {
    /** List of categories to show */
    categories: CategoryOption[] | string[];
    /** Currently selected category label */
    value: string;
    /** Called when a category is selected */
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    /** Use glassmorphism dropdown (default true) */
    glass?: boolean;
    inputId?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toSuggestionItem(cat: CategoryOption | string): SuggestionItem {
    if (typeof cat === 'string') {
        return { id: cat, label: cat };
    }
    return {
        id: cat.label,
        label: cat.label,
        icon: <span role="img" aria-label={cat.label}>{cat.emoji}</span>,
        metadata: { color: cat.color },
    };
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CategoryAutoSuggest({
    categories,
    value,
    onChange,
    placeholder = 'Select category...',
    className = '',
    disabled = false,
    glass = true,
    inputId,
}: CategoryAutoSuggestProps) {
    const items: SuggestionItem[] = useMemo(
        () => (categories as Array<CategoryOption | string>).map(toSuggestionItem),
        [categories],
    );

    // Find the currently selected item (for rendering its color badge)
    const selectedItem = items.find((i) => i.id === value);
    const selectedColor =
        selectedItem?.metadata?.color as string | undefined;

    const handleSelect = useCallback(
        (selected: string | SuggestionItem) => {
            const label = typeof selected === 'string' ? selected : selected.label;
            onChange(label);
        },
        [onChange],
    );

    const renderSuggestion = useCallback(
        (item: SuggestionItem, isActive: boolean) => (
            <div className="flex items-center gap-2.5 w-full">
                {item.icon && (
                    <span className="text-base flex-shrink-0">{item.icon}</span>
                )}
                <span
                    className={`flex-1 text-sm font-medium ${isActive ? 'text-violet-700 dark:text-violet-300' : 'text-slate-700 dark:text-gray-200'
                        }`}
                >
                    {item.label}
                </span>
                {item.id === value && (
                    <span className="text-violet-500 dark:text-violet-400 text-xs flex-shrink-0">✓</span>
                )}
            </div>
        ),
        [value],
    );

    return (
        <div className={`relative ${className}`}>
            {/* Color stripe for selected category */}
            {selectedColor && (
                <span
                    className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-md flex items-center justify-center text-sm pointer-events-none select-none z-10 ${selectedColor}`}
                    aria-hidden="true"
                >
                    {selectedItem?.icon}
                </span>
            )}
            <AutoSuggest
                inputId={inputId}
                suggestions={items}
                value={value}
                onChange={onChange}
                onSelect={handleSelect}
                placeholder={placeholder}
                showDropdownArrow
                allowCustomValue={false}
                minChars={0}
                glass={glass}
                disabled={disabled}
                renderSuggestion={renderSuggestion}
                className={selectedColor ? 'w-full [&_input]:pl-10' : 'w-full'}
            />
        </div>
    );
}

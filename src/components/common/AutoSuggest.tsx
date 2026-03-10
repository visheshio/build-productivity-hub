import {
    useState,
    useRef,
    useEffect,
    useCallback,
    useId,
    ReactNode,
    ChangeEvent,
    KeyboardEvent,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SuggestionItem {
    id: string;
    label: string;
    category?: string;
    icon?: ReactNode;
    metadata?: Record<string, unknown>;
}

export interface AutoSuggestProps {
    /** List of strings or SuggestionItem objects to suggest */
    suggestions: string[] | SuggestionItem[];
    placeholder?: string;
    /** Called when the user selects a value */
    onSelect: (value: string | SuggestionItem) => void;
    /** Controlled value */
    value?: string;
    /** Controlled change handler */
    onChange?: (value: string) => void;
    className?: string;
    /** Max suggestions shown (default 8) */
    maxSuggestions?: number;
    /** Min characters typed before showing dropdown (default 0) */
    minChars?: number;
    /** Debounce delay in ms for filtering (default 150) */
    debounceMs?: number;
    /** Show a leading search icon (default false) */
    showIcon?: boolean;
    /** A chevron icon on the right to signal dropdown behaviour (default false) */
    showDropdownArrow?: boolean;
    /** Allow the user to confirm a value not in the list (default true) */
    allowCustomValue?: boolean;
    /** Key on SuggestionItem to group by */
    groupBy?: string;
    /** Custom renderer for each suggestion row */
    renderSuggestion?: (item: SuggestionItem, isActive: boolean) => ReactNode;
    /** Use glassmorphism style on the dropdown */
    glass?: boolean;
    /** Whether the field is disabled */
    disabled?: boolean;
    /** ID forwarded to the underlying input */
    inputId?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalise(s: string) {
    return s.toLowerCase();
}

function toItem(raw: string | SuggestionItem): SuggestionItem {
    if (typeof raw === 'string') return { id: raw, label: raw };
    return raw;
}

/** Wrap matched substring with a highlighted <span> */
function HighlightMatch({ text, query }: { text: string; query: string }) {
    if (!query) return <>{text}</>;
    const idx = normalise(text).indexOf(normalise(query));
    if (idx === -1) return <>{text}</>;
    return (
        <>
            {text.slice(0, idx)}
            <span className="font-semibold text-violet-600 dark:text-violet-400">
                {text.slice(idx, idx + query.length)}
            </span>
            {text.slice(idx + query.length)}
        </>
    );
}

// ─── Framer Motion variants ───────────────────────────────────────────────────

const dropdownVariants = {
    hidden: { opacity: 0, y: -6, scale: 0.98 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.15, ease: 'easeOut' as const },
    },
    exit: {
        opacity: 0,
        y: -6,
        scale: 0.98,
        transition: { duration: 0.1, ease: 'easeIn' as const },
    },
};


// ─── Component ───────────────────────────────────────────────────────────────

export function AutoSuggest({
    suggestions,
    placeholder = 'Search...',
    onSelect,
    value: controlledValue,
    onChange,
    className = '',
    maxSuggestions = 8,
    minChars = 0,
    debounceMs = 150,
    showIcon = false,
    showDropdownArrow = false,
    allowCustomValue = true,
    groupBy,
    renderSuggestion,
    glass = true,
    disabled = false,
    inputId,
}: AutoSuggestProps) {
    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState('');
    const inputValue = isControlled ? controlledValue : internalValue;

    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [debouncedQuery, setDebouncedQuery] = useState('');

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listboxRef = useRef<HTMLUListElement>(null);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const generatedId = useId();
    const effectiveId = inputId ?? generatedId;
    const listboxId = `${effectiveId}-listbox`;

    // ── Debounced query ──
    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => setDebouncedQuery(inputValue), debounceMs);
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [inputValue, debounceMs]);

    // ── Filtered items ──
    const items: SuggestionItem[] = suggestions.map(toItem);

    const filtered = debouncedQuery.length >= minChars
        ? items
            .filter((item) =>
                normalise(item.label).includes(normalise(debouncedQuery)),
            )
            .slice(0, maxSuggestions)
        : minChars === 0
            ? items.slice(0, maxSuggestions)
            : [];

    // ── Grouped items ──
    const grouped: Record<string, SuggestionItem[]> = {};
    if (groupBy) {
        filtered.forEach((item) => {
            const key = (item.metadata?.[groupBy] as string) ?? item.category ?? 'General';
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(item);
        });
    }
    const flatFiltered = groupBy ? Object.values(grouped).flat() : filtered;

    // ── Click outside ──
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setActiveIndex(-1);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // ── Scroll active item into view ──
    useEffect(() => {
        if (activeIndex >= 0 && listboxRef.current) {
            const el = listboxRef.current.children[activeIndex] as HTMLElement | undefined;
            el?.scrollIntoView({ block: 'nearest' });
        }
    }, [activeIndex]);

    // ── Handlers ──
    const handleInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value;
            if (!isControlled) setInternalValue(val);
            onChange?.(val);
            setIsOpen(true);
            setActiveIndex(-1);
        },
        [isControlled, onChange],
    );

    const handleSelect = useCallback(
        (item: SuggestionItem) => {
            if (!isControlled) setInternalValue(item.label);
            onChange?.(item.label);
            onSelect(typeof suggestions[0] === 'string' ? item.label : item);
            setIsOpen(false);
            setActiveIndex(-1);
            inputRef.current?.blur();
        },
        [isControlled, onChange, onSelect, suggestions],
    );

    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLInputElement>) => {
            if (!isOpen) {
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    setIsOpen(true);
                    setActiveIndex(0);
                    e.preventDefault();
                }
                return;
            }
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setActiveIndex((i) => Math.min(i + 1, flatFiltered.length - 1));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setActiveIndex((i) => Math.max(i - 1, 0));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (activeIndex >= 0 && flatFiltered[activeIndex]) {
                        handleSelect(flatFiltered[activeIndex]);
                    } else if (allowCustomValue && inputValue.trim()) {
                        onSelect(inputValue.trim());
                        setIsOpen(false);
                    }
                    break;
                case 'Escape':
                    setIsOpen(false);
                    setActiveIndex(-1);
                    inputRef.current?.blur();
                    break;
                case 'Tab':
                    setIsOpen(false);
                    break;
            }
        },
        [isOpen, activeIndex, flatFiltered, handleSelect, allowCustomValue, inputValue, onSelect],
    );

    // ── Dropdown panel styles ──
    const dropdownCls = glass
        ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/30 dark:border-gray-700/50'
        : 'bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700';

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Input */}
            <div className="relative">
                {showIcon && (
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-gray-500 pointer-events-none"
                        aria-hidden="true"
                    />
                )}
                <input
                    ref={inputRef}
                    id={effectiveId}
                    type="text"
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-autocomplete="list"
                    aria-controls={listboxId}
                    aria-activedescendant={
                        activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
                    }
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => {
                        if (inputValue.length >= minChars || minChars === 0) setIsOpen(true);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={[
                        'w-full py-2.5 border rounded-xl outline-none text-sm transition-all',
                        'bg-white dark:bg-gray-800',
                        'text-slate-900 dark:text-white',
                        'border-slate-200 dark:border-gray-700',
                        'placeholder:text-slate-400 dark:placeholder:text-gray-500',
                        'focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        showIcon ? 'pl-10' : 'pl-3.5',
                        showDropdownArrow ? 'pr-8' : 'pr-3.5',
                    ].join(' ')}
                    autoComplete="off"
                />
                {showDropdownArrow && (
                    <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => {
                            setIsOpen((o) => !o);
                            inputRef.current?.focus();
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500"
                        aria-hidden="true"
                    >
                        <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        />
                    </button>
                )}
            </div>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="dropdown"
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={`absolute z-50 left-0 right-0 mt-1.5 rounded-xl shadow-xl overflow-hidden ${dropdownCls}`}
                        style={{ maxHeight: 320 }}
                    >
                        <ul
                            ref={listboxRef}
                            id={listboxId}
                            role="listbox"
                            aria-label="Suggestions"
                            className="overflow-y-auto max-h-80 py-1"
                        >
                            {flatFiltered.length > 0 ? (
                                groupBy ? (
                                    Object.entries(grouped).map(([groupLabel, groupItems]) => (
                                        <li key={groupLabel}>
                                            {/* Group header */}
                                            <div className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                                                {groupLabel}
                                            </div>
                                            {groupItems.map((item) => {
                                                const globalIdx = flatFiltered.indexOf(item);
                                                const isActive = activeIndex === globalIdx;
                                                return (
                                                    <SuggestionRow
                                                        key={item.id}
                                                        item={item}
                                                        isActive={isActive}
                                                        index={globalIdx}
                                                        listboxId={listboxId}
                                                        query={debouncedQuery}
                                                        onSelect={handleSelect}
                                                        onHover={() => setActiveIndex(globalIdx)}
                                                        renderSuggestion={renderSuggestion}
                                                    />
                                                );
                                            })}
                                        </li>
                                    ))
                                ) : (
                                    flatFiltered.map((item, idx) => (
                                        <SuggestionRow
                                            key={item.id}
                                            item={item}
                                            isActive={activeIndex === idx}
                                            index={idx}
                                            listboxId={listboxId}
                                            query={debouncedQuery}
                                            onSelect={handleSelect}
                                            onHover={() => setActiveIndex(idx)}
                                            renderSuggestion={renderSuggestion}
                                        />
                                    ))
                                )
                            ) : (
                                <motion.li
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="px-4 py-3 text-sm text-slate-400 dark:text-gray-500 text-center"
                                    role="option"
                                    aria-selected="false"
                                >
                                    No results found
                                </motion.li>
                            )}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── SuggestionRow ───────────────────────────────────────────────────────────

interface SuggestionRowProps {
    item: SuggestionItem;
    isActive: boolean;
    index: number;
    listboxId: string;
    query: string;
    onSelect: (item: SuggestionItem) => void;
    onHover: () => void;
    renderSuggestion?: (item: SuggestionItem, isActive: boolean) => ReactNode;
}

function SuggestionRow({
    item,
    isActive,
    index,
    listboxId,
    query,
    onSelect,
    onHover,
    renderSuggestion,
}: SuggestionRowProps) {
    return (
        <motion.li
            key={item.id}
            id={`${listboxId}-option-${index}`}
            role="option"
            aria-selected={isActive}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03, duration: 0.15, ease: 'easeOut' }}
            onMouseEnter={onHover}
            onMouseDown={(e) => {
                e.preventDefault(); // prevent blur before click
                onSelect(item);
            }}
            className={[
                'flex items-center gap-2.5 px-3 py-2 mx-1 rounded-lg text-sm cursor-pointer select-none transition-colors',
                isActive
                    ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                    : 'text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-800/60',
            ].join(' ')}
        >
            {renderSuggestion ? (
                renderSuggestion(item, isActive)
            ) : (
                <>
                    {item.icon && (
                        <span className="text-base flex-shrink-0" aria-hidden="true">
                            {item.icon}
                        </span>
                    )}
                    <span className="truncate">
                        <HighlightMatch text={item.label} query={query} />
                    </span>
                    {item.category && (
                        <span className="ml-auto text-xs text-slate-400 dark:text-gray-500 flex-shrink-0">
                            {item.category}
                        </span>
                    )}
                </>
            )}
        </motion.li>
    );
}

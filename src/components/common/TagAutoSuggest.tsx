import { useState, useRef, useCallback, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { AutoSuggest, SuggestionItem, AutoSuggestProps } from './AutoSuggest';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TagAutoSuggestProps
    extends Omit<AutoSuggestProps, 'value' | 'onChange' | 'onSelect' | 'allowCustomValue'> {
    /** Currently selected tags */
    selectedTags: string[];
    /** Called when tags change (add or remove) */
    onTagsChange: (tags: string[]) => void;
    /** Whether the user can type any custom tag (default true) */
    allowCustom?: boolean;
    /** Max number of tags (default unlimited) */
    maxTags?: number;
}

// ─── Tag chip colour map ──────────────────────────────────────────────────────

const TAG_COLORS = [
    'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
    'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
    'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
];

function tagColor(tag: string): string {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) hash = (hash * 31 + tag.charCodeAt(i)) | 0;
    return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

// ─── Component ───────────────────────────────────────────────────────────────

export function TagAutoSuggest({
    suggestions,
    selectedTags,
    onTagsChange,
    placeholder = 'Add tag...',
    allowCustom = true,
    maxTags,
    maxSuggestions = 8,
    minChars = 0,
    debounceMs = 150,
    className = '',
    glass = true,
    disabled = false,
}: TagAutoSuggestProps) {
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const id = useId();

    // Filter out already-selected tags
    const availableSuggestions = (suggestions as string[]).filter(
        (s) => !selectedTags.some((t) => t.toLowerCase() === s.toLowerCase()),
    );

    const addTag = useCallback(
        (tag: string) => {
            const trimmed = tag.trim();
            if (!trimmed) return;
            if (maxTags && selectedTags.length >= maxTags) return;
            if (selectedTags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) return;
            onTagsChange([...selectedTags, trimmed]);
            setInputValue('');
        },
        [selectedTags, onTagsChange, maxTags],
    );

    const removeTag = useCallback(
        (tag: string) => {
            onTagsChange(selectedTags.filter((t) => t !== tag));
        },
        [selectedTags, onTagsChange],
    );

    // Backspace removes last tag when input is empty
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
                removeTag(selectedTags[selectedTags.length - 1]);
            }
        },
        [inputValue, selectedTags, removeTag],
    );

    const handleSelect = useCallback(
        (value: string | SuggestionItem) => {
            const label = typeof value === 'string' ? value : value.label;
            addTag(label);
        },
        [addTag],
    );

    const reachedMax = maxTags !== undefined && selectedTags.length >= maxTags;

    return (
        <div className={className}>
            {/* Chips */}
            {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                    <AnimatePresence mode="popLayout">
                        {selectedTags.map((tag) => (
                            <motion.span
                                key={tag}
                                layout
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.7, opacity: 0, transition: { duration: 0.1 } }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${tagColor(tag)}`}
                            >
                                {tag}
                                {!disabled && (
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        aria-label={`Remove tag ${tag}`}
                                        className="rounded-full hover:bg-black/10 dark:hover:bg-white/10 p-0.5 transition-colors"
                                    >
                                        <X className="h-2.5 w-2.5" />
                                    </button>
                                )}
                            </motion.span>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Input with AutoSuggest */}
            {!reachedMax && (
                <AutoSuggest
                    inputId={id}
                    suggestions={availableSuggestions}
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={setInputValue}
                    onSelect={handleSelect}
                    maxSuggestions={maxSuggestions}
                    minChars={minChars}
                    debounceMs={debounceMs}
                    showIcon
                    allowCustomValue={allowCustom}
                    glass={glass}
                    disabled={disabled}
                    className="w-full"
                // We intercept keydown at the input level for backspace
                />
            )}
            {/* Hidden input to capture backspace on the wrapper */}
            {!reachedMax && (
                <input
                    ref={inputRef}
                    type="text"
                    style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0, width: 0 }}
                    onKeyDown={handleKeyDown}
                    tabIndex={-1}
                    aria-hidden="true"
                    readOnly
                />
            )}
            {reachedMax && (
                <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">
                    Maximum {maxTags} tags reached
                </p>
            )}
        </div>
    );
}

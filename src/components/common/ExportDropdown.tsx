import { useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, ChevronDown, Loader2 } from 'lucide-react';

export interface ExportOption {
    label: string;
    icon?: ReactNode;
    onExport: () => void | Promise<void>;
}

export interface ExportDropdownProps {
    options: ExportOption[];
    label?: string;
    className?: string;
    disabled?: boolean;
}

export function ExportDropdown({
    options,
    label = 'Export',
    className = '',
    disabled = false,
}: ExportDropdownProps) {
    const [open, setOpen] = useState(false);
    const [loadingIdx, setLoadingIdx] = useState<number | null>(null);
    const ref = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleOption = useCallback(async (opt: ExportOption, idx: number) => {
        setLoadingIdx(idx);
        try {
            await opt.onExport();
        } finally {
            setTimeout(() => {
                setLoadingIdx(null);
                setOpen(false);
            }, 350);
        }
    }, []);

    return (
        <div ref={ref} className={`relative ${className}`}>
            <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setOpen((o) => !o)}
                disabled={disabled}
                className={[
                    'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                    'bg-gradient-to-r from-emerald-500 to-teal-600 text-white',
                    'shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30',
                    'hover:shadow-xl',
                    'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
                ].join(' ')}
            >
                <Download className="h-4 w-4" />
                {label}
                <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
            </motion.button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className={[
                            'absolute right-0 z-50 mt-2 min-w-[220px] rounded-xl shadow-xl overflow-hidden',
                            'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl',
                            'border border-slate-200/60 dark:border-gray-700/60',
                        ].join(' ')}
                    >
                        <ul className="py-1">
                            {options.map((opt, idx) => {
                                const isLoading = loadingIdx === idx;
                                return (
                                    <li key={idx}>
                                        <button
                                            onClick={() => handleOption(opt, idx)}
                                            disabled={loadingIdx !== null}
                                            className={[
                                                'w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors text-left',
                                                'text-slate-700 dark:text-gray-200',
                                                'hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
                                                'disabled:opacity-50',
                                            ].join(' ')}
                                        >
                                            {isLoading ? (
                                                <Loader2 className="h-4 w-4 text-emerald-500 animate-spin flex-shrink-0" />
                                            ) : (
                                                <span className="flex-shrink-0 text-emerald-600 dark:text-emerald-400">
                                                    {opt.icon ?? <Download className="h-4 w-4" />}
                                                </span>
                                            )}
                                            <span className="font-medium">{opt.label}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

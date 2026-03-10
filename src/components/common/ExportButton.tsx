import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Loader2 } from 'lucide-react';

export interface ExportButtonProps {
    /** Called when the button is clicked; may be async. */
    onExport: () => void | Promise<void>;
    label?: string;
    className?: string;
    disabled?: boolean;
}

export function ExportButton({
    onExport,
    label = 'Export CSV',
    className = '',
    disabled = false,
}: ExportButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleClick = useCallback(async () => {
        if (loading || disabled) return;
        setLoading(true);
        try {
            await onExport();
        } finally {
            // Small delay so the spinner is visible
            setTimeout(() => setLoading(false), 400);
        }
    }, [onExport, loading, disabled]);

    return (
        <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleClick}
            disabled={disabled || loading}
            className={[
                'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                'bg-gradient-to-r from-emerald-500 to-teal-600 text-white',
                'shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30',
                'hover:shadow-xl',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
                className,
            ].join(' ')}
        >
            <AnimatePresence mode="wait" initial={false}>
                {loading ? (
                    <motion.span
                        key="loader"
                        initial={{ opacity: 0, rotate: -90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                    >
                        <Loader2 className="h-4 w-4 animate-spin" />
                    </motion.span>
                ) : (
                    <motion.span
                        key="icon"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                    >
                        <Download className="h-4 w-4" />
                    </motion.span>
                )}
            </AnimatePresence>
            {label}
        </motion.button>
    );
}

import { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
    value: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    className?: string;
    formatFn?: (n: number) => string;
}

/**
 * AnimatedNumber - counts up from 0 to `value` on mount
 * Respects prefers-reduced-motion automatically
 */
export function AnimatedNumber({
    value,
    duration = 800,
    prefix = '',
    suffix = '',
    decimals = 0,
    className = '',
    formatFn,
}: AnimatedNumberProps) {
    const prefersReducedMotion =
        typeof window !== 'undefined'
            ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
            : false;

    const [displayValue, setDisplayValue] = useState(prefersReducedMotion ? value : 0);
    const rafRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const startValueRef = useRef(0);

    useEffect(() => {
        if (prefersReducedMotion) {
            setDisplayValue(value);
            return;
        }

        if (rafRef.current) cancelAnimationFrame(rafRef.current);

        const from = startValueRef.current;
        startTimeRef.current = null;

        const animate = (timestamp: number) => {
            if (!startTimeRef.current) startTimeRef.current = timestamp;
            const elapsed = timestamp - startTimeRef.current;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = from + (value - from) * eased;
            setDisplayValue(current);
            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate);
            } else {
                startValueRef.current = value;
            }
        };

        rafRef.current = requestAnimationFrame(animate);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [value, duration, prefersReducedMotion]);

    const formatted = formatFn
        ? formatFn(displayValue)
        : decimals > 0
            ? displayValue.toFixed(decimals)
            : Math.round(displayValue).toLocaleString();

    return (
        <span className={className}>
            {prefix}{formatted}{suffix}
        </span>
    );
}

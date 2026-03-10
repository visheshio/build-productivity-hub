import { useEffect, useRef } from 'react';

interface ConfettiCelebrationProps {
    active: boolean;
    particleCount?: number;
    duration?: number;
}

const COLORS = ['#8b5cf6', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#ef4444'];

interface Particle {
    x: number; y: number; vx: number; vy: number;
    color: string; rotation: number; rotationSpeed: number;
    size: number; opacity: number; shape: 'rect' | 'circle';
}

/**
 * ConfettiCelebration - canvas-based confetti burst for milestone moments.
 * Auto-cleans up. Respects prefers-reduced-motion.
 */
export function ConfettiCelebration({ active, particleCount = 60, duration = 2500 }: ConfettiCelebrationProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number | null>(null);
    const prefersReducedMotion =
        typeof window !== 'undefined'
            ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
            : false;

    useEffect(() => {
        if (!active || prefersReducedMotion) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const particles: Particle[] = Array.from({ length: particleCount }, () => ({
            x: Math.random() * canvas.width, y: -20,
            vx: (Math.random() - 0.5) * 8, vy: Math.random() * 6 + 2,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            rotation: Math.random() * 360, rotationSpeed: (Math.random() - 0.5) * 10,
            size: Math.random() * 8 + 4, opacity: 1,
            shape: Math.random() > 0.5 ? 'rect' : 'circle',
        }));
        const startTime = performance.now();
        const loop = (now: number) => {
            const elapsed = now - startTime;
            const progress = elapsed / duration;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p) => {
                p.x += p.vx; p.y += p.vy; p.vy += 0.15;
                p.rotation += p.rotationSpeed;
                p.opacity = Math.max(0, 1 - progress * 1.2);
                ctx.save();
                ctx.globalAlpha = p.opacity;
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color;
                if (p.shape === 'circle') {
                    ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill();
                } else {
                    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
                }
                ctx.restore();
            });
            if (elapsed < duration) { animRef.current = requestAnimationFrame(loop); }
            else { ctx.clearRect(0, 0, canvas.width, canvas.height); }
        };
        animRef.current = requestAnimationFrame(loop);
        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        };
    }, [active, particleCount, duration, prefersReducedMotion]);

    if (prefersReducedMotion) return null;

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[9999]"
            style={{ display: active ? 'block' : 'none' }}
        />
    );
}

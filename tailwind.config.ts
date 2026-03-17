import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      /* ===================== ANIMATION EXTENSIONS ===================== */
      animation: {
        'pulse-subtle': 'pulse-subtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.4s ease-out',
        'bounce-soft': 'bounce-soft 1.5s ease-in-out infinite',
        'shake': 'shake 0.3s ease-in-out',
        'glow': 'glow-pulse 2s ease-in-out infinite',
        'confetti': 'confetti-fall 2s ease-in forwards',
        'celebrate': 'celebrate 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'checkmark-draw': 'checkmark-draw 0.5s ease-out forwards',
      },

      /* ===================== KEYFRAMES EXTENSIONS ===================== */
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'slide-up': {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(-10px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(500px) rotate(720deg)', opacity: '0' },
        },
        'celebrate': {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
          '25%': { transform: 'scale(1.1) rotate(5deg)' },
          '50%': { transform: 'scale(1.15) rotate(0deg)' },
          '75%': { transform: 'scale(1.1) rotate(-5deg)' },
        },
        'checkmark-draw': {
          '0%': { strokeDashoffset: '50' },
          '100%': { strokeDashoffset: '0' },
        },
      },

      /* ===================== TRANSITION TIMING FUNCTIONS ===================== */
      transitionTimingFunction: {
        'apple-ease': 'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
        'apple-ease-in': 'cubic-bezier(0.42, 0, 1, 1)',
        'apple-ease-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'apple-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      /* ===================== DURATION EXTENSIONS ===================== */
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },

      /* ===================== BACKDROP BLUR ===================== */
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
      },

      /* ===================== GRADIENT EXTENSIONS ===================== */
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },

      /* ===================== BOX SHADOW EXTENSIONS ===================== */
      boxShadow: {
        'apple-xs': 'var(--shadow-xs)',
        'apple-sm': 'var(--shadow-sm)',
        'apple-md': 'var(--shadow-md)',
        'apple-lg': 'var(--shadow-lg)',
        'apple-xl': 'var(--shadow-xl)',
        'apple-focus': 'var(--shadow-focus)',
        'glow': '0 0 20px rgba(0, 113, 227, 0.4)',
        'glow-lg': '0 0 30px rgba(0, 113, 227, 0.5)',
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'soft-md': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 8px 16px rgba(0, 0, 0, 0.1)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
      },

      /* ===================== Z-INDEX EXTENSIONS ===================== */
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },

      /* ===================== WILL-CHANGE PRESETS ===================== */
      willChange: {
        'transform-opacity': 'transform, opacity',
        'transform-shadow': 'transform, box-shadow',
      },
    },
  },

  plugins: [
    /* Custom plugin for animation utility classes */
    function ({ addUtilities }) {
      const newUtilities = {
        '.animate-in': {
          animation: 'slideDown 500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        },
        '.animate-out': {
          animation: 'slideUp 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        },
        '.transition-gpu': {
          willChange: 'transform',
        },
        '.backface-hidden': {
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        },
        '.perspective': {
          perspective: '1200px',
        },
        '.preserve-3d': {
          transformStyle: 'preserve-3d',
          WebkitTransformStyle: 'preserve-3d',
        },
      };

      addUtilities(newUtilities);
    },
  ],

  darkMode: 'class',
} satisfies Config;

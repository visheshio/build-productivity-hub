/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Extended Variants type that allows a top-level `transition` key.
 * framer-motion's `Variants` type uses `[key: string]: Variant` which
 * excludes `Transition`. Using Record<string, any> preserves full
 * runtime compatibility with both variant definitions and the variants prop.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnimationVariants = Record<string, any>;

/**
 * Animation Duration Constants
 * Use these for consistent timing across the application
 */
export const DURATION = {
  quick: 0.15,
  normal: 0.3,
  medium: 0.4,
  slow: 0.5,
  slower: 0.7,
  slowest: 1,
} as const;

/**
 * Easing Curves
 * Apple-inspired bezier curves for smooth, natural motion
 */
export const EASING = {
  easeOut: [0.25, 0.1, 0.25, 1.0],
  easeInOut: [0.42, 0, 0.58, 1],
  easeIn: [0.42, 0, 1, 1],
  cubic: [0.17, 0.67, 0.83, 0.67],
  spring: { type: 'spring', stiffness: 100, damping: 15 },
  gentleSpring: { type: 'spring', stiffness: 80, damping: 20 },
} as const;

/**
 * FADE ANIMATIONS
 * Opacity-based transitions for smooth appear/disappear effects
 */
export const fadeIn: AnimationVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: DURATION.normal, ease: EASING.easeOut },
};

export const fadeInSlow: AnimationVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: DURATION.slow, ease: EASING.easeOut },
};

export const fadeOut: AnimationVariants = {
  initial: { opacity: 1 },
  animate: { opacity: 0 },
  exit: { opacity: 0 },
  transition: { duration: DURATION.normal, ease: EASING.easeOut },
};

/**
 * SLIDE ANIMATIONS
 * Directional movement transitions (up, down, left, right)
 */
export const slideUp: AnimationVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: DURATION.normal, ease: EASING.easeOut },
};

export const slideUpLarge: AnimationVariants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 40 },
  transition: { duration: DURATION.slow, ease: EASING.easeOut },
};

export const slideDown: AnimationVariants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: DURATION.normal, ease: EASING.easeOut },
};

export const slideDownLarge: AnimationVariants = {
  initial: { opacity: 0, y: -40 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -40 },
  transition: { duration: DURATION.slow, ease: EASING.easeOut },
};

export const slideLeft: AnimationVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: DURATION.normal, ease: EASING.easeOut },
};

export const slideLeftLarge: AnimationVariants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 40 },
  transition: { duration: DURATION.slow, ease: EASING.easeOut },
};

export const slideRight: AnimationVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: DURATION.normal, ease: EASING.easeOut },
};

export const slideRightLarge: AnimationVariants = {
  initial: { opacity: 0, x: -40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
  transition: { duration: DURATION.slow, ease: EASING.easeOut },
};

/**
 * SCALE ANIMATIONS
 * Size-based transitions for zoom effects
 */
export const scaleIn: AnimationVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: DURATION.normal, ease: EASING.easeOut },
};

export const scaleInLarge: AnimationVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  transition: { duration: DURATION.slow, ease: EASING.easeOut },
};

export const scaleOut: AnimationVariants = {
  initial: { opacity: 1, scale: 1 },
  animate: { opacity: 0, scale: 0.9 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: DURATION.normal, ease: EASING.easeOut },
};

/**
 * SPRING BOUNCE ANIMATIONS
 * Physics-based animations for interactive elements (buttons, etc.)
 */
export const springBounce: AnimationVariants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
  transition: EASING.spring,
};

export const springBounceLight: AnimationVariants = {
  initial: { scale: 0.98, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.98, opacity: 0 },
  transition: EASING.gentleSpring,
};

/**
 * PAGE TRANSITION ANIMATIONS
 * Smooth transitions between routes/pages
 */
export const pageTransition: AnimationVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: DURATION.normal, ease: EASING.easeOut },
};

export const pageTransitionFade: AnimationVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: DURATION.normal, ease: EASING.easeOut },
};

/**
 * STAGGER CONTAINER
 * Parent animation for staggered list items
 */
export const staggerContainer: AnimationVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

export const staggerContainerFast: AnimationVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
};

export const staggerContainerSlow: AnimationVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.15,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.08,
      staggerDirection: -1,
    },
  },
};

/**
 * STAGGER ITEM
 * Child animation for staggered lists
 */
export const staggerItem: AnimationVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: DURATION.normal, ease: EASING.easeOut },
};

/**
 * MODAL ANIMATIONS
 * Backdrop and content animations for modals
 */
export const modalBackdrop: AnimationVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: DURATION.normal },
};

export const modalContent: AnimationVariants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
  transition: { duration: DURATION.normal, ease: EASING.easeOut },
};

export const modalSlideUp: AnimationVariants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 40 },
  transition: { duration: DURATION.normal, ease: EASING.easeOut },
};

/**
 * TOAST ANIMATIONS
 * Notifications and toast messages
 */
export const toastEnter: AnimationVariants = {
  initial: { opacity: 0, x: 50, y: 0 },
  animate: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: 50, y: 0 },
  transition: { duration: DURATION.normal, ease: EASING.easeOut },
};

export const toastExit: AnimationVariants = {
  initial: { opacity: 1, x: 0 },
  animate: { opacity: 0, x: 50 },
  transition: { duration: DURATION.normal, ease: EASING.easeOut },
};

/**
 * ROTATION ANIMATIONS
 * Spinning and rotating effects
 */
export const spin: AnimationVariants = {
  animate: { rotate: 360 },
  transition: { duration: 1, repeat: Infinity, ease: 'linear' },
};

export const spinSlow: AnimationVariants = {
  animate: { rotate: 360 },
  transition: { duration: 2, repeat: Infinity, ease: 'linear' },
};

export const spinFast: AnimationVariants = {
  animate: { rotate: 360 },
  transition: { duration: 0.6, repeat: Infinity, ease: 'linear' },
};

/**
 * PULSE ANIMATIONS
 * Subtle opacity pulsing for attention-grabbing elements
 */
export const pulse: AnimationVariants = {
  animate: { opacity: [1, 0.5, 1] },
  transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
};

export const pulseFast: AnimationVariants = {
  animate: { opacity: [1, 0.5, 1] },
  transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
};

/**
 * SHIFT ANIMATIONS
 * Subtle position shifts for hover/focus states
 */
export const shiftUp: AnimationVariants = {
  initial: { y: 0 },
  whileHover: { y: -2 },
  transition: { duration: DURATION.quick },
};

export const shiftRight: AnimationVariants = {
  initial: { x: 0 },
  whileHover: { x: 2 },
  transition: { duration: DURATION.quick },
};

/**
 * COMBINED ANIMATIONS
 * Complex animations combining multiple properties
 */
export const cardHover: AnimationVariants = {
  initial: { y: 0, boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' },
  whileHover: { y: -4, boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.15)' },
  transition: { duration: DURATION.quick, ease: EASING.easeOut },
};

export const buttonPress: AnimationVariants = {
  whileTap: { scale: 0.96 },
  transition: { duration: DURATION.quick },
};

export const glow: AnimationVariants = {
  animate: {
    boxShadow: [
      '0px 0px 10px rgba(59, 130, 246, 0.5)',
      '0px 0px 20px rgba(59, 130, 246, 0.7)',
      '0px 0px 10px rgba(59, 130, 246, 0.5)',
    ],
  },
  transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
};

/**
 * COMPOSITION HELPER
 * Combine multiple animation variants
 */
export const compose = (...variants: AnimationVariants[]): AnimationVariants => {
  return variants.reduce((acc, variant) => ({ ...acc, ...variant }), {});
};

/**
 * TRANSITION CONFIGURATION
 * Reusable transition configs for consistent timing
 */
export const transitions = {
  quick: { duration: DURATION.quick, ease: EASING.easeOut },
  normal: { duration: DURATION.normal, ease: EASING.easeOut },
  medium: { duration: DURATION.medium, ease: EASING.easeOut },
  slow: { duration: DURATION.slow, ease: EASING.easeOut },
  spring: EASING.spring,
  gentleSpring: EASING.gentleSpring,
} as const;

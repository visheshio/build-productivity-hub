import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { modalBackdrop, modalContent } from '../../utils/animations';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const maxW = size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-2xl' : 'max-w-lg';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            variants={modalBackdrop}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0"
            style={{
              backgroundColor: 'var(--color-overlay)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
            onClick={onClose}
          />
          <motion.div
            variants={modalContent}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`relative rounded-[var(--radius-xl)] w-full ${maxW} max-h-[90vh] overflow-hidden`}
            style={{
              background: 'var(--color-vibrancy-heavy)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid var(--color-border-subtle)',
              boxShadow: 'var(--shadow-xl)',
              transition: 'background var(--duration-slow) var(--ease-apple)',
            }}
          >
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid var(--color-border-secondary)' }}>
              <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>{title}</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-1.5 rounded-lg smooth-transition"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>
            <div className="px-5 py-4 overflow-y-auto max-h-[calc(90vh-70px)]">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

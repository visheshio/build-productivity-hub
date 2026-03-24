import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, RefreshCw } from 'lucide-react';
import { Roadmap } from '../../types';

interface Props {
  roadmap: Roadmap;
  isOpen: boolean;
  onClose: () => void;
  onAdjust: (updates: any) => void;
}

export function AdjustPlanModal({ roadmap, isOpen, onClose, onAdjust }: Props) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleApply = async () => {
    setIsGenerating(true);
    // Simulate AI regeneration delay
    await new Promise(r => setTimeout(r, 2000));
    setIsGenerating(false);
    onAdjust({ goal_statement: prompt || roadmap.goal_statement }); // stub update
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-surface-primary rounded-3xl shadow-xl overflow-hidden flex flex-col p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-primary">Adjust Plan with AI</h2>
            <button onClick={onClose} className="p-2 text-text-tertiary hover:text-text-primary rounded-full hover:bg-surface-secondary smooth-transition">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-[15px] text-text-secondary">
              Tell the incredibly smart AI what you'd like to change about this roadmap.
            </p>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g. 'Make phase 2 focus more on French cuisine' or 'Make the tasks shorter'"
              className="w-full h-32 p-4 rounded-xl bg-surface-secondary text-text-primary font-medium outline-none border border-transparent focus:border-accent/40 focus:bg-surface-primary smooth-transition resize-none"
            />
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button onClick={onClose} className="px-5 py-2.5 font-medium text-text-secondary hover:text-text-primary smooth-transition">
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={isGenerating || !prompt.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-white smooth-transition disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-gradient-to))' }}
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isGenerating ? 'Regenerating...' : 'Update Plan'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

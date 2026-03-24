import React from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { WizardState } from './CreationWizard';

interface Props {
  data: WizardState;
  updateData: (d: Partial<WizardState>) => void;
  onNext: () => void;
  onCancel: () => void;
}

const POPULAR_SKILLS = [
  { icon: '🍳', label: 'Cooking' },
  { icon: '💻', label: 'Web Development' },
  { icon: '🎸', label: 'Guitar' },
  { icon: '📸', label: 'Photography' },
  { icon: '🗣', label: 'Public Speaking' },
  { icon: '📊', label: 'Data Science' },
];

export function WizardStepSkill({ data, updateData, onNext, onCancel }: Props) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && data.skill.trim()) onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-text-primary mb-2">What do you want to learn?</h2>
        <p className="text-[17px] text-text-secondary">Enter any skill, topic, or subject</p>
      </div>

      <div className="max-w-xl mx-auto w-full space-y-8 flex-1">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-text-tertiary group-focus-within:text-accent smooth-transition" />
          <input
            autoFocus
            type="text"
            value={data.skill}
            onChange={e => updateData({ skill: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Cooking, Python, Guitar..."
            className="w-full h-14 pl-14 pr-12 rounded-2xl bg-surface-secondary text-text-primary text-xl font-medium outline-none border border-transparent focus:border-accent/40 focus:bg-surface-primary smooth-transition"
            style={{ boxShadow: 'var(--shadow-sm)' }}
          />
          {data.skill && (
            <button 
              onClick={() => updateData({ skill: '' })}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-4">Suggestions</p>
          <div className="flex flex-wrap gap-2.5">
            {POPULAR_SKILLS.map(skill => (
              <button
                key={skill.label}
                onClick={() => updateData({ skill: skill.label })}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-secondary hover:bg-surface-border smooth-transition text-[15px] font-medium text-text-primary"
              >
                <span>{skill.icon}</span> {skill.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 flex items-center justify-between border-t border-border-primary">
        <button 
          onClick={onCancel}
          className="px-6 py-2.5 font-medium text-text-secondary hover:text-text-primary smooth-transition"
        >
          Cancel
        </button>
        <button 
          onClick={onNext}
          disabled={!data.skill.trim()}
          className="px-8 py-2.5 rounded-xl font-medium text-white smooth-transition disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'var(--color-accent)' }}
        >
          Next
        </button>
      </div>
    </motion.div>
  );
}

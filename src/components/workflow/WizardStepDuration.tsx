import React from 'react';
import { motion } from 'framer-motion';
import { WizardState } from './CreationWizard';

interface Props {
  data: WizardState;
  updateData: (d: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const DURATIONS = [
  { value: 1, label: '1 Week Sprint', icon: '⚡', desc: 'Crash course — learn the essentials', timeHint: '~1-2 hours/day' },
  { value: 4, label: '1 Month', icon: '📅', desc: 'Solid foundation with practice time', timeHint: '~45 min/day' },
  { value: 12, label: '3 Months', icon: '📆', desc: 'Comprehensive learning journey', timeHint: '~30-45 min/day', recommended: true },
  { value: 24, label: '6 Months', icon: '🗓', desc: 'Deep expertise with mastery time', timeHint: '~20-30 min/day' },
];

export function WizardStepDuration({ data, updateData, onNext, onBack }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-text-primary mb-2">How much time do you have?</h2>
        <p className="text-[17px] text-text-secondary">We'll adjust the depth and pace accordingly</p>
      </div>

      <div className="max-w-xl mx-auto w-full space-y-4 flex-1">
        <div className="grid gap-3">
          {DURATIONS.map(dur => {
            const isSelected = data.durationWeeks === dur.value;
            return (
              <button
                key={dur.value}
                onClick={() => updateData({ durationWeeks: dur.value })}
                className={`relative flex items-center p-4 rounded-2xl border text-left smooth-transition bg-surface-primary hover:bg-surface-secondary ${
                  isSelected ? 'border-accent ring-1 ring-accent/30' : 'border-border-primary'
                }`}
                style={{
                  backgroundColor: isSelected ? 'var(--color-primary-container)' : undefined
                }}
              >
                <div className="text-3xl mr-4">{dur.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-semibold text-lg ${isSelected ? 'text-accent' : 'text-text-primary'}`}>
                      {dur.label}
                    </h3>
                    {dur.recommended && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold uppercase tracking-wider dark:bg-emerald-500/20 dark:text-emerald-400">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary mt-0.5">{dur.desc}</p>
                </div>
                <div className="text-sm font-medium text-text-tertiary">
                  {dur.timeHint}
                </div>
                <div className="ml-4 flex-shrink-0">
                  <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center smooth-transition ${
                    isSelected ? 'border-accent bg-accent' : 'border-border-heavy'
                  }`}>
                    {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 pt-6 flex items-center justify-between border-t border-border-primary">
        <button 
          onClick={onBack}
          className="px-6 py-2.5 font-medium text-text-secondary hover:text-text-primary smooth-transition"
        >
          Back
        </button>
        <button 
          onClick={onNext}
          className="px-8 py-2.5 rounded-xl font-medium text-white smooth-transition"
          style={{ background: 'var(--color-accent)' }}
        >
          Next
        </button>
      </div>
    </motion.div>
  );
}

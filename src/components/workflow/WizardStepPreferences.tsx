import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { WizardState } from './CreationWizard';

interface Props {
  data: WizardState;
  updateData: (d: Partial<WizardState>) => void;
  onSubmit: () => void;
  onBack: () => void;
}

const LEVELS = [
  { id: 'beginner', icon: '🌱', label: 'Complete Beginner' },
  { id: 'some_basics', icon: '🌿', label: 'Some Basics' },
  { id: 'intermediate', icon: '🌳', label: 'Intermediate' },
  { id: 'advanced', icon: '🏆', label: 'Advanced' },
];

const PREFERENCES = [
  '📹 Video Tutorials', '📖 Reading/Articles', '🎧 Podcasts/Audio',
  '💻 Hands-on Projects', '📝 Courses', '🤝 Community/Forums',
  '📱 Mobile Apps', '📚 Books'
];

export function WizardStepPreferences({ data, updateData, onSubmit, onBack }: Props) {
  const togglePref = (pref: string) => {
    if (data.learningPreferences.includes(pref)) {
      updateData({ learningPreferences: data.learningPreferences.filter(p => p !== pref) });
    } else {
      updateData({ learningPreferences: [...data.learningPreferences, pref] });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-text-primary mb-2">Tell us about your experience</h2>
        <p className="text-[17px] text-text-secondary">This helps us customize your roadmap</p>
      </div>

      <div className="max-w-xl mx-auto w-full space-y-8 flex-1">
        {/* Experience Level */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-3">CURRENT LEVEL</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {LEVELS.map(level => {
              const isSelected = data.experienceLevel === level.id;
              return (
                <button
                  key={level.id}
                  onClick={() => updateData({ experienceLevel: level.id })}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border smooth-transition bg-surface-primary hover:bg-surface-secondary ${
                    isSelected ? 'border-accent bg-blue-50/50 dark:bg-blue-900/10 ring-1 ring-accent' : 'border-border-primary'
                  }`}
                >
                  <span className="text-3xl mb-2">{level.icon}</span>
                  <span className={`text-[13px] font-medium text-center ${isSelected ? 'text-accent' : 'text-text-primary'}`}>
                    {level.label}
                  </span>
                  <div className={`mt-3 h-4 w-4 rounded-full border flex flex-none items-center justify-center smooth-transition ${
                    isSelected ? 'border-accent bg-accent' : 'border-border-heavy'
                  }`}>
                    {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Learning Style */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-3">HOW DO YOU PREFER TO LEARN?</label>
          <div className="flex flex-wrap gap-2.5">
            {PREFERENCES.map(pref => {
              const isSelected = data.learningPreferences.includes(pref);
              return (
                <button
                  key={pref}
                  onClick={() => togglePref(pref)}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium smooth-transition border ${
                    isSelected 
                      ? 'bg-accent border-accent text-white shadow-md' 
                      : 'bg-surface-secondary border-transparent text-text-primary hover:bg-surface-border'
                  }`}
                >
                  {pref}
                </button>
              );
            })}
          </div>
        </div>

        {/* Goal Statement */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-3">WHAT'S YOUR SPECIFIC GOAL? <span className="text-text-tertiary font-normal">(Optional)</span></label>
          <textarea
            value={data.goalStatement}
            onChange={(e) => updateData({ goalStatement: e.target.value })}
            placeholder="e.g., I want to cook healthy meals for my family"
            className="w-full p-4 rounded-2xl bg-surface-secondary text-text-primary text-sm font-medium outline-none border border-transparent focus:border-accent/40 focus:bg-surface-primary smooth-transition resize-none"
            rows={3}
            style={{ boxShadow: 'var(--shadow-sm)' }}
          />
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
          onClick={onSubmit}
          className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-medium text-white smooth-transition"
          style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-gradient-to))', boxShadow: 'var(--shadow-md)' }}
        >
          <Sparkles className="h-4 w-4" />
          Generate Roadmap
        </button>
      </div>
    </motion.div>
  );
}

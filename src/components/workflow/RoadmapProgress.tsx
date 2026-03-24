import React from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Compass, CalendarCheck } from 'lucide-react';
import { Roadmap } from '../../types';

export function RoadmapProgress({ roadmap }: { roadmap: Roadmap }) {
  let totalTasks = 0;
  let compTasks = 0;
  let milestonesCount = 0;
  let compMilestones = 0;

  roadmap.phases.forEach(p => {
    milestonesCount += p.milestones.length;
    p.milestones.forEach(m => {
      if (m.is_completed) compMilestones++;
      totalTasks += m.tasks.length;
      compTasks += m.tasks.filter(t => t.is_completed).length;
    });
  });

  const percent = totalTasks > 0 ? Math.round((compTasks / totalTasks) * 100) : roadmap.progress_percentage;

  const STATS = [
    { label: 'Completion', value: `${percent}%`, icon: TrendingUp, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Milestones', value: `${compMilestones}/${milestonesCount}`, icon: Target, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Tasks Done', value: compTasks, icon: CheckSquareIcon, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Est. End', value: new Date(roadmap.estimated_completion).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), icon: CalendarCheck, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-surface-primary rounded-2xl p-5 border border-border-subtle flex flex-col items-center justify-center text-center"
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            <div className={`h-10 w-10 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="text-[28px] font-bold text-text-primary leading-none mb-1">{stat.value}</p>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-surface-primary rounded-2xl p-6 border border-border-subtle" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
          <Compass className="h-5 w-5 text-accent" /> Journey Heatmap
        </h3>
        <div className="flex items-center justify-center h-48 bg-surface-secondary rounded-xl border border-dashed border-border-primary text-text-tertiary">
          [Activity Heatmap Chart Placeholder]
        </div>
      </div>
    </div>
  );
}

function CheckSquareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

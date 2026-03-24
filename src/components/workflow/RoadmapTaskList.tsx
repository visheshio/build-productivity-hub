import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Clock, Target, Calendar } from 'lucide-react';
import { Roadmap, RoadmapTask, RoadmapMilestone, Phase } from '../../types';
import { useApp } from '../../context/AppContext';

export function RoadmapTaskList({ roadmap }: { roadmap: Roadmap }) {
  const { dispatch } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Flatten tasks for easy view
  const allTasks: { task: RoadmapTask; milestone: RoadmapMilestone; phase: Phase }[] = [];
  
  roadmap.phases.forEach(p => {
    p.milestones.forEach(m => {
      m.tasks.forEach(t => {
        allTasks.push({ task: t, milestone: m, phase: p });
      });
    });
  });

  const filteredTasks = allTasks.filter(item => {
    if (filter === 'completed') return item.task.is_completed;
    if (filter === 'pending') return !item.task.is_completed;
    return true;
  });

  const toggleTask = (phaseId: string, milestoneId: string, taskId: string) => {
    dispatch({ type: 'TOGGLE_ROADMAP_TASK', payload: { roadmapId: roadmap.id, phaseId, milestoneId, taskId } });
  };

  return (
    <div className="bg-surface-primary rounded-2xl border border-border-subtle p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">All Tasks</h2>
          <p className="text-[15px] text-text-secondary mt-1">{filteredTasks.length} {filter === 'all' ? 'total' : filter} tasks</p>
        </div>
        
        <div className="flex p-1 bg-surface-secondary rounded-xl">
          {(['all', 'pending', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize smooth-transition ${
                filter === f ? 'bg-surface-primary text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-primary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {filteredTasks.length === 0 ? (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-text-tertiary py-12">
              No tasks found.
            </motion.p>
          ) : (
            filteredTasks.map(({ task, milestone, phase }) => (
              <motion.div
                layout
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-4 p-4 rounded-xl border border-transparent hover:border-border-subtle bg-surface-secondary/30 hover:bg-surface-secondary smooth-transition group"
              >
                <button 
                  onClick={() => toggleTask(phase.id, milestone.id, task.id)}
                  className="flex-shrink-0 text-text-tertiary hover:text-accent"
                >
                  {task.is_completed ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> : <Circle className="h-6 w-6" />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <h4 className={`text-[15px] font-semibold truncate ${task.is_completed ? 'text-text-tertiary line-through' : 'text-text-primary'}`}>
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded flex-shrink-0">
                      Phase {phase.phase_number}
                    </span>
                    <span className="text-xs text-text-tertiary truncate flex items-center gap-1.5">
                      <Target className="h-3 w-3" /> {milestone.title}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-text-secondary flex-shrink-0">
                  {task.estimated_minutes && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      <Clock className="h-3.5 w-3.5" /> {task.estimated_minutes}m
                    </div>
                  )}
                  <button className="opacity-0 group-hover:opacity-100 p-2 text-text-tertiary hover:text-accent bg-surface-primary shadow-sm border border-border-subtle rounded-lg smooth-transition">
                    <Calendar className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

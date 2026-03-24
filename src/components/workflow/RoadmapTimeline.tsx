import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, ChevronDown, Play, Clock, BookOpen } from 'lucide-react';
import { Roadmap, Phase, RoadmapMilestone, RoadmapTask } from '../../types';
import { useApp } from '../../context/AppContext';

export function RoadmapTimeline({ roadmap }: { roadmap: Roadmap }) {
  // We sort phases by order_index just in case
  const sortedPhases = [...roadmap.phases].sort((a, b) => a.order_index - b.order_index);

  return (
    <div className="space-y-6">
      {sortedPhases.map((phase, index) => (
        <PhaseCard 
          key={phase.id} 
          phase={phase} 
          roadmapId={roadmap.id} 
          isFirst={index === 0} 
          isLast={index === sortedPhases.length - 1} 
        />
      ))}
    </div>
  );
}

function PhaseCard({ phase, roadmapId, isFirst, isLast }: { phase: Phase; roadmapId: string; isFirst: boolean; isLast: boolean }) {
  const { dispatch } = useApp();
  const [expanded, setExpanded] = React.useState(phase.status === 'in_progress' || isFirst);

  const isActive = phase.status === 'in_progress';
  const isCompleted = phase.status === 'completed';

  return (
    <div className="relative pl-6 md:pl-8">
      {/* Vertical Timeline Line */}
      {!isLast && (
        <div className="absolute top-8 bottom-[-24px] left-[11px] w-0.5 bg-border-subtle" />
      )}
      
      {/* Node Pulse */}
      <div className={`absolute top-6 left-0 h-6 w-6 rounded-full border-4 border-surface-bg bg-surface-primary flex items-center justify-center ${
        isActive ? 'ring-2 ring-accent border-accent text-accent' : 
        isCompleted ? 'ring-2 ring-emerald-500 border-emerald-500 text-emerald-500' : 'ring-2 ring-border-primary text-text-tertiary'
      }`}>
        <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-accent' : isCompleted ? 'bg-emerald-500' : 'bg-transparent'}`} />
      </div>

      {/* Main Card */}
      <motion.div
        layout
        className={`bg-surface-primary border rounded-2xl overflow-hidden smooth-transition ${
          isActive ? 'border-accent/40 shadow-sm' : 'border-border-primary'
        }`}
      >
        <button 
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left p-5 flex items-start gap-4 hover:bg-surface-secondary/50 smooth-transition"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-accent' : 'text-text-tertiary'}`}>
                Phase {phase.phase_number} • {phase.duration_text}
              </span>
              {isActive && (
                <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-bold">CURRENT</span>
              )}
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-1">{phase.title}</h3>
            <p className="text-[15px] text-text-secondary">{phase.description}</p>
          </div>
          <div className="mt-1 p-1 bg-surface-secondary text-text-tertiary rounded-lg">
            <motion.div animate={{ rotate: expanded ? 180 : 0 }}>
              <ChevronDown className="h-5 w-5" />
            </motion.div>
          </div>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border-secondary bg-surface-secondary/30"
            >
              <div className="p-5 space-y-4">
                {/* Milestones list */}
                {phase.milestones.length === 0 ? (
                  <p className="text-sm text-text-tertiary italic">No milestones defined.</p>
                ) : (
                  phase.milestones.map((m) => (
                    <MilestoneItem key={m.id} milestone={m} phaseId={phase.id} roadmapId={roadmapId} />
                  ))
                )}
                
                {/* Resources trigger info */}
                {phase.resources.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-dashed border-border-primary">
                    <div className="flex items-center gap-2 text-[13px] font-medium text-text-secondary">
                      <BookOpen className="h-4 w-4 text-accent" />
                      Includes {phase.resources.length} learning resources (See Resources tab)
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function MilestoneItem({ milestone, phaseId, roadmapId }: { milestone: RoadmapMilestone; phaseId: string; roadmapId: string }) {
  const { dispatch } = useApp();

  const toggleMilestone = () => {
    dispatch({ type: 'TOGGLE_ROADMAP_MILESTONE', payload: { roadmapId, phaseId, milestoneId: milestone.id } });
  };

  const toggleTask = (taskId: string) => {
    dispatch({ type: 'TOGGLE_ROADMAP_TASK', payload: { roadmapId, phaseId, milestoneId: milestone.id, taskId } });
  };

  return (
    <div className="bg-surface-primary rounded-xl border border-border-subtle p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <button onClick={toggleMilestone} className="mt-0.5 text-text-tertiary hover:text-text-primary smooth-transition">
          {milestone.is_completed ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>
        <div className="flex-1">
          <h4 className={`text-[15px] font-semibold ${milestone.is_completed ? 'text-text-tertiary line-through' : 'text-text-primary'}`}>
            {milestone.title}
          </h4>
          
          {/* Actionable tasks beneath milestone */}
          {milestone.tasks.length > 0 && (
            <div className="mt-3 space-y-2">
              {milestone.tasks.map(t => (
                <div key={t.id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-surface-secondary/50 group border border-transparent hover:border-border-subtle smooth-transition">
                  <button onClick={() => toggleTask(t.id)} className="mt-0.5 text-text-tertiary hover:text-accent">
                    {t.is_completed ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Circle className="h-4 w-4" />}
                  </button>
                  <div className="flex-1">
                    <p className={`text-sm ${t.is_completed ? 'text-text-tertiary line-through' : 'text-text-primary mt-[1px]'}`}>
                      {t.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 smooth-transition">
                    <button className="p-1 px-2 text-[10px] font-bold uppercase tracking-wider text-text-secondary bg-surface-primary rounded shadow-sm border border-border-subtle hover:text-accent">
                      Start
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

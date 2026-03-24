import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Pencil, RefreshCw, Share2, MoreHorizontal, Map, ListTodo, BookOpen, BarChart2, Target, Flame } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RoadmapTimeline } from '../components/workflow/RoadmapTimeline';
import { RoadmapTaskList } from '../components/workflow/RoadmapTaskList';
import { ResourceList } from '../components/workflow/ResourceList';
import { RoadmapProgress } from '../components/workflow/RoadmapProgress';
import { AdjustPlanModal } from '../components/workflow/AdjustPlanModal';
import { Roadmap } from '../types';

export function RoadmapView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState<'roadmap' | 'tasks' | 'resources' | 'progress'>('roadmap');
  const [adjustOpen, setAdjustOpen] = useState(false);

  const roadmap = state.roadmaps.find(r => r.id === id);

  if (!roadmap) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="text-4xl mb-4">🗺️</div>
        <p className="text-text-secondary font-medium">Roadmap not found or deleted.</p>
        <button onClick={() => navigate('/roadmaps')} className="mt-6 px-6 py-2 bg-surface-secondary hover:bg-surface-border smooth-transition rounded-xl font-medium text-text-primary">
          Back to Workflows
        </button>
      </div>
    );
  }

  // Aggregate
  let totalTasks = 0;
  let compTasks = 0;
  let totalMilestones = 0;
  let compMilestones = 0;
  roadmap.phases.forEach(p => {
    totalMilestones += p.milestones.length;
    p.milestones.forEach(m => {
      if (m.is_completed) compMilestones++;
      totalTasks += m.tasks.length;
      if (m.tasks.filter(t => t.is_completed).length === m.tasks.length) {
        // Just for aggregate example, if tasks are tracked at milestone level
      }
      compTasks += m.tasks.filter(t => t.is_completed).length;
    });
  });

  const percent = totalTasks > 0 ? Math.round((compTasks / totalTasks) * 100) : roadmap.progress_percentage;

  // Tabs
  const TABS = [
    { id: 'roadmap', label: 'Roadmap', icon: Map },
    { id: 'tasks', label: 'Tasks', icon: ListTodo },
    { id: 'resources', label: 'Resources', icon: BookOpen },
    { id: 'progress', label: 'Progress', icon: BarChart2 },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-32">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button 
            onClick={() => navigate('/roadmaps')}
            className="flex items-center gap-1.5 text-sm font-semibold text-text-tertiary hover:text-text-primary smooth-transition mb-3"
          >
            <ArrowLeft className="h-4 w-4" /> Workflow Builder
          </button>
          
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-text-primary">
              {roadmap.skill.toLowerCase().includes('cook') ? '🍳' : '🗺️'} {roadmap.skill}
            </h1>
          </div>
          <div className="flex items-center gap-2 mt-2 text-[13px] font-medium text-text-secondary uppercase tracking-wider">
            <span>{roadmap.duration_weeks} WEEKS</span>
            <span className="w-1 h-1 rounded-full bg-border-heavy" />
            <span>{roadmap.daily_minutes} MIN/DAY</span>
            <span className="w-1 h-1 rounded-full bg-border-heavy" />
            <span>{roadmap.experience_level.replace('_', ' ')}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => setAdjustOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-surface-primary hover:bg-surface-secondary border border-border-primary rounded-xl text-sm font-semibold text-text-primary smooth-transition shadow-sm">
            <Pencil className="h-4 w-4" /> Adjust
          </button>
          <button className="p-2 bg-surface-primary hover:bg-surface-secondary border border-border-primary rounded-xl text-text-secondary hover:text-text-primary smooth-transition shadow-sm">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button className="p-2 bg-surface-primary hover:bg-surface-secondary border border-border-primary rounded-xl text-text-secondary hover:text-text-primary smooth-transition shadow-sm">
            <Share2 className="h-4 w-4" />
          </button>
          <button className="p-2 bg-surface-primary hover:bg-surface-secondary border border-border-primary rounded-xl text-text-secondary hover:text-text-primary smooth-transition shadow-sm">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* OVERALL PROGRESS CARD */}
      <div 
        className="bg-surface-primary rounded-2xl p-6 border border-border-subtle overflow-hidden relative"
        style={{ boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="relative z-10">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xl font-bold text-text-primary">Overall Progress</h2>
            <span className="text-3xl font-bold text-accent">{percent}%</span>
          </div>
          
          <div className="h-2 w-full bg-surface-secondary rounded-full overflow-hidden mb-6">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full" 
              style={{ background: 'linear-gradient(90deg, #0071E3, #34C759)' }} // iOS blue to green
            />
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm font-medium">
            <div className="flex items-center gap-2 text-text-secondary">
              <ListTodo className="h-4 w-4" /> {compTasks}/{totalTasks} tasks done
            </div>
            <div className="flex items-center gap-2 text-text-secondary">
              <Target className="h-4 w-4" /> {compMilestones}/{totalMilestones} milestones
            </div>
            <div className="flex items-center gap-2 text-text-secondary">
              <span className="text-emerald-500 font-bold flex items-center gap-1">
                <Flame className="h-4 w-4" /> On track (Ready to learn)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex items-center gap-2 p-1 bg-surface-secondary border border-border-subtle rounded-[14px] w-full max-w-2xl overflow-x-auto no-scrollbar">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'roadmap')}
              className={`relative flex items-center gap-2 flex-1 min-w-[120px] justify-center py-2.5 px-3 rounded-xl text-sm font-medium smooth-transition z-10 ${
                isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeRoadmapTab"
                  className="absolute inset-0 bg-surface-primary rounded-xl"
                  style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-subtle)' }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-20 flex items-center gap-2">
                <tab.icon className={`h-4 w-4 ${isActive ? 'text-accent' : ''}`} />
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'roadmap' && <RoadmapTimeline roadmap={roadmap} />}
          {activeTab === 'tasks' && <RoadmapTaskList roadmap={roadmap} />}
          {activeTab === 'resources' && <ResourceList roadmap={roadmap} />}
          {activeTab === 'progress' && <RoadmapProgress roadmap={roadmap} />}
        </motion.div>
      </AnimatePresence>

      <AdjustPlanModal 
        roadmap={roadmap} 
        isOpen={adjustOpen} 
        onClose={() => setAdjustOpen(false)} 
        onAdjust={() => {}} 
      />
    </div>
  );
}



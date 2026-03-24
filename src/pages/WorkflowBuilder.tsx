import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, MoreHorizontal, BookOpen, CheckSquare, Target } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { CreationWizard } from '../components/workflow/CreationWizard';
import { Roadmap } from '../types';

const POPULAR_SKILLS = [
  { icon: '🍳', label: 'Cooking' },
  { icon: '💻', label: 'Web Development' },
  { icon: '🎸', label: 'Guitar' },
  { icon: '📸', label: 'Photography' },
  { icon: '🗣', label: 'Public Speaking' },
  { icon: '📊', label: 'Data Science' },
  { icon: '✏️', label: 'Drawing' },
  { icon: '🏋️', label: 'Fitness' },
];

export function WorkflowBuilder() {
  const { state } = useApp();
  const roadmaps = state.roadmaps || [];
  const navigate = useNavigate();
  const [wizardOpen, setWizardOpen] = React.useState(false);
  const [prefilledSkill, setPrefilledSkill] = React.useState('');

  const handleStartWizard = (skill = '') => {
    setPrefilledSkill(skill);
    setWizardOpen(true);
  };

  const handleWizardComplete = (roadmapId: string) => {
    setWizardOpen(false);
    // Ideally we navigate to the roadmap ID, but since state might take a tick to update,
    // we just navigate back to roadmaps home or find the latest from state.
    // If we passed the ID correctly, navigate(`/roadmaps/${roadmapId}`);
    // Since we didn't pass exact uuid gracefully when bypassing context generator, 
    // let's grab the newest roadmap after a short delay or let the user click it.
    
    setTimeout(() => {
      navigate('/roadmaps');
      window.scrollTo(0,0);
    }, 100);
  };

  const activeRoadmaps = roadmaps.filter(r => r.status !== 'archived');

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-1">Workflow Builder</h1>
          <p className="text-text-secondary text-[15px]">AI-powered learning roadmaps tailored to your goals</p>
        </div>
        <button 
          onClick={() => handleStartWizard()}
          className="flex flex-none items-center gap-2 h-11 px-5 rounded-xl font-medium text-white smooth-transition"
          style={{
            background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-gradient-to))',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <Plus className="h-5 w-5" />
          New Roadmap
        </button>
      </div>

      <AnimatePresence>
        {wizardOpen && (
          <CreationWizard 
            initialSkill={prefilledSkill}
            onClose={() => setWizardOpen(false)} 
            onComplete={handleWizardComplete} 
          />
        )}
      </AnimatePresence>

      {/* Active Roadmaps */}
      {activeRoadmaps.length > 0 ? (
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-6">Your Roadmaps</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeRoadmaps.map((rm) => (
              <RoadmapCard key={rm.id} roadmap={rm} onClick={() => navigate(`/roadmaps/${rm.id}`)} />
            ))}
          </div>
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-surface-primary rounded-3xl border border-border-primary" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="w-20 h-20 bg-surface-secondary rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl text-text-tertiary">🗺️</span>
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">Create your first learning roadmap</h3>
          <p className="text-text-secondary max-w-md mb-8">Tell us what you want to learn and we'll build a personalized plan complete with tasks, resources, and milestones.</p>
          <button 
            onClick={() => handleStartWizard()}
            className="px-8 py-3 rounded-xl font-medium text-white smooth-transition"
            style={{ background: 'var(--color-accent)' }}
          >
            Get Started
          </button>
        </div>
      )}

      {/* Suggestions */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <SparklesIcon className="text-accent" />
          <h2 className="text-xl font-bold text-text-primary">Popular Skills</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {POPULAR_SKILLS.map((skill) => (
            <button
              key={skill.label}
              onClick={() => handleStartWizard(skill.label)}
              className="flex items-center gap-2.5 px-5 py-3 bg-surface-primary border border-border-primary hover:border-accent/40 rounded-full smooth-transition hover:-translate-y-0.5"
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              <span className="text-xl">{skill.icon}</span>
              <span className="font-semibold text-text-primary">{skill.label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function RoadmapCard({ roadmap, onClick }: { roadmap: Roadmap; onClick: () => void }) {
  const isDark = document.documentElement.classList.contains('dark');
  
  // Calculate aggregate stats
  let totalTasks = 0;
  let compTasks = 0;
  let totalRes = 0;
  let totalMilestones = 0;
  
  roadmap.phases.forEach(p => {
    totalRes += p.resources.length;
    totalMilestones += p.milestones.length;
    p.milestones.forEach(m => {
      totalTasks += m.tasks.length;
      compTasks += m.tasks.filter(t => t.is_completed).length;
    });
  });

  const percent = totalTasks > 0 ? Math.round((compTasks / totalTasks) * 100) : roadmap.progress_percentage;
  const currentPhase = roadmap.phases.find(p => p.status === 'in_progress') || roadmap.phases[0];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-surface-primary rounded-2xl p-6 border border-border-subtle flex flex-col cursor-pointer group"
      style={{
        boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.04)',
        transition: 'all var(--duration-normal) var(--ease-apple)'
      }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="h-12 w-12 rounded-2xl bg-surface-secondary flex items-center justify-center text-2xl group-hover:scale-110 smooth-transition">
          {roadmap.skill.toLowerCase().includes('cook') ? '🍳' : '🗺️'}
        </div>
        <button className="p-2 text-text-tertiary hover:text-text-primary rounded-full hover:bg-surface-secondary smooth-transition" onClick={e => e.stopPropagation()}>
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      <h3 className="text-xl font-bold text-text-primary mb-1 line-clamp-1">{roadmap.skill}</h3>
      <p className="text-xs text-text-tertiary font-medium uppercase tracking-wider mb-5">
        {roadmap.duration_weeks} Weel Plan • Started {new Date(roadmap.started_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
      </p>

      <div className="mb-5">
        <div className="flex justify-between items-end mb-2">
          <p className="text-[13px] font-semibold text-accent line-clamp-1">Phase {currentPhase?.phase_number || 1}: {currentPhase?.title || 'Starting out'}</p>
          <span className="text-xs font-bold text-text-secondary ml-2">{percent}%</span>
        </div>
        <div className="h-1.5 w-full bg-surface-secondary rounded-full overflow-hidden">
          <div className="h-full rounded-full smooth-transition" style={{ width: `${percent}%`, background: 'var(--color-accent)' }} />
        </div>
      </div>

      <div className="mt-auto grid grid-cols-3 gap-2 py-4 border-t border-border-secondary text-center">
        <div>
          <div className="flex items-center justify-center gap-1.5 text-text-secondary mb-0.5">
            <CheckSquare className="h-3.5 w-3.5" /> <span className="text-xs font-bold">{compTasks}/{totalTasks}</span>
          </div>
          <p className="text-[10px] text-text-tertiary uppercase tracking-wider font-semibold">Tasks</p>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1.5 text-text-secondary mb-0.5">
            <BookOpen className="h-3.5 w-3.5" /> <span className="text-xs font-bold">{totalRes}</span>
          </div>
          <p className="text-[10px] text-text-tertiary uppercase tracking-wider font-semibold">Sources</p>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1.5 text-text-secondary mb-0.5">
            <Target className="h-3.5 w-3.5" /> <span className="text-xs font-bold">{totalMilestones}</span>
          </div>
          <p className="text-[10px] text-text-tertiary uppercase tracking-wider font-semibold">Goals</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="flex-1 py-2.5 bg-accent/10 hover:bg-accent/20 text-accent font-semibold text-sm rounded-xl smooth-transition text-center">
          Continue
        </button>
      </div>
    </motion.div>
  );
}

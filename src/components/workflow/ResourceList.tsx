import React from 'react';
import { motion } from 'framer-motion';
import { Play, FileText, Headphones, Code, ExternalLink, Bookmark, CheckCircle2 } from 'lucide-react';
import { Roadmap, Phase, Resource } from '../../types';

export function ResourceList({ roadmap }: { roadmap: Roadmap }) {
  const allResources: { resource: Resource; phase: Phase }[] = [];
  
  roadmap.phases.forEach(p => {
    p.resources.forEach(r => {
      allResources.push({ resource: r, phase: p });
    });
  });

  const getIcon = (type: string) => {
    switch(type) {
      case 'video': return <Play className="h-5 w-5 text-rose-500" />;
      case 'article': return <FileText className="h-5 w-5 text-blue-500" />;
      case 'podcast': return <Headphones className="h-5 w-5 text-purple-500" />;
      case 'exercise': return <Code className="h-5 w-5 text-emerald-500" />;
      default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-surface-primary rounded-2xl border border-border-subtle overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="p-6 border-b border-border-secondary">
        <h2 className="text-2xl font-bold text-text-primary">Curated Resources</h2>
        <p className="text-[15px] text-text-secondary mt-1">Hand-picked learning materials for your journey</p>
      </div>
      
      {allResources.length === 0 ? (
        <p className="text-center text-text-tertiary py-12">No resources found.</p>
      ) : (
        <div className="divide-y divide-border-secondary">
          {allResources.map(({ resource, phase }) => (
            <motion.a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              key={resource.id}
              whileHover={{ backgroundColor: 'var(--color-surface-secondary)' }}
              className="flex items-start gap-4 p-6 smooth-transition group block"
            >
              <div className="h-12 w-12 rounded-xl bg-surface-secondary flex items-center justify-center border border-border-primary shrink-0 group-hover:scale-110 smooth-transition">
                {getIcon(resource.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-text-primary group-hover:text-accent smooth-transition flex items-center gap-2">
                      {resource.title}
                      <ExternalLink className="h-3.5 w-3.5 text-text-tertiary opacity-0 group-hover:opacity-100 smooth-transition" />
                    </h3>
                    <p className="text-[15px] text-text-secondary mt-0.5 line-clamp-2">{resource.description}</p>
                  </div>
                  <button onClick={(e) => { e.preventDefault(); }} className="p-2 text-text-tertiary hover:text-accent smooth-transition shrink-0">
                    <Bookmark className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className="px-2.5 py-1 rounded-md bg-surface-secondary text-text-primary text-xs font-semibold uppercase tracking-wider">
                    {resource.source}
                  </span>
                  {resource.duration && (
                    <span className="text-xs font-semibold text-text-secondary">{resource.duration}</span>
                  )}
                  <div className="w-1 h-1 rounded-full bg-border-heavy" />
                  <span className="text-xs font-bold text-accent">Phase {phase.phase_number}</span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      )}
    </div>
  );
}

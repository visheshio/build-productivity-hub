import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const MESSAGES = [
  "Analyzing skill requirements...",
  "Structuring learning phases...",
  "Curating the best resources...",
  "Creating daily action plans...",
  "Finalizing your roadmap...",
];

export function WizardStepLoading() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev < MESSAGES.length - 1 ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-full min-h-[400px]"
    >
      {/* Animated Orb */}
      <div className="relative w-32 h-32 mb-12 flex items-center justify-center">
        {/* Glow behind */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full blur-2xl"
          style={{ background: 'var(--color-accent)' }}
        />
        {/* Core sphere */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="relative w-24 h-24 rounded-full"
          style={{ 
            background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-gradient-to))',
            boxShadow: 'var(--shadow-xl), inset 0 0 20px rgba(0,0,0,0.2)'
          }}
        >
          {/* Orbiting particles */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full blur-[2px]" />
          <div className="absolute bottom-0 right-1/4 translate-x-1/2 translate-y-1/2 w-3 h-3 bg-white/70 rounded-full blur-[1px]" />
        </motion.div>
      </div>

      <h2 className="text-xl font-semibold text-text-primary mb-4">Building your personalized roadmap</h2>
      
      {/* Rotating subtitle */}
      <div className="h-6 relative w-full flex justify-center overflow-hidden">
        {MESSAGES.map((msg, idx) => (
          <motion.p
            key={msg}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: msgIndex === idx ? 1 : 0, 
              y: msgIndex === idx ? 0 : -20 
            }}
            transition={{ duration: 0.5 }}
            className="absolute text-sm text-text-secondary font-medium"
          >
            {msg}
          </motion.p>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="w-64 h-1.5 mt-8 bg-surface-secondary rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 5, ease: "linear" }}
          className="h-full rounded-full"
          style={{ background: 'var(--color-accent)' }}
        />
      </div>
    </motion.div>
  );
}

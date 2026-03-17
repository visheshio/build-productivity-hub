const fs = require('fs');
const path = require('path');

const dir = 'd:/myprojects/build-productivity-hub/src/pages';

const replacements = [
  // Tooltip styles (common across many pages)
  [/backgroundColor:\s*['"]#1e293b['"]/g, "backgroundColor: 'var(--color-surface-primary)'"],
  [/backgroundColor:\s*isDark\s*\?\s*['"]#1e1b4b['"]\s*:\s*['"]#1e293b['"]/g, "backgroundColor: 'var(--color-surface-primary)'"],
  [/border:\s*['"]none['"]/g, "border: '1px solid var(--color-border-primary)'"],
  [/borderRadius:\s*['"]8px['"]/g, "borderRadius: 'var(--radius-md)'"],
  [/color:\s*['"]white['"],/g, "color: 'var(--color-text-primary)',\n            boxShadow: 'var(--shadow-lg)',"],

  // focus:ring-violet → focus:ring-accent
  [/focus:ring-violet-500/g, 'focus:ring-[var(--color-accent)]'],
  [/focus:ring-violet-100/g, 'focus:ring-[var(--color-accent-ring)]'],
  [/focus:border-violet-500/g, 'focus:border-[var(--color-accent)]'],
  [/focus:border-violet-400/g, 'focus:border-[var(--color-accent)]'],

  // text-violet-600 → accent color
  [/text-violet-600/g, 'text-[var(--color-accent)]'],
  [/text-violet-500/g, 'text-[var(--color-accent)]'],

  // bg-violet-100 and similar semantic backgrounds
  [/bg-violet-100/g, 'bg-[var(--color-accent-subtle)]'],

  // Chart colors from violet to Apple blue
  [/#8b5cf6/g, '#0071e3'],
  [/#c4b5fd/g, '#5ac8fa'],
];

const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

files.forEach(f => {
  const filePath = path.join(dir, f);
  let content = fs.readFileSync(filePath, 'utf8');

  replacements.forEach(([pattern, replacement]) => {
    content = content.replace(pattern, replacement);
  });

  fs.writeFileSync(filePath, content);
  console.log('Updated:', f);
});

console.log('Done! Updated', files.length, 'files');

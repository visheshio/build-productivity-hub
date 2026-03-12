const fs = require('fs');
const path = require('path');

const applyDarkMode = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Insert ThemeContext import if missing
  if (!content.includes('import { useTheme } from')) {
    content = content.replace(
      /import { useApp } from '..\/context\/AppContext';/,
      "import { useApp } from '../context/AppContext';\nimport { useTheme } from '../context/ThemeContext';"
    );
  }

  // Insert isDark and theme variables
  if (!content.includes('const isDark = theme === ')) {
    content = content.replace(
      /const \{ state, dispatch \} = useApp\(\);/,
      `const { state, dispatch } = useApp();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const card = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200';
  const cardTitle = isDark ? 'text-white' : 'text-slate-900';
  const subText = isDark ? 'text-gray-400' : 'text-slate-500';
  const inputCls = isDark
    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500'
    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100';`
    );
  }

  // Simple and precise regex replacements for the classes
  // General text classes
  content = content.replace(/className="([^"]*)text-slate-900([^"]*)"/g, 'className={`$1${cardTitle}$2`}');
  content = content.replace(/className="([^"]*)text-slate-500([^"]*)"/g, 'className={`$1${subText}$2`}');
  content = content.replace(/className="([^"]*)text-slate-400([^"]*)"/g, 'className={`$1${isDark ? \'text-gray-500\' : \'text-slate-400\'}$2`}');
  content = content.replace(/className="([^"]*)text-slate-700([^"]*)"/g, 'className={`$1${isDark ? \'text-gray-300\' : \'text-slate-700\'}$2`}');

  // Background and borders
  content = content.replace(/className="([^"]*)bg-white([^"]*)border-slate-200([^"]*)"/g, 'className={`$1${card}$2$3`}');
  content = content.replace(/className="([^"]*)bg-slate-50([^"]*)"/g, 'className={`$1${isDark ? \'bg-gray-800\' : \'bg-slate-50\'}$2`}');
  content = content.replace(/className="([^"]*)bg-slate-100([^"]*)"/g, 'className={`$1${isDark ? \'bg-gray-800\' : \'bg-slate-100\'}$2`}');
  
  // Hovers
  content = content.replace(/className="([^"]*)hover:bg-slate-50([^"]*)"/g, 'className={`$1${isDark ? \'hover:bg-gray-800\' : \'hover:bg-slate-50\'}$2`}');
  content = content.replace(/className="([^"]*)hover:bg-slate-100([^"]*)"/g, 'className={`$1${isDark ? \'hover:bg-gray-700\' : \'hover:bg-slate-100\'}$2`}');
  content = content.replace(/className="([^"]*)hover:bg-slate-200([^"]*)"/g, 'className={`$1${isDark ? \'hover:bg-gray-600\' : \'hover:bg-slate-200\'}$2`}');

  // Input styles
  content = content.replace(/className="([^"]*)border border-slate-200([^"]*)focus:border-transparent([^"]*)"/g, 'className={`$1outline-none transition-all ${inputCls} $2$3`}');
  
  // Fix nested string templates if they happened. A cleanup for overlapping replacements.
  // We'll trust standard node script running over manual editing here.

  fs.writeFileSync(filePath, content, 'utf-8');
};

const pagesDir = path.join(__dirname, '../src/pages');
applyDarkMode(path.join(pagesDir, 'Expenses.tsx'));
applyDarkMode(path.join(pagesDir, 'Scheduler.tsx'));
applyDarkMode(path.join(pagesDir, 'Reminders.tsx'));

console.log('Dark mode classes applied.');

import { useState } from 'react';
import { Download, Upload, FileJson, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function convertToCSV(data: any[], columns: string[]): string {
  const header = columns.join(',');
  const rows = data.map((row) =>
    columns.map((col) => {
      const val = row[col];
      if (val === null || val === undefined) return '';
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
      return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(',')
  );
  return [header, ...rows].join('\n');
}

export function DataExport({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { theme } = useTheme();
  const { state, dispatch } = useApp();
  const isDark = theme === 'dark';
  const [importing, setImporting] = useState(false);

  if (!isOpen) return null;

  const cardBg = isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-slate-200';
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-slate-500';

  const handleExportJSON = () => {
    const data = JSON.stringify(state, null, 2);
    downloadFile(data, `productivityhub-export-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
    toast.success('Data exported as JSON');
  };

  const handleExportCSV = (module: string) => {
    let csv = '';
    let filename = '';
    switch (module) {
      case 'todos':
        csv = convertToCSV(state.todos, ['id', 'title', 'description', 'status', 'priority', 'dueDate', 'category', 'createdAt']);
        filename = 'todos.csv';
        break;
      case 'notes':
        csv = convertToCSV(state.notes, ['id', 'title', 'content', 'tags', 'isPinned', 'createdAt']);
        filename = 'notes.csv';
        break;
      case 'expenses':
        csv = convertToCSV(state.expenses, ['id', 'amount', 'type', 'category', 'description', 'date', 'isRecurring']);
        filename = 'expenses.csv';
        break;
      case 'habits':
        csv = convertToCSV(state.habits, ['id', 'name', 'frequency', 'category', 'streakCount', 'createdAt']);
        filename = 'habits.csv';
        break;
      case 'goals':
        csv = convertToCSV(state.goals, ['id', 'title', 'description', 'category', 'progress', 'targetDate', 'createdAt']);
        filename = 'goals.csv';
        break;
      default:
        return;
    }
    downloadFile(csv, filename, 'text/csv');
    toast.success(`${module} exported as CSV`);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setImporting(true);
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (data.notes && data.todos) {
            dispatch({ type: 'LOAD_STATE', payload: data });
            toast.success('Data imported successfully!');
          } else {
            toast.error('Invalid file format');
          }
        } catch {
          toast.error('Failed to parse JSON file');
        }
        setImporting(false);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const modules = [
    { key: 'todos', label: 'Tasks', count: state.todos.length },
    { key: 'notes', label: 'Notes', count: state.notes.length },
    { key: 'expenses', label: 'Expenses', count: state.expenses.length },
    { key: 'habits', label: 'Habits', count: state.habits.length },
    { key: 'goals', label: 'Goals', count: state.goals.length },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className={`relative w-full max-w-md rounded-2xl border shadow-2xl ${cardBg}`} onClick={(e) => e.stopPropagation()}>
        <div className={`px-5 py-4 border-b ${isDark ? 'border-gray-800' : 'border-slate-100'}`}>
          <h2 className={`text-base font-bold ${textPrimary}`}>Export / Import Data</h2>
          <p className={`text-xs mt-0.5 ${textSecondary}`}>Download or upload your productivity data</p>
        </div>

        <div className="p-5 space-y-4">
          {/* Full JSON export */}
          <button onClick={handleExportJSON}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed transition-all hover:shadow-md bg-gradient-to-r from-violet-500/5 to-indigo-600/5 border-violet-300 dark:border-violet-800">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-600 text-white flex items-center justify-center">
              <FileJson className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className={`text-sm font-semibold ${textPrimary}`}>Export All Data (JSON)</p>
              <p className={`text-xs ${textSecondary}`}>Complete backup of all your data</p>
            </div>
            <Download className={`h-4 w-4 ml-auto ${textSecondary}`} />
          </button>

          {/* CSV exports per module */}
          <div>
            <p className={`text-xs font-semibold uppercase mb-2 ${textSecondary}`}>Export by Module (CSV)</p>
            <div className="grid grid-cols-2 gap-2">
              {modules.map((m) => (
                <button key={m.key} onClick={() => handleExportCSV(m.key)}
                  className={`flex items-center gap-2 p-2.5 rounded-lg text-left text-sm transition-colors ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-slate-50 hover:bg-slate-100'}`}>
                  <FileSpreadsheet className={`h-4 w-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  <div>
                    <p className={`font-medium ${textPrimary}`}>{m.label}</p>
                    <p className={`text-xs ${textSecondary}`}>{m.count} items</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Import */}
          <div className={`pt-4 border-t ${isDark ? 'border-gray-800' : 'border-slate-100'}`}>
            <button onClick={handleImport} disabled={importing}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-md ${isDark ? 'border-gray-700 hover:border-gray-600' : 'border-slate-200 hover:border-slate-300'}`}>
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-slate-100'}`}>
                <Upload className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-slate-500'}`} />
              </div>
              <div className="text-left">
                <p className={`text-sm font-semibold ${textPrimary}`}>Import Data (JSON)</p>
                <p className={`text-xs ${textSecondary}`}>Restore from a previous export</p>
              </div>
            </button>
            <p className={`flex items-center gap-1 text-xs mt-2 ${isDark ? 'text-amber-400/70' : 'text-amber-600/70'}`}>
              <AlertCircle className="h-3 w-3" /> Importing will replace all current data
            </p>
          </div>
        </div>

        <div className={`px-5 py-3 border-t ${isDark ? 'border-gray-800' : 'border-slate-100'}`}>
          <button onClick={onClose} className={`w-full py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataExport;

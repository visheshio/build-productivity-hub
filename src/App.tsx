import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/common/Layout';
import { Dashboard } from './pages/Dashboard';
import { Notes } from './pages/Notes';
import { Todos } from './pages/Todos';
import { Expenses } from './pages/Expenses';
import { Habits } from './pages/Habits';
import { Scheduler } from './pages/Scheduler';
import { Reminders } from './pages/Reminders';
import { AuthPage } from './pages/AuthPage';
import Analytics from './pages/Analytics';

function AppContent() {
  const { user, isLoading } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-950' : 'bg-slate-50'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg animate-pulse">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Loading ProductivityHub…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <AppProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: isDark
              ? { background: '#1e1b4b', color: '#e0e7ff', borderRadius: '12px', border: '1px solid #312e81' }
              : { background: '#1e293b', color: '#fff', borderRadius: '12px' },
          }}
        />
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/todos" element={<Todos />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/habits" element={<Habits />} />
            <Route path="/scheduler" element={<Scheduler />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

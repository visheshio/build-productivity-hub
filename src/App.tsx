import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import { SuggestionsProvider } from './context/SuggestionsContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/common/Layout';
import { CommandPalette } from './components/common/CommandPalette';
import { KeyboardShortcuts } from './components/common/KeyboardShortcuts';
import { Dashboard } from './pages/Dashboard';
import { Notes } from './pages/Notes';
import { Todos } from './pages/Todos';
import { Expenses } from './pages/Expenses';
import { Habits } from './pages/Habits';
import { Scheduler } from './pages/Scheduler';
import { Reminders } from './pages/Reminders';
import { AuthPage } from './pages/AuthPage';
import Analytics from './pages/Analytics';
import Pomodoro from './pages/Pomodoro';
import Goals from './pages/Goals';
import Journal from './pages/Journal';
import Achievements from './pages/Achievements';

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-2xl flex items-center justify-center animate-pulse"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-gradient-to))',
              boxShadow: 'var(--shadow-lg)',
            }}>
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Loading ProductivityHub…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <AppProvider>
      <SuggestionsProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--color-surface-primary)',
                color: 'var(--color-text-primary)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border-primary)',
                boxShadow: 'var(--shadow-lg)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              },
            }}
          />
          {/* Global overlays */}
          <CommandPalette />
          <KeyboardShortcuts />
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
              <Route path="/pomodoro" element={<Pomodoro />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/achievements" element={<Achievements />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </SuggestionsProvider>
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

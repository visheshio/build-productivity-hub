import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, StickyNote, CheckSquare, DollarSign,
  Target, Calendar, Bell, Menu, X, Sparkles, LogOut, ChevronDown, BarChart3,
  Timer, BookOpen, Trophy, Search, Download,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth, getInitials } from '../../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { MotivationBar } from './MotivationBar';
import { GlobalSearch } from './GlobalSearch';
import { DataExport } from './DataExport';
import { staggerContainer, staggerItem } from '../../utils/animations';

const navSections = [
  {
    label: 'Productivity',
    items: [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-500' },
      { path: '/pomodoro', label: 'Pomodoro', icon: Timer, color: 'text-rose-500' },
      { path: '/todos', label: 'To-Do List', icon: CheckSquare, color: 'text-emerald-500' },
      { path: '/goals', label: 'Goals', icon: Target, color: 'text-cyan-500' },
    ],
  },
  {
    label: 'Organization',
    items: [
      { path: '/notes', label: 'Notes', icon: StickyNote, color: 'text-amber-500' },
      { path: '/journal', label: 'Journal', icon: BookOpen, color: 'text-pink-500' },
      { path: '/expenses', label: 'Expenses', icon: DollarSign, color: 'text-teal-500' },
      { path: '/habits', label: 'Habits', icon: Target, color: 'text-orange-500' },
      { path: '/scheduler', label: 'Scheduler', icon: Calendar, color: 'text-indigo-500' },
      { path: '/reminders', label: 'Reminders', icon: Bell, color: 'text-yellow-500' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { path: '/analytics', label: 'Analytics', icon: BarChart3, color: 'text-violet-500' },
      { path: '/achievements', label: 'Achievements', icon: Trophy, color: 'text-amber-500' },
    ],
  },
];

function UserAvatar({ user, size = 'sm' }: { user: { name: string; avatar: string }; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm';
  return (
    <div className={`${dim} rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-gradient-to)] flex items-center justify-center text-white font-semibold shrink-0`}
      style={{ boxShadow: 'var(--shadow-sm)' }}>
      {getInitials(user.name)}
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const location = useLocation();
  const { theme } = useTheme();
  const { user, signOut } = useAuth();
  const isDark = theme === 'dark';

  // Global search shortcut
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="min-h-screen transition-colors"
      style={{
        backgroundColor: 'var(--color-bg-primary)',
        transitionDuration: 'var(--duration-slow)',
        transitionTimingFunction: 'var(--ease-apple)',
      }}>
      {/* Global Search */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      {/* Data Export */}
      <DataExport isOpen={exportOpen} onClose={() => setExportOpen(false)} />

      {/* Mobile header — frosted glass */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between"
        style={{
          background: 'var(--color-vibrancy-medium)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid var(--color-border-primary)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-gradient-to))',
              boxShadow: 'var(--shadow-sm)',
            }}>
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>ProductivityHub</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setSearchOpen(true)}
            className="p-2 rounded-lg smooth-transition"
            style={{ color: 'var(--color-text-secondary)' }}>
            <Search className="h-5 w-5" />
          </button>
          <ThemeToggle compact />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg smooth-transition"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar — frosted glass vibrancy */}
      <AnimatePresence mode="wait">
        <motion.aside
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
          className={`fixed inset-y-0 left-0 z-40 w-64 transform lg:translate-x-0 flex flex-col ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{
            background: 'var(--color-vibrancy-heavy)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRight: '1px solid var(--color-border-primary)',
          }}
        >
        {/* Logo */}
        <div className="p-5" style={{ borderBottom: '1px solid var(--color-border-secondary)' }}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-gradient-to))',
                boxShadow: 'var(--shadow-md)',
              }}>
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold" style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>ProductivityHub</h1>
              <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Stay organized</p>
            </div>
          </div>
        </div>

        {/* Search & theme row */}
        <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--color-border-secondary)' }}>
          <div className="flex items-center gap-2">
            <button onClick={() => setSearchOpen(true)}
              className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs smooth-transition"
              style={{
                background: 'var(--color-surface-secondary)',
                color: 'var(--color-text-tertiary)',
              }}>
              <Search className="h-3.5 w-3.5" /> Search...
              <kbd className="ml-auto text-[10px] font-mono" style={{ color: 'var(--color-text-quaternary)' }}>⌘F</kbd>
            </button>
            <ThemeToggle />
          </div>
        </div>

        {/* Nav */}
        <motion.nav
          className="flex-1 p-3 overflow-y-auto space-y-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {navSections.map((section) => (
            <motion.div key={section.label} variants={staggerItem}>
              <p className="text-[11px] font-semibold uppercase tracking-wider px-3 mb-2"
                style={{ color: 'var(--color-text-quaternary)' }}>
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.div
                      key={item.path}
                      whileHover={{ x: 3 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-[10px] text-sm font-medium group"
                        style={{
                          transition: 'all var(--duration-normal) var(--ease-apple)',
                          ...(isActive
                            ? {
                                background: 'var(--color-accent)',
                                color: '#ffffff',
                                boxShadow: isDark
                                  ? '0 4px 16px rgba(41, 151, 255, 0.3)'
                                  : '0 4px 16px rgba(0, 113, 227, 0.25)',
                              }
                            : {
                                color: 'var(--color-text-secondary)',
                              }),
                        }}
                      >
                        <item.icon
                          className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                            isActive ? 'text-white' : item.color
                          }`}
                        />
                        {item.label}
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="ml-auto h-1.5 w-1.5 rounded-full bg-white/70"
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}

          {/* Utility buttons */}
          <div className="pt-2" style={{ borderTop: '1px solid var(--color-border-secondary)' }}>
            <motion.button
              onClick={() => setExportOpen(true)}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-[10px] text-sm font-medium smooth-transition"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <Download className="h-4 w-4" style={{ color: 'var(--color-text-tertiary)' }} /> Export / Import
            </motion.button>
          </div>
        </motion.nav>

        {/* User profile section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-4"
          style={{ borderTop: '1px solid var(--color-border-secondary)' }}
        >
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl smooth-transition"
              style={{
                background: userMenuOpen ? 'var(--color-surface-secondary)' : 'transparent',
              }}
            >
              {user && <UserAvatar user={user} size="sm" />}
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                  {user?.name}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--color-text-tertiary)' }}>
                  {user?.email}
                </p>
              </div>
              <motion.div
                animate={{ rotate: userMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] }}
              >
                <ChevronDown className="h-4 w-4 shrink-0" style={{ color: 'var(--color-text-tertiary)' }} />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1.0] }}
                  className="absolute bottom-full left-0 right-0 mb-2 rounded-xl overflow-hidden z-50"
                  style={{
                    background: 'var(--color-vibrancy-heavy)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid var(--color-border-subtle)',
                    boxShadow: 'var(--shadow-xl)',
                  }}
                >
                  <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--color-border-secondary)' }}>
                    <div className="flex items-center gap-3">
                      {user && <UserAvatar user={user} size="md" />}
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>{user?.name}</p>
                        <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ backgroundColor: 'var(--color-error-bg)' }}
                    onClick={() => { setUserMenuOpen(false); signOut(); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium smooth-transition"
                    style={{ color: 'var(--color-error)' }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.aside>
      </AnimatePresence>

      {/* Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 lg:hidden"
            style={{
              backgroundColor: 'var(--color-overlay)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="lg:pl-64 pt-16 lg:pt-0 min-h-screen flex flex-col">
        {/* Motivation bar — full width under sidebar on desktop */}
        <div className="sticky top-16 lg:top-0 z-20">
          <MotivationBar />
        </div>
        <div className="flex-1 p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

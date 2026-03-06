import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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

const navSections = [
  {
    label: 'Productivity',
    items: [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard, color: 'text-violet-500' },
      { path: '/pomodoro', label: 'Pomodoro', icon: Timer, color: 'text-rose-500' },
      { path: '/todos', label: 'To-Do List', icon: CheckSquare, color: 'text-emerald-500' },
      { path: '/goals', label: 'Goals', icon: Target, color: 'text-blue-500' },
    ],
  },
  {
    label: 'Organization',
    items: [
      { path: '/notes', label: 'Notes', icon: StickyNote, color: 'text-amber-500' },
      { path: '/journal', label: 'Journal', icon: BookOpen, color: 'text-pink-500' },
      { path: '/expenses', label: 'Expenses', icon: DollarSign, color: 'text-teal-500' },
      { path: '/habits', label: 'Habits', icon: Target, color: 'text-orange-500' },
      { path: '/scheduler', label: 'Scheduler', icon: Calendar, color: 'text-cyan-500' },
      { path: '/reminders', label: 'Reminders', icon: Bell, color: 'text-yellow-500' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { path: '/analytics', label: 'Analytics', icon: BarChart3, color: 'text-indigo-500' },
      { path: '/achievements', label: 'Achievements', icon: Trophy, color: 'text-amber-500' },
    ],
  },
];

function UserAvatar({ user, size = 'sm' }: { user: { name: string; avatar: string }; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm';
  return (
    <div className={`${dim} rounded-full bg-gradient-to-br ${user.avatar} flex items-center justify-center text-white font-bold shrink-0 shadow-sm`}>
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

  const bg = isDark ? 'bg-gray-950' : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50';
  const sidebarBg = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white/90 border-slate-200';
  const headerBg = isDark ? 'bg-gray-900/95 border-gray-800' : 'bg-white/90 border-slate-200';

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
    <div className={`min-h-screen ${bg} transition-colors duration-300`}>
      {/* Global Search */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      {/* Data Export */}
      <DataExport isOpen={exportOpen} onClose={() => setExportOpen(false)} />

      {/* Mobile header */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 z-50 backdrop-blur-lg border-b px-4 py-3 flex items-center justify-between ${headerBg}`}>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>ProductivityHub</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSearchOpen(true)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-slate-100 text-slate-600'}`}>
            <Search className="h-5 w-5" />
          </button>
          <ThemeToggle compact />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 backdrop-blur-lg border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col ${sidebarBg} ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className={`p-5 border-b ${isDark ? 'border-gray-800' : 'border-slate-100'}`}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200/50">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>ProductivityHub</h1>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>Stay organized</p>
            </div>
          </div>
        </div>

        {/* Search & theme row */}
        <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-800' : 'border-slate-100'}`}>
          <div className="flex items-center gap-2">
            <button onClick={() => setSearchOpen(true)}
              className={`flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              <Search className="h-3.5 w-3.5" /> Search...
              <kbd className={`ml-auto text-[10px] font-mono ${isDark ? 'text-gray-600' : 'text-slate-400'}`}>⌘F</kbd>
            </button>
            <ThemeToggle />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 overflow-y-auto space-y-4">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className={`text-xs font-semibold uppercase tracking-wider px-3 mb-2 ${isDark ? 'text-gray-600' : 'text-slate-400'}`}>
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 group ${
                        isActive
                          ? 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/30'
                          : isDark
                          ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <item.icon
                        className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-white' : item.color
                        }`}
                      />
                      {item.label}
                      {isActive && (
                        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white/70" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Utility buttons */}
          <div className={`pt-2 border-t ${isDark ? 'border-gray-800' : 'border-slate-100'}`}>
            <button onClick={() => setExportOpen(true)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${isDark ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
              <Download className="h-4 w-4 text-gray-500" /> Export / Import
            </button>
          </div>
        </nav>

        {/* User profile section */}
        <div className={`p-4 border-t ${isDark ? 'border-gray-800' : 'border-slate-100'}`}>
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 ${
                isDark ? 'hover:bg-gray-800' : 'hover:bg-slate-50'
              }`}
            >
              {user && <UserAvatar user={user} size="sm" />}
              <div className="flex-1 text-left min-w-0">
                <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {user?.name}
                </p>
                <p className={`text-xs truncate ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
                  {user?.email}
                </p>
              </div>
              <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${userMenuOpen ? 'rotate-180' : ''} ${isDark ? 'text-gray-500' : 'text-slate-400'}`} />
            </button>

            {userMenuOpen && (
              <div className={`absolute bottom-full left-0 right-0 mb-2 rounded-xl border shadow-xl overflow-hidden z-50 ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-100'
              }`}>
                <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-3">
                    {user && <UserAvatar user={user} size="md" />}
                    <div className="min-w-0">
                      <p className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{user?.name}</p>
                      <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{user?.email}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => { setUserMenuOpen(false); signOut(); }}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors ${
                    isDark
                      ? 'text-red-400 hover:bg-gray-700'
                      : 'text-red-600 hover:bg-red-50'
                  }`}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

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

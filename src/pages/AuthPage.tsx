import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Eye, EyeOff, Sun, Moon, User, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const MOTIVATIONAL = [
  'Every expert was once a beginner. Start your journey today.',
  'Small steps every day lead to big achievements over time.',
  'Discipline is choosing between what you want now and what you want most.',
  'Your future self will thank you for the habits you build today.',
  'Success is the sum of small efforts repeated day in and day out.',
  'Productivity is never an accident — it is the result of commitment to excellence.',
  'The secret of getting ahead is getting started.',
  "Don't watch the clock; do what it does. Keep going.",
];

const FEATURES = [
  { emoji: '📝', title: 'Smart Notes', desc: 'Organize ideas with tags & pins' },
  { emoji: '✅', title: 'To-Do Lists', desc: 'Track tasks with priorities' },
  { emoji: '💰', title: 'Expense Tracker', desc: 'Monitor budget & spending' },
  { emoji: '🔥', title: 'Habit Streaks', desc: 'Build daily consistency' },
  { emoji: '📅', title: 'Scheduler', desc: 'Plan events & meetings' },
  { emoji: '🔔', title: 'Reminders', desc: 'Never miss a deadline' },
];

const cardVariants = {
  initial: { opacity: 0, y: 24 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.07, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  }),
};

export function AuthPage() {
  const { signIn, signUp, resetPassword } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [shakeError, setShakeError] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIdx((i) => (i + 1) % MOTIVATIONAL.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    if (mode === 'forgot') {
      const result = await resetPassword(email);
      setLoading(false);
      if (result.error) {
        setError(result.error);
        setShakeError(true);
        setTimeout(() => setShakeError(false), 500);
      } else {
        setSuccessMsg('Password reset email sent! Check your inbox.');
      }
      return;
    }

    const result =
      mode === 'signin'
        ? await signIn(email, password)
        : await signUp(name, email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gray-950' : 'bg-gradient-to-br from-violet-50 via-white to-indigo-50'} transition-colors duration-300`}>
      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-gray-800' : 'border-slate-200'}`}
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
            className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg"
          >
            <Sparkles className="h-4 w-4 text-white" />
          </motion.div>
          <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>ProductivityHub</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={toggleTheme}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isDark
            ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
            : 'bg-white text-slate-700 hover:bg-slate-100 shadow-sm border border-slate-200'
            }`}
        >
          {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-500" />}
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </motion.button>
      </motion.div>

      {/* Quote ticker */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 py-2.5 px-4 text-center overflow-hidden h-10 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={quoteIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="text-white text-sm font-medium"
          >
            ✨&nbsp;{MOTIVATIONAL[quoteIdx]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center">
          {/* Left panel — feature cards */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
            className="hidden lg:flex flex-col gap-8"
          >
            <div>
              <h2 className={`text-4xl font-extrabold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Your all-in-one<br />
                <span className="bg-[var(--color-accent)] bg-clip-text text-transparent">
                  productivity suite
                </span>
              </h2>
              <p className={`mt-4 text-lg ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                Manage notes, tasks, habits, expenses, schedule — all in one beautiful dashboard.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  custom={i}
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  whileHover={{ y: -3, transition: { duration: 0.15 } }}
                  className={`rounded-xl p-4 ${isDark ? 'bg-gray-800/60 border border-gray-700' : 'bg-white border border-slate-100 shadow-sm'}`}
                >
                  <div className="text-2xl mb-1">{f.emoji}</div>
                  <div className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{f.title}</div>
                  <div className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{f.desc}</div>
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-3"
            >
              {[CheckCircle, CheckCircle, CheckCircle].map((Icon, i) => (
                <div key={i} className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                  <Icon className="h-4 w-4" />
                  {['Free forever', 'Local-first', 'Private & secure'][i]}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right panel — Auth card */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
            className={`w-full rounded-2xl shadow-2xl p-8 ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-slate-100'}`}
          >
            {/* Tab switcher */}
            <div className={`flex rounded-xl p-1 mb-8 ${isDark ? 'bg-gray-800' : 'bg-slate-100'}`}>
              {(['signin', 'signup'] as const).map((m) => (
                <motion.button
                  key={m}
                  onClick={() => { setMode(m); setError(''); setSuccessMsg(''); }}
                  whileTap={{ scale: 0.97 }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${(mode === m || (mode === 'forgot' && m === 'signin'))
                    ? 'bg-[var(--color-accent)] text-white shadow-lg'
                    : isDark
                      ? 'text-gray-400 hover:text-white'
                      : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                  {m === 'signin' ? 'Sign In' : 'Sign Up'}
                </motion.button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="mb-6"
              >
                <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {mode === 'forgot' ? 'Reset password 🔑' : mode === 'signin' ? 'Welcome back 👋' : 'Create your account 🚀'}
                </h3>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                  {mode === 'forgot'
                    ? 'Enter your email and we\'ll send a reset link.'
                    : mode === 'signin'
                      ? 'Sign in to continue your productivity journey.'
                      : 'Join thousands building better habits every day.'}
                </p>
              </motion.div>
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence>
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                      Full Name
                    </label>
                    <div className="relative">
                      <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Johnson"
                        required
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all ${isDark
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500'
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100'
                          }`}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    required
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all ${isDark
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100'
                      }`}
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className={`w-full pl-10 pr-12 py-3 rounded-xl border text-sm outline-none transition-all ${isDark
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100'
                        }`}
                    />
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowPass(!showPass)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </motion.button>
                  </div>
                  {mode === 'signup' && (
                    <p className={`text-xs mt-1.5 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>Minimum 6 characters</p>
                  )}
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setError(''); setSuccessMsg(''); }}
                      className={`text-xs mt-2 font-medium ${isDark ? 'text-violet-400 hover:text-violet-300' : 'text-violet-600 hover:text-violet-700'} transition-colors`}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
              )}

              <AnimatePresence>
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{
                      opacity: 1,
                      height: 'auto',
                      x: shakeError ? [0, -8, 8, -6, 6, 0] : 0,
                    }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3"
                  >
                    {error}
                  </motion.div>
                )}
                {successMsg && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-sm rounded-xl px-4 py-3"
                  >
                    {successMsg}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.97 }}
                className="w-full py-3 rounded-xl bg-[var(--color-accent)] text-white font-semibold text-sm hover:from-violet-600 hover:to-indigo-700 transition-all duration-200 shadow-[var(--shadow-md)] dark:shadow-indigo-900/30 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <motion.svg
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </motion.svg>
                    {mode === 'forgot' ? 'Sending...' : mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                  </span>
                ) : (
                  <>
                    {mode === 'forgot' ? 'Send Reset Link' : mode === 'signin' ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </motion.button>
            </form>

            <p className={`text-center text-sm mt-6 ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
              {mode === 'forgot'
                ? 'Remember your password? '
                : mode === 'signin'
                  ? "Don't have an account? "
                  : 'Already have an account? '}
              <button
                onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setSuccessMsg(''); }}
                className="font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 transition-colors"
              >
                {mode === 'forgot' ? 'Back to sign in' : mode === 'signin' ? 'Sign up free' : 'Sign in'}
              </button>
            </p>

            {/* Demo shortcut */}
            <div className={`mt-6 pt-6 border-t ${isDark ? 'border-gray-800' : 'border-slate-100'}`}>
              <p className={`text-xs text-center mb-3 ${isDark ? 'text-gray-600' : 'text-slate-400'}`}>— Quick demo —</p>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => signIn('demo@productivityhub.app', 'demo123456').then(async (r) => {
                  if (r.error) {
                    await signUp('Demo User', 'demo@productivityhub.app', 'demo123456');
                  }
                })}
                className={`w-full py-2.5 rounded-xl text-sm font-medium border transition-all ${isDark
                  ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
              >
                🚀 Continue as Demo User
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

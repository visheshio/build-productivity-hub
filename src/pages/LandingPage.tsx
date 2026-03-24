import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, Circle, Flame, 
  BookOpen, Sparkles, ArrowRight, Wallet, Timer, 
  Zap, Layout
} from 'lucide-react';

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export function LandingPage() {
  return (
    <div className="bg-[#FAFAFA] dark:bg-[#09090B] text-slate-900 dark:text-white font-body selection:bg-blue-500/30 min-h-screen overflow-x-hidden">
      
      {/* Top Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 dark:bg-[#09090B]/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 transition-colors">
        <div className="flex items-center justify-between px-6 lg:px-12 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Productivity Hub</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden sm:block text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              Log In
            </Link>
            <Link to="/login" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-full font-semibold text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/10 dark:shadow-white/10 flex items-center gap-2">
              Enter Hub <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 lg:px-12 max-w-7xl mx-auto">
        
        {/* HERO SECTION */}
        <section className="relative text-center py-20 lg:py-32 flex flex-col items-center justify-center min-h-[60vh]">
          {/* Background Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/20 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse" />
          
          <motion.div 
            initial="hidden" animate="visible" variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-xs tracking-widest uppercase mb-8">
              <Sparkles className="h-3.5 w-3.5" />
              The Ultimate Digital Sanctuary
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-8 leading-[1.05]">
              Everything you need. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Zero distractions.
              </span>
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed mb-12">
              Stop constantly switching between 10 different apps. We unified your tasks, habits, finances, timers, and journal into one beautiful, insanely fast workspace.
            </motion.p>
            
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-blue-600/25 flex items-center justify-center gap-2">
                Start doing deep work
              </Link>
              <button className="w-full sm:w-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                Cmd+K to explore
              </button>
            </motion.div>
          </motion.div>
        </section>

        {/* BENTO GRID: APP CAPABILITIES EXPLAINER */}
        <section className="py-20" id="bento">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">What's inside the Hub?</h2>
            <p className="text-slate-500 dark:text-slate-400 md:text-lg">A suite of premium micro-apps woven together perfectly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            
            {/* 1. Todos & Scheduler (Large 2-span) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-2 bg-white dark:bg-[#121214] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 overflow-hidden relative group hover:border-blue-500/50 transition-colors shadow-sm"
            >
              <div className="relative z-10 w-2/3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Tasks & Scheduler</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  A hyper-fast todo list with sub-tasks, priorities, and due dates, fully synchronized with a visual calendar scheduler. Map your entire week in seconds.
                </p>
              </div>
              
              {/* Visual Mockup inside card */}
              <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-tl-3xl shadow-2xl p-6 rotate-[-5deg] group-hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="h-5 w-5 text-blue-500" />
                  <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                </div>
                <div className="flex items-center gap-3 mb-4 opacity-50">
                  <Circle className="h-5 w-5 text-slate-400" />
                  <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                </div>
              </div>
            </motion.div>

            {/* 2. Pomodoro (1 span) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center hover:border-rose-500/50 transition-colors shadow-sm relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-rose-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="w-32 h-32 rounded-full border-4 border-rose-100 dark:border-rose-900/30 border-t-rose-500 flex items-center justify-center mb-6 mx-auto animate-[spin_10s_linear_infinite]">
                  <Timer className="h-10 w-10 text-rose-500 animate-[spin_10s_linear_infinite_reverse]" />
                </div>
                <h3 className="text-xl font-bold mb-2">Focus Sessions</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Pomodoro timers tightly linked to your tasks to guarantee deep work.</p>
              </div>
            </motion.div>

            {/* 3. Finance Manager (1 span) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 relative overflow-hidden group hover:border-emerald-500/50 transition-colors shadow-sm"
            >
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                <Wallet className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Expense Tracking</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Log daily transactions, set monthly budgets, and visualize your cash flow instantly.</p>
              <div className="h-16 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 p-4 flex items-center justify-between text-white shadow-lg translate-y-4 group-hover:translate-y-0 transition-transform">
                <span className="text-xs font-medium uppercase">Balance</span>
                <span className="text-lg font-bold">₹42,500</span>
              </div>
            </motion.div>

            {/* 4. Habits & Goals (1 span) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 relative overflow-hidden group hover:border-amber-500/50 transition-colors shadow-sm"
            >
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-6">
                <Flame className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Habits & Goals</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Build 100-day streaks and track long-term life milestones with rich progress analytics.</p>
              <div className="flex gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className={`h-8 flex-1 rounded-md ${i < 5 ? 'bg-amber-400' : 'bg-slate-100 dark:bg-slate-800'}`}></div>
                ))}
              </div>
            </motion.div>

            {/* 5. Journal & Notes (1 span) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="bg-[#09090B] dark:bg-white text-white dark:text-[#09090B] border border-transparent rounded-3xl p-8 relative overflow-hidden group shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-bl-[100px]"></div>
              <div className="w-12 h-12 bg-white/10 dark:bg-black/5 text-white dark:text-black rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Journal & Notes</h3>
              <p className="text-sm opacity-80 mb-6">A distraction-free markdown editor for daily reflections and meeting notes. Track your mood over time.</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl">😄</span>
                <span className="text-3xl">😐</span>
                <span className="text-3xl">😢</span>
              </div>
            </motion.div>

          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="py-24 text-center">
          <div className="max-w-3xl mx-auto glass-card border border-slate-200 dark:border-slate-800 rounded-[3rem] p-12 lg:p-20 shadow-xl bg-white/50 dark:bg-[#121214]/50 backdrop-blur-3xl">
            <Layout className="h-12 w-12 mx-auto text-blue-500 mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Ready to regain control?</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-10">
              Join thousands of makers, founders, and students who have already simplified their digital lives.
            </p>
            <Link to="/login" className="inline-block bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 px-10 py-5 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/10 dark:shadow-white/10">
              Go to Dashboard &rarr;
            </Link>
          </div>
        </section>

      </main>

      {/* Ultra Minimal Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/60 py-10 text-center text-sm font-medium text-slate-400">
        <p>© {new Date().getFullYear()} Productivity Hub. Built for Deep Work.</p>
      </footer>
    </div>
  );
}

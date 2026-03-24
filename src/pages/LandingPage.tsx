import { Link } from 'react-router-dom';
import { 
  Calendar, CheckCircle2, Circle, Clock, Folder, MessageSquare, 
  Sparkles, Smartphone, Tablet, Share2, Globe 
} from 'lucide-react';

export function LandingPage() {
  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary-container selection:text-white min-h-screen">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
          <div className="text-xl font-bold tracking-tighter text-slate-900 dark:text-white">
            Productivity Hub
          </div>
          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 font-sans text-sm font-medium tracking-tight">
            <a href="#features" className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-500 dark:hover:text-blue-300 transition-colors">Features</a>
            <a href="#pricing" className="text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">Pricing</a>
            <a href="#resources" className="text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">Resources</a>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link to="/login" className="font-sans text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors">
              Log In
            </Link>
            <Link to="/login" className="bg-primary-container text-white px-6 py-2.5 rounded-full font-sans text-sm font-medium scale-95 active:scale-90 transition-transform shadow-lg shadow-primary-container/20">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative max-w-7xl mx-auto px-8 py-20 lg:py-32 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left z-10">
            <div className="inline-flex items-center px-4 py-1.5 mb-6 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label text-xs font-bold tracking-wider uppercase">
              New: Task Automations 2.0
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tighter text-on-surface mb-8 leading-[1.1]">
              All Your Work, <br />
              <span className="text-primary-container bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-container">All in One Place</span>
            </h1>
            <p className="text-xl text-on-surface-variant leading-relaxed max-w-2xl mb-10 mx-auto lg:mx-0">
              Eliminate the noise and regain your focus. Productivity Hub unifies your tasks, calendar, and team communication into one seamless, high-end digital sanctuary.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link to="/login" className="w-full text-center sm:w-auto px-10 py-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-full shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all">
                Get Started Free
              </Link>
              <button className="w-full sm:w-auto px-10 py-4 glass-card text-on-surface font-semibold rounded-full hover:bg-surface-container-low transition-all border border-outline-variant/20 shadow-sm backdrop-blur-xl bg-white/70">
                Watch Demo
              </button>
            </div>
          </div>
          {/* Floating UI Elements Area */}
          <div className="flex-1 relative w-full aspect-square max-w-[500px] lg:max-w-none">
            {/* Abstract Background Glow */}
            <div className="absolute inset-0 bg-primary/10 blur-[120px] rounded-full translate-x-10 translate-y-10"></div>
            
            {/* Focus Glass Widget: Calendar */}
            <div className="absolute top-0 right-0 w-64 glass-card p-6 rounded-2xl shadow-2xl z-30 animate-float-slow border border-white/40 bg-white/70 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-sm">Upcoming</span>
                <Calendar className="text-primary h-4 w-4" />
              </div>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-1 h-10 bg-primary-container rounded-full"></div>
                  <div>
                    <p className="text-xs font-bold">Product Strategy</p>
                    <p className="text-[10px] text-on-surface-variant">10:00 AM - 11:30 AM</p>
                  </div>
                </div>
                <div className="flex gap-3 opacity-50">
                  <div className="w-1 h-10 bg-secondary rounded-full"></div>
                  <div>
                    <p className="text-xs font-bold">Design Sync</p>
                    <p className="text-[10px] text-on-surface-variant">2:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Focus Glass Widget: Task List */}
            <div className="absolute bottom-10 left-0 w-72 glass-card p-6 rounded-2xl shadow-2xl z-20 animate-float border border-white/40 bg-white/70 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="font-bold text-sm">Task List</span>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-primary-container h-5 w-5" />
                  <span className="text-xs font-medium line-through text-on-surface-variant">Review Q4 Roadmap</span>
                </li>
                <li className="flex items-center gap-3">
                  <Circle className="text-outline-variant h-5 w-5" />
                  <span className="text-xs font-medium">Finalize Design Tokens</span>
                </li>
                <li className="flex items-center gap-3">
                  <Circle className="text-outline-variant h-5 w-5" />
                  <span className="text-xs font-medium">Weekly Team Retro</span>
                </li>
              </ul>
            </div>

            {/* Main Dashboard Visual */}
            <div className="absolute inset-10 bg-white dark:bg-slate-800 rounded-2xl shadow-inner border border-outline-variant/10 overflow-hidden transform rotate-3">
              <img 
                alt="Productivity Dashboard Interface" 
                className="w-full h-full object-cover opacity-80" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOOzTvKotyASkfXu554ru-Gn82_TjeUiishpIX4QgvT7pll5tezg3OWt8GGD5RHRzARUEIwuWxMlvHTTiieoFD06k_GnXNkk9je6VEdY-yQN4eJNjtAJU0IyDai5qBC5gxAs5tjWvOOI1jagH44e9F_n3vk2fQdZwUIunaD8LL-kg0O9Ef5TMf4k7p1GsIy9A33FiD1ia5qpRVpueSdShrpwojffZOAHrSvFskfUurPDRvKe3rcoVbNg-EH4Kuq7RCwcETVTp1kKBc"
              />
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="bg-surface-container-low py-32">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-extrabold tracking-tight mb-4">Designed for the Modern Workflow</h2>
              <p className="text-on-surface-variant max-w-xl mx-auto">Everything you need to ship faster and work smarter, without the visual clutter of traditional tools.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="group p-8 bg-surface-container-lowest rounded-2xl hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <Clock className="text-primary-container h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-4">Time Tracking</h3>
                <p className="text-on-surface-variant leading-relaxed">
                  Understand where your hours go with precision logging and automated activity reports.
                </p>
              </div>
              <div className="group p-8 bg-surface-container-lowest rounded-2xl hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <Folder className="text-primary-container h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-4">File Organization</h3>
                <p className="text-on-surface-variant leading-relaxed">
                  Keep every asset in its place with intelligent tagging and instant cloud synchronization.
                </p>
              </div>
              <div className="group p-8 bg-surface-container-lowest rounded-2xl hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <MessageSquare className="text-primary-container h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-4">Team Communication</h3>
                <p className="text-on-surface-variant leading-relaxed">
                  Contextual threads and real-time messaging built directly into your task workflow.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid Section */}
        <section className="py-32 max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 grid-rows-2 gap-6 h-auto lg:h-[600px]">
            <div className="lg:col-span-8 bg-primary-container rounded-2xl p-10 flex flex-col justify-end text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
                <img 
                  alt="Collaboration Abstract" 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC92q2CE516ai3Ngk0VdIPIIIVVeAVvOn6ERhiKoAwt7Vpj_8akCR35Ii5EChDOzqJu6HFbklfr3cRx7WC6wMmyLqGhzD-gcetXCwUKhcUnnjrBhfnNeFJEQwOp4tnYGZn82MZGa82hDc56x3Q0pxWBVN1tamXQw9R-wKqBoEsQiChBGNnz6ATNKj6ejK9vzH-cWEx8MqQNeuVrJ15SGVL_rp0aVwgC50HPlnpfzj6OQukH3Xpnr0GBaDb6Fgo_oew9IJgBkhXxEb_L"
                />
              </div>
              <div className="z-10">
                <h3 className="text-3xl font-bold mb-4">Collaborative Powerhouse</h3>
                <p className="max-w-md opacity-90 mb-6">Real-time sync ensures everyone stays on the same page, from tiny startups to global enterprises.</p>
                <button className="bg-white text-primary-container px-6 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-lg">
                  Explore Enterprise
                </button>
              </div>
            </div>
            <div className="lg:col-span-4 bg-surface-container-high rounded-2xl p-10 flex flex-col justify-center items-center text-center">
              <Sparkles className="h-12 w-12 text-primary mb-6" />
              <h3 className="text-2xl font-bold mb-2">Smart Insights</h3>
              <p className="text-on-surface-variant text-sm">AI-driven analytics to predict bottlenecks before they happen.</p>
            </div>
            <div className="lg:col-span-4 bg-secondary-fixed rounded-2xl p-10 flex flex-col justify-between">
              <h3 className="text-xl font-bold text-on-secondary-fixed">Mobile Native</h3>
              <div className="mt-4 flex gap-2">
                <div className="w-12 h-12 rounded-xl bg-white/50 backdrop-blur-sm flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-on-secondary-fixed" />
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/50 backdrop-blur-sm flex items-center justify-center">
                  <Tablet className="h-6 w-6 text-on-secondary-fixed" />
                </div>
              </div>
            </div>
            <div className="lg:col-span-8 bg-surface-container rounded-2xl p-10 relative overflow-hidden flex items-center">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-4">Seamless Integrations</h3>
                <div className="flex flex-wrap gap-3">
                  {['Slack', 'Github', 'Figma', 'Zoom'].map((app) => (
                    <span key={app} className="px-4 py-2 bg-white rounded-full text-xs font-semibold shadow-sm">{app}</span>
                  ))}
                </div>
              </div>
              <div className="hidden md:block absolute -right-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-950 w-full py-12 px-8 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
            <div className="col-span-2">
              <div className="text-lg font-bold text-slate-900 dark:text-white mb-4">Productivity Hub</div>
              <p className="text-slate-500 dark:text-slate-500 text-sm leading-relaxed max-w-xs">
                Building the future of focused work. Designed for teams who value clarity and efficiency above all else.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="text-sm font-bold text-slate-900 dark:text-white">Product</div>
              <a href="#" className="text-slate-500 dark:text-slate-500 text-sm hover:text-slate-900 dark:hover:text-white underline-offset-4 hover:underline transition-opacity">Features</a>
              <a href="#" className="text-slate-500 dark:text-slate-500 text-sm hover:text-slate-900 dark:hover:text-white underline-offset-4 hover:underline transition-opacity">Pricing</a>
            </div>
            <div className="flex flex-col gap-4">
              <div className="text-sm font-bold text-slate-900 dark:text-white">Company</div>
              <a href="#" className="text-slate-500 dark:text-slate-500 text-sm hover:text-slate-900 dark:hover:text-white underline-offset-4 hover:underline transition-opacity">Resources</a>
              <a href="#" className="text-slate-500 dark:text-slate-500 text-sm hover:text-slate-900 dark:hover:text-white underline-offset-4 hover:underline transition-opacity">Support</a>
            </div>
            <div className="flex flex-col gap-4">
              <div className="text-sm font-bold text-slate-900 dark:text-white">Legal</div>
              <a href="#" className="text-slate-500 dark:text-slate-500 text-sm hover:text-slate-900 dark:hover:text-white underline-offset-4 hover:underline transition-opacity">Privacy</a>
              <a href="#" className="text-slate-500 dark:text-slate-500 text-sm hover:text-slate-900 dark:hover:text-white underline-offset-4 hover:underline transition-opacity">Terms</a>
            </div>
            <div className="flex flex-col gap-4">
              <div className="text-sm font-bold text-slate-900 dark:text-white">Social</div>
              <div className="flex gap-4">
                <Share2 className="h-5 w-5 text-slate-400 hover:text-primary transition-colors cursor-pointer" />
                <Globe className="h-5 w-5 text-slate-400 hover:text-primary transition-colors cursor-pointer" />
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500 text-sm text-center">
            © 2024 Productivity Hub. Designed for the Digital Sanctuary.
          </div>
        </div>
      </footer>
    </div>
  );
}

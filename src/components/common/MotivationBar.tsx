import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Sparkles, Sun, Sunset, Moon, Coffee } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Quote {
  text: string;
  author: string;
  category: string;
}

const QUOTES: Quote[] = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain", category: "productivity" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson", category: "motivation" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar", category: "motivation" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier", category: "habits" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln", category: "discipline" },
  { text: "Your future self will thank you for the habits you build today.", author: "James Clear", category: "habits" },
  { text: "Small steps every day lead to big achievements over time.", author: "Unknown", category: "progress" },
  { text: "Focus on being productive instead of being busy.", author: "Tim Ferriss", category: "productivity" },
  { text: "We are what we repeatedly do. Excellence is not an act, but a habit.", author: "Aristotle", category: "habits" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "passion" },
  { text: "Energy and persistence conquer all things.", author: "Benjamin Franklin", category: "persistence" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso", category: "motivation" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi", category: "motivation" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela", category: "motivation" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali", category: "motivation" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke", category: "work" },
];

const MORNING_QUOTES: Quote[] = [
  { text: "Rise and shine! Today is your chance to make it count.", author: "ProductivityHub", category: "morning" },
  { text: "Every morning is a new beginning. Make it a beautiful one.", author: "Unknown", category: "morning" },
  { text: "The way you start your day sets the tone for the rest of it.", author: "Unknown", category: "morning" },
];

const AFTERNOON_QUOTES: Quote[] = [
  { text: "You're halfway there — don't stop now! Finish strong.", author: "ProductivityHub", category: "afternoon" },
  { text: "Keep the momentum going. Your goals are within reach.", author: "Unknown", category: "afternoon" },
];

const EVENING_QUOTES: Quote[] = [
  { text: "Review your wins today — you did more than you think.", author: "ProductivityHub", category: "evening" },
  { text: "Tonight's planning is tomorrow's success.", author: "Unknown", category: "evening" },
  { text: "Rest well, tomorrow is another opportunity to grow.", author: "Unknown", category: "evening" },
];

function getTimeOfDay(): { label: string; Icon: typeof Sun; pool: Quote[] } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { label: 'Good morning', Icon: Sun, pool: MORNING_QUOTES };
  if (hour >= 12 && hour < 17) return { label: 'Good afternoon', Icon: Sunset, pool: AFTERNOON_QUOTES };
  if (hour >= 17 && hour < 21) return { label: 'Good evening', Icon: Moon, pool: EVENING_QUOTES };
  return { label: 'Working late?', Icon: Coffee, pool: EVENING_QUOTES };
}

function getPersonalizedQuote(name: string, pool: Quote[]): Quote {
  const allQuotes = [...pool, ...QUOTES];
  const seed = name.length + new Date().getDate() + new Date().getHours();
  return allQuotes[seed % allQuotes.length];
}

export function MotivationBar() {
  const { user } = useAuth();

  const firstName = user?.name?.split(' ')[0] || 'there';
  const timeInfo = getTimeOfDay();

  const [quoteKey, setQuoteKey] = useState(0);
  const [quote, setQuote] = useState<Quote>(() => getPersonalizedQuote(firstName, timeInfo.pool));
  const [spinning, setSpinning] = useState(false);

  const refreshQuote = useCallback(() => {
    setSpinning(true);
    const all = [...timeInfo.pool, ...QUOTES];
    setQuoteKey((k) => {
      const next = (k + 1) % all.length;
      setQuote(all[next]);
      return next;
    });
    setTimeout(() => setSpinning(false), 500);
  }, [timeInfo.pool]);

  const Icon = timeInfo.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.1, 0.25, 1.0] }}
      className="w-full flex items-center gap-3 px-4 py-2.5"
      style={{
        background: 'var(--color-accent-subtle)',
        borderBottom: '1px solid var(--color-border-secondary)',
        transition: 'background var(--duration-slow) var(--ease-apple)',
      }}
    >
      {/* Time greeting */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Icon className="h-4 w-4" style={{ color: 'var(--color-warning)' }} />
        <span className="text-xs font-semibold hidden sm:block" style={{ color: 'var(--color-accent)' }}>
          {timeInfo.label}, <span style={{ color: 'var(--color-accent)' }}>{firstName}!</span>
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-4 shrink-0 hidden sm:block" style={{ background: 'var(--color-border-subtle)' }} />

      {/* Sparkles icon */}
      <Sparkles className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--color-accent)' }} />

      {/* Quote with crossfade */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={quoteKey}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1.0] }}
            className="text-xs font-medium truncate"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <span className="italic">"{quote.text}"</span>
            {quote.author !== 'ProductivityHub' && (
              <span className="ml-1.5 not-italic font-semibold" style={{ color: 'var(--color-accent)' }}>
                — {quote.author}
              </span>
            )}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Refresh button */}
      <motion.button
        onClick={refreshQuote}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        title="Get a new quote"
        className="shrink-0 p-1.5 rounded-lg smooth-transition"
        style={{ color: 'var(--color-accent)' }}
      >
        <motion.div
          animate={{ rotate: spinning ? 360 : 0 }}
          transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1.0] }}
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </motion.div>
      </motion.button>
    </motion.div>
  );
}

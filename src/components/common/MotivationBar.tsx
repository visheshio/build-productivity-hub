import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Sun, Sunset, Moon, Coffee } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

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
  { text: "Productivity is never an accident. It is always the result of a commitment to excellence.", author: "Paul J. Meyer", category: "productivity" },
  { text: "Energy and persistence conquer all things.", author: "Benjamin Franklin", category: "persistence" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso", category: "motivation" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi", category: "motivation" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela", category: "motivation" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali", category: "motivation" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky", category: "motivation" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke", category: "work" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown", category: "work" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown", category: "motivation" },
  { text: "Great things never come from comfort zones.", author: "Unknown", category: "growth" },
  { text: "Dream it. Wish it. Do it.", author: "Unknown", category: "motivation" },
  { text: "Success doesn't just find you. You have to go out and get it.", author: "Unknown", category: "motivation" },
  { text: "The key to success is to focus on goals, not obstacles.", author: "Unknown", category: "focus" },
  { text: "Believe in yourself and all that you are.", author: "Christian D. Larson", category: "confidence" },
];

const MORNING_QUOTES: Quote[] = [
  { text: "Rise and shine! Today is your chance to make it count.", author: "ProductivityHub", category: "morning" },
  { text: "Every morning is a new beginning. Make it a beautiful one.", author: "Unknown", category: "morning" },
  { text: "Morning is an important time of day — it's the beginning of everything.", author: "Unknown", category: "morning" },
  { text: "Start each day with a grateful heart and a focused mind.", author: "Unknown", category: "morning" },
  { text: "The way you start your day sets the tone for the rest of it.", author: "Unknown", category: "morning" },
];

const AFTERNOON_QUOTES: Quote[] = [
  { text: "You're halfway there — don't stop now! Finish strong.", author: "ProductivityHub", category: "afternoon" },
  { text: "Keep the momentum going. Your goals are within reach.", author: "Unknown", category: "afternoon" },
  { text: "Midday check-in: Are your actions aligned with your goals?", author: "Unknown", category: "afternoon" },
  { text: "Stay focused, stay determined, stay motivated.", author: "Unknown", category: "afternoon" },
];

const EVENING_QUOTES: Quote[] = [
  { text: "Review your wins today — you did more than you think.", author: "ProductivityHub", category: "evening" },
  { text: "Tonight's planning is tomorrow's success.", author: "Unknown", category: "evening" },
  { text: "Celebrate what you accomplished today and plan for tomorrow.", author: "Unknown", category: "evening" },
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const firstName = user?.name?.split(' ')[0] || 'there';
  const timeInfo = getTimeOfDay();

  const [quote, setQuote] = useState<Quote>(() => getPersonalizedQuote(firstName, timeInfo.pool));
  const [, setQuoteIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  const refreshQuote = useCallback(() => {
    setAnimating(true);
    setTimeout(() => {
      const all = [...timeInfo.pool, ...QUOTES];
      setQuoteIndex((i) => {
        const next = (i + 1) % all.length;
        setQuote(all[next]);
        return next;
      });
      setAnimating(false);
    }, 200);
  }, [timeInfo.pool]);

  // Auto-rotate every 30 seconds
  useEffect(() => {
    const timer = setInterval(refreshQuote, 30000);
    return () => clearInterval(timer);
  }, [refreshQuote]);

  const Icon = timeInfo.Icon;

  return (
    <div
      className={`w-full flex items-center gap-3 px-4 py-2.5 border-b transition-colors duration-300 ${
        isDark
          ? 'bg-gradient-to-r from-violet-950/60 via-indigo-950/60 to-purple-950/60 border-violet-900/40'
          : 'bg-gradient-to-r from-violet-50 via-indigo-50 to-purple-50 border-violet-100'
      }`}
    >
      {/* Time greeting */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Icon className={`h-4 w-4 ${isDark ? 'text-amber-400' : 'text-amber-500'}`} />
        <span className={`text-xs font-semibold hidden sm:block ${isDark ? 'text-violet-300' : 'text-violet-700'}`}>
          {timeInfo.label}, <span className="text-indigo-500 dark:text-indigo-400">{firstName}!</span>
        </span>
      </div>

      {/* Divider */}
      <div className={`w-px h-4 shrink-0 hidden sm:block ${isDark ? 'bg-violet-800' : 'bg-violet-200'}`} />

      {/* Sparkles icon */}
      <Sparkles className={`h-3.5 w-3.5 shrink-0 ${isDark ? 'text-violet-400' : 'text-violet-500'}`} />

      {/* Quote */}
      <p
        className={`flex-1 text-xs font-medium truncate transition-opacity duration-200 ${
          animating ? 'opacity-0' : 'opacity-100'
        } ${isDark ? 'text-gray-300' : 'text-slate-600'}`}
      >
        <span className="italic">"{quote.text}"</span>
        {quote.author !== 'ProductivityHub' && (
          <span className={`ml-1.5 not-italic font-semibold ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>
            — {quote.author}
          </span>
        )}
      </p>

      {/* Refresh button */}
      <button
        onClick={refreshQuote}
        title="Get a new quote"
        className={`shrink-0 p-1.5 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 ${
          isDark
            ? 'text-violet-400 hover:bg-violet-900/50'
            : 'text-violet-500 hover:bg-violet-100'
        }`}
      >
        <RefreshCw className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

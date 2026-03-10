import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Note, Todo, Expense, Budget, Habit, Event, Reminder, Goal, PomodoroSession, TimeEntry, JournalEntry, Achievement, AchievementType, DailyChallenge } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface AppState {
  notes: Note[];
  todos: Todo[];
  expenses: Expense[];
  budgets: Budget[];
  habits: Habit[];
  events: Event[];
  reminders: Reminder[];
  goals: Goal[];
  pomodoroSessions: PomodoroSession[];
  timeEntries: TimeEntry[];
  journalEntries: JournalEntry[];
  achievements: Achievement[];
  dailyChallenges: DailyChallenge[];
}

type Action =
  | { type: 'ADD_NOTE'; payload: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_NOTE'; payload: Note }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'TOGGLE_PIN_NOTE'; payload: string }
  | { type: 'ADD_TODO'; payload: Omit<Todo, 'id' | 'createdAt'> }
  | { type: 'UPDATE_TODO'; payload: Todo }
  | { type: 'DELETE_TODO'; payload: string }
  | { type: 'ADD_EXPENSE'; payload: Omit<Expense, 'id'> }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'SET_BUDGET'; payload: Omit<Budget, 'id'> }
  | { type: 'ADD_HABIT'; payload: Omit<Habit, 'id' | 'createdAt' | 'streakCount' | 'completedDates'> }
  | { type: 'UPDATE_HABIT'; payload: Habit }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'COMPLETE_HABIT'; payload: { id: string; date: string } }
  | { type: 'ADD_EVENT'; payload: Omit<Event, 'id'> }
  | { type: 'UPDATE_EVENT'; payload: Event }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'ADD_REMINDER'; payload: Omit<Reminder, 'id' | 'isSent'> }
  | { type: 'UPDATE_REMINDER'; payload: Reminder }
  | { type: 'DELETE_REMINDER'; payload: string }
  | { type: 'DISMISS_REMINDER'; payload: string }
  | { type: 'SNOOZE_REMINDER'; payload: { id: string; until: Date } }
  // Goals
  | { type: 'ADD_GOAL'; payload: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_GOAL'; payload: Goal }
  | { type: 'DELETE_GOAL'; payload: string }
  // Pomodoro
  | { type: 'ADD_POMODORO_SESSION'; payload: Omit<PomodoroSession, 'id'> }
  | { type: 'DELETE_POMODORO_SESSION'; payload: string }
  // Time Entries
  | { type: 'ADD_TIME_ENTRY'; payload: Omit<TimeEntry, 'id'> }
  | { type: 'UPDATE_TIME_ENTRY'; payload: TimeEntry }
  | { type: 'DELETE_TIME_ENTRY'; payload: string }
  // Journal
  | { type: 'ADD_JOURNAL_ENTRY'; payload: Omit<JournalEntry, 'id' | 'createdAt'> }
  | { type: 'UPDATE_JOURNAL_ENTRY'; payload: JournalEntry }
  | { type: 'DELETE_JOURNAL_ENTRY'; payload: string }
  // Achievements
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: AchievementType }
  // Daily Challenges
  | { type: 'SET_DAILY_CHALLENGES'; payload: DailyChallenge[] }
  | { type: 'UPDATE_CHALLENGE_PROGRESS'; payload: { id: string; currentCount: number } }
  | { type: 'COMPLETE_CHALLENGE'; payload: string }
  | { type: 'LOAD_STATE'; payload: AppState };

// Generate sample dates
const today = new Date();
const yesterday = new Date(Date.now() - 86400000);
const twoDaysAgo = new Date(Date.now() - 2 * 86400000);
const threeDaysAgo = new Date(Date.now() - 3 * 86400000);
const fourDaysAgo = new Date(Date.now() - 4 * 86400000);
const tomorrow = new Date(Date.now() + 86400000);
const nextWeek = new Date(Date.now() + 7 * 86400000);

const formatDateStr = (d: Date) => d.toISOString().split('T')[0];

const sampleNotes = [
  {
    id: 'note-1',
    title: 'Welcome to ProductivityHub! 🎉',
    content: 'This is your personal productivity suite. Use the sidebar to navigate between different features:\n\n• Notes - Capture ideas and thoughts\n• To-Do List - Manage your tasks\n• Expenses - Track your finances\n• Habits - Build better habits\n• Scheduler - Plan your calendar\n• Reminders - Never forget important things',
    tags: ['important', 'personal'],
    isPinned: true,
    createdAt: yesterday,
    updatedAt: yesterday,
  },
  {
    id: 'note-2',
    title: 'Project Ideas',
    content: '1. Build a mobile app\n2. Learn a new programming language\n3. Start a blog\n4. Create an online course',
    tags: ['ideas', 'work'],
    isPinned: false,
    createdAt: twoDaysAgo,
    updatedAt: twoDaysAgo,
  },
  {
    id: 'note-3',
    title: 'Meeting Notes',
    content: 'Key takeaways from today\'s meeting:\n- New project deadline is next month\n- Need to review the design specs\n- Schedule follow-up with the team',
    tags: ['work'],
    isPinned: false,
    createdAt: threeDaysAgo,
    updatedAt: threeDaysAgo,
  },
];

const sampleTodos = [
  {
    id: 'todo-1',
    title: 'Complete project proposal',
    description: 'Draft and finalize the Q4 project proposal document',
    status: 'in-progress' as const,
    priority: 'high' as const,
    dueDate: tomorrow,
    category: 'Work',
    checklist: [
      { id: 'cl-1', text: 'Write executive summary', completed: true },
      { id: 'cl-2', text: 'Add budget estimates', completed: false },
      { id: 'cl-3', text: 'Review with team', completed: false },
    ],
    createdAt: twoDaysAgo,
  },
  {
    id: 'todo-2',
    title: 'Buy groceries',
    description: 'Weekly grocery shopping',
    status: 'pending' as const,
    priority: 'medium' as const,
    dueDate: today,
    category: 'Personal',
    checklist: [
      { id: 'cl-4', text: 'Milk', completed: false },
      { id: 'cl-5', text: 'Bread', completed: false },
      { id: 'cl-6', text: 'Fruits', completed: false },
    ],
    createdAt: yesterday,
  },
  {
    id: 'todo-3',
    title: 'Read documentation',
    description: 'Review the new API documentation',
    status: 'completed' as const,
    priority: 'low' as const,
    dueDate: yesterday,
    category: 'Learning',
    checklist: [],
    createdAt: threeDaysAgo,
  },
  {
    id: 'todo-4',
    title: 'Schedule dentist appointment',
    description: 'Annual dental checkup',
    status: 'pending' as const,
    priority: 'medium' as const,
    dueDate: nextWeek,
    category: 'Health',
    checklist: [],
    createdAt: today,
  },
];

const sampleExpenses = [
  {
    id: 'exp-1',
    amount: 5000,
    type: 'income' as const,
    category: 'Salary',
    description: 'Monthly salary',
    date: new Date(today.getFullYear(), today.getMonth(), 1),
    isRecurring: true,
  },
  {
    id: 'exp-2',
    amount: 120,
    type: 'expense' as const,
    category: 'Food',
    description: 'Weekly groceries',
    date: yesterday,
    isRecurring: false,
  },
  {
    id: 'exp-3',
    amount: 50,
    type: 'expense' as const,
    category: 'Transport',
    description: 'Gas',
    date: twoDaysAgo,
    isRecurring: false,
  },
  {
    id: 'exp-4',
    amount: 200,
    type: 'expense' as const,
    category: 'Bills',
    description: 'Internet and phone',
    date: threeDaysAgo,
    isRecurring: true,
  },
  {
    id: 'exp-5',
    amount: 45,
    type: 'expense' as const,
    category: 'Entertainment',
    description: 'Movie tickets',
    date: fourDaysAgo,
    isRecurring: false,
  },
  {
    id: 'exp-6',
    amount: 500,
    type: 'income' as const,
    category: 'Freelance',
    description: 'Side project payment',
    date: twoDaysAgo,
    isRecurring: false,
  },
];

const sampleBudgets = [
  {
    id: 'budget-1',
    category: 'Food',
    amount: 500,
    month: today.getMonth() + 1,
    year: today.getFullYear(),
  },
  {
    id: 'budget-2',
    category: 'Transport',
    amount: 200,
    month: today.getMonth() + 1,
    year: today.getFullYear(),
  },
  {
    id: 'budget-3',
    category: 'Entertainment',
    amount: 150,
    month: today.getMonth() + 1,
    year: today.getFullYear(),
  },
];

const sampleHabits = [
  {
    id: 'habit-1',
    name: 'Morning Exercise',
    frequency: 'daily' as const,
    category: 'health' as const,
    streakCount: 5,
    completedDates: [
      formatDateStr(today),
      formatDateStr(yesterday),
      formatDateStr(twoDaysAgo),
      formatDateStr(threeDaysAgo),
      formatDateStr(fourDaysAgo),
    ],
    createdAt: new Date(Date.now() - 14 * 86400000),
  },
  {
    id: 'habit-2',
    name: 'Read 30 minutes',
    frequency: 'daily' as const,
    category: 'learning' as const,
    streakCount: 3,
    completedDates: [
      formatDateStr(today),
      formatDateStr(yesterday),
      formatDateStr(twoDaysAgo),
    ],
    createdAt: new Date(Date.now() - 10 * 86400000),
  },
  {
    id: 'habit-3',
    name: 'Meditate',
    frequency: 'daily' as const,
    category: 'health' as const,
    streakCount: 2,
    completedDates: [
      formatDateStr(yesterday),
      formatDateStr(twoDaysAgo),
    ],
    createdAt: new Date(Date.now() - 7 * 86400000),
  },
  {
    id: 'habit-4',
    name: 'Review weekly goals',
    frequency: 'weekly' as const,
    category: 'productivity' as const,
    streakCount: 1,
    completedDates: [formatDateStr(yesterday)],
    createdAt: new Date(Date.now() - 21 * 86400000),
  },
];

const sampleEvents = [
  {
    id: 'event-1',
    title: 'Team Meeting',
    description: 'Weekly team sync-up',
    startTime: new Date(today.setHours(10, 0, 0)),
    endTime: new Date(today.setHours(11, 0, 0)),
    reminderTime: null,
    color: '#8b5cf6',
  },
  {
    id: 'event-2',
    title: 'Lunch with Client',
    description: 'Discuss new project requirements',
    startTime: new Date(tomorrow.setHours(12, 30, 0)),
    endTime: new Date(tomorrow.setHours(14, 0, 0)),
    reminderTime: null,
    color: '#10b981',
  },
  {
    id: 'event-3',
    title: 'Project Deadline',
    description: 'Submit final deliverables',
    startTime: new Date(nextWeek.setHours(17, 0, 0)),
    endTime: new Date(nextWeek.setHours(18, 0, 0)),
    reminderTime: null,
    color: '#ef4444',
  },
];

const sampleReminders = [
  {
    id: 'reminder-1',
    title: 'Review this app\'s features',
    referenceType: 'custom' as const,
    referenceId: null,
    remindAt: new Date(Date.now() + 3600000), // 1 hour from now
    isSent: false,
    snoozedUntil: null,
  },
];

const sampleGoals: Goal[] = [
  {
    id: 'goal-1',
    title: 'Learn React Advanced Patterns',
    description: 'Master advanced React patterns including compound components, render props, and hooks.',
    category: 'career',
    targetDate: new Date(Date.now() + 30 * 86400000),
    progress: 40,
    milestones: [
      { id: 'ms-1', title: 'Complete hooks tutorial', completed: true },
      { id: 'ms-2', title: 'Build a compound component', completed: true },
      { id: 'ms-3', title: 'Master render props', completed: false },
      { id: 'ms-4', title: 'Build a real project', completed: false },
    ],
    linkedTaskIds: ['todo-3'],
    linkedHabitIds: ['habit-2'],
    createdAt: new Date(Date.now() - 14 * 86400000),
    updatedAt: yesterday,
  },
  {
    id: 'goal-2',
    title: 'Get Fit This Quarter',
    description: 'Exercise regularly and improve overall health.',
    category: 'health',
    targetDate: new Date(Date.now() + 60 * 86400000),
    progress: 60,
    milestones: [
      { id: 'ms-5', title: 'Exercise 5 days/week for 2 weeks', completed: true },
      { id: 'ms-6', title: 'Run 5K without stopping', completed: true },
      { id: 'ms-7', title: 'Reach target weight', completed: true },
      { id: 'ms-8', title: 'Maintain for 1 month', completed: false },
    ],
    linkedTaskIds: [],
    linkedHabitIds: ['habit-1', 'habit-3'],
    createdAt: new Date(Date.now() - 21 * 86400000),
    updatedAt: twoDaysAgo,
  },
];

const sampleJournalEntries: JournalEntry[] = [
  {
    id: 'journal-1',
    content: 'Had a really productive day today. Finished the project proposal and got great feedback from the team. Feeling motivated to keep going!',
    moodRating: 5,
    gratitude: ['Great team collaboration', 'Good weather for a walk'],
    date: yesterday,
    createdAt: yesterday,
  },
  {
    id: 'journal-2',
    content: 'A bit tired today but still managed to get through my tasks. Need to focus on getting more sleep.',
    moodRating: 3,
    gratitude: ['Healthy lunch', 'Finished reading a chapter'],
    date: twoDaysAgo,
    createdAt: twoDaysAgo,
  },
];

const defaultAchievements: Achievement[] = [
  { id: 'ach-1', type: 'streak_master', title: 'Streak Master', description: 'Maintain a 30-day habit streak', criteria: '30-day streak on any habit', icon: '🔥', unlockedAt: null },
  { id: 'ach-2', type: 'task_crusher', title: 'Task Crusher', description: 'Complete 100 tasks', criteria: 'Complete 100 total tasks', icon: '💪', unlockedAt: null },
  { id: 'ach-3', type: 'budget_pro', title: 'Budget Pro', description: 'Stay within budget for 3 months', criteria: 'Under budget for 3 consecutive months', icon: '💰', unlockedAt: null },
  { id: 'ach-4', type: 'early_bird', title: 'Early Bird', description: 'Complete 5 tasks before 9 AM', criteria: '5 tasks completed before 9 AM', icon: '🌅', unlockedAt: null },
  { id: 'ach-5', type: 'note_taker', title: 'Note Taker', description: 'Create 50 notes', criteria: 'Create 50 total notes', icon: '📝', unlockedAt: null },
  { id: 'ach-6', type: 'focus_champion', title: 'Focus Champion', description: 'Complete 50 Pomodoro sessions', criteria: '50 completed focus sessions', icon: '🎯', unlockedAt: null },
  { id: 'ach-7', type: 'goal_setter', title: 'Goal Setter', description: 'Complete 5 goals', criteria: '5 goals at 100% progress', icon: '🏆', unlockedAt: null },
  { id: 'ach-8', type: 'journal_keeper', title: 'Journal Keeper', description: 'Write journal entries for 30 days', criteria: '30 journal entries', icon: '📓', unlockedAt: null },
];

const initialState: AppState = {
  notes: sampleNotes,
  todos: sampleTodos,
  expenses: sampleExpenses,
  budgets: sampleBudgets,
  habits: sampleHabits,
  events: sampleEvents,
  reminders: sampleReminders,
  goals: sampleGoals,
  pomodoroSessions: [],
  timeEntries: [],
  journalEntries: sampleJournalEntries,
  achievements: defaultAchievements,
  dailyChallenges: [],
};

function calculateStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;

  const sortedDates = [...completedDates].sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const current = new Date(sortedDates[i - 1]);
    const prev = new Date(sortedDates[i]);
    const diffDays = Math.floor((current.getTime() - prev.getTime()) / 86400000);

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_NOTE':
      return {
        ...state,
        notes: [
          ...state.notes,
          {
            ...action.payload,
            id: uuidv4(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map((note) =>
          note.id === action.payload.id
            ? { ...action.payload, updatedAt: new Date() }
            : note
        ),
      };
    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter((note) => note.id !== action.payload),
      };
    case 'TOGGLE_PIN_NOTE':
      return {
        ...state,
        notes: state.notes.map((note) =>
          note.id === action.payload ? { ...note, isPinned: !note.isPinned } : note
        ),
      };
    case 'ADD_TODO':
      return {
        ...state,
        todos: [
          ...state.todos,
          {
            ...action.payload,
            id: uuidv4(),
            createdAt: new Date(),
          },
        ],
      };
    case 'UPDATE_TODO':
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload.id ? action.payload : todo
        ),
      };
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.payload),
      };
    case 'ADD_EXPENSE':
      return {
        ...state,
        expenses: [...state.expenses, { ...action.payload, id: uuidv4() }],
      };
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map((expense) =>
          expense.id === action.payload.id ? action.payload : expense
        ),
      };
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter((expense) => expense.id !== action.payload),
      };
    case 'SET_BUDGET':
      const existingBudgetIndex = state.budgets.findIndex(
        (b) =>
          b.category === action.payload.category &&
          b.month === action.payload.month &&
          b.year === action.payload.year
      );
      if (existingBudgetIndex >= 0) {
        const newBudgets = [...state.budgets];
        newBudgets[existingBudgetIndex] = {
          ...newBudgets[existingBudgetIndex],
          amount: action.payload.amount,
        };
        return { ...state, budgets: newBudgets };
      }
      return {
        ...state,
        budgets: [...state.budgets, { ...action.payload, id: uuidv4() }],
      };
    case 'ADD_HABIT':
      return {
        ...state,
        habits: [
          ...state.habits,
          {
            ...action.payload,
            id: uuidv4(),
            streakCount: 0,
            completedDates: [],
            createdAt: new Date(),
          },
        ],
      };
    case 'UPDATE_HABIT':
      return {
        ...state,
        habits: state.habits.map((habit) =>
          habit.id === action.payload.id ? action.payload : habit
        ),
      };
    case 'DELETE_HABIT':
      return {
        ...state,
        habits: state.habits.filter((habit) => habit.id !== action.payload),
      };
    case 'COMPLETE_HABIT':
      return {
        ...state,
        habits: state.habits.map((habit) => {
          if (habit.id === action.payload.id) {
            const newCompletedDates = habit.completedDates.includes(action.payload.date)
              ? habit.completedDates.filter((d) => d !== action.payload.date)
              : [...habit.completedDates, action.payload.date];
            return {
              ...habit,
              completedDates: newCompletedDates,
              streakCount: calculateStreak(newCompletedDates),
            };
          }
          return habit;
        }),
      };
    case 'ADD_EVENT':
      return {
        ...state,
        events: [...state.events, { ...action.payload, id: uuidv4() }],
      };
    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map((event) =>
          event.id === action.payload.id ? action.payload : event
        ),
      };
    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter((event) => event.id !== action.payload),
      };
    case 'ADD_REMINDER':
      return {
        ...state,
        reminders: [
          ...state.reminders,
          { ...action.payload, id: uuidv4(), isSent: false },
        ],
      };
    case 'UPDATE_REMINDER':
      return {
        ...state,
        reminders: state.reminders.map((reminder) =>
          reminder.id === action.payload.id ? action.payload : reminder
        ),
      };
    case 'DELETE_REMINDER':
      return {
        ...state,
        reminders: state.reminders.filter((reminder) => reminder.id !== action.payload),
      };
    case 'DISMISS_REMINDER':
      return {
        ...state,
        reminders: state.reminders.filter((reminder) => reminder.id !== action.payload),
      };
    case 'SNOOZE_REMINDER':
      return {
        ...state,
        reminders: state.reminders.map((reminder) =>
          reminder.id === action.payload.id
            ? { ...reminder, snoozedUntil: action.payload.until }
            : reminder
        ),
      };

    // --- Goals ---
    case 'ADD_GOAL':
      return {
        ...state,
        goals: [
          ...state.goals,
          { ...action.payload, id: uuidv4(), createdAt: new Date(), updatedAt: new Date() },
        ],
      };
    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map((g) =>
          g.id === action.payload.id ? { ...action.payload, updatedAt: new Date() } : g
        ),
      };
    case 'DELETE_GOAL':
      return {
        ...state,
        goals: state.goals.filter((g) => g.id !== action.payload),
      };

    // --- Pomodoro ---
    case 'ADD_POMODORO_SESSION':
      return {
        ...state,
        pomodoroSessions: [
          ...state.pomodoroSessions,
          { ...action.payload, id: uuidv4() },
        ],
      };
    case 'DELETE_POMODORO_SESSION':
      return {
        ...state,
        pomodoroSessions: state.pomodoroSessions.filter((s) => s.id !== action.payload),
      };

    // --- Time Entries ---
    case 'ADD_TIME_ENTRY':
      return {
        ...state,
        timeEntries: [
          ...state.timeEntries,
          { ...action.payload, id: uuidv4() },
        ],
      };
    case 'UPDATE_TIME_ENTRY':
      return {
        ...state,
        timeEntries: state.timeEntries.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case 'DELETE_TIME_ENTRY':
      return {
        ...state,
        timeEntries: state.timeEntries.filter((t) => t.id !== action.payload),
      };

    // --- Journal ---
    case 'ADD_JOURNAL_ENTRY':
      return {
        ...state,
        journalEntries: [
          ...state.journalEntries,
          { ...action.payload, id: uuidv4(), createdAt: new Date() },
        ],
      };
    case 'UPDATE_JOURNAL_ENTRY':
      return {
        ...state,
        journalEntries: state.journalEntries.map((j) =>
          j.id === action.payload.id ? action.payload : j
        ),
      };
    case 'DELETE_JOURNAL_ENTRY':
      return {
        ...state,
        journalEntries: state.journalEntries.filter((j) => j.id !== action.payload),
      };

    // --- Achievements ---
    case 'UNLOCK_ACHIEVEMENT':
      return {
        ...state,
        achievements: state.achievements.map((a) =>
          a.type === action.payload && !a.unlockedAt
            ? { ...a, unlockedAt: new Date() }
            : a
        ),
      };

    // --- Daily Challenges ---
    case 'SET_DAILY_CHALLENGES':
      return { ...state, dailyChallenges: action.payload };
    case 'UPDATE_CHALLENGE_PROGRESS':
      return {
        ...state,
        dailyChallenges: state.dailyChallenges.map((c) =>
          c.id === action.payload.id
            ? { ...c, currentCount: action.payload.currentCount, completed: action.payload.currentCount >= c.targetCount }
            : c
        ),
      };
    case 'COMPLETE_CHALLENGE':
      return {
        ...state,
        dailyChallenges: state.dailyChallenges.map((c) =>
          c.id === action.payload ? { ...c, completed: true, currentCount: c.targetCount } : c
        ),
      };

    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const savedState = localStorage.getItem('productivityHubState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState, (key, value) => {
          if (
            key === 'createdAt' ||
            key === 'updatedAt' ||
            key === 'dueDate' ||
            key === 'date' ||
            key === 'startTime' ||
            key === 'endTime' ||
            key === 'reminderTime' ||
            key === 'remindAt' ||
            key === 'snoozedUntil' ||
            key === 'targetDate' ||
            key === 'completedAt' ||
            key === 'unlockedAt'
          ) {
            return value ? new Date(value) : null;
          }
          return value;
        });
        // Only load if there's meaningful data
        if (parsed && (parsed.notes?.length > 0 || parsed.todos?.length > 0 || parsed.habits?.length > 0)) {
          // Ensure new state slices exist with defaults for upgrades
          const merged: AppState = {
            ...initialState,
            ...parsed,
            goals: parsed.goals ?? initialState.goals,
            pomodoroSessions: parsed.pomodoroSessions ?? [],
            timeEntries: parsed.timeEntries ?? [],
            journalEntries: parsed.journalEntries ?? initialState.journalEntries,
            achievements: parsed.achievements ?? defaultAchievements,
            dailyChallenges: parsed.dailyChallenges ?? [],
          };
          dispatch({ type: 'LOAD_STATE', payload: merged });
        }
      } catch (e) {
        console.error('Failed to parse saved state', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('productivityHubState', JSON.stringify(state));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

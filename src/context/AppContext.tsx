import React, { createContext, useContext, useReducer, useEffect, useState, useCallback, ReactNode } from 'react';
import { Note, Todo, Expense, Budget, Habit, Event, Reminder, Goal, PomodoroSession, TimeEntry, JournalEntry, Achievement, AchievementType, DailyChallenge, Roadmap } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

// ─── Services ────────────────────────────────────────────────────────────────
import * as notesService from '../lib/services/notes.service';
import * as todosService from '../lib/services/todos.service';
import * as expensesService from '../lib/services/expenses.service';
import * as budgetsService from '../lib/services/budgets.service';
import * as habitsService from '../lib/services/habits.service';
import * as eventsService from '../lib/services/events.service';
import * as remindersService from '../lib/services/reminders.service';
import * as goalsService from '../lib/services/goals.service';
import * as pomodoroService from '../lib/services/pomodoro.service';
import * as timeEntriesService from '../lib/services/time-entries.service';
import * as journalService from '../lib/services/journal.service';
import * as achievementsService from '../lib/services/achievements.service';
import * as challengesService from '../lib/services/challenges.service';
import * as roadmapsService from '../lib/services/roadmaps.service';

// ─── State Types ─────────────────────────────────────────────────────────────

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
  roadmaps: Roadmap[];
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
  | { type: 'LOAD_STATE'; payload: AppState }
  // Roadmaps
  | { type: 'ADD_ROADMAP'; payload: Omit<Roadmap, 'id' | 'created_at' | 'updated_at'> }
  | { type: 'UPDATE_ROADMAP'; payload: Roadmap }
  | { type: 'DELETE_ROADMAP'; payload: string }
  | { type: 'TOGGLE_ROADMAP_MILESTONE'; payload: { roadmapId: string; phaseId: string; milestoneId: string } }
  | { type: 'TOGGLE_ROADMAP_TASK'; payload: { roadmapId: string; phaseId: string; milestoneId: string; taskId: string } };

// ─── Initial State ───────────────────────────────────────────────────────────

const emptyState: AppState = {
  notes: [],
  todos: [],
  expenses: [],
  budgets: [],
  habits: [],
  events: [],
  reminders: [],
  goals: [],
  pomodoroSessions: [],
  timeEntries: [],
  journalEntries: [],
  achievements: [],
  dailyChallenges: [],
  roadmaps: [],
};

// ─── Streak Calculator ──────────────────────────────────────────────────────

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

// ─── Reducer ─────────────────────────────────────────────────────────────────

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

    // --- Roadmaps ---
    case 'ADD_ROADMAP':
      return {
        ...state,
        roadmaps: [
          ...state.roadmaps,
          { ...action.payload, id: uuidv4(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Roadmap,
        ],
      };
    case 'UPDATE_ROADMAP':
      return {
        ...state,
        roadmaps: state.roadmaps.map((r) =>
          r.id === action.payload.id ? { ...action.payload, updated_at: new Date().toISOString() } : r
        ),
      };
    case 'DELETE_ROADMAP':
      return {
        ...state,
        roadmaps: state.roadmaps.filter((r) => r.id !== action.payload),
      };
    case 'TOGGLE_ROADMAP_MILESTONE': {
      const { roadmapId, phaseId, milestoneId } = action.payload;
      return {
        ...state,
        roadmaps: state.roadmaps.map(r => r.id === roadmapId ? {
          ...r,
          phases: r.phases.map(p => p.id === phaseId ? {
            ...p,
            milestones: p.milestones.map(m => m.id === milestoneId ? { ...m, is_completed: !m.is_completed } : m)
          } : p)
        } : r)
      };
    }
    case 'TOGGLE_ROADMAP_TASK': {
      const { roadmapId, phaseId, milestoneId, taskId } = action.payload;
      return {
        ...state,
        roadmaps: state.roadmaps.map(r => r.id === roadmapId ? {
          ...r,
          phases: r.phases.map(p => p.id === phaseId ? {
            ...p,
            milestones: p.milestones.map(m => m.id === milestoneId ? {
              ...m,
              tasks: m.tasks.map(t => t.id === taskId ? { ...t, is_completed: !t.is_completed } : t)
            } : m)
          } : p)
        } : r)
      };
    }

    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, emptyState);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuth();

  // ─── Fetch all data from Supabase on mount / auth change ───────────
  useEffect(() => {
    if (!session?.user) {
      dispatch({ type: 'LOAD_STATE', payload: emptyState });
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadAll() {
      setIsLoading(true);
      try {
        const [
          notes,
          todos,
          expenses,
          budgets,
          habits,
          events,
          reminders,
          goals,
          pomodoroSessions,
          timeEntries,
          journalEntries,
          achievements,
          dailyChallenges,
          roadmaps,
        ] = await Promise.all([
          notesService.fetchNotes(),
          todosService.fetchTodos(),
          expensesService.fetchExpenses(),
          budgetsService.fetchBudgets(),
          habitsService.fetchHabits(),
          eventsService.fetchEvents(),
          remindersService.fetchReminders(),
          goalsService.fetchGoals(),
          pomodoroService.fetchPomodoroSessions(),
          timeEntriesService.fetchTimeEntries(),
          journalService.fetchJournalEntries(),
          achievementsService.seedDefaultAchievements(),
          challengesService.fetchDailyChallenges(),
          roadmapsService.fetchRoadmaps(),
        ]);

        if (!cancelled) {
          dispatch({
            type: 'LOAD_STATE',
            payload: {
              notes,
              todos,
              expenses,
              budgets,
              habits,
              events,
              reminders,
              goals,
              pomodoroSessions,
              timeEntries,
              journalEntries,
              achievements,
              dailyChallenges,
              roadmaps,
            },
          });
        }
      } catch (err) {
        console.error('Failed to load data from Supabase:', err);
        toast.error('Failed to load data. Check your connection.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadAll();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  // ─── Supabase Realtime — full refresh on any change ────────────────
  useEffect(() => {
    if (!session?.user) return;

    // Debounced refetch to avoid spamming on batch operations
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const debouncedRefetch = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        try {
          const [
            notes, todos, expenses, budgets, habits, events, reminders,
            goals, pomodoroSessions, timeEntries, journalEntries,
            achievements, dailyChallenges, roadmaps,
          ] = await Promise.all([
            notesService.fetchNotes(),
            todosService.fetchTodos(),
            expensesService.fetchExpenses(),
            budgetsService.fetchBudgets(),
            habitsService.fetchHabits(),
            eventsService.fetchEvents(),
            remindersService.fetchReminders(),
            goalsService.fetchGoals(),
            pomodoroService.fetchPomodoroSessions(),
            timeEntriesService.fetchTimeEntries(),
            journalService.fetchJournalEntries(),
            achievementsService.fetchAchievements(),
            challengesService.fetchDailyChallenges(),
            roadmapsService.fetchRoadmaps(),
          ]);
          dispatch({
            type: 'LOAD_STATE',
            payload: {
              notes, todos, expenses, budgets, habits, events, reminders,
              goals, pomodoroSessions, timeEntries, journalEntries,
              achievements, dailyChallenges, roadmaps,
            },
          });
        } catch (err) {
          console.error('Realtime sync error:', err);
        }
      }, 500);
    };

    const channel = supabase
      .channel('app-realtime')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        debouncedRefetch();
      })
      .subscribe();

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  // ─── Wrap dispatch to sync with Supabase ───────────────────────────
  const syncDispatch = useCallback(
    (action: Action) => {
      // Optimistic local update first
      dispatch(action);

      // Fire-and-forget Supabase sync
      (async () => {
        try {
          switch (action.type) {
            // Notes
            case 'ADD_NOTE':
              await notesService.createNote(action.payload);
              break;
            case 'UPDATE_NOTE':
              await notesService.updateNote(action.payload);
              break;
            case 'DELETE_NOTE':
              await notesService.deleteNote(action.payload);
              break;
            case 'TOGGLE_PIN_NOTE': {
              const note = state.notes.find((n) => n.id === action.payload);
              if (note) await notesService.togglePinNote(action.payload, note.isPinned);
              break;
            }

            // Todos
            case 'ADD_TODO':
              await todosService.createTodo(action.payload);
              break;
            case 'UPDATE_TODO':
              await todosService.updateTodo(action.payload);
              break;
            case 'DELETE_TODO':
              await todosService.deleteTodo(action.payload);
              break;

            // Expenses
            case 'ADD_EXPENSE':
              await expensesService.createExpense(action.payload);
              break;
            case 'UPDATE_EXPENSE':
              await expensesService.updateExpense(action.payload);
              break;
            case 'DELETE_EXPENSE':
              await expensesService.deleteExpense(action.payload);
              break;

            // Budgets
            case 'SET_BUDGET':
              await budgetsService.upsertBudget(action.payload);
              break;

            // Habits
            case 'ADD_HABIT':
              await habitsService.createHabit(action.payload);
              break;
            case 'UPDATE_HABIT':
              await habitsService.updateHabit(action.payload);
              break;
            case 'DELETE_HABIT':
              await habitsService.deleteHabit(action.payload);
              break;
            case 'COMPLETE_HABIT': {
              const habit = state.habits.find((h) => h.id === action.payload.id);
              if (habit) {
                const newCompletedDates = habit.completedDates.includes(action.payload.date)
                  ? habit.completedDates.filter((d) => d !== action.payload.date)
                  : [...habit.completedDates, action.payload.date];
                const newStreak = calculateStreak(newCompletedDates);
                await habitsService.toggleHabitCompletion(action.payload.id, action.payload.date, newStreak);
              }
              break;
            }

            // Events
            case 'ADD_EVENT':
              await eventsService.createEvent(action.payload);
              break;
            case 'UPDATE_EVENT':
              await eventsService.updateEvent(action.payload);
              break;
            case 'DELETE_EVENT':
              await eventsService.deleteEvent(action.payload);
              break;

            // Reminders
            case 'ADD_REMINDER':
              await remindersService.createReminder(action.payload);
              break;
            case 'UPDATE_REMINDER':
              await remindersService.updateReminder(action.payload);
              break;
            case 'DELETE_REMINDER':
              await remindersService.deleteReminder(action.payload);
              break;
            case 'DISMISS_REMINDER':
              await remindersService.dismissReminder(action.payload);
              break;
            case 'SNOOZE_REMINDER':
              await remindersService.snoozeReminder(action.payload.id, action.payload.until);
              break;

            // Goals
            case 'ADD_GOAL':
              await goalsService.createGoal(action.payload);
              break;
            case 'UPDATE_GOAL':
              await goalsService.updateGoal(action.payload);
              break;
            case 'DELETE_GOAL':
              await goalsService.deleteGoal(action.payload);
              break;

            // Pomodoro
            case 'ADD_POMODORO_SESSION':
              await pomodoroService.createPomodoroSession(action.payload);
              break;
            case 'DELETE_POMODORO_SESSION':
              await pomodoroService.deletePomodoroSession(action.payload);
              break;

            // Time Entries
            case 'ADD_TIME_ENTRY':
              await timeEntriesService.createTimeEntry(action.payload);
              break;
            case 'UPDATE_TIME_ENTRY':
              await timeEntriesService.updateTimeEntry(action.payload);
              break;
            case 'DELETE_TIME_ENTRY':
              await timeEntriesService.deleteTimeEntry(action.payload);
              break;

            // Journal
            case 'ADD_JOURNAL_ENTRY':
              await journalService.createJournalEntry(action.payload);
              break;
            case 'UPDATE_JOURNAL_ENTRY':
              await journalService.updateJournalEntry(action.payload);
              break;
            case 'DELETE_JOURNAL_ENTRY':
              await journalService.deleteJournalEntry(action.payload);
              break;

            // Achievements
            case 'UNLOCK_ACHIEVEMENT':
              await achievementsService.unlockAchievement(action.payload);
              break;

            // Daily Challenges
            case 'SET_DAILY_CHALLENGES':
              await challengesService.setDailyChallenges(action.payload);
              break;
            case 'UPDATE_CHALLENGE_PROGRESS': {
              const challenge = state.dailyChallenges.find((c) => c.id === action.payload.id);
              if (challenge) {
                await challengesService.updateChallengeProgress(
                  action.payload.id,
                  action.payload.currentCount,
                  challenge.targetCount
                );
              }
              break;
            }
            case 'COMPLETE_CHALLENGE': {
              const ch = state.dailyChallenges.find((c) => c.id === action.payload);
              if (ch) await challengesService.completeChallenge(action.payload, ch.targetCount);
              break;
            }

            // Roadmaps
            case 'ADD_ROADMAP':
              await roadmapsService.createRoadmap(action.payload);
              break;
            case 'UPDATE_ROADMAP':
              await roadmapsService.updateRoadmap(action.payload);
              break;
            case 'DELETE_ROADMAP':
              await roadmapsService.deleteRoadmap(action.payload);
              break;

            // LOAD_STATE is local-only
            case 'LOAD_STATE':
              break;
          }
        } catch (err) {
          console.error(`Supabase sync error [${action.type}]:`, err);
          toast.error('Failed to sync changes. They will be retried.');
        }
      })();
    },
    [state]
  );

  // ─── Also persist to localStorage as offline fallback ──────────────
  useEffect(() => {
    if (state !== emptyState) {
      localStorage.setItem('productivityHubState', JSON.stringify(state));
    }
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch: syncDispatch, isLoading }}>
      {children}
    </AppContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

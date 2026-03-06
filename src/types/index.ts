export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Todo {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: Date | null;
  category: string;
  checklist: ChecklistItem[];
  createdAt: Date;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Expense {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: Date;
  isRecurring: boolean;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  month: number;
  year: number;
}

export interface Habit {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'custom';
  category: 'health' | 'productivity' | 'learning' | 'other';
  streakCount: number;
  completedDates: string[];
  createdAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  reminderTime: Date | null;
  color: string;
}

export interface Reminder {
  id: string;
  title: string;
  referenceType: 'todo' | 'event' | 'habit' | 'custom';
  referenceId: string | null;
  remindAt: Date;
  isSent: boolean;
  snoozedUntil: Date | null;
}

export interface ProductivityStats {
  completedTasks: number;
  totalTasks: number;
  habitStreakAvg: number;
  attendedEvents: number;
  totalEvents: number;
  notesCreated: number;
  withinBudget: boolean;
  totalIncome: number;
  totalExpenses: number;
}

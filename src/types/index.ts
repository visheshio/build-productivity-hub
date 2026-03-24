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

// --- Phase 1: Core Productivity ---

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'career' | 'health' | 'financial' | 'personal';
  targetDate: Date | null;
  progress: number; // 0-100
  milestones: Milestone[];
  linkedTaskIds: string[];
  linkedHabitIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PomodoroSession {
  id: string;
  taskId: string | null;
  taskTitle: string;
  duration: number; // in seconds
  breakDuration: number;
  completedAt: Date;
  type: 'work' | 'break';
}

export interface TimeEntry {
  id: string;
  taskId: string;
  startTime: Date;
  endTime: Date | null;
  duration: number; // in seconds
}

export interface JournalEntry {
  id: string;
  content: string;
  moodRating: 1 | 2 | 3 | 4 | 5;
  gratitude: string[];
  date: Date;
  createdAt: Date;
}

// --- Phase 3: Gamification ---

export type AchievementType =
  | 'streak_master'
  | 'task_crusher'
  | 'budget_pro'
  | 'early_bird'
  | 'note_taker'
  | 'focus_champion'
  | 'goal_setter'
  | 'journal_keeper';

export interface Achievement {
  id: string;
  type: AchievementType;
  title: string;
  description: string;
  criteria: string;
  icon: string;
  unlockedAt: Date | null;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  category: string;
  targetCount: number;
  currentCount: number;
  completed: boolean;
  date: string; // YYYY-MM-DD
  points: number;
}

// --- Phase 2: UX ---

export interface WidgetConfig {
  id: string;
  title: string;
  visible: boolean;
  order: number;
}

// --- Phase 4: Workflow Builder ---

export interface Roadmap {
  id: string;
  user_id: string;
  skill: string;
  duration_weeks: number;
  daily_minutes: number;
  experience_level: 'beginner' | 'some_basics' | 'intermediate' | 'advanced';
  learning_preferences: string[];
  goal_statement?: string;
  phases: Phase[];
  status: 'active' | 'completed' | 'paused' | 'archived';
  progress_percentage: number;
  started_at: string;
  estimated_completion: string;
  created_at: string;
  updated_at: string;
  ai_model_used: string;
  raw_ai_response?: string;
}

export interface Phase {
  id: string;
  roadmap_id: string;
  phase_number: number;
  title: string;
  description: string;
  duration_text: string;
  start_week: number;
  end_week: number;
  status: 'completed' | 'in_progress' | 'locked' | 'upcoming';
  progress_percentage: number;
  milestones: RoadmapMilestone[];
  resources: Resource[];
  order_index: number;
}

export interface RoadmapMilestone {
  id: string;
  phase_id: string;
  title: string;
  description?: string;
  is_completed: boolean;
  completed_at?: string;
  tasks: RoadmapTask[];
  linked_goal_id?: string;
  order_index: number;
}

export interface RoadmapTask {
  id: string;
  milestone_id: string;
  title: string;
  description?: string;
  estimated_minutes?: number;
  suggested_date?: string;
  is_completed: boolean;
  completed_at?: string;
  linked_todo_id?: string;
  order_index: number;
}

export interface Resource {
  id: string;
  phase_id: string;
  title: string;
  url: string;
  type: 'video' | 'article' | 'course' | 'podcast' | 'book' | 'app' | 'tool';
  source: string;
  author?: string;
  duration?: string;
  description: string;
  is_consumed: boolean;
  is_bookmarked: boolean;
  milestone_id?: string;
  order_index: number;
}

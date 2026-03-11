/**
 * Hand-written database types matching the Supabase Postgres schema.
 * Regenerate with `npx supabase gen types typescript` after schema changes.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
    public: {
        Tables: {
            notes: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    content: string;
                    tags: string[];
                    is_pinned: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string;
                    title: string;
                    content?: string;
                    tags?: string[];
                    is_pinned?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    title?: string;
                    content?: string;
                    tags?: string[];
                    is_pinned?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            todos: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    description: string;
                    status: string;
                    priority: string;
                    due_date: string | null;
                    category: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string;
                    title: string;
                    description?: string;
                    status?: string;
                    priority?: string;
                    due_date?: string | null;
                    category?: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    title?: string;
                    description?: string;
                    status?: string;
                    priority?: string;
                    due_date?: string | null;
                    category?: string;
                    created_at?: string;
                };
                Relationships: [];
            };
            todo_checklist_items: {
                Row: {
                    id: string;
                    todo_id: string;
                    text: string;
                    completed: boolean;
                    position: number;
                };
                Insert: {
                    id?: string;
                    todo_id: string;
                    text: string;
                    completed?: boolean;
                    position?: number;
                };
                Update: {
                    id?: string;
                    todo_id?: string;
                    text?: string;
                    completed?: boolean;
                    position?: number;
                };
                Relationships: [
                    {
                        foreignKeyName: 'todo_checklist_items_todo_id_fkey',
                        columns: ['todo_id'],
                        isOneToOne: false,
                        referencedRelation: 'todos',
                        referencedColumns: ['id'],
                    },
                ];
            };
            expenses: {
                Row: {
                    id: string;
                    user_id: string;
                    amount: number;
                    type: string;
                    category: string;
                    description: string;
                    date: string;
                    is_recurring: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string;
                    amount: number;
                    type: string;
                    category?: string;
                    description?: string;
                    date: string;
                    is_recurring?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    amount?: number;
                    type?: string;
                    category?: string;
                    description?: string;
                    date?: string;
                    is_recurring?: boolean;
                    created_at?: string;
                };
                Relationships: [];
            };
            budgets: {
                Row: {
                    id: string;
                    user_id: string;
                    category: string;
                    amount: number;
                    month: number;
                    year: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string;
                    category: string;
                    amount: number;
                    month: number;
                    year: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    category?: string;
                    amount?: number;
                    month?: number;
                    year?: number;
                    created_at?: string;
                };
                Relationships: [];
            };
            habits: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    frequency: string;
                    category: string;
                    streak_count: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string;
                    name: string;
                    frequency: string;
                    category: string;
                    streak_count?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    name?: string;
                    frequency?: string;
                    category?: string;
                    streak_count?: number;
                    created_at?: string;
                };
                Relationships: [];
            };
            habit_completions: {
                Row: {
                    id: string;
                    habit_id: string;
                    completed_date: string;
                };
                Insert: {
                    id?: string;
                    habit_id: string;
                    completed_date: string;
                };
                Update: {
                    id?: string;
                    habit_id?: string;
                    completed_date?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'habit_completions_habit_id_fkey',
                        columns: ['habit_id'],
                        isOneToOne: false,
                        referencedRelation: 'habits',
                        referencedColumns: ['id'],
                    },
                ];
            };
            events: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    description: string;
                    start_time: string;
                    end_time: string;
                    reminder_time: string | null;
                    color: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string;
                    title: string;
                    description?: string;
                    start_time: string;
                    end_time: string;
                    reminder_time?: string | null;
                    color?: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    title?: string;
                    description?: string;
                    start_time?: string;
                    end_time?: string;
                    reminder_time?: string | null;
                    color?: string;
                    created_at?: string;
                };
                Relationships: [];
            };
            reminders: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    reference_type: string;
                    reference_id: string | null;
                    remind_at: string;
                    is_sent: boolean;
                    snoozed_until: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string;
                    title: string;
                    reference_type: string;
                    reference_id?: string | null;
                    remind_at: string;
                    is_sent?: boolean;
                    snoozed_until?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    title?: string;
                    reference_type?: string;
                    reference_id?: string | null;
                    remind_at?: string;
                    is_sent?: boolean;
                    snoozed_until?: string | null;
                    created_at?: string;
                };
                Relationships: [];
            };
            goals: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    description: string;
                    category: string;
                    target_date: string | null;
                    progress: number;
                    linked_task_ids: string[];
                    linked_habit_ids: string[];
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string;
                    title: string;
                    description?: string;
                    category: string;
                    target_date?: string | null;
                    progress?: number;
                    linked_task_ids?: string[];
                    linked_habit_ids?: string[];
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    title?: string;
                    description?: string;
                    category?: string;
                    target_date?: string | null;
                    progress?: number;
                    linked_task_ids?: string[];
                    linked_habit_ids?: string[];
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            goal_milestones: {
                Row: {
                    id: string;
                    goal_id: string;
                    title: string;
                    completed: boolean;
                    position: number;
                };
                Insert: {
                    id?: string;
                    goal_id: string;
                    title: string;
                    completed?: boolean;
                    position?: number;
                };
                Update: {
                    id?: string;
                    goal_id?: string;
                    title?: string;
                    completed?: boolean;
                    position?: number;
                };
                Relationships: [
                    {
                        foreignKeyName: 'goal_milestones_goal_id_fkey',
                        columns: ['goal_id'],
                        isOneToOne: false,
                        referencedRelation: 'goals',
                        referencedColumns: ['id'],
                    },
                ];
            };
            pomodoro_sessions: {
                Row: {
                    id: string;
                    user_id: string;
                    task_id: string | null;
                    task_title: string;
                    duration: number;
                    break_duration: number;
                    completed_at: string;
                    type: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string;
                    task_id?: string | null;
                    task_title: string;
                    duration: number;
                    break_duration: number;
                    completed_at: string;
                    type: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    task_id?: string | null;
                    task_title?: string;
                    duration?: number;
                    break_duration?: number;
                    completed_at?: string;
                    type?: string;
                    created_at?: string;
                };
                Relationships: [];
            };
            time_entries: {
                Row: {
                    id: string;
                    user_id: string;
                    task_id: string;
                    start_time: string;
                    end_time: string | null;
                    duration: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string;
                    task_id: string;
                    start_time: string;
                    end_time?: string | null;
                    duration?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    task_id?: string;
                    start_time?: string;
                    end_time?: string | null;
                    duration?: number;
                    created_at?: string;
                };
                Relationships: [];
            };
            journal_entries: {
                Row: {
                    id: string;
                    user_id: string;
                    content: string;
                    mood_rating: number;
                    gratitude: string[];
                    date: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string;
                    content: string;
                    mood_rating: number;
                    gratitude?: string[];
                    date: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    content?: string;
                    mood_rating?: number;
                    gratitude?: string[];
                    date?: string;
                    created_at?: string;
                };
                Relationships: [];
            };
            achievements: {
                Row: {
                    id: string;
                    user_id: string;
                    type: string;
                    title: string;
                    description: string;
                    criteria: string;
                    icon: string;
                    unlocked_at: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string;
                    type: string;
                    title: string;
                    description: string;
                    criteria: string;
                    icon: string;
                    unlocked_at?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    type?: string;
                    title?: string;
                    description?: string;
                    criteria?: string;
                    icon?: string;
                    unlocked_at?: string | null;
                    created_at?: string;
                };
                Relationships: [];
            };
            daily_challenges: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    description: string;
                    category: string;
                    target_count: number;
                    current_count: number;
                    completed: boolean;
                    date: string;
                    points: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string;
                    title: string;
                    description: string;
                    category: string;
                    target_count: number;
                    current_count?: number;
                    completed?: boolean;
                    date: string;
                    points: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    title?: string;
                    description?: string;
                    category?: string;
                    target_count?: number;
                    current_count?: number;
                    completed?: boolean;
                    date?: string;
                    points?: number;
                    created_at?: string;
                };
                Relationships: [];
            };
        };
        Views: {};
        Functions: {};
        Enums: {};
    };
}

// Convenience type aliases
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

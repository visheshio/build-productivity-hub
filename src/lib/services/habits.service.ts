import { supabase } from '../supabase';
import type { Habit } from '../../types';
import { toDateRequired, handleSupabaseError, getUserId } from '../helpers';
import type { Tables } from '../database.types';

function rowToHabit(
    row: Tables<'habits'> & { habit_completions?: Tables<'habit_completions'>[] }
): Habit {
    return {
        id: row.id,
        name: row.name,
        frequency: row.frequency as Habit['frequency'],
        category: row.category as Habit['category'],
        streakCount: row.streak_count,
        completedDates: (row.habit_completions ?? []).map((hc) => hc.completed_date),
        createdAt: toDateRequired(row.created_at),
    };
}

export async function fetchHabits(): Promise<Habit[]> {
    const { data, error } = await supabase
        .from('habits')
        .select('*, habit_completions(*)')
        .order('created_at', { ascending: false });
    handleSupabaseError(error, 'fetchHabits');
    return (data ?? []).map(rowToHabit);
}

export async function createHabit(
    habit: Omit<Habit, 'id' | 'createdAt' | 'streakCount' | 'completedDates'>
): Promise<Habit> {
    const { data, error } = await supabase
        .from('habits')
        .insert({
            user_id: await getUserId(),
            name: habit.name,
            frequency: habit.frequency,
            category: habit.category,
        })
        .select('*, habit_completions(*)')
        .single();
    handleSupabaseError(error, 'createHabit');
    return rowToHabit(data!);
}

export async function updateHabit(habit: Habit): Promise<Habit> {
    const { error } = await supabase
        .from('habits')
        .update({
            name: habit.name,
            frequency: habit.frequency,
            category: habit.category,
            streak_count: habit.streakCount,
        })
        .eq('id', habit.id);
    handleSupabaseError(error, 'updateHabit');

    // Re-fetch
    const { data, error: fetchErr } = await supabase
        .from('habits')
        .select('*, habit_completions(*)')
        .eq('id', habit.id)
        .single();
    handleSupabaseError(fetchErr, 'updateHabit:refetch');
    return rowToHabit(data!);
}

export async function deleteHabit(id: string): Promise<void> {
    const { error } = await supabase.from('habits').delete().eq('id', id);
    handleSupabaseError(error, 'deleteHabit');
}

export async function toggleHabitCompletion(
    habitId: string,
    date: string,
    newStreakCount: number
): Promise<void> {
    // Check if completion exists
    const { data: existing } = await supabase
        .from('habit_completions')
        .select('id')
        .eq('habit_id', habitId)
        .eq('completed_date', date)
        .maybeSingle();

    if (existing) {
        // Remove completion
        const { error } = await supabase
            .from('habit_completions')
            .delete()
            .eq('id', existing.id);
        handleSupabaseError(error, 'toggleHabitCompletion:delete');
    } else {
        // Add completion
        const { error } = await supabase
            .from('habit_completions')
            .insert({ habit_id: habitId, completed_date: date });
        handleSupabaseError(error, 'toggleHabitCompletion:insert');
    }

    // Update streak count
    const { error: streakErr } = await supabase
        .from('habits')
        .update({ streak_count: newStreakCount })
        .eq('id', habitId);
    handleSupabaseError(streakErr, 'toggleHabitCompletion:streak');
}

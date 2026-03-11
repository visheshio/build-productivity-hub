import { supabase } from '../supabase';
import type { Goal } from '../../types';
import { toDate, toDateRequired, handleSupabaseError, getUserId } from '../helpers';
import type { Tables } from '../database.types';

function rowToGoal(
    row: Tables<'goals'> & { goal_milestones?: Tables<'goal_milestones'>[] }
): Goal {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        category: row.category as Goal['category'],
        targetDate: toDate(row.target_date),
        progress: row.progress,
        milestones: (row.goal_milestones ?? [])
            .sort((a, b) => a.position - b.position)
            .map((m) => ({
                id: m.id,
                title: m.title,
                completed: m.completed,
            })),
        linkedTaskIds: row.linked_task_ids,
        linkedHabitIds: row.linked_habit_ids,
        createdAt: toDateRequired(row.created_at),
        updatedAt: toDateRequired(row.updated_at),
    };
}

export async function fetchGoals(): Promise<Goal[]> {
    const { data, error } = await supabase
        .from('goals')
        .select('*, goal_milestones(*)')
        .order('created_at', { ascending: false });
    handleSupabaseError(error, 'fetchGoals');
    return (data ?? []).map(rowToGoal);
}

export async function createGoal(
    goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Goal> {
    const { data, error } = await supabase
        .from('goals')
        .insert({
            user_id: await getUserId(),
            title: goal.title,
            description: goal.description,
            category: goal.category,
            target_date: goal.targetDate?.toISOString() ?? null,
            progress: goal.progress,
            linked_task_ids: goal.linkedTaskIds,
            linked_habit_ids: goal.linkedHabitIds,
        })
        .select()
        .single();
    handleSupabaseError(error, 'createGoal');

    // Insert milestones
    if (goal.milestones.length > 0) {
        const { error: msErr } = await supabase.from('goal_milestones').insert(
            goal.milestones.map((m, i) => ({
                goal_id: data!.id,
                title: m.title,
                completed: m.completed,
                position: i,
            }))
        );
        handleSupabaseError(msErr, 'createGoal:milestones');
    }

    // Re-fetch
    const { data: full, error: fetchErr } = await supabase
        .from('goals')
        .select('*, goal_milestones(*)')
        .eq('id', data!.id)
        .single();
    handleSupabaseError(fetchErr, 'createGoal:refetch');
    return rowToGoal(full!);
}

export async function updateGoal(goal: Goal): Promise<Goal> {
    const { error } = await supabase
        .from('goals')
        .update({
            title: goal.title,
            description: goal.description,
            category: goal.category,
            target_date: goal.targetDate?.toISOString() ?? null,
            progress: goal.progress,
            linked_task_ids: goal.linkedTaskIds,
            linked_habit_ids: goal.linkedHabitIds,
        })
        .eq('id', goal.id);
    handleSupabaseError(error, 'updateGoal');

    // Sync milestones
    const { error: delErr } = await supabase
        .from('goal_milestones')
        .delete()
        .eq('goal_id', goal.id);
    handleSupabaseError(delErr, 'updateGoal:deleteMilestones');

    if (goal.milestones.length > 0) {
        const { error: insErr } = await supabase.from('goal_milestones').insert(
            goal.milestones.map((m, i) => ({
                goal_id: goal.id,
                title: m.title,
                completed: m.completed,
                position: i,
            }))
        );
        handleSupabaseError(insErr, 'updateGoal:insertMilestones');
    }

    // Re-fetch
    const { data: full, error: fetchErr } = await supabase
        .from('goals')
        .select('*, goal_milestones(*)')
        .eq('id', goal.id)
        .single();
    handleSupabaseError(fetchErr, 'updateGoal:refetch');
    return rowToGoal(full!);
}

export async function deleteGoal(id: string): Promise<void> {
    const { error } = await supabase.from('goals').delete().eq('id', id);
    handleSupabaseError(error, 'deleteGoal');
}

import { supabase } from '../supabase';
import type { DailyChallenge } from '../../types';
import { handleSupabaseError, getUserId } from '../helpers';
import type { Tables } from '../database.types';

function rowToChallenge(row: Tables<'daily_challenges'>): DailyChallenge {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        category: row.category,
        targetCount: row.target_count,
        currentCount: row.current_count,
        completed: row.completed,
        date: row.date,
        points: row.points,
    };
}

export async function fetchDailyChallenges(): Promise<DailyChallenge[]> {
    const { data, error } = await supabase
        .from('daily_challenges')
        .select('*')
        .order('date', { ascending: false });
    handleSupabaseError(error, 'fetchDailyChallenges');
    return (data ?? []).map(rowToChallenge);
}

export async function setDailyChallenges(challenges: DailyChallenge[]): Promise<DailyChallenge[]> {
    // Delete existing challenges for the dates being set
    const dates = [...new Set(challenges.map((c) => c.date))];
    if (dates.length > 0) {
        const { error: delErr } = await supabase
            .from('daily_challenges')
            .delete()
            .in('date', dates);
        handleSupabaseError(delErr, 'setDailyChallenges:delete');
    }

    if (challenges.length === 0) return [];

    const userId = await getUserId();
    const { data, error } = await supabase
        .from('daily_challenges')
        .insert(
            challenges.map((c) => ({
                user_id: userId,
                title: c.title,
                description: c.description,
                category: c.category,
                target_count: c.targetCount,
                current_count: c.currentCount,
                completed: c.completed,
                date: c.date,
                points: c.points,
            }))
        )
        .select();
    handleSupabaseError(error, 'setDailyChallenges:insert');
    return (data ?? []).map(rowToChallenge);
}

export async function updateChallengeProgress(
    id: string,
    currentCount: number,
    targetCount: number
): Promise<void> {
    const { error } = await supabase
        .from('daily_challenges')
        .update({
            current_count: currentCount,
            completed: currentCount >= targetCount,
        })
        .eq('id', id);
    handleSupabaseError(error, 'updateChallengeProgress');
}

export async function completeChallenge(id: string, targetCount: number): Promise<void> {
    const { error } = await supabase
        .from('daily_challenges')
        .update({
            completed: true,
            current_count: targetCount,
        })
        .eq('id', id);
    handleSupabaseError(error, 'completeChallenge');
}

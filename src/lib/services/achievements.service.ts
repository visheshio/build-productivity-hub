import { supabase } from '../supabase';
import type { Achievement, AchievementType } from '../../types';
import { toDate, handleSupabaseError, getUserId } from '../helpers';
import type { Tables } from '../database.types';

function rowToAchievement(row: Tables<'achievements'>): Achievement {
    return {
        id: row.id,
        type: row.type as AchievementType,
        title: row.title,
        description: row.description,
        criteria: row.criteria,
        icon: row.icon,
        unlockedAt: toDate(row.unlocked_at),
    };
}

const DEFAULT_ACHIEVEMENTS: Omit<Achievement, 'id'>[] = [
    { type: 'streak_master', title: 'Streak Master', description: 'Maintain a 30-day habit streak', criteria: '30-day streak on any habit', icon: '🔥', unlockedAt: null },
    { type: 'task_crusher', title: 'Task Crusher', description: 'Complete 100 tasks', criteria: 'Complete 100 total tasks', icon: '💪', unlockedAt: null },
    { type: 'budget_pro', title: 'Budget Pro', description: 'Stay within budget for 3 months', criteria: 'Under budget for 3 consecutive months', icon: '💰', unlockedAt: null },
    { type: 'early_bird', title: 'Early Bird', description: 'Complete 5 tasks before 9 AM', criteria: '5 tasks completed before 9 AM', icon: '🌅', unlockedAt: null },
    { type: 'note_taker', title: 'Note Taker', description: 'Create 50 notes', criteria: 'Create 50 total notes', icon: '📝', unlockedAt: null },
    { type: 'focus_champion', title: 'Focus Champion', description: 'Complete 50 Pomodoro sessions', criteria: '50 completed focus sessions', icon: '🎯', unlockedAt: null },
    { type: 'goal_setter', title: 'Goal Setter', description: 'Complete 5 goals', criteria: '5 goals at 100% progress', icon: '🏆', unlockedAt: null },
    { type: 'journal_keeper', title: 'Journal Keeper', description: 'Write journal entries for 30 days', criteria: '30 journal entries', icon: '📓', unlockedAt: null },
];

export async function fetchAchievements(): Promise<Achievement[]> {
    const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('type', { ascending: true });
    handleSupabaseError(error, 'fetchAchievements');
    return (data ?? []).map(rowToAchievement);
}

/**
 * Seed default achievements for a new user if they don't exist yet.
 */
export async function seedDefaultAchievements(): Promise<Achievement[]> {
    const existing = await fetchAchievements();
    if (existing.length > 0) return existing;

    const userId = await getUserId();
    const { data, error } = await supabase
        .from('achievements')
        .insert(
            DEFAULT_ACHIEVEMENTS.map((a) => ({
                user_id: userId,
                type: a.type,
                title: a.title,
                description: a.description,
                criteria: a.criteria,
                icon: a.icon,
            }))
        )
        .select();
    handleSupabaseError(error, 'seedDefaultAchievements');
    return (data ?? []).map(rowToAchievement);
}

export async function unlockAchievement(type: AchievementType): Promise<void> {
    const { error } = await supabase
        .from('achievements')
        .update({ unlocked_at: new Date().toISOString() })
        .eq('type', type)
        .is('unlocked_at', null);
    handleSupabaseError(error, 'unlockAchievement');
}

import { supabase } from '../supabase';
import type { PomodoroSession } from '../../types';
import { toDateRequired, handleSupabaseError, getUserId } from '../helpers';
import type { Tables } from '../database.types';

function rowToSession(row: Tables<'pomodoro_sessions'>): PomodoroSession {
    return {
        id: row.id,
        taskId: row.task_id,
        taskTitle: row.task_title,
        duration: row.duration,
        breakDuration: row.break_duration,
        completedAt: toDateRequired(row.completed_at),
        type: row.type as PomodoroSession['type'],
    };
}

export async function fetchPomodoroSessions(): Promise<PomodoroSession[]> {
    const { data, error } = await supabase
        .from('pomodoro_sessions')
        .select('*')
        .order('completed_at', { ascending: false });
    handleSupabaseError(error, 'fetchPomodoroSessions');
    return (data ?? []).map(rowToSession);
}

export async function createPomodoroSession(
    session: Omit<PomodoroSession, 'id'>
): Promise<PomodoroSession> {
    const { data, error } = await supabase
        .from('pomodoro_sessions')
        .insert({
            user_id: await getUserId(),
            task_id: session.taskId,
            task_title: session.taskTitle,
            duration: session.duration,
            break_duration: session.breakDuration,
            completed_at: session.completedAt.toISOString(),
            type: session.type,
        })
        .select()
        .single();
    handleSupabaseError(error, 'createPomodoroSession');
    return rowToSession(data!);
}

export async function deletePomodoroSession(id: string): Promise<void> {
    const { error } = await supabase.from('pomodoro_sessions').delete().eq('id', id);
    handleSupabaseError(error, 'deletePomodoroSession');
}

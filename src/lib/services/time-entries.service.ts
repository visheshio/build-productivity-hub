import { supabase } from '../supabase';
import type { TimeEntry } from '../../types';
import { toDate, toDateRequired, handleSupabaseError, getUserId } from '../helpers';
import type { Tables } from '../database.types';

function rowToTimeEntry(row: Tables<'time_entries'>): TimeEntry {
    return {
        id: row.id,
        taskId: row.task_id,
        startTime: toDateRequired(row.start_time),
        endTime: toDate(row.end_time),
        duration: row.duration,
    };
}

export async function fetchTimeEntries(): Promise<TimeEntry[]> {
    const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .order('start_time', { ascending: false });
    handleSupabaseError(error, 'fetchTimeEntries');
    return (data ?? []).map(rowToTimeEntry);
}

export async function createTimeEntry(entry: Omit<TimeEntry, 'id'>): Promise<TimeEntry> {
    const { data, error } = await supabase
        .from('time_entries')
        .insert({
            user_id: await getUserId(),
            task_id: entry.taskId,
            start_time: entry.startTime.toISOString(),
            end_time: entry.endTime?.toISOString() ?? null,
            duration: entry.duration,
        })
        .select()
        .single();
    handleSupabaseError(error, 'createTimeEntry');
    return rowToTimeEntry(data!);
}

export async function updateTimeEntry(entry: TimeEntry): Promise<TimeEntry> {
    const { data, error } = await supabase
        .from('time_entries')
        .update({
            task_id: entry.taskId,
            start_time: entry.startTime.toISOString(),
            end_time: entry.endTime?.toISOString() ?? null,
            duration: entry.duration,
        })
        .eq('id', entry.id)
        .select()
        .single();
    handleSupabaseError(error, 'updateTimeEntry');
    return rowToTimeEntry(data!);
}

export async function deleteTimeEntry(id: string): Promise<void> {
    const { error } = await supabase.from('time_entries').delete().eq('id', id);
    handleSupabaseError(error, 'deleteTimeEntry');
}

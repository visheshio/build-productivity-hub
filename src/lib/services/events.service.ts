import { supabase } from '../supabase';
import type { Event } from '../../types';
import { toDate, toDateRequired, handleSupabaseError, getUserId } from '../helpers';
import type { Tables } from '../database.types';

function rowToEvent(row: Tables<'events'>): Event {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        startTime: toDateRequired(row.start_time),
        endTime: toDateRequired(row.end_time),
        reminderTime: toDate(row.reminder_time),
        color: row.color,
    };
}

export async function fetchEvents(): Promise<Event[]> {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_time', { ascending: true });
    handleSupabaseError(error, 'fetchEvents');
    return (data ?? []).map(rowToEvent);
}

export async function createEvent(event: Omit<Event, 'id'>): Promise<Event> {
    const { data, error } = await supabase
        .from('events')
        .insert({
            user_id: await getUserId(),
            title: event.title,
            description: event.description,
            start_time: event.startTime.toISOString(),
            end_time: event.endTime.toISOString(),
            reminder_time: event.reminderTime?.toISOString() ?? null,
            color: event.color,
        })
        .select()
        .single();
    handleSupabaseError(error, 'createEvent');
    return rowToEvent(data!);
}

export async function updateEvent(event: Event): Promise<Event> {
    const { data, error } = await supabase
        .from('events')
        .update({
            title: event.title,
            description: event.description,
            start_time: event.startTime.toISOString(),
            end_time: event.endTime.toISOString(),
            reminder_time: event.reminderTime?.toISOString() ?? null,
            color: event.color,
        })
        .eq('id', event.id)
        .select()
        .single();
    handleSupabaseError(error, 'updateEvent');
    return rowToEvent(data!);
}

export async function deleteEvent(id: string): Promise<void> {
    const { error } = await supabase.from('events').delete().eq('id', id);
    handleSupabaseError(error, 'deleteEvent');
}

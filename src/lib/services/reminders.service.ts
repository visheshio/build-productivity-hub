import { supabase } from '../supabase';
import type { Reminder } from '../../types';
import { toDate, toDateRequired, handleSupabaseError, getUserId } from '../helpers';
import type { Tables } from '../database.types';

function rowToReminder(row: Tables<'reminders'>): Reminder {
    return {
        id: row.id,
        title: row.title,
        referenceType: row.reference_type as Reminder['referenceType'],
        referenceId: row.reference_id,
        remindAt: toDateRequired(row.remind_at),
        isSent: row.is_sent,
        snoozedUntil: toDate(row.snoozed_until),
    };
}

export async function fetchReminders(): Promise<Reminder[]> {
    const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .order('remind_at', { ascending: true });
    handleSupabaseError(error, 'fetchReminders');
    return (data ?? []).map(rowToReminder);
}

export async function createReminder(reminder: Omit<Reminder, 'id' | 'isSent'>): Promise<Reminder> {
    const { data, error } = await supabase
        .from('reminders')
        .insert({
            user_id: await getUserId(),
            title: reminder.title,
            reference_type: reminder.referenceType,
            reference_id: reminder.referenceId,
            remind_at: reminder.remindAt.toISOString(),
            snoozed_until: reminder.snoozedUntil?.toISOString() ?? null,
        })
        .select()
        .single();
    handleSupabaseError(error, 'createReminder');
    return rowToReminder(data!);
}

export async function updateReminder(reminder: Reminder): Promise<Reminder> {
    const { data, error } = await supabase
        .from('reminders')
        .update({
            title: reminder.title,
            reference_type: reminder.referenceType,
            reference_id: reminder.referenceId,
            remind_at: reminder.remindAt.toISOString(),
            is_sent: reminder.isSent,
            snoozed_until: reminder.snoozedUntil?.toISOString() ?? null,
        })
        .eq('id', reminder.id)
        .select()
        .single();
    handleSupabaseError(error, 'updateReminder');
    return rowToReminder(data!);
}

export async function deleteReminder(id: string): Promise<void> {
    const { error } = await supabase.from('reminders').delete().eq('id', id);
    handleSupabaseError(error, 'deleteReminder');
}

export async function dismissReminder(id: string): Promise<void> {
    const { error } = await supabase.from('reminders').delete().eq('id', id);
    handleSupabaseError(error, 'dismissReminder');
}

export async function snoozeReminder(id: string, until: Date): Promise<void> {
    const { error } = await supabase
        .from('reminders')
        .update({ snoozed_until: until.toISOString() })
        .eq('id', id);
    handleSupabaseError(error, 'snoozeReminder');
}

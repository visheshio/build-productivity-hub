import { supabase } from '../supabase';
import type { JournalEntry } from '../../types';
import { toDateRequired, handleSupabaseError, getUserId } from '../helpers';
import type { Tables } from '../database.types';

function rowToJournalEntry(row: Tables<'journal_entries'>): JournalEntry {
    return {
        id: row.id,
        content: row.content,
        moodRating: row.mood_rating as JournalEntry['moodRating'],
        gratitude: row.gratitude,
        date: toDateRequired(row.date),
        createdAt: toDateRequired(row.created_at),
    };
}

export async function fetchJournalEntries(): Promise<JournalEntry[]> {
    const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('date', { ascending: false });
    handleSupabaseError(error, 'fetchJournalEntries');
    return (data ?? []).map(rowToJournalEntry);
}

export async function createJournalEntry(
    entry: Omit<JournalEntry, 'id' | 'createdAt'>
): Promise<JournalEntry> {
    const { data, error } = await supabase
        .from('journal_entries')
        .insert({
            user_id: await getUserId(),
            content: entry.content,
            mood_rating: entry.moodRating,
            gratitude: entry.gratitude,
            date: entry.date.toISOString(),
        })
        .select()
        .single();
    handleSupabaseError(error, 'createJournalEntry');
    return rowToJournalEntry(data!);
}

export async function updateJournalEntry(entry: JournalEntry): Promise<JournalEntry> {
    const { data, error } = await supabase
        .from('journal_entries')
        .update({
            content: entry.content,
            mood_rating: entry.moodRating,
            gratitude: entry.gratitude,
            date: entry.date.toISOString(),
        })
        .eq('id', entry.id)
        .select()
        .single();
    handleSupabaseError(error, 'updateJournalEntry');
    return rowToJournalEntry(data!);
}

export async function deleteJournalEntry(id: string): Promise<void> {
    const { error } = await supabase.from('journal_entries').delete().eq('id', id);
    handleSupabaseError(error, 'deleteJournalEntry');
}

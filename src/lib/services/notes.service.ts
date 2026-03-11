import { supabase } from '../supabase';
import type { Note } from '../../types';
import { toDateRequired, handleSupabaseError, getUserId } from '../helpers';
import type { Tables } from '../database.types';

function rowToNote(row: Tables<'notes'>): Note {
    return {
        id: row.id,
        title: row.title,
        content: row.content,
        tags: row.tags,
        isPinned: row.is_pinned,
        createdAt: toDateRequired(row.created_at),
        updatedAt: toDateRequired(row.updated_at),
    };
}

export async function fetchNotes(): Promise<Note[]> {
    const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });
    handleSupabaseError(error, 'fetchNotes');
    return (data ?? []).map(rowToNote);
}

export async function createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    const { data, error } = await supabase
        .from('notes')
        .insert({
            user_id: await getUserId(),
            title: note.title,
            content: note.content,
            tags: note.tags,
            is_pinned: note.isPinned,
        })
        .select()
        .single();
    handleSupabaseError(error, 'createNote');
    return rowToNote(data!);
}

export async function updateNote(note: Note): Promise<Note> {
    const { data, error } = await supabase
        .from('notes')
        .update({
            title: note.title,
            content: note.content,
            tags: note.tags,
            is_pinned: note.isPinned,
        })
        .eq('id', note.id)
        .select()
        .single();
    handleSupabaseError(error, 'updateNote');
    return rowToNote(data!);
}

export async function deleteNote(id: string): Promise<void> {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    handleSupabaseError(error, 'deleteNote');
}

export async function togglePinNote(id: string, isPinned: boolean): Promise<void> {
    const { error } = await supabase
        .from('notes')
        .update({ is_pinned: !isPinned })
        .eq('id', id);
    handleSupabaseError(error, 'togglePinNote');
}

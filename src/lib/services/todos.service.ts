import { supabase } from '../supabase';
import type { Todo } from '../../types';
import { toDate, toDateRequired, handleSupabaseError, getUserId } from '../helpers';
import type { Tables } from '../database.types';

function rowToTodo(row: Tables<'todos'> & { todo_checklist_items?: Tables<'todo_checklist_items'>[] }): Todo {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        status: row.status as Todo['status'],
        priority: row.priority as Todo['priority'],
        dueDate: toDate(row.due_date),
        category: row.category,
        checklist: (row.todo_checklist_items ?? [])
            .sort((a, b) => a.position - b.position)
            .map((ci) => ({
                id: ci.id,
                text: ci.text,
                completed: ci.completed,
            })),
        createdAt: toDateRequired(row.created_at),
    };
}

export async function fetchTodos(): Promise<Todo[]> {
    const { data, error } = await supabase
        .from('todos')
        .select('*, todo_checklist_items(*)')
        .order('created_at', { ascending: false });
    handleSupabaseError(error, 'fetchTodos');
    return (data ?? []).map(rowToTodo);
}

export async function createTodo(todo: Omit<Todo, 'id' | 'createdAt'>): Promise<Todo> {
    const { data, error } = await supabase
        .from('todos')
        .insert({
            user_id: await getUserId(),
            title: todo.title,
            description: todo.description,
            status: todo.status,
            priority: todo.priority,
            due_date: todo.dueDate?.toISOString() ?? null,
            category: todo.category,
        })
        .select()
        .single();
    handleSupabaseError(error, 'createTodo');

    // Insert checklist items
    if (todo.checklist.length > 0) {
        const { error: clError } = await supabase.from('todo_checklist_items').insert(
            todo.checklist.map((ci, i) => ({
                todo_id: data!.id,
                text: ci.text,
                completed: ci.completed,
                position: i,
            }))
        );
        handleSupabaseError(clError, 'createTodo:checklist');
    }

    // Re-fetch with checklist
    const { data: full, error: fetchErr } = await supabase
        .from('todos')
        .select('*, todo_checklist_items(*)')
        .eq('id', data!.id)
        .single();
    handleSupabaseError(fetchErr, 'createTodo:refetch');
    return rowToTodo(full!);
}

export async function updateTodo(todo: Todo): Promise<Todo> {
    const { error } = await supabase
        .from('todos')
        .update({
            title: todo.title,
            description: todo.description,
            status: todo.status,
            priority: todo.priority,
            due_date: todo.dueDate?.toISOString() ?? null,
            category: todo.category,
        })
        .eq('id', todo.id);
    handleSupabaseError(error, 'updateTodo');

    // Sync checklist: delete all then re-insert
    const { error: delErr } = await supabase
        .from('todo_checklist_items')
        .delete()
        .eq('todo_id', todo.id);
    handleSupabaseError(delErr, 'updateTodo:deleteChecklist');

    if (todo.checklist.length > 0) {
        const { error: insErr } = await supabase.from('todo_checklist_items').insert(
            todo.checklist.map((ci, i) => ({
                todo_id: todo.id,
                text: ci.text,
                completed: ci.completed,
                position: i,
            }))
        );
        handleSupabaseError(insErr, 'updateTodo:insertChecklist');
    }

    // Re-fetch with checklist
    const { data: full, error: fetchErr } = await supabase
        .from('todos')
        .select('*, todo_checklist_items(*)')
        .eq('id', todo.id)
        .single();
    handleSupabaseError(fetchErr, 'updateTodo:refetch');
    return rowToTodo(full!);
}

export async function deleteTodo(id: string): Promise<void> {
    // Checklist items cascade-delete via FK
    const { error } = await supabase.from('todos').delete().eq('id', id);
    handleSupabaseError(error, 'deleteTodo');
}

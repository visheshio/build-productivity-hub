import { supabase } from '../supabase';
import type { Expense } from '../../types';
import { toDateRequired, handleSupabaseError, getUserId } from '../helpers';
import type { Tables } from '../database.types';

function rowToExpense(row: Tables<'expenses'>): Expense {
    return {
        id: row.id,
        amount: Number(row.amount),
        type: row.type as Expense['type'],
        category: row.category,
        description: row.description,
        date: toDateRequired(row.date),
        isRecurring: row.is_recurring,
    };
}

export async function fetchExpenses(): Promise<Expense[]> {
    const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
    handleSupabaseError(error, 'fetchExpenses');
    return (data ?? []).map(rowToExpense);
}

export async function createExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
    const { data, error } = await supabase
        .from('expenses')
        .insert({
            user_id: await getUserId(),
            amount: expense.amount,
            type: expense.type,
            category: expense.category,
            description: expense.description,
            date: expense.date.toISOString(),
            is_recurring: expense.isRecurring,
        })
        .select()
        .single();
    handleSupabaseError(error, 'createExpense');
    return rowToExpense(data!);
}

export async function updateExpense(expense: Expense): Promise<Expense> {
    const { data, error } = await supabase
        .from('expenses')
        .update({
            amount: expense.amount,
            type: expense.type,
            category: expense.category,
            description: expense.description,
            date: expense.date.toISOString(),
            is_recurring: expense.isRecurring,
        })
        .eq('id', expense.id)
        .select()
        .single();
    handleSupabaseError(error, 'updateExpense');
    return rowToExpense(data!);
}

export async function deleteExpense(id: string): Promise<void> {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    handleSupabaseError(error, 'deleteExpense');
}

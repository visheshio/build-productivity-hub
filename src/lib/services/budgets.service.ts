import { supabase } from '../supabase';
import type { Budget } from '../../types';
import { handleSupabaseError, getUserId } from '../helpers';
import type { Tables } from '../database.types';

function rowToBudget(row: Tables<'budgets'>): Budget {
    return {
        id: row.id,
        category: row.category,
        amount: Number(row.amount),
        month: row.month,
        year: row.year,
    };
}

export async function fetchBudgets(): Promise<Budget[]> {
    const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false });
    handleSupabaseError(error, 'fetchBudgets');
    return (data ?? []).map(rowToBudget);
}

export async function upsertBudget(budget: Omit<Budget, 'id'>): Promise<Budget> {
    const { data, error } = await supabase
        .from('budgets')
        .upsert(
            {
                user_id: await getUserId(),
                category: budget.category,
                amount: budget.amount,
                month: budget.month,
                year: budget.year,
            },
            { onConflict: 'user_id,category,month,year' }
        )
        .select()
        .single();
    handleSupabaseError(error, 'upsertBudget');
    return rowToBudget(data!);
}

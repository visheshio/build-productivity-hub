import { supabase } from './supabase';

/**
 * Utility helpers for Supabase ↔ App type conversions.
 */

/**
 * Get the current authenticated user's ID.
 * Throws if no user is logged in.
 */
export async function getUserId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    return user.id;
}

/** Convert a Date | null to an ISO string | null for Postgres */
export function toISOString(date: Date | null | undefined): string | null {
    if (!date) return null;
    return date instanceof Date ? date.toISOString() : date;
}

/** Convert an ISO string | null from Postgres to Date | null */
export function toDate(iso: string | null | undefined): Date | null {
    if (!iso) return null;
    return new Date(iso);
}

/** Convert an ISO string to a Date (non-nullable) */
export function toDateRequired(iso: string): Date {
    return new Date(iso);
}

/**
 * Generic error handler for Supabase responses.
 * Throws with context if there's an error.
 */
export function handleSupabaseError(error: { message: string; code?: string } | null, context: string): void {
    if (error) {
        console.error(`Supabase error [${context}]:`, error);
        throw new Error(`${context}: ${error.message}`);
    }
}

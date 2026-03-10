// ─── CSV Export Utilities ─────────────────────────────────────────────────────
// Excel-compatible CSV with BOM, proper escaping, date formatting, and
// per-data-type export functions.

import type { Note, Todo, Expense, Habit, Event, Reminder } from '../types';
import type { AppState } from '../context/AppContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** UTF-8 BOM so Excel auto-detects encoding correctly. */
const BOM = '\uFEFF';

/** Format a Date to a readable locale string, or return empty string. */
function formatDate(val: unknown): string {
    if (!val) return '';
    const d = val instanceof Date ? val : new Date(val as string | number);
    if (isNaN(d.getTime())) return String(val);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatDateOnly(val: unknown): string {
    if (!val) return '';
    const d = val instanceof Date ? val : new Date(val as string | number);
    if (isNaN(d.getTime())) return String(val);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

/**
 * Escape a single CSV cell value.
 * - null / undefined → empty
 * - Date → locale string
 * - Array → semicolon-separated
 * - Object → JSON
 * - Strings containing comma, quote, or newline are quoted + double-quoted
 */
function escapeCsvValue(val: unknown): string {
    if (val === null || val === undefined) return '';

    if (val instanceof Date) return formatDate(val);

    if (Array.isArray(val)) {
        return escapeCsvValue(val.map((v) => String(v)).join('; '));
    }

    if (typeof val === 'object') {
        return escapeCsvValue(JSON.stringify(val));
    }

    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

/** Build a CSV string from rows + headers. */
function buildCsv(headers: string[], rows: string[][]): string {
    const headerLine = headers.map(escapeCsvValue).join(',');
    const dataLines = rows.map((row) => row.map(escapeCsvValue).join(','));
    return [headerLine, ...dataLines].join('\n');
}

// ─── Download ─────────────────────────────────────────────────────────────────

/** Trigger a file download in the browser. */
function downloadCsv(filename: string, csvContent: string): void {
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ─── Generic Export ───────────────────────────────────────────────────────────

export interface CsvDataset {
    title: string;
    headers: string[];
    rows: string[][];
}

/** Export a single dataset to CSV. */
export function exportToCsv(filename: string, headers: string[], rows: string[][]): void {
    const csv = buildCsv(headers, rows);
    downloadCsv(filename, csv);
}

/** Export multiple datasets to a single CSV, separated by blank lines. */
export function exportMultipleToCsv(filename: string, datasets: CsvDataset[]): void {
    const sections = datasets.map((ds) => {
        const sectionHeader = `--- ${ds.title} ---`;
        const csv = buildCsv(ds.headers, ds.rows);
        return `${sectionHeader}\n${csv}`;
    });
    downloadCsv(filename, sections.join('\n\n'));
}

// ─── Date helper for filenames ────────────────────────────────────────────────

function dateSuffix(): string {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

// ─── Notes ────────────────────────────────────────────────────────────────────

export function exportNotes(notes: Note[]): void {
    const headers = ['Title', 'Content', 'Tags', 'Pinned', 'Created Date', 'Updated Date'];
    const rows = notes.map((n) => [
        n.title,
        n.content,
        n.tags.join('; '),
        n.isPinned ? 'Yes' : 'No',
        formatDate(n.createdAt),
        formatDate(n.updatedAt),
    ]);
    exportToCsv(`notes-export-${dateSuffix()}.csv`, headers, rows);
}

// ─── Todos ────────────────────────────────────────────────────────────────────

export function exportTodos(todos: Todo[]): void {
    const headers = ['Task', 'Description', 'Priority', 'Status', 'Due Date', 'Category'];
    const rows = todos.map((t) => [
        t.title,
        t.description || '',
        t.priority.charAt(0).toUpperCase() + t.priority.slice(1),
        t.status === 'completed' ? 'Completed' : t.status === 'in-progress' ? 'In Progress' : 'Pending',
        t.dueDate ? formatDateOnly(t.dueDate) : '',
        t.category || '',
    ]);
    exportToCsv(`todos-export-${dateSuffix()}.csv`, headers, rows);
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export function exportExpenses(expenses: Expense[], includesSummary = true): void {
    const headers = ['Description', 'Amount', 'Type', 'Category', 'Date', 'Recurring'];
    const rows = expenses.map((e) => [
        e.description || '',
        e.amount.toFixed(2),
        e.type === 'income' ? 'Income' : 'Expense',
        e.category,
        formatDateOnly(e.date),
        e.isRecurring ? 'Yes' : 'No',
    ]);

    if (includesSummary && expenses.length > 0) {
        const totalIncome = expenses
            .filter((e) => e.type === 'income')
            .reduce((sum, e) => sum + e.amount, 0);
        const totalExpenses = expenses
            .filter((e) => e.type === 'expense')
            .reduce((sum, e) => sum + e.amount, 0);
        const balance = totalIncome - totalExpenses;

        rows.push([]); // blank separator
        rows.push(['TOTAL INCOME', totalIncome.toFixed(2), '', '', '', '']);
        rows.push(['TOTAL EXPENSES', totalExpenses.toFixed(2), '', '', '', '']);
        rows.push(['BALANCE', balance.toFixed(2), '', '', '', '']);
    }

    exportToCsv(`expenses-export-${dateSuffix()}.csv`, headers, rows);
}

// ─── Habits ───────────────────────────────────────────────────────────────────

export function exportHabits(habits: Habit[]): void {
    const headers = ['Habit Name', 'Category', 'Frequency', 'Current Streak', 'Total Completions', 'Start Date'];
    const rows = habits.map((h) => [
        h.name,
        h.category.charAt(0).toUpperCase() + h.category.slice(1),
        h.frequency.charAt(0).toUpperCase() + h.frequency.slice(1),
        String(h.streakCount),
        String(h.completedDates.length),
        formatDateOnly(h.createdAt),
    ]);
    exportToCsv(`habits-export-${dateSuffix()}.csv`, headers, rows);
}

// ─── Events / Scheduler ──────────────────────────────────────────────────────

export function exportEvents(events: Event[]): void {
    const headers = ['Event Title', 'Description', 'Start Date/Time', 'End Date/Time', 'Reminder', 'Color'];
    const rows = events.map((ev) => [
        ev.title,
        ev.description || '',
        formatDate(ev.startTime),
        formatDate(ev.endTime),
        ev.reminderTime ? formatDate(ev.reminderTime) : 'None',
        ev.color || '',
    ]);
    exportToCsv(`events-export-${dateSuffix()}.csv`, headers, rows);
}

// ─── Reminders ────────────────────────────────────────────────────────────────

export function exportReminders(reminders: Reminder[]): void {
    const headers = ['Reminder', 'Type', 'Reference ID', 'Remind At', 'Sent', 'Snoozed Until'];
    const rows = reminders.map((r) => [
        r.title,
        r.referenceType.charAt(0).toUpperCase() + r.referenceType.slice(1),
        r.referenceId || '',
        formatDate(r.remindAt),
        r.isSent ? 'Yes' : 'No',
        r.snoozedUntil ? formatDate(r.snoozedUntil) : '',
    ]);
    exportToCsv(`reminders-export-${dateSuffix()}.csv`, headers, rows);
}

// ─── Full Backup ──────────────────────────────────────────────────────────────

export function exportFullBackup(state: AppState): void {
    const now = new Date();
    const meta: CsvDataset = {
        title: 'BACKUP METADATA',
        headers: ['Property', 'Value'],
        rows: [
            ['Export Date', formatDate(now)],
            ['Notes', String(state.notes.length)],
            ['Tasks', String(state.todos.length)],
            ['Expenses', String(state.expenses.length)],
            ['Habits', String(state.habits.length)],
            ['Events', String(state.events.length)],
            ['Reminders', String(state.reminders.length)],
            ['Goals', String(state.goals.length)],
            ['Journal Entries', String(state.journalEntries.length)],
        ],
    };

    const notesDs: CsvDataset = {
        title: 'NOTES',
        headers: ['Title', 'Content', 'Tags', 'Pinned', 'Created', 'Updated'],
        rows: state.notes.map((n) => [
            n.title, n.content, n.tags.join('; '), n.isPinned ? 'Yes' : 'No',
            formatDate(n.createdAt), formatDate(n.updatedAt),
        ]),
    };

    const todosDs: CsvDataset = {
        title: 'TASKS',
        headers: ['Task', 'Description', 'Priority', 'Status', 'Due Date', 'Category'],
        rows: state.todos.map((t) => [
            t.title, t.description || '',
            t.priority.charAt(0).toUpperCase() + t.priority.slice(1),
            t.status === 'completed' ? 'Completed' : t.status === 'in-progress' ? 'In Progress' : 'Pending',
            t.dueDate ? formatDateOnly(t.dueDate) : '', t.category || '',
        ]),
    };

    const expensesDs: CsvDataset = {
        title: 'EXPENSES',
        headers: ['Description', 'Amount', 'Type', 'Category', 'Date', 'Recurring'],
        rows: state.expenses.map((e) => [
            e.description || '', e.amount.toFixed(2),
            e.type === 'income' ? 'Income' : 'Expense', e.category,
            formatDateOnly(e.date), e.isRecurring ? 'Yes' : 'No',
        ]),
    };

    const habitsDs: CsvDataset = {
        title: 'HABITS',
        headers: ['Name', 'Category', 'Frequency', 'Streak', 'Completions', 'Start Date'],
        rows: state.habits.map((h) => [
            h.name, h.category, h.frequency,
            String(h.streakCount), String(h.completedDates.length), formatDateOnly(h.createdAt),
        ]),
    };

    const eventsDs: CsvDataset = {
        title: 'EVENTS',
        headers: ['Title', 'Description', 'Start', 'End', 'Reminder', 'Color'],
        rows: state.events.map((ev) => [
            ev.title, ev.description || '',
            formatDate(ev.startTime), formatDate(ev.endTime),
            ev.reminderTime ? formatDate(ev.reminderTime) : '', ev.color || '',
        ]),
    };

    const remindersDs: CsvDataset = {
        title: 'REMINDERS',
        headers: ['Title', 'Type', 'Remind At', 'Sent', 'Snoozed Until'],
        rows: state.reminders.map((r) => [
            r.title, r.referenceType,
            formatDate(r.remindAt), r.isSent ? 'Yes' : 'No',
            r.snoozedUntil ? formatDate(r.snoozedUntil) : '',
        ]),
    };

    exportMultipleToCsv(
        `productivity-hub-backup-${dateSuffix()}.csv`,
        [meta, notesDs, todosDs, expensesDs, habitsDs, eventsDs, remindersDs],
    );
}

-- ============================================================
-- ProductivityHub — Initial Supabase Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ──────────────────────────────── NOTES ────────────────────────────────

create table public.notes (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null default '',
  content    text not null default '',
  tags       text[] not null default '{}',
  is_pinned  boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notes enable row level security;

create policy "Users manage own notes"
  on public.notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_notes_user on public.notes(user_id);

-- ──────────────────────────────── TODOS ────────────────────────────────

create table public.todos (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null default '',
  description text not null default '',
  status      text not null default 'pending' check (status in ('pending','in-progress','completed')),
  priority    text not null default 'medium' check (priority in ('low','medium','high')),
  due_date    timestamptz,
  category    text not null default '',
  created_at  timestamptz not null default now()
);

alter table public.todos enable row level security;

create policy "Users manage own todos"
  on public.todos for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_todos_user on public.todos(user_id);

-- ─── TODO CHECKLIST ITEMS ─────────────────────────────────────────────

create table public.todo_checklist_items (
  id        uuid primary key default uuid_generate_v4(),
  todo_id   uuid not null references public.todos(id) on delete cascade,
  text      text not null default '',
  completed boolean not null default false,
  position  int not null default 0
);

alter table public.todo_checklist_items enable row level security;

create policy "Users manage own checklist items"
  on public.todo_checklist_items for all
  using (
    exists (
      select 1 from public.todos
      where todos.id = todo_checklist_items.todo_id
        and todos.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.todos
      where todos.id = todo_checklist_items.todo_id
        and todos.user_id = auth.uid()
    )
  );

create index idx_checklist_todo on public.todo_checklist_items(todo_id);

-- ──────────────────────────────── EXPENSES ─────────────────────────────

create table public.expenses (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  amount       numeric(12,2) not null default 0,
  type         text not null default 'expense' check (type in ('income','expense')),
  category     text not null default '',
  description  text not null default '',
  date         timestamptz not null default now(),
  is_recurring boolean not null default false,
  created_at   timestamptz not null default now()
);

alter table public.expenses enable row level security;

create policy "Users manage own expenses"
  on public.expenses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_expenses_user on public.expenses(user_id);

-- ──────────────────────────────── BUDGETS ──────────────────────────────

create table public.budgets (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  category   text not null default '',
  amount     numeric(12,2) not null default 0,
  month      int not null,
  year       int not null,
  created_at timestamptz not null default now(),
  unique (user_id, category, month, year)
);

alter table public.budgets enable row level security;

create policy "Users manage own budgets"
  on public.budgets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_budgets_user on public.budgets(user_id);

-- ──────────────────────────────── HABITS ───────────────────────────────

create table public.habits (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null default '',
  frequency    text not null default 'daily' check (frequency in ('daily','weekly','custom')),
  category     text not null default 'other' check (category in ('health','productivity','learning','other')),
  streak_count int not null default 0,
  created_at   timestamptz not null default now()
);

alter table public.habits enable row level security;

create policy "Users manage own habits"
  on public.habits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_habits_user on public.habits(user_id);

-- ─── HABIT COMPLETIONS ────────────────────────────────────────────────

create table public.habit_completions (
  id             uuid primary key default uuid_generate_v4(),
  habit_id       uuid not null references public.habits(id) on delete cascade,
  completed_date date not null,
  unique (habit_id, completed_date)
);

alter table public.habit_completions enable row level security;

create policy "Users manage own habit completions"
  on public.habit_completions for all
  using (
    exists (
      select 1 from public.habits
      where habits.id = habit_completions.habit_id
        and habits.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.habits
      where habits.id = habit_completions.habit_id
        and habits.user_id = auth.uid()
    )
  );

create index idx_habit_completions_habit on public.habit_completions(habit_id);

-- ──────────────────────────────── EVENTS ───────────────────────────────

create table public.events (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text not null default '',
  description   text not null default '',
  start_time    timestamptz not null,
  end_time      timestamptz not null,
  reminder_time timestamptz,
  color         text not null default '#8b5cf6',
  created_at    timestamptz not null default now()
);

alter table public.events enable row level security;

create policy "Users manage own events"
  on public.events for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_events_user on public.events(user_id);

-- ──────────────────────────────── REMINDERS ────────────────────────────

create table public.reminders (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  title          text not null default '',
  reference_type text not null default 'custom' check (reference_type in ('todo','event','habit','custom')),
  reference_id   uuid,
  remind_at      timestamptz not null,
  is_sent        boolean not null default false,
  snoozed_until  timestamptz,
  created_at     timestamptz not null default now()
);

alter table public.reminders enable row level security;

create policy "Users manage own reminders"
  on public.reminders for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_reminders_user on public.reminders(user_id);

-- ──────────────────────────────── GOALS ────────────────────────────────

create table public.goals (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  title           text not null default '',
  description     text not null default '',
  category        text not null default 'personal' check (category in ('career','health','financial','personal')),
  target_date     timestamptz,
  progress        int not null default 0 check (progress >= 0 and progress <= 100),
  linked_task_ids text[] not null default '{}',
  linked_habit_ids text[] not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.goals enable row level security;

create policy "Users manage own goals"
  on public.goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_goals_user on public.goals(user_id);

-- ─── GOAL MILESTONES ──────────────────────────────────────────────────

create table public.goal_milestones (
  id        uuid primary key default uuid_generate_v4(),
  goal_id   uuid not null references public.goals(id) on delete cascade,
  title     text not null default '',
  completed boolean not null default false,
  position  int not null default 0
);

alter table public.goal_milestones enable row level security;

create policy "Users manage own milestones"
  on public.goal_milestones for all
  using (
    exists (
      select 1 from public.goals
      where goals.id = goal_milestones.goal_id
        and goals.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.goals
      where goals.id = goal_milestones.goal_id
        and goals.user_id = auth.uid()
    )
  );

create index idx_milestones_goal on public.goal_milestones(goal_id);

-- ──────────────────────────────── POMODORO SESSIONS ───────────────────

create table public.pomodoro_sessions (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  task_id        uuid,
  task_title     text not null default '',
  duration       int not null default 0,
  break_duration int not null default 0,
  completed_at   timestamptz not null default now(),
  type           text not null default 'work' check (type in ('work','break')),
  created_at     timestamptz not null default now()
);

alter table public.pomodoro_sessions enable row level security;

create policy "Users manage own pomodoro sessions"
  on public.pomodoro_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_pomodoro_user on public.pomodoro_sessions(user_id);

-- ──────────────────────────────── TIME ENTRIES ─────────────────────────

create table public.time_entries (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  task_id    text not null default '',
  start_time timestamptz not null,
  end_time   timestamptz,
  duration   int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.time_entries enable row level security;

create policy "Users manage own time entries"
  on public.time_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_time_entries_user on public.time_entries(user_id);

-- ──────────────────────────────── JOURNAL ENTRIES ──────────────────────

create table public.journal_entries (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  content     text not null default '',
  mood_rating int not null default 3 check (mood_rating >= 1 and mood_rating <= 5),
  gratitude   text[] not null default '{}',
  date        timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

alter table public.journal_entries enable row level security;

create policy "Users manage own journal entries"
  on public.journal_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_journal_user on public.journal_entries(user_id);

-- ──────────────────────────────── ACHIEVEMENTS ────────────────────────

create table public.achievements (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null,
  title       text not null default '',
  description text not null default '',
  criteria    text not null default '',
  icon        text not null default '',
  unlocked_at timestamptz,
  created_at  timestamptz not null default now(),
  unique (user_id, type)
);

alter table public.achievements enable row level security;

create policy "Users manage own achievements"
  on public.achievements for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_achievements_user on public.achievements(user_id);

-- ──────────────────────────────── DAILY CHALLENGES ────────────────────

create table public.daily_challenges (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text not null default '',
  description   text not null default '',
  category      text not null default '',
  target_count  int not null default 1,
  current_count int not null default 0,
  completed     boolean not null default false,
  date          date not null default current_date,
  points        int not null default 0,
  created_at    timestamptz not null default now()
);

alter table public.daily_challenges enable row level security;

create policy "Users manage own challenges"
  on public.daily_challenges for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_challenges_user on public.daily_challenges(user_id);

-- ──────────────────────────────── AUTO-UPDATE TRIGGER ──────────────────

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply to tables that have updated_at
create trigger set_updated_at before update on public.notes
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.goals
  for each row execute function public.handle_updated_at();

-- ──────────────────────────────── ENABLE REALTIME ─────────────────────

alter publication supabase_realtime add table public.notes;
alter publication supabase_realtime add table public.todos;
alter publication supabase_realtime add table public.todo_checklist_items;
alter publication supabase_realtime add table public.expenses;
alter publication supabase_realtime add table public.budgets;
alter publication supabase_realtime add table public.habits;
alter publication supabase_realtime add table public.habit_completions;
alter publication supabase_realtime add table public.events;
alter publication supabase_realtime add table public.reminders;
alter publication supabase_realtime add table public.goals;
alter publication supabase_realtime add table public.goal_milestones;
alter publication supabase_realtime add table public.pomodoro_sessions;
alter publication supabase_realtime add table public.time_entries;
alter publication supabase_realtime add table public.journal_entries;
alter publication supabase_realtime add table public.achievements;
alter publication supabase_realtime add table public.daily_challenges;

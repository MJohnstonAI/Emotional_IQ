create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  created_at timestamptz default now()
);

create table if not exists daily_puzzles (
  id uuid primary key default gen_random_uuid(),
  date date unique not null,
  title text not null,
  scenario text not null,
  target_x int not null,
  target_y int not null,
  puzzle_number int not null,
  category text not null,
  difficulty text not null,
  created_at timestamptz default now()
);

create table if not exists attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  puzzle_id uuid references daily_puzzles on delete cascade,
  guess_x int not null,
  guess_y int not null,
  resonance int not null,
  hints text[],
  attempt_index int not null,
  created_at timestamptz default now()
);

create table if not exists entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  product_id text not null,
  status text not null default 'active',
  purchase_token text,
  created_at timestamptz default now()
);

create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  product_id text not null,
  purchase_token text,
  raw jsonb,
  created_at timestamptz default now()
);

create unique index if not exists attempts_unique
on attempts (user_id, puzzle_id, attempt_index);

create unique index if not exists entitlements_unique
on entitlements (user_id, product_id);

alter table profiles enable row level security;
alter table daily_puzzles enable row level security;
alter table attempts enable row level security;
alter table entitlements enable row level security;
alter table purchases enable row level security;

create policy "Profiles are viewable by owner"
on profiles for select
using (auth.uid() = id);

create policy "Profiles are updatable by owner"
on profiles for update
using (auth.uid() = id);

create policy "Profiles are insertable by owner"
on profiles for insert
with check (auth.uid() = id);

create policy "Daily puzzles are readable by all"
on daily_puzzles for select
using (true);

create policy "Attempts are per-user"
on attempts for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Entitlements are per-user"
on entitlements for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Purchases are per-user"
on purchases for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

insert into daily_puzzles (date, title, scenario, target_x, target_y, puzzle_number, category, difficulty)
values
  (current_date - interval '13 days', 'Reflections', 'Identify the emotion in the stillness. A friend pauses before answering your question.', 52, 40, 101, 'Self Awareness', 'easy'),
  (current_date - interval '12 days', 'Quiet Tension', 'A coworker sighs after a meeting and says, "I guess that''s one way to do it."', 35, 68, 102, 'Workplace', 'medium'),
  (current_date - interval '11 days', 'Warm Relief', 'You finally submit a long-overdue project and feel your shoulders drop.', 78, 28, 103, 'Personal', 'easy'),
  (current_date - interval '10 days', 'Sudden Sting', 'Someone cancels plans last minute without explanation.', 22, 60, 104, 'Relationships', 'medium'),
  (current_date - interval '9 days', 'Bright Boost', 'A mentor praises your progress in front of the team.', 85, 76, 105, 'Growth', 'easy'),
  (current_date - interval '8 days', 'Low Static', 'You scroll aimlessly and feel time slipping away.', 40, 22, 106, 'Mindfulness', 'easy'),
  (current_date - interval '7 days', 'Defensive Heat', 'A loved one points out a habit you promised to change.', 30, 72, 107, 'Relationships', 'hard'),
  (current_date - interval '6 days', 'Soft Gratitude', 'You receive a small, thoughtful gift on an ordinary day.', 72, 34, 108, 'Connection', 'easy'),
  (current_date - interval '5 days', 'Lingering Doubt', 'You replay a conversation and wonder if you sounded foolish.', 28, 38, 109, 'Self Awareness', 'medium'),
  (current_date - interval '4 days', 'Edge of Excitement', 'You are about to present an idea you believe in.', 68, 82, 110, 'Growth', 'medium'),
  (current_date - interval '3 days', 'Numb Drift', 'A day passes without much feeling attached to it.', 48, 18, 111, 'Mindfulness', 'easy'),
  (current_date - interval '2 days', 'Silent Pride', 'You quietly recognize how far you''ve come this year.', 70, 46, 112, 'Personal', 'easy'),
  (current_date - interval '1 day', 'Overloaded', 'Notifications pile up faster than you can respond.', 38, 80, 113, 'Workplace', 'hard'),
  (current_date, 'Gentle Resolve', 'You decide to start over after a setback.', 60, 52, 114, 'Resilience', 'medium');

-- Enable UUID helpers
create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  native_language text not null default 'zh',
  ui_language text not null default 'zh',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists learning_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  goal text not null,
  daily_minutes int not null default 25,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists placement_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  cefr_level text,
  score int,
  skill_breakdown jsonb,
  created_at timestamptz not null default now()
);

create table if not exists placement_answers (
  id uuid primary key default gen_random_uuid(),
  placement_session_id uuid not null references placement_sessions(id) on delete cascade,
  question_id text not null,
  answer int not null,
  is_correct boolean not null,
  created_at timestamptz not null default now()
);

create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  cefr_level text not null,
  title text not null,
  description text,
  content jsonb not null default '{}'::jsonb,
  is_premium boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists lesson_exercises (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  type text not null,
  skill text not null,
  prompt text not null,
  options jsonb,
  answer jsonb,
  created_at timestamptz not null default now()
);

create table if not exists user_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  exercise_id text not null,
  answer_payload jsonb not null,
  duration_sec int not null,
  correctness boolean not null,
  created_at timestamptz not null default now()
);

create table if not exists review_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  front text not null,
  back text not null,
  tag text not null default 'general',
  stability numeric not null default 2,
  difficulty numeric not null default 5,
  due_at timestamptz not null default now(),
  last_reviewed_at timestamptz,
  lapses int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists review_logs (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references review_cards(id) on delete cascade,
  user_id uuid not null,
  rating int not null,
  next_due_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists ai_feedback_records (
  id uuid primary key default gen_random_uuid(),
  user_attempt_id uuid references user_attempts(id) on delete set null,
  user_id uuid not null,
  feedback_type text not null,
  input_payload jsonb not null,
  output_payload jsonb not null,
  token_cost int,
  created_at timestamptz not null default now()
);

create table if not exists daily_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  date date not null,
  tasks jsonb not null,
  estimated_minutes int not null,
  created_at timestamptz not null default now(),
  unique(user_id, date)
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  status text not null default 'inactive',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists event_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  event_name text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

-- RLS
alter table profiles enable row level security;
alter table learning_goals enable row level security;
alter table placement_sessions enable row level security;
alter table placement_answers enable row level security;
alter table user_attempts enable row level security;
alter table review_cards enable row level security;
alter table review_logs enable row level security;
alter table ai_feedback_records enable row level security;
alter table daily_plans enable row level security;
alter table subscriptions enable row level security;
alter table event_logs enable row level security;

create policy "profiles own rows" on profiles
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "learning goals own rows" on learning_goals
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "placement sessions own rows" on placement_sessions
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "placement answers via own sessions" on placement_answers
for all using (
  exists (
    select 1 from placement_sessions ps
    where ps.id = placement_session_id and ps.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from placement_sessions ps
    where ps.id = placement_session_id and ps.user_id = auth.uid()
  )
);

create policy "attempts own rows" on user_attempts
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "review cards own rows" on review_cards
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "review logs own rows" on review_logs
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "feedback own rows" on ai_feedback_records
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "daily plans own rows" on daily_plans
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "subscriptions own rows" on subscriptions
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "event logs own rows" on event_logs
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Public read for lesson catalog
alter table lessons enable row level security;
alter table lesson_exercises enable row level security;

create policy "lessons public read" on lessons for select using (true);
create policy "lesson exercises public read" on lesson_exercises for select using (true);

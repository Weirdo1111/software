alter table learning_goals
  add column if not exists schedule_mode text not null default 'standard',
  add column if not exists study_window text not null default 'evening';

create table if not exists schedule_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  classes jsonb not null default '[]'::jsonb,
  deadlines jsonb not null default '[]'::jsonb,
  plan_week_start date,
  plan_overrides jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists context_comment_threads (
  id uuid primary key default gen_random_uuid(),
  module text not null,
  target_id text not null,
  title text not null,
  subtitle text,
  plaza_tag text not null default 'Discussion',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (module, target_id)
);

create table if not exists context_comments (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references context_comment_threads(id) on delete cascade,
  user_id uuid not null,
  author text not null,
  content text not null,
  topic text,
  likes_count int not null default 0,
  anchor_label text,
  anchor_text text,
  promoted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists context_comment_likes (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references context_comments(id) on delete cascade,
  user_id uuid not null,
  created_at timestamptz not null default now(),
  unique (comment_id, user_id)
);

create index if not exists idx_context_comment_threads_lookup
  on context_comment_threads(module, target_id);

create index if not exists idx_context_comments_thread_created
  on context_comments(thread_id, created_at desc);

create index if not exists idx_context_comment_likes_user
  on context_comment_likes(user_id, comment_id);

alter table schedule_profiles enable row level security;
alter table context_comment_threads enable row level security;
alter table context_comments enable row level security;
alter table context_comment_likes enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'schedule_profiles'
      and policyname = 'schedule profiles own rows'
  ) then
    create policy "schedule profiles own rows" on schedule_profiles
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'context_comment_threads'
      and policyname = 'context comment threads public read'
  ) then
    create policy "context comment threads public read" on context_comment_threads
      for select using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'context_comments'
      and policyname = 'context comments public read'
  ) then
    create policy "context comments public read" on context_comments
      for select using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'context_comment_likes'
      and policyname = 'context comment likes own rows'
  ) then
    create policy "context comment likes own rows" on context_comment_likes
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

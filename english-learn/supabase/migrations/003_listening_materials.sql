create table if not exists listening_materials (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  content_mode text not null default 'practice' check (content_mode in ('practice', 'ted')),
  major_id text not null,
  major_label text not null,
  accent text not null,
  accent_label text not null,
  accent_hint text not null,
  title text not null,
  source text not null,
  source_name text not null default 'DIICSU Studio',
  speaker_role text not null,
  speaker_name text,
  scenario text not null,
  transcript text not null default '',
  transcript_url text,
  official_url text,
  embed_url text,
  recommended_level text not null,
  duration_label text not null,
  support_focus text not null,
  note_prompts jsonb not null default '[]'::jsonb,
  vocabulary jsonb not null default '[]'::jsonb,
  questions jsonb not null default '[]'::jsonb,
  follow_up_task text not null,
  audio_src text,
  audio_voice text,
  voice_locales jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table listening_materials enable row level security;

create policy "listening materials public read"
on listening_materials
for select
using (true);

insert into lessons (code, cefr_level, title, description, content, is_premium)
values
  (
    'A1-001',
    'A1',
    'Daily Introduction',
    'Introduce yourself in common daily scenarios.',
    '{"vocab":["name","from","job"],"reading":"Simple profile text","listening":"Short dialogue"}'::jsonb,
    false
  ),
  (
    'A2-003',
    'A2',
    'Travel at the Airport',
    'Understand airport announcements and travel conversations.',
    '{"vocab":["boarding pass","terminal","delay"],"reading":"Airport conversation","listening":"Gate announcement"}'::jsonb,
    true
  )
on conflict (code) do nothing;

insert into lesson_exercises (lesson_id, type, skill, prompt, options, answer)
select
  l.id,
  'single_choice',
  'vocab',
  'Choose the correct word: Please show your ____ at the gate.',
  '["boarding pass","suitcase","passport","ticket"]'::jsonb,
  '{"correct":0}'::jsonb
from lessons l where l.code = 'A2-003'
on conflict do nothing;

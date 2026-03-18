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
  ),
  -- Reading lessons for each band
  (
    'A2-reading-starter',
    'A2',
    'Study Habits and Class Attendance',
    'Read a short passage about university attendance and identify the main claim, evidence, and academic vocabulary.',
    '{"skill":"reading","band":"Low","vocab":["attendance","lecture","coursework","assessment","end-of-term"]}'::jsonb,
    false
  ),
  (
    'B1-reading-starter',
    'B1',
    'Remote Study Habits and Comprehension',
    'Analyze how remote learning affects reading comprehension by identifying claims, evidence, and contrast signals.',
    '{"skill":"reading","band":"Medium","vocab":["longitudinal","cohort","blended learning","evidence-based","referencing accuracy"]}'::jsonb,
    false
  ),
  (
    'B2-reading-starter',
    'B2',
    'Critical Reading in Interdisciplinary Programmes',
    'Evaluate complex academic arguments about interdisciplinary education by mapping claims to evidence.',
    '{"skill":"reading","band":"High","vocab":["meta-analysis","methodological","interdisciplinary","synthesize","curriculum"]}'::jsonb,
    false
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

-- Reading exercises: checkpoint 1 — identify main claim
insert into lesson_exercises (lesson_id, type, skill, prompt, options, answer)
select l.id, 'reading_checkpoint', 'reading',
  'What sentence expresses the main claim most clearly?',
  null,
  '{"expected":"regular attendance helps students understand course material more deeply"}'::jsonb
from lessons l where l.code = 'A2-reading-starter'
on conflict do nothing;

insert into lesson_exercises (lesson_id, type, skill, prompt, options, answer)
select l.id, 'reading_checkpoint', 'reading',
  'What sentence expresses the main claim most clearly?',
  null,
  '{"expected":"independent reading frequency increases under remote conditions, yet comprehension depth declines when collaborative discussion is removed"}'::jsonb
from lessons l where l.code = 'B1-reading-starter'
on conflict do nothing;

insert into lesson_exercises (lesson_id, type, skill, prompt, options, answer)
select l.id, 'reading_checkpoint', 'reading',
  'What sentence expresses the main claim most clearly?',
  null,
  '{"expected":"exposure to competing disciplinary frameworks accelerates the development of analytical reading ability"}'::jsonb
from lessons l where l.code = 'B2-reading-starter'
on conflict do nothing;

-- Reading exercises: checkpoint 2 — identify evidence
insert into lesson_exercises (lesson_id, type, skill, prompt, options, answer)
select l.id, 'reading_checkpoint', 'reading',
  'Which detail functions as evidence rather than background?',
  null,
  '{"expected":"one group of students who attended every class scored 15 percent higher than those who only watched recorded lectures"}'::jsonb
from lessons l where l.code = 'A2-reading-starter'
on conflict do nothing;

insert into lesson_exercises (lesson_id, type, skill, prompt, options, answer)
select l.id, 'reading_checkpoint', 'reading',
  'Which detail functions as evidence rather than background?',
  null,
  '{"expected":"students without weekly seminar discussion produce shorter and less evidence-based written responses after eight weeks"}'::jsonb
from lessons l where l.code = 'B1-reading-starter'
on conflict do nothing;

insert into lesson_exercises (lesson_id, type, skill, prompt, options, answer)
select l.id, 'reading_checkpoint', 'reading',
  'Which detail functions as evidence rather than background?',
  null,
  '{"expected":"interdisciplinary students were 1.4 times more likely to identify methodological limitations in published journal articles"}'::jsonb
from lessons l where l.code = 'B2-reading-starter'
on conflict do nothing;

-- Reading exercises: checkpoint 3 — identify contrast signal
insert into lesson_exercises (lesson_id, type, skill, prompt, options, answer)
select l.id, 'reading_checkpoint', 'reading',
  'What transition signals contrast in the passage?',
  null,
  '{"expected":"However"}'::jsonb
from lessons l where l.code = 'A2-reading-starter'
on conflict do nothing;

insert into lesson_exercises (lesson_id, type, skill, prompt, options, answer)
select l.id, 'reading_checkpoint', 'reading',
  'What transition signals contrast in the passage?',
  null,
  '{"expected":"However"}'::jsonb
from lessons l where l.code = 'B1-reading-starter'
on conflict do nothing;

insert into lesson_exercises (lesson_id, type, skill, prompt, options, answer)
select l.id, 'reading_checkpoint', 'reading',
  'What transition signals contrast in the passage?',
  null,
  '{"expected":"However"}'::jsonb
from lessons l where l.code = 'B2-reading-starter'
on conflict do nothing;

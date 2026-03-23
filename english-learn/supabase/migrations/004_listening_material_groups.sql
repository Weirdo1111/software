alter table listening_materials
  add column if not exists material_group_id text,
  add column if not exists material_group_label text;

update listening_materials
set
  material_group_id = case
    when content_mode = 'practice' then major_id
    else concat('ted-', major_id)
  end,
  material_group_label = case
    when content_mode = 'practice' and major_id = 'civil-engineering' then 'Drainage inspection'
    when content_mode = 'practice' and major_id = 'mathematics' then 'Sampling bias'
    when content_mode = 'practice' and major_id = 'computing-science' then 'Caching sprint review'
    when content_mode = 'practice' and major_id = 'mechanical-engineering' then 'Heat exchanger lab'
    when content_mode = 'practice' and major_id = 'mechanical-engineering-transportation' then 'Bus corridor simulation'
    else title
  end
where material_group_id is null
   or material_group_label is null;

alter table listening_materials
  alter column material_group_id set not null,
  alter column material_group_label set not null;

create index if not exists listening_materials_mode_major_group_idx
  on listening_materials (content_mode, major_id, material_group_id);

import { createClient } from "@supabase/supabase-js";

import { listeningMaterials } from "../lib/listening-materials.ts";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required to seed listening materials.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const payload = listeningMaterials.map((material) => ({
  code: material.id,
  content_mode: material.contentMode,
  major_id: material.majorId,
  major_label: material.majorLabel,
  accent: material.accent,
  accent_label: material.accentLabel,
  accent_hint: material.accentHint,
  title: material.title,
  source: material.source,
  source_name: material.sourceName,
  speaker_role: material.speakerRole,
  speaker_name: material.speakerName ?? null,
  scenario: material.scenario,
  transcript: material.transcript,
  transcript_url: material.transcriptUrl ?? null,
  official_url: material.officialUrl ?? null,
  embed_url: material.embedUrl ?? null,
  recommended_level: material.recommendedLevel,
  duration_label: material.durationLabel,
  support_focus: material.supportFocus,
  note_prompts: material.notePrompts,
  vocabulary: material.vocabulary,
  questions: material.questions,
  follow_up_task: material.followUpTask,
  audio_src: material.audioSrc,
  audio_voice: material.audioVoice,
  voice_locales: material.voiceLocales,
}));

const { error } = await supabase.from("listening_materials").upsert(payload, {
  onConflict: "code",
});

if (error) {
  throw error;
}

console.log(`Seeded ${payload.length} listening materials.`);

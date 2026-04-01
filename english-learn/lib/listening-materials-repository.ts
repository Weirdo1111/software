import { listeningMaterials, type ListeningMaterial } from "@/lib/listening-materials";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

type ListeningMaterialRow = {
  code: string;
  content_mode: string;
  material_group_id: string | null;
  material_group_label: string | null;
  major_id: string;
  major_label: string;
  accent: string;
  accent_label: string;
  accent_hint: string;
  title: string;
  source: string;
  source_name: string | null;
  speaker_role: string;
  speaker_name: string | null;
  scenario: string;
  transcript: string | null;
  transcript_url: string | null;
  official_url: string | null;
  embed_url: string | null;
  recommended_level: string;
  duration_label: string;
  support_focus: string;
  note_prompts: unknown;
  vocabulary: unknown;
  questions: unknown;
  follow_up_task: string;
  audio_src: string | null;
  audio_voice: string | null;
  voice_locales: unknown;
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function inferResourceType(row: ListeningMaterialRow): ListeningMaterial["resourceType"] {
  if (row.content_mode === "ted") return "real-talk";

  const normalizedSource = `${row.source_name ?? ""} ${row.source}`.toLowerCase();

  if (normalizedSource.includes("podcast")) return "podcast";
  if (normalizedSource.includes("interview")) return "interview";

  return "lecture";
}

function mapRowToListeningMaterial(row: ListeningMaterialRow): ListeningMaterial | null {
  if (
    !isStringArray(row.note_prompts) ||
    !Array.isArray(row.vocabulary) ||
    !Array.isArray(row.questions)
  ) {
    return null;
  }

  const voiceLocales = row.voice_locales === null ? [] : row.voice_locales;

  if (!isStringArray(voiceLocales)) {
    return null;
  }

  return {
    id: row.code,
    contentMode: row.content_mode as ListeningMaterial["contentMode"],
    resourceType: inferResourceType(row),
    materialGroupId: row.material_group_id ?? row.code,
    materialGroupLabel: row.material_group_label ?? row.title,
    majorId: row.major_id as ListeningMaterial["majorId"],
    majorLabel: row.major_label,
    accent: row.accent as ListeningMaterial["accent"],
    accentLabel: row.accent_label,
    accentHint: row.accent_hint,
    title: row.title,
    source: row.source,
    sourceName: row.source_name ?? row.source,
    speakerRole: row.speaker_role,
    speakerName: row.speaker_name ?? undefined,
    scenario: row.scenario,
    transcript: row.transcript ?? "",
    transcriptUrl: row.transcript_url ?? undefined,
    officialUrl: row.official_url ?? undefined,
    embedUrl: row.embed_url ?? undefined,
    recommendedLevel: row.recommended_level as ListeningMaterial["recommendedLevel"],
    durationLabel: row.duration_label,
    supportFocus: row.support_focus,
    notePrompts: row.note_prompts,
    vocabulary: row.vocabulary as ListeningMaterial["vocabulary"],
    questions: row.questions as ListeningMaterial["questions"],
    followUpTask: row.follow_up_task,
    audioSrc: row.audio_src,
    audioVoice: row.audio_voice,
    voiceLocales,
  };
}

const localMaterialFallbackMap = new Map(
  listeningMaterials.map((material) => [material.materialGroupId, material]),
);

function mergeWithLocalFallback(material: ListeningMaterial): ListeningMaterial {
  const localFallback = localMaterialFallbackMap.get(material.materialGroupId);

  if (!localFallback) {
    return material;
  }

  return {
    ...material,
    ...localFallback,
    transcriptUrl: localFallback.transcriptUrl ?? material.transcriptUrl,
    officialUrl: localFallback.officialUrl ?? material.officialUrl,
    embedUrl: localFallback.embedUrl ?? material.embedUrl,
    videoSrc: localFallback.videoSrc ?? material.videoSrc,
    thumbnailUrl: localFallback.thumbnailUrl ?? material.thumbnailUrl,
    audioSrc: localFallback.audioSrc ?? material.audioSrc,
  };
}

export async function getListeningMaterialsCatalog() {
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return listeningMaterials;
  }

  const { data, error } = await supabase
    .from("listening_materials")
    .select(
      "code, content_mode, material_group_id, material_group_label, major_id, major_label, accent, accent_label, accent_hint, title, source, source_name, speaker_role, speaker_name, scenario, transcript, transcript_url, official_url, embed_url, recommended_level, duration_label, support_focus, note_prompts, vocabulary, questions, follow_up_task, audio_src, audio_voice, voice_locales",
    )
    .neq("content_mode", "practice")
    .order("content_mode", { ascending: true })
    .order("major_label", { ascending: true })
    .order("material_group_label", { ascending: true })
    .order("accent", { ascending: true });

  if (error || !data || data.length === 0) {
    return listeningMaterials;
  }

  const mapped = (data as ListeningMaterialRow[])
    .map(mapRowToListeningMaterial)
    .filter((item): item is ListeningMaterial => item !== null)
    .map(mergeWithLocalFallback);

  return mapped.length >= listeningMaterials.length ? mapped : listeningMaterials;
}

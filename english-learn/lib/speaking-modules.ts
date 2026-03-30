import type { SpeakingModuleId, SpeakingModuleRouteId } from "@/components/forms/speaking/types";

export const speakingModuleCopy: Record<
  SpeakingModuleId,
  {
    label: string;
    title: string;
    description: string;
    hubDescription: string;
    cta: string;
  }
> = {
  studio: {
    label: "Speaking studio",
    title: "Record, refine, and score one task.",
    description: "Choose one prompt, record one take, edit the transcript, and score it.",
    hubDescription: "Record one full response, edit the transcript, and submit it for AI scoring.",
    cta: "Open speaking studio",
  },
  rehearsal: {
    label: "Rehearsal lab",
    title: "Shadow the script and rehearse the task.",
    description: "Use the active draft for one shadowing attempt, then stay inside the same task for one AI partner exchange.",
    hubDescription: "Practice pronunciation with shadowing, then continue into one prompt-aware follow-up conversation.",
    cta: "Open rehearsal lab",
  },
};

export function isSpeakingModuleRouteId(value: string | undefined): value is SpeakingModuleRouteId {
  return value === "studio" || value === "rehearsal" || value === "shadowing" || value === "partner";
}

export function normalizeSpeakingModuleId(value: SpeakingModuleRouteId): SpeakingModuleId {
  return value === "shadowing" || value === "partner" ? "rehearsal" : value;
}

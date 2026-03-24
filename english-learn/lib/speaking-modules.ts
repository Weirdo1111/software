import type { SpeakingModuleId } from "@/components/forms/speaking/types";

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
    title: "Record, refine, and score one academic response.",
    description: "Choose a prompt, record one take, polish the transcript, and get AI feedback.",
    hubDescription: "Record one full response, edit the transcript, and submit it for AI scoring.",
    cta: "Open speaking studio",
  },
  shadowing: {
    label: "Shadowing studio",
    title: "Shadow one full script without sentence-by-sentence switching.",
    description: "Use your active speaking draft as the target, replay it, and compare one shadowing attempt.",
    hubDescription: "Repeat your current script aloud, replay the target, and check keyword-level shadowing feedback.",
    cta: "Open shadowing studio",
  },
  partner: {
    label: "AI partner",
    title: "Practice follow-up speaking turns with the AI coach.",
    description: "Hold a short speaking exchange, get one follow-up question, and keep the coaching separate from scoring.",
    hubDescription: "Talk to the AI coach in a separate rehearsal space before you go back to scoring.",
    cta: "Open AI partner",
  },
};

export function isSpeakingModuleId(value: string | undefined): value is SpeakingModuleId {
  return value === "studio" || value === "shadowing" || value === "partner";
}

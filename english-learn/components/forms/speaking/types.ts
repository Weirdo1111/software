<<<<<<< Updated upstream
export type SpeakingLevel = "A1" | "A2" | "B1" | "B2";
=======
import type { CEFRLevel, SpeakingDifficulty, SpeakingScenarioCategory } from "@/types/learning";

export type { SpeakingDifficulty, SpeakingScenarioCategory };
export type SpeakingLevel = CEFRLevel;
export type SpeakingModuleId = "studio" | "shadowing" | "partner";
export type SpeakingScenarioFilter = SpeakingScenarioCategory | "all";
>>>>>>> Stashed changes

export type PartnerMessage = {
  role: "user" | "assistant";
  content: string;
};

export type RecorderStatus = "idle" | "recording" | "paused" | "stopped" | "unsupported" | "error";

export type SpeakingAudioClip = {
  blob: Blob;
  url: string;
  mimeType: string;
  durationMs: number;
  createdAt: string;
};

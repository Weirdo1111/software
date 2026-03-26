import type { SpeakingDifficulty, SpeakingScenarioCategory } from "@/types/learning";

export type { SpeakingDifficulty, SpeakingScenarioCategory };
export type SpeakingModuleId = "studio" | "rehearsal";
export type SpeakingModuleRouteId = SpeakingModuleId | "shadowing" | "partner";
export type SpeakingScenarioFilter = SpeakingScenarioCategory | "all";

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

export type SpeakingLevel = "A1" | "A2" | "B1" | "B2";

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

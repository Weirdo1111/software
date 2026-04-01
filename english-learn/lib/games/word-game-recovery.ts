export const WORD_GAME_RECOVERY_STORAGE_KEY = "word_game_recovery_payload_v1";

export type RecoveryWord = {
  word: string;
  meaningEn: string;
  meaningZh: string;
  examples: Array<{ en: string; zh: string }>;
  uk: string;
  us: string;
};

export type RecoveryPayload = {
  queue: RecoveryWord[];
  bank: string;
  locale: "en" | "zh";
  source: "critical" | "victory";
  createdAt: number;
};

export function saveRecoveryPayload(payload: RecoveryPayload) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WORD_GAME_RECOVERY_STORAGE_KEY, JSON.stringify(payload));
}

export function loadRecoveryPayload(): RecoveryPayload | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(WORD_GAME_RECOVERY_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<RecoveryPayload>;
    if (!parsed || !Array.isArray(parsed.queue) || parsed.queue.length === 0) return null;
    if (typeof parsed.bank !== "string") return null;
    if (parsed.locale !== "en" && parsed.locale !== "zh") return null;
    if (parsed.source !== "critical" && parsed.source !== "victory") return null;

    return {
      queue: parsed.queue as RecoveryWord[],
      bank: parsed.bank,
      locale: parsed.locale,
      source: parsed.source,
      createdAt: typeof parsed.createdAt === "number" ? parsed.createdAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export function clearRecoveryPayload() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(WORD_GAME_RECOVERY_STORAGE_KEY);
}

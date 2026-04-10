import type { SpeakingTestAnswerInput, SpeakingTestFeedback } from "@/lib/speaking-test";

export type SpeakingEvaluationStoredInput = {
  set_id: string;
  set_title: string;
  set_theme: string;
  answers: SpeakingTestAnswerInput[];
};

export type SpeakingEvaluationHistoryEntry = {
  id: string;
  attemptedAt: string;
  monthLabel: string;
  dayLabel: string;
  yearLabel: string;
  title: string;
  subtitle: string;
  score: number;
  tier: string;
  report: SpeakingTestFeedback;
};

export function formatHistoryDateLabels(input: string | Date) {
  const date = typeof input === "string" ? new Date(input) : input;

  return {
    monthLabel: new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(date).toUpperCase(),
    dayLabel: new Intl.DateTimeFormat("en-US", { day: "2-digit", timeZone: "UTC" }).format(date),
    yearLabel: new Intl.DateTimeFormat("en-US", { year: "numeric", timeZone: "UTC" }).format(date),
  };
}

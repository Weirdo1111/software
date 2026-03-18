export type CEFRLevel = "A1" | "A2" | "B1" | "B2";

export type SkillType =
  | "vocab"
  | "grammar"
  | "reading"
  | "listening"
  | "speaking"
  | "writing";

export interface PlacementQuestion {
  id: string;
  type: "single_choice" | "reading" | "listening";
  skill: Extract<SkillType, "vocab" | "grammar" | "reading" | "listening">;
  prompt: string;
  options: string[];
  answer: number;
  level: CEFRLevel;
}

export interface SkillBreakdown {
  vocab: number;
  grammar: number;
  reading: number;
  listening: number;
}

export interface AttemptResult {
  correctness: boolean;
  explanation: string;
  next_action: "continue" | "review";
}

export interface SpeakingFeedback {
  pronunciation_score: number;
  fluency_score: number;
  grammar_score: number;
  tips: string[];
}

export interface WritingFeedback {
  overall_score: number;
  errors: string[];
  rewrite_sample: string;
}

export interface DailyTask {
  id: string;
  title: string;
  type: "lesson" | "review" | "writing" | "speaking";
  estimated_minutes: number;
  skill: SkillType;
  completed: boolean;
}

export interface ProgressSummary {
  minutes: number;
  lessons_completed: number;
  accuracy: number;
  weak_skills: SkillType[];
}

export interface ReviewCard {
  id: string;
  user_id: string;
  front: string;
  back: string;
  stability: number;
  difficulty: number;
  due_at: string;
  last_reviewed_at: string | null;
  lapses: number;
}

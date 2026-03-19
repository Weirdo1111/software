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
  type: "single_choice";
  skill: Extract<SkillType, "listening" | "speaking" | "reading" | "writing">;
  prompt: string;
  context?: string;
  options: string[];
  answer: number;
  level: CEFRLevel;
}

export interface SkillBreakdown {
  listening: number;
  speaking: number;
  reading: number;
  writing: number;
}

export interface AttemptResult {
  correctness: boolean;
  explanation: string;
  next_action: "continue" | "review";
}

export interface SpeakingFeedback {
  overall_score: number;
  task_response_score: number;
  pronunciation_score: number;
  fluency_score: number;
  grammar_score: number;
  strengths: string[];
  revision_focus: string;
  tips: string[];
}

export interface SpeakingPrompt {
  id: string;
  level: CEFRLevel;
  title: string;
  scenario: string;
  prompt: string;
  response_time_sec: number;
  skill_focus: string;
  partner_role: string;
  partner_goal: string;
  useful_phrases: string[];
  checkpoints: string[];
  sample_opening: string;
}

export interface SpeakingPartnerReply {
  reply: string;
  follow_up: string;
  coaching_note: string;
}

export interface SpeakingAttemptRecord {
  id: string;
  prompt_id: string;
  prompt_title: string;
  target_level: CEFRLevel;
  transcript: string;
  overall_score: number;
  task_response_score: number;
  pronunciation_score: number;
  fluency_score: number;
  grammar_score: number;
  strengths: string[];
  revision_focus: string;
  tips: string[];
  recording_duration_sec: number | null;
  recording_mime_type: string | null;
  created_at: string;
}

export interface WritingFeedback {
  overall_score: number;
  errors: string[];
  rewrite_sample: string;
}

export interface WritingPrompt {
  id: string;
  level: CEFRLevel;
  title: string;
  scenario: string;
  prompt: string;
  skill_focus: string;
  checkpoints: string[];
  sample_response: string;
}

export interface ReadingFeedback {
  comprehension_score: number;
  claim_feedback: string;
  evidence_feedback: string;
  vocabulary_feedback: string;
  tips: string[];
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

import { addDays } from "date-fns";

export interface ReviewResultInput {
  stability: number;
  difficulty: number;
  rating: 1 | 2 | 3 | 4;
}

export interface ReviewResultOutput {
  next_stability: number;
  next_difficulty: number;
  next_due_at: string;
}

export function calculateNextReview(input: ReviewResultInput): ReviewResultOutput {
  const { stability, difficulty, rating } = input;

  const difficultyShift = rating <= 2 ? 0.25 : -0.15;
  const next_difficulty = Math.min(10, Math.max(1, Number((difficulty + difficultyShift).toFixed(2))));

  const stabilityFactor = rating === 1 ? 0.6 : rating === 2 ? 0.9 : rating === 3 ? 1.35 : 1.8;
  const difficultyPenalty = 1 - (next_difficulty - 5) * 0.04;
  const rawStability = stability * stabilityFactor * difficultyPenalty;
  const next_stability = Math.min(120, Math.max(0.5, Number(rawStability.toFixed(2))));

  const intervalDays = Math.max(1, Math.round(next_stability));
  const next_due_at = addDays(new Date(), intervalDays).toISOString();

  return {
    next_stability,
    next_difficulty,
    next_due_at,
  };
}

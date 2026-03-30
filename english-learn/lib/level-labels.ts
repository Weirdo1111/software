import type { CEFRLevel } from "@/types/learning";

export type DifficultyLabel = "Easy" | "Medium" | "Difficult";
export const difficultyOptions: DifficultyLabel[] = ["Easy", "Medium", "Difficult"];

export function getDifficultyLabel(level: string): DifficultyLabel {
  const normalized = String(level).toUpperCase();

  if (normalized === "A1" || normalized === "A2") return "Easy";
  if (normalized === "B1") return "Medium";
  return "Difficult";
}

export function getLevelForDifficulty(
  difficulty: DifficultyLabel,
  easyLevel: "A1" | "A2" = "A2",
): CEFRLevel {
  if (difficulty === "Easy") return easyLevel;
  if (difficulty === "Medium") return "B1";
  return "B2";
}

import type { DailyTask, ProgressSummary } from "@/types/learning";

export const todayTasks: DailyTask[] = [
  {
    id: "task-1",
    title: "Lecture Notes Sprint: Climate Policy Seminar",
    type: "lesson",
    estimated_minutes: 18,
    skill: "listening",
    completed: false,
  },
  {
    id: "task-2",
    title: "Reading Review: 18 Academic Collocations",
    type: "review",
    estimated_minutes: 12,
    skill: "vocab",
    completed: false,
  },
  {
    id: "task-3",
    title: "Writing Prompt: Response to a Research Abstract",
    type: "writing",
    estimated_minutes: 15,
    skill: "writing",
    completed: false,
  },
];

export const summary7d: ProgressSummary = {
  minutes: 186,
  lessons_completed: 9,
  accuracy: 0.78,
  weak_skills: ["speaking", "grammar"],
};

export const summary30d: ProgressSummary = {
  minutes: 690,
  lessons_completed: 30,
  accuracy: 0.81,
  weak_skills: ["speaking"],
};

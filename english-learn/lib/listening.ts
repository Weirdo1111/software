export type ListeningItem = {
  id: string;
  sentence: string;
  hint: string;
  gistQuestion: string;
  gistOptions: string[];
  gistAnswer: number;
  gistExplanation: string;
};

export const listeningWeekOneItems: ListeningItem[] = [
  {
    id: "s1",
    sentence: "Before next Friday, every first-year student should upload the draft lab report to Moodle.",
    hint: "Focus on the action verb and the platform name.",
    gistQuestion: "What is the speaker mainly asking students to do?",
    gistOptions: ["Attend a Friday lecture", "Submit a draft report online", "Meet tutors in person", "Buy a new lab book"],
    gistAnswer: 1,
    gistExplanation: "The sentence says students should upload a draft report to Moodle before a deadline, so it is an online submission task.",
  },
  {
    id: "s2",
    sentence: "If the vocabulary in lectures feels difficult, check the weekly glossary before class starts.",
    hint: "Listen for the strategy that happens before class.",
    gistQuestion: "What strategy does the speaker recommend?",
    gistOptions: ["Skip difficult lectures", "Translate slides word by word", "Review glossary before class", "Only focus on homework"],
    gistAnswer: 2,
    gistExplanation: "The speaker explicitly recommends checking the weekly glossary before class, which is a pre-class support strategy.",
  },
  {
    id: "s3",
    sentence: "During seminar discussions, use one clear example to support your opinion.",
    hint: "The key is how to support an opinion in seminars.",
    gistQuestion: "What is emphasized for seminar speaking?",
    gistOptions: ["Speaking longer than others", "Using one clear supporting example", "Avoiding disagreement", "Reading from slides"],
    gistAnswer: 1,
    gistExplanation: "The sentence directly says to use one clear example, so support quality matters more than speaking length.",
  },
];

export function isChoiceCorrect(choice: number | null, answer: number) {
  return choice === answer;
}

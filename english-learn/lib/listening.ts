export type ListeningItem = {
  id: string;
  sentence: string;
  hint: string;
  gistQuestion: string;
  gistOptions: string[];
  gistAnswer: number;
  gistExplanation: string;
  keyword: string;
  keywordExplanation: string;
};

export const listeningWeekOneItems: ListeningItem[] = [
  {
    id: "s1",
    sentence: "Before next Friday, every first-year student should upload the draft lab report to Moodle.",
    hint: "Deadline reminder about where to submit your draft lab report.",
    gistQuestion: "What is the speaker mainly asking students to do?",
    gistOptions: ["Attend a Friday lecture", "Submit a draft report online", "Meet tutors in person", "Buy a new lab book"],
    gistAnswer: 1,
    gistExplanation:
      "The sentence says students should upload a draft report to Moodle before a deadline, so it is an online submission task.",
    keyword: "Moodle",
    keywordExplanation: "Moodle is the platform keyword indicating where the submission happens.",
  },
  {
    id: "s2",
    sentence: "If the vocabulary in lectures feels difficult, check the weekly glossary before class starts.",
    hint: "Support strategy: review an academic word list before class.",
    gistQuestion: "What strategy does the speaker recommend?",
    gistOptions: ["Skip difficult lectures", "Translate slides word by word", "Review glossary before class", "Only focus on homework"],
    gistAnswer: 2,
    gistExplanation: "The speaker explicitly recommends checking the weekly glossary before class, which is pre-class preparation.",
    keyword: "glossary",
    keywordExplanation: "Glossary is the key academic support word in this sentence.",
  },
  {
    id: "s3",
    sentence: "During seminar discussions, use one clear example to support your opinion.",
    hint: "Seminar speaking advice about backing ideas with evidence.",
    gistQuestion: "What is emphasized for seminar speaking?",
    gistOptions: ["Speaking longer than others", "Using one clear supporting example", "Avoiding disagreement", "Reading from slides"],
    gistAnswer: 1,
    gistExplanation: "The sentence directly says to use one clear example, so support quality matters more than speaking length.",
    keyword: "example",
    keywordExplanation: "Example is the keyword that signals how to support an opinion.",
  },
];

export function isChoiceCorrect(choice: number | null, answer: number) {
  return choice === answer;
}

export function getListeningProgress(currentIndex: number, total: number) {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round(((currentIndex + 1) / total) * 100)));
}
